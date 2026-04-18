import type { MemberBalance } from "../types/splitflow"
import { formatXLM } from "../lib/algorithm"

interface Props {
  balances: MemberBalance[]
  currentAddress?: string
}

export default function LiveBalance({ balances, currentAddress }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {balances.map((b) => {
        const isYou = b.address === currentAddress
        const isCreditor = b.net > 0.005
        const isDebtor = b.net < -0.005
        const color = isCreditor ? "var(--green)" : isDebtor ? "var(--red)" : "var(--text-3)"
        const bgColor = isCreditor ? "var(--green-dim)" : isDebtor ? "var(--red-dim)" : "var(--bg-surface)"
        const borderColor = isCreditor ? "rgba(16,185,129,0.3)" : isDebtor ? "rgba(244,63,94,0.3)" : "var(--border)"
        const icon = isCreditor ? "▲" : isDebtor ? "▼" : "●"
        const statusLabel = isCreditor ? "alacaklı" : isDebtor ? "borçlu" : "dengede"

        return (
          <div
            key={b.address}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              borderRadius: 12,
              background: isYou ? "rgba(0,212,255,0.06)" : bgColor,
              border: `1px solid ${isYou ? "var(--border-cyan)" : borderColor}`,
              transition: "var(--transition)",
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: `${color}18`,
              border: `2px solid ${color}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontFamily: "monospace", fontWeight: 800, color,
            }}>
              {b.shortName.slice(0, 2).toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 13, color: "var(--text)", fontFamily: "monospace", fontWeight: 600 }}>
                  {b.shortName}
                </span>
                {isYou && (
                  <span className="sf-chip sf-chip--active-cyan" style={{ fontSize: 10, padding: "2px 8px" }}>
                    SEN
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                ödedi {formatXLM(b.totalPaid)} · borç {formatXLM(b.totalOwed)}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color, fontFamily: "monospace" }}>
                {icon} {formatXLM(Math.abs(b.net))}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{statusLabel}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
