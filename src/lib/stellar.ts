import {
  Asset,
  Horizon,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk"
import { horizonUrl, networkPassphrase } from "../contracts/util"
import type { HorizonPayment, PaymentPath } from "../types/splitflow"

export const server = new Horizon.Server(horizonUrl, { allowHttp: true })

export const XLM = Asset.native()
export const USDC_TESTNET = new Asset(
  "USDC",
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
)

// Convert display amount (e.g. 10.5 XLM) to XLM string for SDK
// Handles both raw XLM floats and stroops (1 XLM = 10_000_000 stroops)
export function toXLMString(amount: number): string {
  const xlm = amount >= 1_000_000 ? amount / 10_000_000 : amount
  return xlm.toFixed(7)
}

// Keep toStroops as alias for backward compat
export function toStroops(amount: number): string {
  return toXLMString(amount)
}

export async function findPaymentPaths(
  sourceAddress: string,
  destAddress: string,
  destAmount: number,
  destAsset: Asset = XLM,
): Promise<PaymentPath[]> {
  try {
    const result = await server
      .strictReceivePaths(
        [XLM, USDC_TESTNET],
        destAsset,
        toStroops(destAmount),
      )
      .call()

    return result.records.map((r) => ({
      sourceAsset: r.source_asset_type === "native" ? "XLM" : r.source_asset_code ?? "?",
      destAsset: destAsset.isNative() ? "XLM" : destAsset.getCode(),
      sourceAmount: r.source_amount,
      destAmount: toStroops(destAmount),
      path: r.path.map((p, i) => ({
        from: i === 0 ? sourceAddress : `hop-${i}`,
        to: i === r.path.length - 1 ? destAddress : `hop-${i + 1}`,
        amount: p.asset_code ?? "XLM",
      })),
    }))
  } catch {
    // Fallback: direct XLM path
    return [
      {
        sourceAsset: "XLM",
        destAsset: destAsset.isNative() ? "XLM" : destAsset.getCode(),
        sourceAmount: toStroops(destAmount),
        destAmount: toStroops(destAmount),
        path: [],
      },
    ]
  }
}

export async function buildPathPaymentTx(params: {
  sourceAddress: string
  destAddress: string
  amount: number          // stroops OR XLM float — we normalise inside
  sourceAsset?: Asset
  destAsset?: Asset
  slippagePct?: number
}): Promise<string> {
  const {
    sourceAddress,
    destAddress,
    amount,
    sourceAsset = XLM,
    destAsset = XLM,
    slippagePct = 2,      // 2% slippage
  } = params

  // Normalise to XLM float regardless of input unit
  const xlmAmount = amount >= 1_000_000 ? amount / 10_000_000 : amount
  const destAmountStr = xlmAmount.toFixed(7)
  const sendMaxStr = (xlmAmount * (1 + slippagePct / 100)).toFixed(7)

  const account = await server.loadAccount(sourceAddress)

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: networkPassphrase as string,
  })
    .addOperation(
      Operation.pathPaymentStrictReceive({
        sendAsset: sourceAsset,
        sendMax: sendMaxStr,
        destination: destAddress,
        destAsset,
        destAmount: destAmountStr,
        path: [],
      }),
    )
    .setTimeout(60)
    .build()

  return tx.toXDR()
}

export async function submitSignedTx(signedXdr: string): Promise<string> {
  const { TransactionBuilder: TB } = await import("@stellar/stellar-sdk")
  const tx = TB.fromXDR(signedXdr, networkPassphrase as string)
  const result = await server.submitTransaction(tx)
  return result.hash
}

// ── Real-time Horizon SSE streaming ──────────────────────────────────────────

export function streamPaymentsForAccount(
  address: string,
  onPayment: (payment: HorizonPayment) => void,
  onError?: (err: unknown) => void,
): () => void {
  const closeStream = server
    .payments()
    .forAccount(address)
    .cursor("now")
    .stream({
      onmessage: (payment) => {
        if (
          payment.type !== "payment" &&
          payment.type !== "path_payment_strict_receive" &&
          payment.type !== "path_payment_strict_send"
        )
          return

        const p = payment as {
          id: string
          from: string
          to: string
          amount: string
          asset_type: string
          asset_code?: string
          created_at: string
        }

        onPayment({
          id: p.id,
          from: p.from,
          to: p.to,
          amount: p.amount,
          asset: p.asset_type === "native" ? "XLM" : (p.asset_code ?? "?"),
          createdAt: p.created_at,
        })
      },
      onerror: onError,
    })

  return closeStream as () => void
}

export function getExplorerUrl(txHash: string): string {
  const network = networkPassphrase?.includes("Test") ? "testnet" : "mainnet"
  return `https://stellar.expert/explorer/${network}/tx/${txHash}`
}
