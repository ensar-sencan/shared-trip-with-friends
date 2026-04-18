import { useWallet } from "./useWallet"
import { buildPathPaymentTx, submitSignedTx } from "../lib/stellar"
import { Asset } from "@stellar/stellar-sdk"

export function useFreighter() {
  const { address, signTransaction, isPending, balances } = useWallet()

  const isConnected = Boolean(address)

  async function signAndSubmit(xdr: string): Promise<string> {
    if (!address) throw new Error("Wallet not connected")
    const signed = await signTransaction(xdr, { address })
    return submitSignedTx(signed.signedTxXdr)
  }

  async function sendPayment(params: {
    to: string
    amount: number
    token: "XLM" | "USDC"
  }): Promise<string> {
    if (!address) throw new Error("Wallet not connected")

    const destAsset = params.token === "USDC"
      ? new Asset("USDC", "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5")
      : Asset.native()

    const xdr = await buildPathPaymentTx({
      sourceAddress: address,
      destAddress: params.to,
      amount: params.amount,
      destAsset,
    })

    return signAndSubmit(xdr)
  }

  return {
    address,
    isConnected,
    isPending,
    balances,
    signAndSubmit,
    sendPayment,
  }
}
