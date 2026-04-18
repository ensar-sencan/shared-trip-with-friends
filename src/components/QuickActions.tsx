import { useState } from "react"
import { useNavigate } from "react-router-dom"

interface Action {
  id: string
  icon: string
  label: string
  description: string
  action: () => void
  color: string
}

export default function QuickActions() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const actions: Action[] = [
    {
      id: "add-expense",
      icon: "💸",
      label: "Hızlı Gider",
      description: "Yeni harcama ekle",
      action: () => navigate("/split/add"),
      color: "var(--cyan)",
    },
    {
      id: "settle",
      icon: "⚡",
      label: "Öde",
      description: "Borçları öde",
      action: () => navigate("/split/settle"),
      color: "var(--amber)",
    },
    {
      id: "summary",
      icon: "📊",
      label: "Özet",
      description: "Trip özeti",
      action: () => navigate("/split/summary"),
      color: "var(--green)",
    },
    {
      id: "share",
      icon: "📱",
      label: "Paylaş",
      description: "QR ile davet",
      action: () => {
        // This will be handled by parent component
        setIsOpen(false)
      },
      color: "#a78bfa",
    },
  ]

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--cyan), #a78bfa)",
          border: "none",
          boxShadow: "0 8px 24px rgba(0,212,255,0.4)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          transition: "transform 0.2s, box-shadow 0.2s",
          zIndex: 1000,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)"
          e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,212,255,0.6)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)"
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,212,255,0.4)"
        }}
      >
        {isOpen ? "✕" : "⚡"}
      </button>

      {/* Actions Menu */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 100,
            right: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            zIndex: 999,
          }}
        >
          {actions.map((action, idx) => (
            <div
              key={action.id}
              onClick={action.action}
              style={{
                background: "var(--bg-surface)",
                border: `2px solid ${action.color}`,
                borderRadius: 12,
                padding: "12px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: 200,
                animation: `slideIn 0.3s ease-out ${idx * 0.05}s both`,
                boxShadow: `0 4px 12px ${action.color}33`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(-4px)"
                e.currentTarget.style.boxShadow = `0 6px 16px ${action.color}55`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(0)"
                e.currentTarget.style.boxShadow = `0 4px 12px ${action.color}33`
              }}
            >
              <div style={{ fontSize: 24 }}>{action.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 14 }}>
                  {action.label}
                </div>
                <div style={{ color: "var(--text-3)", fontSize: 11 }}>
                  {action.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  )
}
