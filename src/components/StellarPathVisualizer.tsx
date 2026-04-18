import { useEffect, useRef } from "react"
import type { PaymentPath } from "../types/splitflow"

interface Props {
  paths: PaymentPath[]
  isLoading: boolean
  amount: number
  fromAddress: string
  toAddress: string
}

export default function StellarPathVisualizer({ paths, isLoading, amount, fromAddress, toAddress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const progressRef = useRef(0)

  const bestPath = paths[0]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !bestPath) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = 100

    const nodes = buildNodes(bestPath, fromAddress, toAddress, canvas.width)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw edges
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i]
        const b = nodes[i + 1]

        const grad = ctx.createLinearGradient(a.x, 50, b.x, 50)
        grad.addColorStop(0, "#3b82f6")
        grad.addColorStop(1, "#8b5cf6")

        ctx.beginPath()
        ctx.strokeStyle = grad
        ctx.lineWidth = 2
        ctx.setLineDash([5, 4])
        ctx.moveTo(a.x, 50)
        ctx.lineTo(b.x, 50)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Animated packet
      progressRef.current = (progressRef.current + 0.008) % 1
      const totalLen = nodes[nodes.length - 1].x - nodes[0].x
      const px = nodes[0].x + totalLen * progressRef.current

      const glow = ctx.createRadialGradient(px, 50, 0, px, 50, 10)
      glow.addColorStop(0, "rgba(251,191,36,1)")
      glow.addColorStop(1, "rgba(251,191,36,0)")
      ctx.beginPath()
      ctx.fillStyle = glow
      ctx.arc(px, 50, 10, 0, 2 * Math.PI)
      ctx.fill()

      // Nodes
      nodes.forEach((node) => {
        ctx.beginPath()
        ctx.arc(node.x, 50, 16, 0, 2 * Math.PI)
        ctx.fillStyle = "#1e293b"
        ctx.fill()
        ctx.strokeStyle = node.color
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.font = "bold 10px monospace"
        ctx.fillStyle = node.color
        ctx.textAlign = "center"
        ctx.fillText(node.label, node.x, 54)

        ctx.font = "9px sans-serif"
        ctx.fillStyle = "#64748b"
        ctx.fillText(node.sub, node.x, 82)
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [bestPath, fromAddress, toAddress])

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", color: "#fbbf24", fontSize: 13, padding: 16 }}>
        ⟳ Finding best Stellar DEX path…
      </div>
    )
  }

  if (!bestPath) return null

  return (
    <div style={{ background: "#0f172a", borderRadius: 10, padding: 12, border: "1px solid #1e3a5f" }}>
      <div style={{ fontSize: 12, color: "#3b82f6", fontWeight: "bold", marginBottom: 8 }}>
        ⚡ Stellar Path Payment — Best Route
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: 100, display: "block" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginTop: 6 }}>
        <span>Send: {parseFloat(bestPath.sourceAmount).toFixed(4)} {bestPath.sourceAsset}</span>
        <span>Receive: {amount.toFixed(4)} {bestPath.destAsset}</span>
        <span style={{ color: "#22c55e" }}>
          {bestPath.path.length === 0 ? "Direct" : `${bestPath.path.length} hop${bestPath.path.length > 1 ? "s" : ""}`}
        </span>
      </div>
    </div>
  )
}

interface PathNode {
  x: number
  label: string
  sub: string
  color: string
}

function buildNodes(path: PaymentPath, from: string, to: string, width: number): PathNode[] {
  const hops = path.path
  const total = hops.length + 2
  const step = (width - 60) / (total - 1)

  const nodes: PathNode[] = [
    { x: 30, label: path.sourceAsset, sub: from.slice(0, 6) + "…", color: "#3b82f6" },
    ...hops.map((h, i) => ({
      x: 30 + step * (i + 1),
      label: h.amount,
      sub: "DEX",
      color: "#8b5cf6",
    })),
    { x: 30 + step * (total - 1), label: path.destAsset, sub: to.slice(0, 6) + "…", color: "#22c55e" },
  ]

  return nodes
}
