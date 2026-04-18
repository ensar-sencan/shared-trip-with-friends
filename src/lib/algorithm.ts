import type { Expense, MemberBalance, Settlement } from "../types/splitflow"
import { MOCK_NAMES, isMockAddress } from "./mockData"

export function computeBalances(
  members: string[],
  expenses: Expense[],
): MemberBalance[] {
  const paid: Record<string, number> = {}
  const owed: Record<string, number> = {}

  for (const m of members) {
    paid[m] = 0
    owed[m] = 0
  }

  for (const expense of expenses) {
    paid[expense.payer] = (paid[expense.payer] ?? 0) + expense.amount
    const share = expense.amount / expense.splitAmong.length
    for (const addr of expense.splitAmong) {
      owed[addr] = (owed[addr] ?? 0) + share
    }
  }

  return members.map((addr) => {
    const totalPaid = paid[addr] ?? 0
    const totalOwed = owed[addr] ?? 0
    return {
      address: addr,
      net: totalPaid - totalOwed,
      totalPaid,
      totalOwed,
      shortName: shortAddr(addr),
    }
  })
}

// Greedy debt-simplification: largest creditor ↔ largest debtor
export function computeSettlements(balances: MemberBalance[]): Settlement[] {
  const creditors = balances
    .filter((b) => b.net > 0.005)
    .map((b) => ({ address: b.address, amount: b.net }))
  const debtors = balances
    .filter((b) => b.net < -0.005)
    .map((b) => ({ address: b.address, amount: -b.net }))

  const settlements: Settlement[] = []

  while (creditors.length > 0 && debtors.length > 0) {
    creditors.sort((a, b) => b.amount - a.amount)
    debtors.sort((a, b) => b.amount - a.amount)

    const creditor = creditors[0]
    const debtor = debtors[0]

    const transfer = Math.min(creditor.amount, debtor.amount)

    settlements.push({
      from: debtor.address,
      to: creditor.address,
      amount: Math.round(transfer * 100) / 100,
      paid: false,
    })

    creditor.amount -= transfer
    debtor.amount -= transfer

    if (creditor.amount < 0.005) creditors.shift()
    if (debtor.amount < 0.005) debtors.shift()
  }

  return settlements
}

export function shortAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr
  
  // Check if it's a mock address and return the friendly name
  if (isMockAddress(addr)) {
    return MOCK_NAMES[addr] || addr
  }
  
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`
}

export function categoryEmoji(category: string): string {
  switch (category) {
    case "food":
      return "🍽️"
    case "transport":
      return "🚗"
    case "hotel":
      return "🏨"
    case "activity":
      return "🎯"
    default:
      return "📦"
  }
}

export function formatXLM(amount: number): string {
  // Convert stroops to XLM (1 XLM = 10,000,000 stroops)
  const xlm = amount / 10_000_000
  return `${xlm.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XLM`
}
