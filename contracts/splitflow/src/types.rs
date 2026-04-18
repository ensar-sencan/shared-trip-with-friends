use soroban_sdk::{contracttype, Address, Symbol, Vec};

#[contracttype]
#[derive(Clone, Debug)]
pub struct Expense {
    pub payer: Address,
    pub amount: i128,
    pub description: Symbol,
    pub category: Symbol,
    pub timestamp: u64,
    pub split_among: Vec<Address>,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Settlement {
    pub from: Address,
    pub to: Address,
    pub amount: i128,
    pub paid: bool,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct GroupState {
    pub members: Vec<Address>,
    pub expenses: Vec<Expense>,
    pub settlements: Vec<Settlement>,
    pub is_closed: bool,
}

#[contracttype]
pub enum DataKey {
    Members,
    Expenses,
    Settlements,
    IsClosed,
}
