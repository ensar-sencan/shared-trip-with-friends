import { useEffect, useRef, useState, useMemo } from "react"
import { computeBalances, computeSettlements } from "../lib/algorithm"
import { loadLocalGroup, saveLocalGroup } from "../lib/soroban"
import type { Expense, GroupState, MemberBalance, Settlement } from "../types/splitflow"

// Reduced polling for better performance
const POLL_MS = 10000

export function useGroup() {
  const [group, setGroup] = useState<GroupState | null>(() => loadLocalGroup())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastHashRef = useRef<string>("")

  // Memoized balances and settlements for performance
  const balances = useMemo(() => {
    if (!group) return []
    return computeBalances(group.members, group.expenses)
  }, [group?.members, group?.expenses])

  const settlements = useMemo(() => {
    if (!group) return []
    const computed = computeSettlements(balances)
    
    // Merge with stored settlements (preserve paid status)
    if (group.settlements.length > 0) {
      return group.settlements.map((stored) => {
        const match = computed.find(
          (c) => c.from === stored.from && c.to === stored.to,
        )
        return stored.paid ? stored : (match ?? stored)
      })
    }
    return computed
  }, [balances, group?.settlements])

  // Optimized polling with hash comparison
  useEffect(() => {
    const poll = () => {
      const stored = loadLocalGroup()
      if (stored) {
        // Fast hash comparison instead of JSON.stringify
        const hash = `${stored.expenses.length}-${stored.settlements.filter(s => s.paid).length}`
        if (hash !== lastHashRef.current) {
          lastHashRef.current = hash
          setGroup(stored)
        }
      }
      timerRef.current = setTimeout(poll, POLL_MS)
    }
    timerRef.current = setTimeout(poll, POLL_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function createGroup(members: string[]) {
    const newGroup: GroupState = {
      groupId: `group-${Date.now()}`,
      members,
      expenses: [],
      settlements: [],
      isClosed: false,
    }
    saveLocalGroup(newGroup)
    setGroup(newGroup)
  }

  function addExpense(expense: Omit<Expense, "id" | "timestamp">) {
    setGroup((prev) => {
      if (!prev) return prev
      const updated: GroupState = {
        ...prev,
        expenses: [
          ...prev.expenses,
          { ...expense, id: `exp-${Date.now()}`, timestamp: Math.floor(Date.now() / 1000) },
        ],
      }
      // Settlements will be computed by useMemo
      saveLocalGroup(updated)
      return updated
    })
  }

  function markPaid(from: string, to: string) {
    setGroup((prev) => {
      if (!prev) return prev
      const updated: GroupState = {
        ...prev,
        settlements: prev.settlements.map((s) =>
          s.from === from && s.to === to ? { ...s, paid: true } : s,
        ),
      }
      saveLocalGroup(updated)
      return updated
    })
  }

  function closeGroup() {
    setGroup((prev) => {
      if (!prev) return prev
      const updated = { ...prev, isClosed: true }
      saveLocalGroup(updated)
      return updated
    })
  }

  function resetGroup() {
    localStorage.removeItem("splitflow_local_group")
    setGroup(null)
    lastHashRef.current = ""
  }

  return { group, balances, settlements, createGroup, addExpense, markPaid, closeGroup, resetGroup }
}
