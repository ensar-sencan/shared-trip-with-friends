import { useState } from "react"
import QRCode from "react-qr-code"
import type { GroupState } from "../types/splitflow"

interface Props {
  group: GroupState
  onClose: () => void
}

export default function QRSplitModal({ group, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const inviteUrl = `${window.location.origin}/join?groupId=${group.groupId}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e3a5f",
          borderRadius: 16,
          padding: 28,
          maxWidth: 340,
          width: "90%",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 20, fontWeight: "bold", color: "#f1f5f9", marginBottom: 6 }}>
          📱 Invite to Group
        </div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
          Scan to join & connect Freighter wallet
        </div>

        {/* QR Code */}
        <div
          style={{
            background: "#fff",
            padding: 16,
            borderRadius: 12,
            display: "inline-block",
            marginBottom: 18,
          }}
        >
          <QRCode value={inviteUrl} size={180} />
        </div>

        {/* Group info */}
        <div style={{ background: "#1e293b", borderRadius: 10, padding: 12, marginBottom: 16, textAlign: "left" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>Group ID</div>
          <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace", wordBreak: "break-all" }}>
            {group.groupId}
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 8, marginBottom: 4 }}>Members</div>
          <div style={{ fontSize: 12, color: "#f1f5f9" }}>{group.members.length} connected</div>
        </div>

        {/* Copy link */}
        <button
          onClick={copyLink}
          style={{
            width: "100%",
            padding: "11px",
            borderRadius: 10,
            border: "none",
            background: copied ? "#065f46" : "#1d4ed8",
            color: "#fff",
            fontSize: 14,
            fontWeight: "bold",
            cursor: "pointer",
            marginBottom: 10,
            transition: "background 0.2s",
          }}
        >
          {copied ? "✓ Copied!" : "🔗 Copy Invite Link"}
        </button>

        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#64748b",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
