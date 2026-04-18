#[soroban_sdk::contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    GroupAlreadyExists = 1,
    GroupNotFound = 2,
    GroupClosed = 3,
    NotAMember = 4,
    PayerNotInSplitList = 5,
    InvalidAmount = 6,
    SettlementNotFound = 7,
    AlreadyPaid = 8,
    UnauthorizedCaller = 9,
}
