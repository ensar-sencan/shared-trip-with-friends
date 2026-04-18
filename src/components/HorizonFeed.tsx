import { useEffect, useRef, useState } from "react"
import { streamPaymentsForAccount } from "../lib/stellar"
import { getExplorerUrl } from "../lib/stellar"
import { shortAddr } from "../lib/algorithm"
import type { HorizonPayment } from "../types/splitflow"

interface Props {
  watchAddresses: string[]
}

export default function HorizonFeed({ watchAddresses }: Props) {
  const [payments, setPayments] = useState<(HorizonPayment & { watchedAddr: string })[]>([])
  const [pulse, setPulse] = useState(false)
  const closeFnsRef = useRef<Array<() => void>>([])

  useEffect(() => {
    // Önceki stream'leri kapat
    closeFnsRef.current.forEach((fn) => fn())
    closeFnsRef.current = []

    watchAddresses.slice(0, 5).forEach((addr) => {
      const close = streamPaymentsForAccount(
        addr,
        (payment) => {
          setPulse(true)
          setTimeout(() => setPulse(false), 1000)
          setPayments((prev) =>
            [{ ...payment, watchedAddr: addr }, ...prev].slice(0, 15),
          )
        },
        (err) => console.warn("Horizon stream error:", err),
      )
      if (close) closeFnsRef.current.push(close)
    })

    return () => {
      closeFnsRef.current.forEach((fn) => fn())
      closeFnsRef.current = []
    }
  }, [watchAddresses.join(",")])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: pulse ? "#22c55e" : "#334155",
            transition: "background 0.3s",
            boxShadow: pulse ? "0 0 8px #22c55e" : "none",
          }}
        />
        <span style={{ fontSize: 13, fontWeight: "bold", color: "#f1f5f9" }}>
          Live Stellar Feed
        </span>
        <span style={{ fontSize: 11, color: "#64748b" }}>
          {watchAddresses.length} hesap izleniyor
        </span>
      </div>

      {payments.length === 0 ? (
        <div style={{ fontSize: 12, color: "#475569", fontStyle: "italic", padding: "10px 0" }}>
          On-chain ödeme bekleniyor… (testnet'te gerçek tx göründüğünde burada çıkar)
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {payments.map((p) => (
            <PaymentRow key={p.id} payment={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function PaymentRow({ payment }: { payment: HorizonPayment & { watchedAddr: string } }) {
  const timeAgo = formatTimeAgo(payment.createdAt)

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 8,
        background: "#1e293b",
        border: "1px solid #334155",
        fontSize: 12,
      }}
    >
      <div style={{ fontSize: 16 }}>⚡</div>
      <div style={{ flex: 1 }}>
        <span style={{ color: "#ef4444", fontFamily: "monospace" }}>{shortAddr(payment.from)}</span>
        <span style={{ color: "#64748b", margin: "0 4px" }}>→</span>
        <span style={{ color: "#22c55e", fontFamily: "monospace" }}>{shortAddr(payment.to)}</span>
      </div>
      <div style={{ color: "#fbbf24", fontWeight: "bold", fontFamily: "monospace" }}>
        {parseFloat(payment.amount).toFixed(4)} {payment.asset}
      </div>
      <div style={{ color: "#475569", fontSize: 10 }}>{timeAgo}</div>
      <a
        href={getExplorerUrl(payment.id)}
        target="_blank"
        rel="noreferrer"
        style={{ color: "#3b82f6", textDecoration: "none", fontSize: 14 }}
      >
        ↗
      </a>
    </div>
  )
}

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return `${secs}s önce`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}dk önce`
  return `${Math.floor(mins / 60)}sa önce`
}
