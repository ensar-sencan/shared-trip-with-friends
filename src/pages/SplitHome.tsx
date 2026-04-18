import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useGroup } from "../hooks/useGroup"
import { useFreighter } from "../hooks/useFreighter"
import ConnectAccount from "../components/ConnectAccount"
import { shortAddr } from "../lib/algorithm"
import { createDemoGroup } from "../lib/mockData"
import { saveLocalGroup } from "../lib/soroban"

export default function SplitHome() {
  const navigate = useNavigate()
  const { addExpense } = useGroup()
  const { address, isConnected } = useFreighter()

  const [mode, setMode] = useState<"idle" | "create" | "join">("idle")
  const [memberInput, setMemberInput] = useState("")
  const [members, setMembers] = useState<string[]>([])
  const [joinId, setJoinId] = useState("")
  const [error, setError] = useState("")

  const loadDemo = () => {
    if (!address) return
    
    // Create a rich demo group with mock users and expenses
    const demoGroup = createDemoGroup(address)
    
    // Save to localStorage
    saveLocalGroup(demoGroup)
    
    // Navigate to group page to see the beautiful graphs!
    navigate("/group")
  }

  const addMember = () => {
    const addr = memberInput.trim()
    if (!addr.startsWith("G") || addr.length !== 56) {
      setError("Geçersiz Stellar adresi (G ile başlayıp 56 karakter olmalı)")
      return
    }
    if (members.includes(addr)) { setError("Zaten eklendi"); return }
    setMembers((p) => [...p, addr])
    setMemberInput("")
    setError("")
  }

  const handleCreate = () => {
    if (!address) return
    const all = members.includes(address) ? members : [address, ...members]
    void createGroup(all)
    void navigate("/group")
  }

  const handleJoin = () => {
    if (joinId.trim()) navigate(`/group?id=${joinId.trim()}`)
  }

  return (
    <div className="sf-page" style={{ maxWidth: 560 }}>

      {/* ── Floating orbs ── */}
      <div className="sf-orb sf-orb--cyan"
        style={{ width: 400, height: 400, top: -100, left: -150 }} />
      <div className="sf-orb sf-orb--purple"
        style={{ width: 300, height: 300, top: 50, right: -100 }} />

      {/* ── Hero ── */}
      <div className="sf-animate-in" style={{ textAlign: "center", marginBottom: 44, position: "relative" }}>
        <div style={{ fontSize: 64, marginBottom: 12, filter: "drop-shadow(0 0 24px rgba(0,212,255,0.5))" }}>
          💸
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, margin: "0 0 10px", lineHeight: 1.1 }}>
          <span className="sf-gradient-text">SplitFlow</span>
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 16, margin: "0 0 24px", lineHeight: 1.5 }}>
          Grup masraflarını hesapla,<br />
          <span style={{ color: "var(--cyan)", fontWeight: 600 }}>Stellar blockchain</span> üzerinden öde.
        </p>

        {/* Feature chips */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            ["⚡", "Freighter Cüzdan"],
            ["🔀", "Path Payment"],
            ["📊", "Borç Grafiği"],
            ["📡", "Canlı Horizon"],
            ["🏆", "Karma Puanı"],
            ["📱", "QR Davet"],
          ].map(([icon, label]) => (
            <span key={label} className="sf-chip">
              {icon} {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Wallet card ── */}
      <div
        className={`sf-card sf-animate-in ${isConnected ? "sf-card--glow-green" : ""}`}
        style={{ marginBottom: 16, animationDelay: "0.1s" }}
      >
        <div className="sf-label" style={{ marginBottom: 12 }}>
          🔐 Adım 1 — Freighter Cüzdanını Bağla
        </div>

        {isConnected ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="sf-dot sf-dot--green sf-dot--pulse" />
            <span style={{ color: "var(--green)", fontWeight: 700, fontSize: 14 }}>Bağlandı</span>
            <span className="sf-address">{shortAddr(address!)}</span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-3)" }}>Testnet</span>
          </div>
        ) : (
          <div>
            <p style={{ color: "var(--text-2)", fontSize: 13, margin: "0 0 14px", lineHeight: 1.6 }}>
              Freighter uzantısını yükle → ağı <strong style={{ color: "var(--cyan)" }}>Test Network</strong> yap → bağlan.
            </p>
            <ConnectAccount />
          </div>
        )}
      </div>

      {/* ── Demo Mode ── */}
      {isConnected && (
        <div
          className="sf-card sf-card--glow-purple sf-animate-in"
          style={{ marginBottom: 16, animationDelay: "0.15s" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 3 }}>
                🎮 Demo Modu
              </div>
              <div style={{ fontSize: 13, color: "var(--text-2)" }}>
                5 kullanıcı, 14 harcama → Gerçek borçlarını Freighter ile öde
              </div>
            </div>
            <button className="sf-btn sf-btn--cyan" onClick={loadDemo}>
              Demoyu Yükle →
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              ["👥", "5 Kullanıcı"],
              ["🧾", "14 Harcama"],
              ["💰", "Zengin Borç Grafiği"],
            ].map(([icon, label]) => (
              <div
                key={label}
                style={{
                  flex: 1,
                  background: "rgba(124,58,237,0.08)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  borderRadius: 8,
                  padding: "7px 10px",
                  fontSize: 12,
                  color: "var(--text-2)",
                  textAlign: "center",
                }}
              >
                {icon} {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Create / Join ── */}
      {isConnected && (
        <div className="sf-animate-in" style={{ animationDelay: "0.2s" }}>
          <div className="sf-label" style={{ marginBottom: 10 }}>
            🚀 Adım 2 — Grup Oluştur veya Katıl
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <button
              className={`sf-btn ${mode === "create" ? "sf-btn--primary" : "sf-btn--ghost"}`}
              style={{ flex: 1 }}
              onClick={() => setMode(mode === "create" ? "idle" : "create")}
            >
              + Grup Oluştur
            </button>
            <button
              className={`sf-btn ${mode === "join" ? "sf-btn--cyan" : "sf-btn--ghost"}`}
              style={{ flex: 1 }}
              onClick={() => setMode(mode === "join" ? "idle" : "join")}
            >
              Gruba Katıl
            </button>
          </div>

          {mode === "create" && (
            <div className="sf-card sf-animate-in" style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
                Yeni Grup
              </div>

              <div style={{ marginBottom: 10 }}>
                <div className="sf-label">Senin adresin (otomatik)</div>
                <div className="sf-address" style={{ fontSize: 11 }}>{address}</div>
              </div>

              <div className="sf-label">Üye ekle (G… adresi)</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  className="sf-input"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMember()}
                  placeholder="GABC…XYZ"
                />
                <button className="sf-btn sf-btn--success" onClick={addMember}>+ Ekle</button>
              </div>

              {error && (
                <div style={{ color: "var(--red)", fontSize: 12, marginBottom: 8 }}>{error}</div>
              )}

              {members.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                  {members.map((m) => (
                    <div key={m} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span className="sf-address" style={{ fontSize: 11 }}>{shortAddr(m)}</span>
                      <button
                        onClick={() => setMembers((p) => p.filter((x) => x !== m))}
                        style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 16 }}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}

              <button className="sf-btn sf-btn--primary sf-btn--full" onClick={handleCreate}>
                🚀 Oluştur ve Panele Git
              </button>
            </div>
          )}

          {mode === "join" && (
            <div className="sf-card sf-animate-in">
              <div className="sf-label" style={{ marginBottom: 8 }}>Grup ID veya QR kodu ile katıl</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="sf-input"
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  placeholder="group-1234567890"
                />
                <button className="sf-btn sf-btn--cyan" onClick={handleJoin}>Katıl →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ textAlign: "center", marginTop: 48, fontSize: 12, color: "var(--text-3)" }}>
        Stellar Soroban · Freighter · Horizon SSE
      </div>
    </div>
  )
}
