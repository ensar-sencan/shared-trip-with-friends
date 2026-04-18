import { useState, useEffect } from "react"
import { useStellarPayment } from "../hooks/useStellarPayment"
import { getExplorerUrl } from "../lib/stellar"
import { formatXLM, shortAddr } from "../lib/algorithm"
import { showPaymentSuccessNotification, showPaymentErrorNotification, requestNotificationPermission } from "../lib/notifications"
import { isMockAddress } from "../lib/mockData"
import type { Settlement } from "../types/splitflow"

interface Props {
  settlement: Settlement
  currentAddress: string
  onPaid: (from: string, to: string, txHash: string) => void
  isDemo?: boolean
}

type Token = "XLM" | "USDC"

export default function SettleCard({ settlement, currentAddress, onPaid, isDemo = false }: Props) {
  const [token, setToken] = useState<Token>("XLM")
  const [showPath, setShowPath] = useState(false)
  const { isLoading, error, txHash, pay, loadPaths, paths } = useStellarPayment()

  const isMyDebt = settlement.from === currentAddress
  const isPaid = settlement.paid

  useEffect(() => {
    // Request notification permission on mount
    requestNotificationPermission()
  }, [])

  const handleSettle = () => {
    if (!isMyDebt) return
    void (async () => {
      try {
        // TRICK: If paying to a mock address (like Alice), actually pay to yourself
        // This allows local testing without needing multiple wallets
        const actualDestination = isMockAddress(settlement.to) ? currentAddress : settlement.to
        
        const hash = await pay({ to: actualDestination, amount: settlement.amount, token })
        if (hash) {
          onPaid(settlement.from, settlement.to, hash)
          showPaymentSuccessNotification(settlement.amount, settlement.to)
        }
      } catch (err) {
        showPaymentErrorNotification(err instanceof Error ? err.message : "Ödeme başarısız")
      }
    })()
  }

  const handleShowPath = async () => {
    setShowPath((v) => !v)
    if (!showPath && paths.length === 0) await loadPaths(settlement.to, settlement.amount)
  }

  return (
    <div
      className="sf-card"
      style={{
        borderColor: isPaid
          ? "rgba(16,185,129,0.35)"
          : isMyDebt
            ? "rgba(0,212,255,0.35)"
            : "var(--border)",
        background: isPaid ? "rgba(16,185,129,0.05)" : "var(--bg-surface)",
      }}
    >
      {/* From → To header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <AddressChip address={settlement.from} isYou={settlement.from === currentAddress} accent="red" />
        <div style={{ fontSize: 20, color: "var(--amber)" }}>→</div>
        <AddressChip address={settlement.to} isYou={settlement.to === currentAddress} accent="green" />

        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", fontFamily: "monospace" }}>
            {formatXLM(settlement.amount)}
          </div>
          {isPaid && (
            <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 700 }}>
              ✓ ON-CHAIN
            </div>
          )}
        </div>
      </div>

      {/* TX hash link */}
      {isPaid && settlement.txHash && (
        <a
          href={getExplorerUrl(settlement.txHash)}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "var(--cyan)", fontFamily: "monospace",
            textDecoration: "none", marginBottom: 12,
            padding: "4px 10px", borderRadius: 6,
            background: "var(--cyan-dim)", border: "1px solid var(--border-cyan)",
          }}
        >
          🔗 {settlement.txHash.slice(0, 18)}… ↗
        </a>
      )}

      {/* Path payment route toggle */}
      {!isPaid && (
        <button
          onClick={handleShowPath}
          style={{
            background: "none", border: "none", color: "var(--text-3)",
            fontSize: 12, cursor: "pointer", padding: "0 0 10px", display: "flex", alignItems: "center", gap: 4,
          }}
        >
          {showPath ? "▲" : "▼"} Stellar Path Payment rotası
        </button>
      )}

      {showPath && paths.length > 0 && (
        <div
          style={{
            background: "rgba(0,212,255,0.05)", border: "1px solid var(--border-cyan)",
            borderRadius: 8, padding: "8px 12px", fontSize: 12,
            color: "var(--text-2)", fontFamily: "monospace", marginBottom: 12,
          }}
        >
          <span style={{ color: "var(--cyan)" }}>{paths[0].sourceAsset}</span>
          {paths[0].path.map((h, i) => (
            <span key={i}> → <span style={{ color: "#a78bfa" }}>{h.amount}</span></span>
          ))}
          <span> → <span style={{ color: "var(--green)" }}>{paths[0].destAsset}</span></span>
          <span style={{ color: "var(--amber)", marginLeft: 12 }}>
            Kaynak: {parseFloat(paths[0].sourceAmount).toFixed(4)} {paths[0].sourceAsset}
          </span>
        </div>
      )}

      {/* Token selector + Pay button */}
      {isMyDebt && !isPaid && !isDemo && (
        <div>
          {/* Local test info */}
          {isMockAddress(settlement.to) && (
            <div style={{ 
              fontSize: 11, 
              color: "var(--amber)", 
              background: "rgba(245,158,11,0.1)", 
              padding: "6px 10px", 
              borderRadius: 6,
              marginBottom: 10,
              border: "1px solid rgba(245,158,11,0.2)"
            }}>
              💡 Local test: Ödeme kendi adresine gidecek (Alice mock kullanıcı)
            </div>
          )}
          
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 4 }}>
              {(["XLM", "USDC"] as Token[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setToken(t)}
                  className={`sf-chip ${token === t ? "sf-chip--active-cyan" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              className="sf-btn sf-btn--primary"
              style={{ flex: 1 }}
              onClick={handleSettle}
              disabled={isLoading}
            >
              {isLoading ? (
                <><span className="sf-spin">⟳</span> Freighter imzalanıyor…</>
              ) : (
                <>🚀 Freighter ile Öde</>
              )}
            </button>
          </div>
        </div>
      )}

      {isDemo && !isPaid && (
        <div style={{ fontSize: 13, color: "var(--text-3)", fontStyle: "italic", textAlign: "center", padding: "8px 0" }}>
          🎭 Demo kullanıcı - Sadece görsel amaçlı
        </div>
      )}

      {!isMyDebt && !isPaid && !isDemo && (
        <div style={{ fontSize: 13, color: "var(--text-3)", fontStyle: "italic" }}>
          ⏳ {shortAddr(settlement.from)} ödemesini bekliyor…
        </div>
      )}

      {error && (
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--red)", background: "var(--red-dim)", borderRadius: 6, padding: "6px 10px" }}>
          ⚠ {error}
        </div>
      )}

      {txHash && (
        <div style={{ marginTop: 10, fontSize: 12 }}>
          <a
            href={getExplorerUrl(txHash)}
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--cyan)", fontFamily: "monospace", textDecoration: "none" }}
          >
            ✓ Onaylandı: {txHash.slice(0, 20)}… ↗
          </a>
        </div>
      )}
    </div>
  )
}

function AddressChip({ address, isYou, accent }: { address: string; isYou: boolean; accent: "red" | "green" }) {
  const color = accent === "red" ? "var(--red)" : "var(--green)"
  const bg = accent === "red" ? "var(--red-dim)" : "var(--green-dim)"
  return (
    <div
      style={{
        padding: "5px 12px", borderRadius: 20,
        border: `1px solid ${isYou ? "var(--border-cyan)" : color + "55"}`,
        background: isYou ? "var(--cyan-dim)" : bg,
        fontSize: 12, fontFamily: "monospace", fontWeight: 700,
        color: isYou ? "var(--cyan)" : color,
      }}
    >
      {shortAddr(address)}{isYou ? " (Sen)" : ""}
    </div>
  )
}
