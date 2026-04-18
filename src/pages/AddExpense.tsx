import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useGroup } from "../hooks/useGroup"
import { useFreighter } from "../hooks/useFreighter"
import ExpenseForm from "../components/ExpenseForm"
import type { Expense } from "../types/splitflow"

export default function AddExpensePage() {
  const navigate = useNavigate()
  const { group, addExpense } = useGroup()
  const { address } = useFreighter()

  // Fix: navigate in useEffect, not during render
  useEffect(() => {
    if (!group) navigate("/split")
  }, [group, navigate])

  if (!group) return null

  const handleSubmit = (expense: Omit<Expense, "id" | "timestamp">) => {
    void addExpense(expense)
    void navigate("/group")
  }

  return (
    <div style={{ maxWidth: 540, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <button
          onClick={() => navigate("/group")}
          style={{
            background: "none",
            border: "none",
            color: "#64748b",
            fontSize: 20,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, color: "#f1f5f9", fontSize: 20 }}>Add Expense</h2>
      </div>

      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: 14,
          padding: 20,
        }}
      >
        <ExpenseForm
          members={group.members}
          currentAddress={address}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/group")}
        />
      </div>
    </div>
  )
}
