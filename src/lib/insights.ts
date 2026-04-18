import type { Category, Expense, MemberBalance } from "../types/splitflow"
import { shortAddr, categoryEmoji } from "./algorithm"

const CATEGORIES: Category[] = ["food", "transport", "hotel", "activity", "other"]

// ── Yerel trip summary üretici ─────────────────────────────────────────────

export function generateLocalSummary(params: {
  members: string[]
  totalSpent: number
  balances: MemberBalance[]
  expenses: Expense[]
  categoryTotals: Record<string, number>
}): string {
  const { members, totalSpent, balances, expenses, categoryTotals } = params

  if (expenses.length === 0) return "Henüz harcama eklenmedi."

  // En çok harcayan kategori
  const topCat = CATEGORIES.reduce((best, cat) =>
    (categoryTotals[cat] ?? 0) > (categoryTotals[best] ?? 0) ? cat : best,
  )

  // En çok ödeyen kişi
  const topPayer = [...balances].sort((a, b) => b.totalPaid - a.totalPaid)[0]

  // En pahalı gün
  const byDay: Record<string, number> = {}
  for (const e of expenses) {
    const day = new Date(e.timestamp * 1000).toLocaleDateString("tr-TR", {
      weekday: "long",
      day: "numeric",
      month: "short",
    })
    byDay[day] = (byDay[day] ?? 0) + e.amount
  }
  const topDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0]

  // En büyük tek harcama
  const biggestExp = [...expenses].sort((a, b) => b.amount - a.amount)[0]

  const perPerson = totalSpent / members.length

  const lines = [
    `💰 Grup toplamda ${totalSpent.toFixed(2)} XLM harcadı — kişi başı ortalama ${perPerson.toFixed(2)} XLM.`,
    `${categoryEmoji(topCat)} En çok harcama ${topCat} kategorisinde (${(categoryTotals[topCat] ?? 0).toFixed(2)} XLM). ` +
      (topDay ? `En yoğun gün ${topDay[0]} ile ${topDay[1].toFixed(2)} XLM.` : ""),
    `🏆 Grubun bankacısı ${shortAddr(topPayer?.address ?? "")} — toplam ${topPayer?.totalPaid.toFixed(2) ?? 0} XLM ödedi. ` +
      (biggestExp
        ? `En büyük tek harcama: "${biggestExp.description}" (${biggestExp.amount.toFixed(2)} XLM).`
        : ""),
  ]

  return lines.join("\n\n")
}

// ── Yerel harcama kişilik analizi ─────────────────────────────────────────

export function generateLocalPatterns(
  members: string[],
  expenses: Expense[],
): Record<string, string> {
  const result: Record<string, string> = {}

  for (const addr of members) {
    const myExpenses = expenses.filter((e) => e.payer === addr)
    const totalPaid = myExpenses.reduce((s, e) => s + e.amount, 0)

    if (myExpenses.length === 0) {
      result[addr] = "😶 Henüz ödeme yapmadı"
      continue
    }

    // Hangi kategoride en çok öder?
    const catTotals = CATEGORIES.map((c) => ({
      cat: c,
      total: myExpenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
    }))
    const topCat = catTotals.sort((a, b) => b.total - a.total)[0]

    const avgAmount = totalPaid / myExpenses.length

    let personality = ""
    if (topCat.cat === "food") personality = "🍽️ Grubun yemek sponsoru"
    else if (topCat.cat === "transport") personality = "🚗 Her zaman araç kiralar"
    else if (topCat.cat === "hotel") personality = "🏨 Konfor düşkünü"
    else if (topCat.cat === "activity") personality = "🎯 Aktivite meraklısı"
    else personality = "📦 Her şeyi öder"

    if (avgAmount > 100) personality += " · büyük harcamalar yapar"
    else if (myExpenses.length >= 3) personality += " · sık sık öder"

    result[addr] = personality
  }

  return result
}

// ── Yerel ses transcript parse ─────────────────────────────────────────────

export function parseTranscriptLocally(transcript: string): {
  amount: number | null
  description: string
  category: Category
  payerHint: string
} {
  const lower = transcript.toLowerCase()

  // Miktar: "50", "50 lira", "50 dollar", "50 XLM"
  const amountMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:lira|tl|₺|dolar?|dollar?|xlm|euro?|€|\$)?/)
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(",", ".")) : null

  // Kategori keyword tespiti
  let category: Category = "other"
  if (/yemek|restoran|pizza|burger|cafe|kahve|dinner|lunch|breakfast|food|eat/.test(lower))
    category = "food"
  else if (/taksi|taxi|uber|otobüs|metro|tren|uçak|flight|transport|araba|car/.test(lower))
    category = "transport"
  else if (/otel|hotel|konaklama|hostel|airbnb/.test(lower)) category = "hotel"
  else if (/aktivite|müze|bilet|ticket|eğlence|konser|activity|tour/.test(lower))
    category = "activity"

  // Açıklama: miktar ve gereksiz kelimeleri çıkar
  const description = transcript
    .replace(/\d+(?:[.,]\d+)?\s*(?:lira|tl|dolar|dollar|xlm|euro|\$|€)?/gi, "")
    .replace(/\b(ödedi|paid|için|for|ve|and|the|a|an)\b/gi, "")
    .trim()
    .replace(/\s+/g, " ")
    || "Harcama"

  // İsim tespiti (büyük harfle başlayan kelime)
  const nameMatch = transcript.match(/\b([A-ZÇĞİÖŞÜ][a-zçğışöüa-z]+)\b/)
  const payerHint = nameMatch ? nameMatch[1] : ""

  return { amount, description, category, payerHint }
}
