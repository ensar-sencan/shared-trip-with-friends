export type Category = "food" | "transport" | "hotel" | "activity" | "other"

export interface Expense {
  id: string
  payer: string
  amount: number
  description: string
  category: Category
  timestamp: number
  splitAmong: string[]
}

export interface Settlement {
  from: string
  to: string
  amount: number
  paid: boolean
  txHash?: string
}

export interface MemberBalance {
  address: string
  net: number
  totalPaid: number
  totalOwed: number
  shortName: string
}

export interface GroupState {
  groupId: string
  members: string[]
  expenses: Expense[]
  settlements: Settlement[]
  isClosed: boolean
}

export interface KarmaScore {
  address: string
  score: number
  paidOnTime: number
  totalSettlements: number
  badges: Badge[]
}

export type BadgeId =
  | "group_banker"
  | "quick_settler"
  | "big_spender"
  | "weekend_warrior"
  | "always_late"

export interface Badge {
  id: BadgeId
  label: string
  emoji: string
}

export interface PathHop {
  from: string
  to: string
  amount: string
}

export interface PaymentPath {
  sourceAsset: string
  destAsset: string
  sourceAmount: string
  destAmount: string
  path: PathHop[]
}

export interface HorizonPayment {
  id: string
  from: string
  to: string
  amount: string
  asset: string
  createdAt: string
}

export interface ReceiptData {
  totalAmount: number
  merchantName: string
  category: Category
}
