import { Routes, Route, Outlet, NavLink, useNavigate } from "react-router-dom"
import styles from "./App.module.css"
import { useWallet } from "./hooks/useWallet"
import { connectWallet, disconnectWallet } from "./util/wallet"
import SplitHome from "./pages/SplitHome"
import GroupPage from "./pages/Group"
import AddExpensePage from "./pages/AddExpense"
import SettleUpPage from "./pages/SettleUp"
import SummaryPage from "./pages/Summary"

function App() {
	return (
		<Routes>
			<Route element={<AppLayout />}>
				<Route path="/" element={<SplitHome />} />
				<Route path="/split" element={<SplitHome />} />
				<Route path="/group" element={<GroupPage />} />
				<Route path="/split/add" element={<AddExpensePage />} />
				<Route path="/split/settle" element={<SettleUpPage />} />
				<Route path="/split/summary" element={<SummaryPage />} />
			</Route>
		</Routes>
	)
}

const AppLayout: React.FC = () => {
	const navigate = useNavigate()
	const { address, isPending } = useWallet()
	const isConnected = Boolean(address)

	const handleConnect = async () => {
		await connectWallet()
	}

	const handleDisconnect = async () => {
		await disconnectWallet()
	}

	return (
		<div className={styles.AppLayout}>
			{/* Clean Professional Header */}
			<header style={{
				background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
				borderBottom: "1px solid rgba(0,212,255,0.2)",
				padding: "16px 24px",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				position: "sticky",
				top: 0,
				zIndex: 100,
				backdropFilter: "blur(10px)",
			}}>
				{/* Logo */}
				<div 
					onClick={() => navigate("/")}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 12,
						cursor: "pointer",
					}}
				>
					<div style={{ fontSize: 32 }}>💸</div>
					<div>
						<div style={{
							fontSize: 24,
							fontWeight: 800,
							background: "linear-gradient(135deg, var(--cyan), #a78bfa)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
						}}>
							SplitFlow
						</div>
						<div style={{ fontSize: 10, color: "var(--text-3)", marginTop: -2 }}>
							Stellar Blockchain
						</div>
					</div>
				</div>

				{/* Navigation */}
				<nav style={{ display: "flex", gap: 8 }}>
					<NavLink to="/split">
						{({ isActive }) => (
							<button 
								className="sf-btn sf-btn--ghost"
								style={isActive ? { 
									background: "var(--cyan-dim)", 
									borderColor: "var(--cyan)",
									color: "var(--cyan)" 
								} : {}}
							>
								🏠 Ana Sayfa
							</button>
						)}
					</NavLink>
					<NavLink to="/group">
						{({ isActive }) => (
							<button 
								className="sf-btn sf-btn--ghost"
								style={isActive ? { 
									background: "var(--cyan-dim)", 
									borderColor: "var(--cyan)",
									color: "var(--cyan)" 
								} : {}}
							>
								📊 Grup
							</button>
						)}
					</NavLink>
				</nav>

				{/* Wallet Connection */}
				<div>
					{isConnected ? (
						<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
							<div style={{
								padding: "8px 16px",
								background: "var(--green-dim)",
								border: "1px solid var(--green)",
								borderRadius: 8,
								display: "flex",
								alignItems: "center",
								gap: 8,
							}}>
								<span className="sf-dot sf-dot--green sf-dot--pulse" />
								<span style={{ 
									fontFamily: "monospace", 
									fontSize: 12, 
									color: "var(--green)",
									fontWeight: 600,
								}}>
									{address?.slice(0, 6)}...{address?.slice(-4)}
								</span>
							</div>
							<button 
								className="sf-btn sf-btn--ghost sf-btn--sm"
								onClick={handleDisconnect}
								style={{ color: "var(--red)" }}
							>
								Çıkış
							</button>
						</div>
					) : (
						<button 
							className="sf-btn sf-btn--primary"
							onClick={handleConnect}
							disabled={isPending}
						>
							{isPending ? "Yükleniyor..." : "🔐 Freighter Bağla"}
						</button>
					)}
				</div>
			</header>

			<main style={{ minHeight: "calc(100vh - 140px)" }}>
				<Outlet />
			</main>

			{/* Clean Footer */}
			<footer style={{
				background: "#0f172a",
				borderTop: "1px solid rgba(0,212,255,0.2)",
				padding: "24px",
				textAlign: "center",
			}}>
				<div style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 12 }}>
					Stellar Blockchain · Freighter Wallet · Soroban Smart Contracts
				</div>
				<div style={{ display: "flex", gap: 16, justifyContent: "center", fontSize: 12 }}>
					<a 
						href="https://stellar.org" 
						target="_blank" 
						rel="noreferrer"
						style={{ color: "var(--cyan)", textDecoration: "none" }}
					>
						⭐ Stellar
					</a>
					<a 
						href="https://www.freighter.app" 
						target="_blank" 
						rel="noreferrer"
						style={{ color: "var(--cyan)", textDecoration: "none" }}
					>
						🚀 Freighter
					</a>
					<a 
						href="https://soroban.stellar.org" 
						target="_blank" 
						rel="noreferrer"
						style={{ color: "var(--cyan)", textDecoration: "none" }}
					>
						🔷 Soroban
					</a>
				</div>
			</footer>
		</div>
	)
}

export default App
