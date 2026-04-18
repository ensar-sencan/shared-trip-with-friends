import { useState } from "react"
import { findPaymentPaths } from "../lib/stellar"
import { useFreighter } from "./useFreighter"
import type { PaymentPath } from "../types/splitflow"

export function useStellarPayment() {
  const { address, sendPayment } = useFreighter()
  const [paths, setPaths] = useState<PaymentPath[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  async function loadPaths(to: string, amount: number) {
    if (!address) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await findPaymentPaths(address, to, amount)
      setPaths(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to find paths")
    } finally {
      setIsLoading(false)
    }
  }

  async function pay(params: {
    to: string
    amount: number
    token: "XLM" | "USDC"
  }): Promise<string | null> {
    setIsLoading(true)
    setError(null)
    setTxHash(null)
    try {
      const hash = await sendPayment(params)
      setTxHash(hash)
      return hash
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { paths, isLoading, error, txHash, loadPaths, pay }
}
