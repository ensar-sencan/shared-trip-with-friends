export default function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: 20,
    md: 40,
    lg: 60,
  }
  
  const s = sizeMap[size]
  
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
      <div
        className="sf-spin"
        style={{
          width: s,
          height: s,
          border: `3px solid rgba(0,212,255,0.2)`,
          borderTop: `3px solid var(--cyan)`,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
