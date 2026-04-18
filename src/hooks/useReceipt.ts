import { useState } from "react"
import type { Category, ReceiptData } from "../types/splitflow"

export function useReceipt() {
  const [preview, setPreview] = useState<string | null>(null)
  const [manualData, setManualData] = useState<Partial<ReceiptData>>({})
  const [isReady, setIsReady] = useState(false)

  function processFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
      setIsReady(false)
      // Dosya adından kategori tahmini
      const name = file.name.toLowerCase()
      let category: Category = "other"
      if (/food|yemek|rest|cafe|pizza|burger/.test(name)) category = "food"
      else if (/taxi|uber|transfer|ulas/.test(name)) category = "transport"
      else if (/hotel|otel|hostel/.test(name)) category = "hotel"
      else if (/bilet|ticket|tour|aktivite/.test(name)) category = "activity"
      setManualData({ category })
    }
    reader.readAsDataURL(file)
  }

  function confirmData(data: ReceiptData) {
    setManualData(data)
    setIsReady(true)
  }

  function reset() {
    setPreview(null)
    setManualData({})
    setIsReady(false)
  }

  const result: ReceiptData | null = isReady
    ? {
        totalAmount: manualData.totalAmount ?? 0,
        merchantName: manualData.merchantName ?? "Harcama",
        category: manualData.category ?? "other",
      }
    : null

  return { preview, manualData, result, isReady, processFile, confirmData, reset }
}
