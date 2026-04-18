import { useState } from "react"
import { useVoiceInput } from "../hooks/useVoiceInput"
import ReceiptScanner from "./ReceiptScanner"
import type { Category, Expense, ReceiptData } from "../types/splitflow"
import { categoryEmoji, shortAddr } from "../lib/algorithm"

interface Props {
  members: string[]
  currentAddress?: string
  onSubmit: (expense: Omit<Expense, "id" | "timestamp">) => void
  onCancel: () => void
}

const CATEGORIES: Category[] = ["food", "transport", "hotel", "activity", "other"]

export default function ExpenseForm({ members, currentAddress, onSubmit, onCancel }: Props) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<Category>("food")
  const [payer, setPayer] = useState(currentAddress ?? members[0] ?? "")
  const [splitAmong, setSplitAmong] = useState<string[]>(members)
  const [showScanner, setShowScanner] = useState(false)

  const voice = useVoiceInput()

  const applyReceipt = (data: ReceiptData) => {
    setAmount(data.totalAmount.toFixed(2))
    setDescription(data.merchantName)
    setCategory(data.category)
    setShowScanner(false)
  }

  const applyVoice = () => {
    if (!voice.result) return
    if (voice.result.amount) setAmount(String(voice.result.amount))
    if (voice.result.description) setDescription(voice.result.description)
    setCategory(voice.result.category)
    voice.reset()
  }

  const toggleSplit = (addr: string) => {
    setSplitAmong((prev) =>
      prev.includes(addr) ? prev.filter((a) => a !== addr) : [...prev, addr],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description || splitAmong.length === 0) return
    onSubmit({
      payer,
      amount: parseFloat(amount),
      description,
      category,
      splitAmong,
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* AI Input Row */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => setShowScanner((v) => !v)}
          style={chipBtn(showScanner ? "#1e40af" : "#1e293b")}
        >
          📸 Scan Receipt
        </button>
        <button
          type="button"
          onClick={voice.isListening ? voice.stopListening : voice.startListening}
          style={chipBtn(voice.isListening ? "#7c3aed" : "#1e293b")}
          disabled={!voice.isSupported}
        >
          {voice.isListening ? "🔴 Listening…" : "🎙️ Voice Input"}
        </button>
      </div>

      {/* Voice feedback */}
      {(voice.transcript || voice.isParsing || voice.result) && (
        <div style={{ background: "#1e293b", borderRadius: 10, padding: 10, fontSize: 12 }}>
          {voice.transcript && (
            <div style={{ color: "#94a3b8", marginBottom: 6 }}>"{voice.transcript}"</div>
          )}
          {voice.isParsing && <div style={{ color: "#fbbf24" }}>⟳ Parsing with AI…</div>}
          {voice.result && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#22c55e" }}>
                ✓ {voice.result.description} · {voice.result.amount} XLM · {categoryEmoji(voice.result.category)}
              </span>
              <button type="button" onClick={applyVoice} style={chipBtn("#065f46", 10)}>
                Apply
              </button>
            </div>
          )}
        </div>
      )}

      {/* Receipt Scanner */}
      {showScanner && <ReceiptScanner onExtracted={applyReceipt} />}

      {/* Amount + Description */}
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: "0 0 120px" }}>
          <label style={labelStyle}>Amount (XLM)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={inputStyle}
            placeholder="0.00"
            required
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={inputStyle}
            placeholder="Dinner, taxi, hotel…"
            required
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label style={labelStyle}>Category</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              style={chipBtn(category === c ? "#1e40af" : "#1e293b")}
            >
              {categoryEmoji(c)} {c}
            </button>
          ))}
        </div>
      </div>

      {/* Payer */}
      <div>
        <label style={labelStyle}>Who paid?</label>
        <select
          value={payer}
          onChange={(e) => setPayer(e.target.value)}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          {members.map((m) => (
            <option key={m} value={m}>
              {shortAddr(m)}{m === currentAddress ? " (You)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Split Among */}
      <div>
        <label style={labelStyle}>Split among</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {members.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => toggleSplit(m)}
              style={chipBtn(splitAmong.includes(m) ? "#065f46" : "#1e293b")}
            >
              {splitAmong.includes(m) ? "✓ " : ""}{shortAddr(m)}
              {m === currentAddress ? " (You)" : ""}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
          {splitAmong.length > 0
            ? `Each pays ${amount ? (parseFloat(amount) / splitAmong.length).toFixed(2) : "?"} XLM`
            : "Select at least one person"}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="submit"
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: 10,
            border: "none",
            background: "#1d4ed8",
            color: "#fff",
            fontSize: 14,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Add Expense
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            border: "1px solid #334155",
            background: "transparent",
            color: "#94a3b8",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "#64748b",
  marginBottom: 4,
  fontWeight: "bold",
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#1e293b",
  color: "#f1f5f9",
  fontSize: 14,
  boxSizing: "border-box",
}

function chipBtn(bg: string, fontSize = 12): React.CSSProperties {
  return {
    padding: "6px 12px",
    borderRadius: 20,
    border: "none",
    background: bg,
    color: "#f1f5f9",
    fontSize,
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background 0.2s",
  }
}
