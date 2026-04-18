import { useRef, useState } from "react"
import { useReceipt } from "../hooks/useReceipt"
import type { Category, ReceiptData } from "../types/splitflow"
import { categoryEmoji } from "../lib/algorithm"

interface Props {
  onExtracted: (data: ReceiptData) => void
}

const CATEGORIES: Category[] = ["food", "transport", "hotel", "activity", "other"]

export default function ReceiptScanner({ onExtracted }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const { preview, manualData, processFile, confirmData, reset } = useReceipt()
  const [amount, setAmount] = useState("")
  const [merchant, setMerchant] = useState("")
  const [category, setCategory] = useState<Category>(manualData.category ?? "other")

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
      setAmount("")
      setMerchant("")
    }
  }

  const handleConfirm = () => {
    if (!amount) return
    const data: ReceiptData = {
      totalAmount: parseFloat(amount),
      merchantName: merchant || "Fatura",
      category,
    }
    confirmData(data)
    onExtracted(data)
  }

  return (
    <div style={{ border: "1px dashed #334155", borderRadius: 12, padding: 16, background: "#0f172a" }}>
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10, fontWeight: "bold" }}>
        📸 Fiş / Fatura Yükle
      </div>

      {!preview ? (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => fileRef.current?.click()} style={btn("#1e40af")}>
            📁 Dosya Seç
          </button>
          <button
            onClick={() => {
              if (fileRef.current) {
                fileRef.current.setAttribute("capture", "environment")
                fileRef.current.click()
              }
            }}
            style={btn("#065f46")}
          >
            📷 Fotoğraf Çek
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        </div>
      ) : (
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <img
            src={preview}
            alt="Fiş"
            style={{ width: 80, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid #334155", flexShrink: 0 }}
          />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Tutar (XLM)"
              style={inputStyle}
            />
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="İşyeri adı"
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  style={btn(category === c ? "#1e40af" : "#1e293b", 11)}
                >
                  {categoryEmoji(c)} {c}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={handleConfirm} disabled={!amount} style={btn("#065f46")}>
                ✓ Kullan
              </button>
              <button onClick={reset} style={btn("#374151")}>
                ✕ Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function btn(bg: string, fontSize = 12): React.CSSProperties {
  return {
    padding: "6px 12px",
    borderRadius: 8,
    border: "none",
    background: bg,
    color: "#f1f5f9",
    fontSize,
    cursor: "pointer",
    fontWeight: "bold",
  }
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#1e293b",
  color: "#f1f5f9",
  fontSize: 13,
  boxSizing: "border-box",
}
