import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useGroup } from "../hooks/useGroup"
import { useFreighter } from "../hooks/useFreighter"
import DebtGraph from "../components/DebtGraph"
import LiveBalance from "../components/LiveBalance"
import KarmaLeaderboard from "../components/KarmaLeaderboard"
import QRSplitModal from "../components/QRSplitModal"
import LoadingSpinner from "../components/LoadingSpinner"
import QuickActions from "../components/QuickActions"
import { categoryEmoji, formatXLM, shortAddr } from "../lib/algorithm"
import { isMockAddress } from "../lib/mockData"

type Tab = "graph" | "balance" | "expenses" | "karma"

export default function GroupPage() {
  const navigate = useNavigate()
  const { group, balances, settlements } = useGroup()
  const { address } = useFreighter()
  const [tab, setTab] = useState<Tab>("graph")
  const [showQR, setShowQR] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="sf-page" style={{ textAlign: "center", paddingTop: 80 }}>
        <LoadingSpinner size="lg" />
        <div style={{ color: "var(--text-2)", marginTop: 16 }}>
          Grup yükleniyor...
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="sf-page" style={{ textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>💸</div>
        <div style={{ color: "var(--text-2)", marginBottom: 24, fontSize: 15 }}>
          Aktif grup yok
        </div>
        <button className="sf-btn sf-btn--primary sf-btn--lg" onClick={() => navigate("/split")}>
          Grup Oluştur veya Katıl
        </button>
      </div>
    )
  }

  const pending = settlements.filter((s) => !s.paid)
  const settled = settlements.filter((s) => s.paid)
  const totalSpent = group.expenses.reduce((sum, e) => sum + e.amount, 0)
  
  // Mock members for demo mode indicator
  const mockMembers = group.members.filter(m => isMockAddress(m))

  const TABS: { id: Tab; label: string }[] = [
    { id: "graph", label: "📊 Graf" },
    { id: "balance", label: "💰 Bakiye" },
    { id: "expenses", label: "🧾 Harcamalar" },
    { id: "karma", label: "🏆 Karma" },
  ]

  return (
    <div className="sf-page sf-page--wide">

      {/* Orbs */}
      <div className="sf-orb sf-orb--cyan" style={{ width: 300, height: 300, top: -80, right: -80 }} />

      {/* Demo mode indicator */}
      {mockMembers.length > 0 && pending.length > 0 && (
        <div className="sf-alert" style={{ marginBottom: 20, background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <div>
              <div style={{ color: "var(--red)", fontWeight: 700, fontSize: 14 }}>
                {pending.length} Ödeme Bekliyor
              </div>
              <div style={{ color: "rgba(239,68,68,0.7)", fontSize: 12, marginTop: 2 }}>
                Borçlarını Freighter ile blockchain'e kaydet
              </div>
            </div>
            <button 
              className="sf-btn sf-btn--primary" 
              onClick={() => navigate("/split/settle")}
              style={{ marginLeft: "auto" }}
            >
              Ödemeleri Gör →
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, position: "relative" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
            <span className="sf-gradient-text">Grup Paneli</span>
          </h2>
          <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "monospace", marginTop: 4 }}>
            {group.groupId}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="sf-btn sf-btn--ghost sf-btn--sm" onClick={() => setShowQR(true)}>
            📱 Davet
          </button>
          <button className="sf-btn sf-btn--primary" onClick={() => navigate("/split/add")}>
            + Gider Ekle
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Üyeler", value: group.members.length, color: "var(--cyan)" },
          { label: "Harcama", value: group.expenses.length, color: "#a78bfa" },
          { label: "Toplam", value: formatXLM(totalSpent), color: "var(--amber)" },
          {
            label: "Bekleyen",
            value: pending.length,
            color: pending.length > 0 ? "var(--red)" : "var(--green)",
          },
        ].map((s) => (
          <div className="sf-stat" key={s.label}>
            <div className="sf-stat__value" style={{ color: s.color }}>{s.value}</div>
            <div className="sf-stat__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Settle CTA */}
      {pending.length > 0 && (
        <div className="sf-alert sf-alert--warning" style={{ marginBottom: 20 }}>
          <div>
            <div style={{ color: "var(--amber)", fontWeight: 700, fontSize: 14 }}>
              ⚡ {pending.length} ödeme bekliyor
            </div>
            <div style={{ color: "rgba(245,158,11,0.6)", fontSize: 12, marginTop: 2 }}>
              Freighter ile Stellar Path Payment üzerinden öde
            </div>
          </div>
          <button className="sf-btn sf-btn--primary" onClick={() => navigate("/split/settle")}>
            Öde →
          </button>
        </div>
      )}

      {settled.length > 0 && pending.length === 0 && (
        <div className="sf-alert sf-alert--success" style={{ marginBottom: 20 }}>
          <div style={{ color: "var(--green)", fontWeight: 700 }}>
            ✓ Tüm ödemeler blockchain'de tamamlandı!
          </div>
          <button className="sf-btn sf-btn--success sf-btn--sm" onClick={() => navigate("/split/summary")}>
            Özet →
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="sf-tabs" style={{ marginBottom: 18 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`sf-tab ${tab === t.id ? "sf-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="sf-animate-in" key={tab}>
        {tab === "graph" && (
          <div className="sf-card sf-card--glow-cyan">
            <DebtGraph members={group.members} balances={balances} settlements={settlements} />
          </div>
        )}

        {tab === "balance" && (
          <LiveBalance balances={balances} currentAddress={address} />
        )}

        {tab === "expenses" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {group.expenses.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-3)" }}>
                Henüz harcama yok.{" "}
                <button
                  onClick={() => navigate("/split/add")}
                  style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer", fontWeight: 600 }}
                >
                  İlk harcamayı ekle →
                </button>
              </div>
            ) : (
              [...group.expenses].reverse().map((exp) => (
                <div key={exp.id} className="sf-card" style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                      background: "var(--bg-surface-2)", border: "1px solid var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                    }}>
                      {categoryEmoji(exp.category)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>
                        {exp.description}
                      </div>
                      <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 2 }}>
                        {shortAddr(exp.payer)}{exp.payer === address ? " (Sen)" : ""} ödedi
                        · {exp.splitAmong.length} kişiye bölündü
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "var(--text)", fontWeight: 700, fontFamily: "monospace" }}>
                        {formatXLM(exp.amount)}
                      </div>
                      <div style={{ color: "var(--text-3)", fontSize: 11 }}>
                        {formatXLM(exp.amount / exp.splitAmong.length)} / kişi
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "karma" && (
          <KarmaLeaderboard
            members={group.members}
            expenses={group.expenses}
            settlements={settlements}
            currentAddress={address}
          />
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
        <button className="sf-btn sf-btn--ghost" style={{ flex: 1 }} onClick={() => navigate("/split/summary")}>
          📋 Özet
        </button>
        <button className="sf-btn sf-btn--ghost" style={{ flex: 1 }} onClick={() => navigate("/split")}>
          ← Ana Sayfa
        </button>
      </div>

      {showQR && group && <QRSplitModal group={group} onClose={() => setShowQR(false)} />}
      
      <QuickActions />
    </div>
  )
}
