#![cfg(test)]

use soroban_sdk::{
    symbol_short,
    testutils::Address as _,
    Address, Env, Vec,
};

use crate::SplitFlow;
use crate::SplitFlowClient;

fn setup_env() -> (Env, SplitFlowClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(SplitFlow, ());
    let client = SplitFlowClient::new(&env, &contract_id);
    (env, client)
}

#[test]
fn test_create_group() {
    let (env, client) = setup_env();

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let carol = Address::generate(&env);

    let mut members = Vec::new(&env);
    members.push_back(alice.clone());
    members.push_back(bob.clone());
    members.push_back(carol.clone());

    client.create_group(&alice, &members);

    let info = client.get_group_info();
    assert_eq!(info.members.len(), 3);
    assert!(!info.is_closed);
    assert_eq!(info.expenses.len(), 0);
}

#[test]
fn test_add_expense_and_balances() {
    let (env, client) = setup_env();

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let carol = Address::generate(&env);

    let mut members = Vec::new(&env);
    members.push_back(alice.clone());
    members.push_back(bob.clone());
    members.push_back(carol.clone());

    client.create_group(&alice, &members);

    // Alice pays 300 (split equally among all 3 → each owes 100)
    let mut split = Vec::new(&env);
    split.push_back(alice.clone());
    split.push_back(bob.clone());
    split.push_back(carol.clone());

    client.add_expense(
        &alice,
        &300,
        &symbol_short!("dinner"),
        &symbol_short!("food"),
        &split,
    );

    let balances = client.get_balances();
    // alice paid 300, owes 100 → net +200
    // bob   paid 0, owes 100  → net -100
    // carol paid 0, owes 100  → net -100
    for (addr, bal) in balances.iter() {
        if addr == alice {
            assert_eq!(bal, 200);
        } else {
            assert_eq!(bal, -100);
        }
    }
}

#[test]
fn test_minimum_settlements() {
    let (env, client) = setup_env();

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let carol = Address::generate(&env);

    let mut members = Vec::new(&env);
    members.push_back(alice.clone());
    members.push_back(bob.clone());
    members.push_back(carol.clone());

    client.create_group(&alice, &members);

    // Expense 1: Alice pays 300 split equally (alice +200, bob -100, carol -100)
    let mut split_all = Vec::new(&env);
    split_all.push_back(alice.clone());
    split_all.push_back(bob.clone());
    split_all.push_back(carol.clone());

    client.add_expense(
        &alice,
        &300,
        &symbol_short!("dinner"),
        &symbol_short!("food"),
        &split_all.clone(),
    );

    // Expense 2: Bob pays 150 split equally (alice +100-50=+50, bob +100-50=+50, carol -50)
    // After: alice net = +200 + (-50) = +150 (she's in split but didn't pay this one — wait, let's recalc)
    // Bob pays 150, split among all 3 → each owes 50
    // alice: prev +200, now owes 50 → +150
    // bob: prev -100, paid 150, owes 50 → -100 + 150 - 50 = 0
    // carol: prev -100, owes 50 → -150
    client.add_expense(
        &bob,
        &150,
        &symbol_short!("taxi"),
        &symbol_short!("transport"),
        &split_all,
    );

    let settlements = client.calculate_settlements();
    // carol owes 150, alice is owed 150, bob is settled → 1 settlement
    assert_eq!(settlements.len(), 1);
    let s = settlements.get(0).unwrap();
    assert_eq!(s.from, carol);
    assert_eq!(s.to, alice);
    assert_eq!(s.amount, 150);
    assert!(!s.paid);
}

#[test]
fn test_mark_paid() {
    let (env, client) = setup_env();

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let mut members = Vec::new(&env);
    members.push_back(alice.clone());
    members.push_back(bob.clone());

    client.create_group(&alice, &members);

    let mut split = Vec::new(&env);
    split.push_back(alice.clone());
    split.push_back(bob.clone());

    // Alice pays 200, split between 2 → bob owes 100
    client.add_expense(
        &alice,
        &200,
        &symbol_short!("hotel"),
        &symbol_short!("hotel"),
        &split,
    );

    let settlements = client.calculate_settlements();
    assert_eq!(settlements.len(), 1);

    client.mark_paid(&bob, &bob, &alice);

    let info = client.get_group_info();
    assert!(info.settlements.get(0).unwrap().paid);
}

#[test]
fn test_close_group() {
    let (env, client) = setup_env();
    let alice = Address::generate(&env);
    let mut members = Vec::new(&env);
    members.push_back(alice.clone());
    client.create_group(&alice, &members);
    client.close_group(&alice);
    assert!(client.get_group_info().is_closed);
}

#[test]
#[should_panic]
fn test_add_expense_to_closed_group_panics() {
    let (env, client) = setup_env();
    let alice = Address::generate(&env);
    let mut members = Vec::new(&env);
    members.push_back(alice.clone());
    client.create_group(&alice, &members);
    client.close_group(&alice);
    let mut split = Vec::new(&env);
    split.push_back(alice.clone());
    client.add_expense(
        &alice,
        &100,
        &symbol_short!("test"),
        &symbol_short!("other"),
        &split,
    );
}
