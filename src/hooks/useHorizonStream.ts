import { useEffect, useRef, useState } from "react"
import { streamPaymentsForAccount } from "../lib/stellar"
import type { HorizonPayment } from "../types/splitflow"

export function useHorizonStream(address: string | undefined) {
  const [payments, setPayments] = useState<HorizonPayment[]>([])
  const [lastPayment, setLastPayment] = useState<HorizonPayment | null>(null)
  const closeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!address) return

    closeRef.current = streamPaymentsForAccount(
      address,
      (payment) => {
        setLastPayment(payment)
        setPayments((prev) => [payment, ...prev].slice(0, 20))
      },
      (err) => {
        console.warn("Horizon stream error:", err)
      },
    )

    return () => {
      closeRef.current?.()
    }
  }, [address])

  function clearPayments() {
    setPayments([])
    setLastPayment(null)
  }

  return { payments, lastPayment, clearPayments }
}
