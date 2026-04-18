import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useGroup } from "../hooks/useGroup"
import { useFreighter } from "../hooks/useFreighter"
import { useStellarPayment } from "../hooks/useStellarPayment"
import SettleCard from "../components/SettleCard"
import DebtGraph from "../components/DebtGraph"
import StellarPathVisualizer from "../components/StellarPathVisualizer"
import HorizonFeed from "../components/HorizonFeed"
import { getExplorerUrl } from "../lib/stellar"

export default function SettleUpPage() {
  const navigate = useNavigate()
  const { group, balances, settlements, markPaid } = useGroup()
  const { address } = useFreighter()
  const { paths, isLoading: pathLoading, loadPaths } = useStellarPayment()
  const { pay } = useStellarPayment()
  const [settledAnim, setSettledAnim] = useState(false)
  const [selected, setSelected] = useState<{ to: string; amount: number } | null>(null)
  const [testTxHash, setTestTxHash] = useState<string | null>(null)
  const [testLoading, setTestLoading] = useState(false)
  const [testError, setTestError] = useState<string | null>(null)

  // Fix: navigate in useEffect, not during render
  useEffect(() => {
    if (!group || !address) {
      navigate("/split")
    }
  }, [group, address, navigate])

  const handleSelfTest = () => {
    if (!address) return
    void (async () => {
      setTestLoading(true)
      setTestError(null)
      setTestTxHash(null)
      try {
        const hash = await pay({ to: address, amount: 1, token: "XLM" })
        if (hash) setTestTxHash(hash)
      } catch (e) {
        setTestError(e instanceof Error ? e.message : "Hata")
      } finally {
        setTestLoading(false)
      }
    })()
  }

  if (!group || !address) return null

  const pending = settlements.filter((s) => !s.paid)
  const myDebts = pending.filter((s) => s.from === address)
  const otherDebts = pending.filter((s) => s.from !== address)
  const allSettled = pending.length === 0

  const handlePaid = (from: string, to: string) => {
    markPaid(from, to)
    if (pending.length <= 1) setSettledAnim(true)
  }

  const handleSelect = async (to: string, amount: number) => {
    setSelected({ to, amount })
    await loadPaths(to, amount)
  }

  return (
    <div className="sf-page sf-page--wide">

      <div className="sf-orb sf-orb--purple" style={{ width: 350, height: 350, top: -100, left: -100 }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, position: "relative" }}>
        <button
          className="sf-btn sf-btn--ghost sf-btn--sm"
          onClick={() => navigate("/group")}
          style={{ padding: "6px 10px" }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
          <span className="sf-gradient-text">Ödemeleri Tamamla</span>
        </h2>
        <div style={{ marginLeft: "auto" }}>
          <span
            className="sf-chip"
            style={allSettled
              ? { borderColor: "rgba(16,185,129,0.4)", background: "var(--green-dim)", color: "var(--green)" }
              : { borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)", color: "var(--amber)" }
            }
          >
            {allSettled ? "✓ Tamamlandı" : `${pending.length} bekliyor`}
          </span>
        </div>
      </div>

      {/* Debt Graph */}
      <div className="sf-card sf-card--glow-cyan" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {settledAnim ? "✓ Ödeme Sonrası" : "Güncel Borç Grafiği"}
        </div>
        <DebtGraph
          members={group.members}
          balances={balances}
          settlements={settlements}
          animateSettle={settledAnim}
        />
      </div>

      {/* Path visualizer */}
      {selected && (
        <div style={{ marginBottom: 20 }}>
          <StellarPathVisualizer
            paths={paths}
            isLoading={pathLoading}
            amount={selected.amount}
            fromAddress={address}
            toAddress={selected.to}
          />
        </div>
      )}

      {allSettled ? (
        <div className="sf-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            <span className="sf-gradient-text--green">Tüm borçlar ödendi!</span>
          </div>
          <div style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 28 }}>
            Her ödeme Stellar blockchain'e kaydedildi.
          </div>
          <button className="sf-btn sf-btn--primary sf-btn--lg" onClick={() => navigate("/split/summary")}>
            Trip Özeti →
          </button>
        </div>
      ) : (
        <div>
          {myDebts.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: "var(--red)", fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                ⚡ Senin Ödemelerin — Freighter ile İmzala
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {myDebts.map((s, i) => (
                  <div key={i} onClick={() => handleSelect(s.to, s.amount)} style={{ cursor: "pointer" }}>
                    <SettleCard settlement={s} currentAddress={address} onPaid={handlePaid} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {otherDebts.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                👥 Diğer Kullanıcıların Ödemeleri (Görsel)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {otherDebts.map((s, i) => (
                  <div key={i} style={{ opacity: 0.6, pointerEvents: "none" }}>
                    <SettleCard settlement={s} currentAddress={address} onPaid={() => {}} isDemo />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Freighter bağlantı testi */}
      <div className="sf-card sf-card--glow-purple" style={{ marginTop: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          🧪 Freighter Bağlantı Testi
        </div>
        <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 12 }}>
          Kendi adresine <strong>1 XLM</strong> gönderir — Freighter imzasını test et.
          (Bakiyen değişmez, sadece işlem ücreti düşer)
        </div>
        <button
          className="sf-btn sf-btn--cyan sf-btn--full"
          onClick={handleSelfTest}
          disabled={testLoading}
        >
          {testLoading
            ? <><span className="sf-spin">⟳</span> Freighter imzalanıyor…</>
            : "🚀 1 XLM Test Gönder (Kendi Adresine)"}
        </button>
        {testTxHash && (
          <div style={{ marginTop: 10 }}>
            <a
              href={getExplorerUrl(testTxHash)}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 12, color: "var(--cyan)", fontFamily: "monospace",
                textDecoration: "none", padding: "6px 12px",
                background: "var(--cyan-dim)", border: "1px solid var(--border-cyan)", borderRadius: 8,
              }}
            >
              ✓ Onaylandı! TX: {testTxHash.slice(0, 20)}… ↗
            </a>
          </div>
        )}
        {testError && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--red)", background: "var(--red-dim)", borderRadius: 6, padding: "6px 10px" }}>
            ⚠ {testError}
          </div>
        )}
      </div>

      {/* Horizon feed */}
      <div className="sf-card" style={{ marginTop: 16 }}>
        <HorizonFeed watchAddresses={[address]} />
      </div>

      <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "var(--text-3)" }}>
        Stellar Path Payment · Freighter imzalı işlemler
      </div>
    </div>
  )
}
