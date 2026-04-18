import { useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useGroup } from "../hooks/useGroup"
import { useFreighter } from "../hooks/useFreighter"
import { generateLocalSummary, generateLocalPatterns } from "../lib/insights"
import { categoryEmoji, formatXLM } from "../lib/algorithm"
import type { Category } from "../types/splitflow"

const CATEGORIES: Category[] = ["food", "transport", "hotel", "activity", "other"]

export default function SummaryPage() {
  const navigate = useNavigate()
  const { group, balances } = useGroup()
  const { address } = useFreighter()

  // Compute all values before early return
  const totalSpent = group?.expenses.reduce((sum, e) => sum + e.amount, 0) ?? 0

  const categoryTotals = useMemo(
    () => {
      if (!group) return {}
      return CATEGORIES.reduce(
        (acc, cat) => {
          acc[cat] = group.expenses
            .filter((e) => e.category === cat)
            .reduce((sum, e) => sum + e.amount, 0)
          return acc
        },
        {} as Record<string, number>,
      )
    },
    [group],
  )

  const maxCatValue = Math.max(...CATEGORIES.map((c) => categoryTotals[c] ?? 0), 1)
  const topCat = CATEGORIES.reduce((best, cat) =>
    (categoryTotals[cat] ?? 0) > (categoryTotals[best] ?? 0) ? cat : best,
  )

  const summary = useMemo(
    () => {
      if (!group) return ""
      return generateLocalSummary({
        members: group.members,
        totalSpent,
        balances,
        expenses: group.expenses,
        categoryTotals,
      })
    },
    [group, balances, totalSpent, categoryTotals],
  )

  const patterns = useMemo(
    () => {
      if (!group) return {}
      return generateLocalPatterns(group.members, group.expenses)
    },
    [group],
  )

  const settledCount = group?.settlements.filter((s) => s.paid).length ?? 0

  useEffect(() => {
    if (!group) {
      void navigate("/split")
    }
  }, [group, navigate])

  if (!group) return null

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px" }}>
      {/* Back */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <button
          onClick={() => navigate("/group")}
          style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer", padding: 0 }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, color: "#f1f5f9", fontSize: 20 }}>Gezi Özeti</h2>
      </div>

      {/* Total hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a5f, #0f172a)",
          border: "1px solid #1e3a5f",
          borderRadius: 14,
          padding: 24,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 6 }}>Toplam Harcama</div>
        <div style={{ fontSize: 40, fontWeight: "bold", color: "#f1f5f9", fontFamily: "monospace" }}>
          {formatXLM(totalSpent)}
        </div>
        <div style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>
          {group.expenses.length} harcama · {group.members.length} kişi ·{" "}
          {formatXLM(group.members.length > 0 ? totalSpent / group.members.length : 0)} kişi başı
        </div>
      </div>

      {/* Category bar chart */}
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: 14,
          padding: 18,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: "bold", color: "#f1f5f9", marginBottom: 14 }}>
          Kategoriye Göre Harcama
        </div>
        {CATEGORIES.filter((c) => (categoryTotals[c] ?? 0) > 0).map((cat) => {
          const val = categoryTotals[cat] ?? 0
          const pct = (val / maxCatValue) * 100
          return (
            <div key={cat} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: "#94a3b8" }}>
                  {categoryEmoji(cat)} {cat}
                  {cat === topCat && (
                    <span style={{ color: "#fbbf24", marginLeft: 6, fontSize: 10 }}>★ En Yüksek</span>
                  )}
                </span>
                <span style={{ color: "#f1f5f9", fontFamily: "monospace" }}>{formatXLM(val)}</span>
              </div>
              <div style={{ background: "#1e293b", borderRadius: 4, height: 10, overflow: "hidden" }}>
                <div
                  style={{
                    height: 10,
                    borderRadius: 4,
                    width: `${pct}%`,
                    background: catColor(cat),
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          )
        })}
        {CATEGORIES.every((c) => (categoryTotals[c] ?? 0) === 0) && (
          <div style={{ color: "#475569", fontSize: 13, fontStyle: "italic" }}>Henüz harcama yok</div>
        )}
      </div>

      {/* Per-person */}
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: 14,
          padding: 18,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: "bold", color: "#f1f5f9", marginBottom: 14 }}>
          Kişi Başı Dağılım
        </div>
        {balances
          .sort((a, b) => b.totalPaid - a.totalPaid)
          .map((b) => (
            <div
              key={b.address}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "9px 0",
                borderBottom: "1px solid #1e293b",
                fontSize: 13,
              }}
            >
              <div>
                <span style={{ color: "#94a3b8", fontFamily: "monospace" }}>{b.shortName}</span>
                {b.address === address && (
                  <span style={{ color: "#3b82f6", marginLeft: 6, fontSize: 11, fontWeight: "bold" }}>SEN</span>
                )}
                <div style={{ fontSize: 11, color: "#475569" }}>
                  {patterns[b.address] ?? ""}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#f1f5f9", fontFamily: "monospace", fontWeight: "bold" }}>
                  {formatXLM(b.totalPaid)}
                </div>
                <div style={{ fontSize: 11, color: b.net > 0 ? "#22c55e" : b.net < 0 ? "#ef4444" : "#64748b" }}>
                  {b.net > 0 ? "+" : ""}{b.net.toFixed(2)} XLM net
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Otomatik özet */}
      {group.expenses.length > 0 && (
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1e3a5f",
            borderRadius: 14,
            padding: 18,
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: "bold", color: "#f1f5f9", marginBottom: 10 }}>
            📋 Gezi Özeti
          </div>
          <div
            style={{
              color: "#e2e8f0",
              fontSize: 13,
              lineHeight: 1.7,
              whiteSpace: "pre-line",
              background: "#1e293b",
              borderRadius: 10,
              padding: 14,
              borderLeft: "3px solid #3b82f6",
            }}
          >
            {summary}
          </div>
        </div>
      )}

      {/* Blockchain proof */}
      <div
        style={{
          background: "#052e16",
          border: "1px solid #166534",
          borderRadius: 12,
          padding: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 12, color: "#22c55e" }}>
          ✓ {settledCount} / {group.settlements.length} ödeme Stellar blockchain'de onaylandı
        </div>
        <button
          onClick={() => navigate("/split/settle")}
          style={{
            padding: "6px 14px",
            borderRadius: 8,
            border: "none",
            background: "#166534",
            color: "#22c55e",
            fontSize: 12,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Ödemeleri Gör →
        </button>
      </div>
    </div>
  )
}

function catColor(cat: string): string {
  switch (cat) {
    case "food": return "#f59e0b"
    case "transport": return "#3b82f6"
    case "hotel": return "#8b5cf6"
    case "activity": return "#22c55e"
    default: return "#64748b"
  }
}
