import { Contract, rpc as SorobanRpc, TransactionBuilder, scValToNative, xdr } from "@stellar/stellar-sdk"
import { rpcUrl, networkPassphrase } from "../contracts/util"
import type { Expense, GroupState, Settlement } from "../types/splitflow"

const rpc = new SorobanRpc.Server(rpcUrl, { allowHttp: true })

// Contract ID is stored in localStorage after deployment
export function getContractId(groupId: string): string | null {
  return localStorage.getItem(`splitflow_contract_${groupId}`)
}

export function setContractId(groupId: string, contractId: string) {
  localStorage.setItem(`splitflow_contract_${groupId}`, contractId)
}

// ── Helpers to call contract read functions ───────────────────────────────────

async function simulateCall(
  contractId: string,
  method: string,
  args: xdr.ScVal[] = [],
): Promise<unknown> {
  const account = await rpc.getAccount("GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN")
    .catch(() => ({ accountId: () => "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN", sequenceNumber: () => "0", incrementSequenceNumber: () => {} }))

  const contract = new Contract(contractId)

  const tx = new TransactionBuilder(account as Parameters<typeof TransactionBuilder>[0], {
    fee: "100",
    networkPassphrase: networkPassphrase as string,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build()

  const sim = await rpc.simulateTransaction(tx)
  if (SorobanRpc.Api.isSimulationError(sim)) {
    throw new Error(`Contract call failed: ${sim.error}`)
  }

  const result = (sim as SorobanRpc.Api.SimulateTransactionSuccessResponse).result
  if (!result) return null
  return scValToNative(result.retval)
}

// ── Public read helpers ───────────────────────────────────────────────────────

export async function fetchGroupState(contractId: string): Promise<GroupState | null> {
  try {
    const raw = await simulateCall(contractId, "get_group_info")
    if (!raw) return null
    return mapGroupState(raw as RawGroupState, contractId)
  } catch {
    return null
  }
}

interface RawGroupState {
  members: string[]
  expenses: RawExpense[]
  settlements: RawSettlement[]
  is_closed: boolean
}

interface RawExpense {
  payer: string
  amount: bigint
  description: string
  category: string
  timestamp: bigint
  split_among: string[]
}

interface RawSettlement {
  from: string
  to: string
  amount: bigint
  paid: boolean
}

function mapGroupState(raw: RawGroupState, contractId: string): GroupState {
  return {
    groupId: contractId,
    members: raw.members,
    isClosed: raw.is_closed,
    expenses: raw.expenses.map((e, i) => ({
      id: `expense-${i}`,
      payer: e.payer,
      amount: Number(e.amount) / 1e7,
      description: e.description,
      category: e.category as Expense["category"],
      timestamp: Number(e.timestamp),
      splitAmong: e.split_among,
    })),
    settlements: raw.settlements.map((s) => ({
      from: s.from,
      to: s.to,
      amount: Number(s.amount) / 1e7,
      paid: s.paid,
    })),
  }
}

// ── Local-only group store (when contract not yet deployed) ───────────────────

const LOCAL_KEY = "splitflow_local_group"

export function saveLocalGroup(state: GroupState) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(state))
}

export function loadLocalGroup(): GroupState | null {
  const raw = localStorage.getItem(LOCAL_KEY)
  if (!raw) return null
  return JSON.parse(raw) as GroupState
}

export function clearLocalGroup() {
  localStorage.removeItem(LOCAL_KEY)
}
