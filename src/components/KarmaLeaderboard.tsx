import type { Expense, Settlement } from "../types/splitflow"
import { shortAddr } from "../lib/algorithm"

interface Props {
  members: string[]
  expenses: Expense[]
  settlements: Settlement[]
  currentAddress?: string
}

interface KarmaEntry {
  address: string
  score: number
  paidCount: number
  settledCount: number
  badges: { emoji: string; label: string }[]
}

export default function KarmaLeaderboard({ members, expenses, settlements, currentAddress }: Props) {
  const entries = computeKarma(members, expenses, settlements)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: "bold", color: "#f1f5f9", marginBottom: 4 }}>
        🏆 Group Karma
      </div>
      {entries.map((entry, rank) => {
        const isYou = entry.address === currentAddress
        const medalEmoji = rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `#${rank + 1}`

        return (
          <div
            key={entry.address}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 10,
              background: isYou ? "#1e3a5f" : "#1e293b",
              border: `1px solid ${isYou ? "#3b82f6" : "#334155"}`,
            }}
          >
            <div style={{ fontSize: 18, width: 28, textAlign: "center" }}>{medalEmoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "#f1f5f9", fontFamily: "monospace", fontWeight: "bold" }}>
                {shortAddr(entry.address)}
                {isYou && <span style={{ color: "#3b82f6", marginLeft: 6, fontSize: 11 }}>YOU</span>}
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                {entry.badges.map((b) => (
                  <span
                    key={b.label}
                    title={b.label}
                    style={{
                      fontSize: 11,
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 12,
                      padding: "2px 8px",
                      color: "#94a3b8",
                    }}
                  >
                    {b.emoji} {b.label}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: "bold", color: scoreColor(entry.score) }}>
                {entry.score}
              </div>
              <div style={{ fontSize: 10, color: "#64748b" }}>karma</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function computeKarma(members: string[], expenses: Expense[], settlements: Settlement[]): KarmaEntry[] {
  return members
    .map((addr) => {
      const paidCount = expenses.filter((e) => e.payer === addr).length
      const settledCount = settlements.filter((s) => s.from === addr && s.paid).length
      const totalPaid = expenses
        .filter((e) => e.payer === addr)
        .reduce((sum, e) => sum + e.amount, 0)

      let score = 0
      score += paidCount * 10
      score += settledCount * 20

      const badges: { emoji: string; label: string }[] = []

      if (totalPaid === Math.max(...expenses.map((e) => e.amount)) && expenses.length > 0) {
        badges.push({ emoji: "💸", label: "Big Spender" })
        score += 15
      }
      if (paidCount >= 3) {
        badges.push({ emoji: "🏦", label: "Group Banker" })
        score += 10
      }
      if (settledCount > 0 && settlements.filter((s) => s.from === addr).every((s) => s.paid)) {
        badges.push({ emoji: "⚡", label: "Quick Settler" })
        score += 25
      }
      const hasFood = expenses.some((e) => e.payer === addr && e.category === "food")
      if (hasFood) badges.push({ emoji: "🍽️", label: "Food Fan" })

      return { address: addr, score, paidCount, settledCount, badges }
    })
    .sort((a, b) => b.score - a.score)
}

function scoreColor(score: number): string {
  if (score >= 60) return "#fbbf24"
  if (score >= 30) return "#22c55e"
  return "#64748b"
}
