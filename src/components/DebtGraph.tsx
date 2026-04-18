import { useEffect, useRef, useState, useMemo } from "react"
import type { MemberBalance, Settlement } from "../types/splitflow"
import { shortAddr, formatXLM } from "../lib/algorithm"

interface Props {
  members: string[]
  balances: MemberBalance[]
  settlements: Settlement[]
  animateSettle?: boolean
}

interface Node {
  x: number
  y: number
  address: string
  label: string
  net: number
}

interface Particle {
  x: number
  y: number
  progress: number
  speed: number
  edgeIdx: number
}

export default function DebtGraph({ members, balances, settlements, animateSettle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const nodesRef = useRef<Node[]>([])
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const lastDrawTime = useRef<number>(0)

  const pendingSettlements = useMemo(() => 
    settlements.filter((s) => !s.paid), 
    [settlements]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    canvas.width = W
    canvas.height = H

    // Place nodes in a circle
    const cx = W / 2
    const cy = H / 2
    const r = Math.min(W, H) * 0.35
    const nodes: Node[] = members.map((addr, i) => {
      const angle = (2 * Math.PI * i) / members.length - Math.PI / 2
      const bal = balances.find((b) => b.address === addr)
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        address: addr,
        label: shortAddr(addr),
        net: bal?.net ?? 0,
      }
    })
    nodesRef.current = nodes

    // Spawn fewer particles for better performance
    const spawnParticles = () => {
      const particles: Particle[] = []
      pendingSettlements.forEach((s, edgeIdx) => {
        const count = Math.min(3, Math.max(1, Math.round(s.amount / 50)))
        for (let i = 0; i < count; i++) {
          particles.push({
            x: 0,
            y: 0,
            progress: Math.random(),
            speed: 0.003 + Math.random() * 0.002,
            edgeIdx,
          })
        }
      })
      particlesRef.current = particles
    }
    spawnParticles()

    const draw = (timestamp: number) => {
      // Throttle to 30 FPS for better performance
      if (timestamp - lastDrawTime.current < 33) {
        animRef.current = requestAnimationFrame(draw)
        return
      }
      lastDrawTime.current = timestamp

      ctx.fillStyle = "#0f172a"
      ctx.fillRect(0, 0, W, H)

      // Draw edges
      pendingSettlements.forEach((s, idx) => {
        const from = nodes.find((n) => n.address === s.from)
        const to = nodes.find((n) => n.address === s.to)
        if (!from || !to) return

        const isHovered = hoveredNode === s.from || hoveredNode === s.to
        const alpha = isHovered ? 0.9 : 0.45
        const lw = Math.max(1, Math.min(5, s.amount / 30))

        // Gradient arrow line
        const grad = ctx.createLinearGradient(from.x, from.y, to.x, to.y)
        grad.addColorStop(0, `rgba(239,68,68,${alpha})`)
        grad.addColorStop(1, `rgba(34,197,94,${alpha})`)

        ctx.beginPath()
        ctx.strokeStyle = grad
        ctx.lineWidth = lw
        ctx.setLineDash([6, 4])
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.stroke()
        ctx.setLineDash([])

        // Arrowhead
        const angle = Math.atan2(to.y - from.y, to.x - from.x)
        const arrowLen = 10
        ctx.beginPath()
        ctx.fillStyle = `rgba(34,197,94,${alpha + 0.2})`
        ctx.moveTo(to.x, to.y)
        ctx.lineTo(
          to.x - arrowLen * Math.cos(angle - 0.4),
          to.y - arrowLen * Math.sin(angle - 0.4),
        )
        ctx.lineTo(
          to.x - arrowLen * Math.cos(angle + 0.4),
          to.y - arrowLen * Math.sin(angle + 0.4),
        )
        ctx.closePath()
        ctx.fill()

        // Amount label
        const mx = (from.x + to.x) / 2
        const my = (from.y + to.y) / 2
        ctx.font = "bold 11px monospace"
        ctx.fillStyle = "rgba(255,255,255,0.85)"
        ctx.textAlign = "center"
        ctx.fillText(formatXLM(s.amount), mx, my - 8)

        // Update + draw particles for this edge
        const edgeParticles = particlesRef.current.filter((p) => p.edgeIdx === idx)
        edgeParticles.forEach((p) => {
          p.progress += p.speed
          if (p.progress > 1) p.progress = 0
          p.x = from.x + (to.x - from.x) * p.progress
          p.y = from.y + (to.y - from.y) * p.progress

          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 6)
          glow.addColorStop(0, "rgba(251,191,36,0.95)")
          glow.addColorStop(1, "rgba(251,191,36,0)")
          ctx.beginPath()
          ctx.fillStyle = glow
          ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI)
          ctx.fill()
        })
      })

      // Draw nodes
      nodes.forEach((node) => {
        const isHov = hoveredNode === node.address
        const isCreditor = node.net > 0
        const isDebtor = node.net < 0
        const color = isCreditor ? "#22c55e" : isDebtor ? "#ef4444" : "#6b7280"
        const r = isHov ? 26 : 22

        // Glow ring
        const glow = ctx.createRadialGradient(node.x, node.y, r * 0.5, node.x, node.y, r * 1.8)
        glow.addColorStop(0, color + "55")
        glow.addColorStop(1, "transparent")
        ctx.beginPath()
        ctx.fillStyle = glow
        ctx.arc(node.x, node.y, r * 1.8, 0, 2 * Math.PI)
        ctx.fill()

        // Main circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
        ctx.fillStyle = "#1e293b"
        ctx.fill()
        ctx.strokeStyle = color
        ctx.lineWidth = isHov ? 3 : 2
        ctx.stroke()

        // Label
        ctx.font = "bold 10px monospace"
        ctx.fillStyle = "#f1f5f9"
        ctx.textAlign = "center"
        ctx.fillText(node.label, node.x, node.y + 4)

        // Balance below node
        const balText = node.net === 0 ? "✓" : `${node.net > 0 ? "+" : ""}${node.net.toFixed(1)}`
        ctx.font = "10px sans-serif"
        ctx.fillStyle = color
        ctx.fillText(balText, node.x, node.y + r + 14)
      })

      // Settled overlay
      if (animateSettle && pendingSettlements.length === 0) {
        ctx.font = "bold 20px sans-serif"
        ctx.fillStyle = "#22c55e"
        ctx.textAlign = "center"
        ctx.fillText("✓ All Settled!", W / 2, H / 2)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [members, balances, pendingSettlements, hoveredNode, animateSettle])

  // Handle hover
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const hit = nodesRef.current.find(
      (n) => Math.hypot(n.x - mx, n.y - my) < 26,
    )
    setHoveredNode(hit?.address ?? null)
  }

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", borderRadius: "12px", background: "#0f172a" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
      />
      {pendingSettlements.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 14,
            fontSize: 12,
            color: "#94a3b8",
            fontFamily: "monospace",
          }}
        >
          {pendingSettlements.length} pending transfer{pendingSettlements.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  )
}
