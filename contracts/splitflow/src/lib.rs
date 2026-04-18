#![no_std]

mod error;
mod types;

use error::Error;
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, Vec};
use types::{DataKey, Expense, GroupState, Settlement};

#[contract]
pub struct SplitFlow;

#[contractimpl]
impl SplitFlow {
    /// Initialize the group with a list of members. Caller must be a member.
    pub fn create_group(env: &Env, creator: Address, members: Vec<Address>) -> Result<(), Error> {
        creator.require_auth();

        if !members.contains(&creator) {
            return Err(Error::NotAMember);
        }

        env.storage().instance().set(&DataKey::Members, &members);
        env.storage()
            .instance()
            .set(&DataKey::Expenses, &Vec::<Expense>::new(env));
        env.storage()
            .instance()
            .set(&DataKey::Settlements, &Vec::<Settlement>::new(env));
        env.storage()
            .instance()
            .set(&DataKey::IsClosed, &false);

        Ok(())
    }

    /// Add an expense. Payer must be a member and must be in split_among.
    pub fn add_expense(
        env: &Env,
        payer: Address,
        amount: i128,
        description: Symbol,
        category: Symbol,
        split_among: Vec<Address>,
    ) -> Result<u32, Error> {
        payer.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        Self::assert_member(env, &payer)?;
        Self::assert_open(env)?;

        if !split_among.contains(&payer) {
            return Err(Error::PayerNotInSplitList);
        }

        // Validate all split_among are members
        let members: Vec<Address> = env.storage().instance().get(&DataKey::Members).unwrap();
        for addr in split_among.iter() {
            if !members.contains(&addr) {
                return Err(Error::NotAMember);
            }
        }

        let expense = Expense {
            payer,
            amount,
            description,
            category,
            timestamp: env.ledger().timestamp(),
            split_among,
        };

        let mut expenses: Vec<Expense> =
            env.storage().instance().get(&DataKey::Expenses).unwrap();
        expenses.push_back(expense);
        let idx = expenses.len() - 1;
        env.storage().instance().set(&DataKey::Expenses, &expenses);

        // Recalculate settlements after every new expense
        Self::recalculate_settlements(env);

        Ok(idx)
    }

    /// Returns net balance per member (positive = owed money, negative = owes money)
    pub fn get_balances(env: &Env) -> Vec<(Address, i128)> {
        let members: Vec<Address> = env.storage().instance().get(&DataKey::Members).unwrap();
        let expenses: Vec<Expense> = env.storage().instance().get(&DataKey::Expenses).unwrap();

        let mut balances: Vec<(Address, i128)> = Vec::new(env);

        for member in members.iter() {
            let mut net: i128 = 0;
            for expense in expenses.iter() {
                // Amount this member is owed (they paid)
                if expense.payer == member {
                    net += expense.amount;
                }
                // Amount this member owes (they are in split_among)
                if expense.split_among.contains(&member) {
                    let share = expense.amount / (expense.split_among.len() as i128);
                    net -= share;
                }
            }
            balances.push_back((member, net));
        }

        balances
    }

    /// Returns the minimum set of transfers to settle all debts.
    pub fn calculate_settlements(env: &Env) -> Vec<Settlement> {
        env.storage().instance().get(&DataKey::Settlements).unwrap()
    }

    /// Mark a settlement as paid. Called after Stellar path payment is confirmed.
    pub fn mark_paid(env: &Env, caller: Address, from: Address, to: Address) -> Result<(), Error> {
        caller.require_auth();
        Self::assert_open(env)?;

        let settlements: Vec<Settlement> =
            env.storage().instance().get(&DataKey::Settlements).unwrap();

        let mut found = false;
        let mut new_settlements: Vec<Settlement> = Vec::new(env);

        for s in settlements.iter() {
            if s.from == from && s.to == to && !s.paid {
                new_settlements.push_back(Settlement {
                    from: s.from,
                    to: s.to,
                    amount: s.amount,
                    paid: true,
                });
                found = true;
            } else {
                new_settlements.push_back(s);
            }
        }

        if !found {
            return Err(Error::SettlementNotFound);
        }

        env.storage()
            .instance()
            .set(&DataKey::Settlements, &new_settlements);

        Ok(())
    }

    /// Close the group — no more expenses can be added.
    pub fn close_group(env: &Env, caller: Address) -> Result<(), Error> {
        caller.require_auth();
        Self::assert_member(env, &caller)?;
        env.storage().instance().set(&DataKey::IsClosed, &true);
        Ok(())
    }

    /// Full group state snapshot.
    pub fn get_group_info(env: &Env) -> GroupState {
        GroupState {
            members: env.storage().instance().get(&DataKey::Members).unwrap(),
            expenses: env.storage().instance().get(&DataKey::Expenses).unwrap(),
            settlements: env
                .storage()
                .instance()
                .get(&DataKey::Settlements)
                .unwrap(),
            is_closed: env.storage().instance().get(&DataKey::IsClosed).unwrap(),
        }
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    fn assert_member(env: &Env, addr: &Address) -> Result<(), Error> {
        let members: Vec<Address> = env.storage().instance().get(&DataKey::Members).unwrap();
        if !members.contains(addr) {
            return Err(Error::NotAMember);
        }
        Ok(())
    }

    fn assert_open(env: &Env) -> Result<(), Error> {
        let closed: bool = env.storage().instance().get(&DataKey::IsClosed).unwrap();
        if closed {
            return Err(Error::GroupClosed);
        }
        Ok(())
    }

    /// Debt-simplification: greedy largest-debtor vs largest-creditor matching.
    /// Runs in-contract so get_balances() and calculate_settlements() are always in sync.
    fn recalculate_settlements(env: &Env) {
        let balances = Self::get_balances(env);

        // Split into creditors (net > 0) and debtors (net < 0)
        // We work with plain i128 amounts (positive for both lists)
        let mut creditors: Vec<(Address, i128)> = Vec::new(env);
        let mut debtors: Vec<(Address, i128)> = Vec::new(env);

        for (addr, bal) in balances.iter() {
            if bal > 0 {
                creditors.push_back((addr, bal));
            } else if bal < 0 {
                debtors.push_back((addr, -bal)); // store as positive
            }
        }

        let mut settlements: Vec<Settlement> = Vec::new(env);

        // Greedy O(n²) matching — fine for small groups
        // We simulate mutable state by rebuilding vectors each pass
        loop {
            // Find index of largest creditor and largest debtor
            let ci = Self::max_index(env, &creditors);
            let di = Self::max_index(env, &debtors);

            if ci.is_none() || di.is_none() {
                break;
            }

            let ci = ci.unwrap();
            let di = di.unwrap();

            let (caddr, camp) = creditors.get(ci).unwrap();
            let (daddr, damp) = debtors.get(di).unwrap();

            let transfer = if camp < damp { camp } else { damp };

            settlements.push_back(Settlement {
                from: daddr.clone(),
                to: caddr.clone(),
                amount: transfer,
                paid: false,
            });

            let new_camp = camp - transfer;
            let new_damp = damp - transfer;

            // Rebuild creditors without index ci, re-insert if remainder > 0
            let mut new_creditors: Vec<(Address, i128)> = Vec::new(env);
            for (i, item) in creditors.iter().enumerate() {
                if i as u32 != ci {
                    new_creditors.push_back(item);
                }
            }
            if new_camp > 0 {
                new_creditors.push_back((caddr, new_camp));
            }
            creditors = new_creditors;

            // Rebuild debtors without index di, re-insert if remainder > 0
            let mut new_debtors: Vec<(Address, i128)> = Vec::new(env);
            for (i, item) in debtors.iter().enumerate() {
                if i as u32 != di {
                    new_debtors.push_back(item);
                }
            }
            if new_damp > 0 {
                new_debtors.push_back((daddr, new_damp));
            }
            debtors = new_debtors;
        }

        env.storage()
            .instance()
            .set(&DataKey::Settlements, &settlements);
    }

    /// Returns the index of the entry with the maximum i128 value, or None if empty.
    fn max_index(env: &Env, list: &Vec<(Address, i128)>) -> Option<u32> {
        let _ = env;
        if list.is_empty() {
            return None;
        }
        let mut best_idx: u32 = 0;
        let mut best_val: i128 = i128::MIN;
        for (i, (_, v)) in list.iter().enumerate() {
            if v > best_val {
                best_val = v;
                best_idx = i as u32;
            }
        }
        Some(best_idx)
    }
}

mod test;
