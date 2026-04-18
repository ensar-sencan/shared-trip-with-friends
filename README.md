# 💸 SplitFlow — Split Expenses on Stellar Blockchain

> **Stellar Meridian Hackathon 2025 Submission**

SplitFlow is a decentralized group expense splitting app built on the **Stellar blockchain**. Split costs with friends, calculate who owes what, and settle debts with real **Freighter wallet payments** — all on-chain.

---

## 🎬 Demo

> 📸 Screenshots and 🎥 demo video coming soon — see `/docs` folder after submission.

---

## ✨ Features

| Feature | Description |
|---|---|
| � **Freighter Wallet** | Connect your Stellar wallet manually |
| 💸 **Group Expenses** | Add expenses with categories & split among members |
| � **Debt Graph** | Animated canvas graph showing who owes whom |
| 🔀 **Path Payment** | Stellar Path Payment for optimal routing |
| 🧮 **Debt Optimization** | Greedy algorithm minimizes number of transfers |
| 💰 **Live Balances** | Real-time net balance per member |
| 🏆 **Karma Leaderboard** | Score members by payment behavior |
| 📱 **QR Invite** | Invite friends to a group via QR code |
| 📡 **Horizon SSE** | Live transaction feed from Horizon API |
| 🎭 **Demo Mode** | One-click demo with 5 users & 14 expenses |

---

## 🛠 Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Blockchain:** Stellar (Testnet)
- **Smart Contract:** Rust + Soroban
- **Wallet:** Freighter via `@creit.tech/stellar-wallets-kit`
- **Payments:** Stellar Path Payment (strict receive)
- **Streaming:** Horizon SSE API
- **Styling:** Custom CSS design system

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v22+
- [Freighter Wallet](https://www.freighter.app/) browser extension
- Freighter set to **Test Network**

### Install & Run

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/splitflow.git
cd splitflow

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🎮 Demo Mode

Don't have friends nearby? Use **Demo Mode**:

1. Connect Freighter wallet (Test Network)
2. Click **"🎮 Demo Modu"** on the home page
3. Instantly loads:
   - 5 users (You, Alice, Bob, Charlie, Diana)
   - 14 realistic expenses (hotel, food, transport, activities)
   - Live debt graph with animations
   - Your real debt to settle with Freighter

---

## 📸 Screenshots

> Add your screenshots here after taking them

```
docs/
├── screenshot-home.png
├── screenshot-group.png
├── screenshot-graph.png
├── screenshot-settle.png
└── demo-video.mp4
```

---

## 🏗 Project Structure

```
splitflow/
├── contracts/
│   └── splitflow/          # Rust Soroban smart contract
│       └── src/
│           ├── lib.rs       # Main contract logic
│           ├── types.rs     # Data types
│           └── error.rs     # Error handling
├── src/
│   ├── components/          # React components
│   │   ├── DebtGraph.tsx    # Animated canvas debt graph
│   │   ├── SettleCard.tsx   # Payment card
│   │   ├── KarmaLeaderboard.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useGroup.ts      # Group state management
│   │   ├── useFreighter.ts  # Wallet integration
│   │   └── useStellarPayment.ts
│   ├── lib/
│   │   ├── algorithm.ts     # Debt optimization algorithm
│   │   ├── stellar.ts       # Stellar SDK helpers
│   │   ├── mockData.ts      # Demo data
│   │   └── soroban.ts       # Contract interaction
│   └── pages/
│       ├── SplitHome.tsx    # Landing page
│       ├── Group.tsx        # Group dashboard
│       ├── SettleUp.tsx     # Payment page
│       └── Summary.tsx      # Trip summary
└── environments.toml        # Network configuration
```

---

## 🧮 Debt Optimization Algorithm

SplitFlow uses a **greedy debt simplification** algorithm to minimize the number of transfers needed:

```
Example:
  Alice paid 150 XLM (hotel) → split 5 ways
  Bob paid 40 XLM (taxi) → split 3 ways
  You paid 100 XLM (dinner) → split 5 ways

Naive: 8 transfers
Optimized: 3 transfers ✅
```

The same algorithm runs in the **Soroban smart contract** on-chain.

---

## 🔗 Smart Contract

The `splitflow` Soroban contract handles:

- `create_group` — Initialize group with members
- `add_expense` — Add expense with split logic
- `get_balances` — Net balance per member
- `calculate_settlements` — Minimum transfer set
- `mark_paid` — Record on-chain payment
- `close_group` — Finalize the trip

---

## 🌐 Stellar Integration

### Path Payment
Uses `pathPaymentStrictReceive` to find the best route:
```
You → [optional hops] → Alice
XLM → USDC → XLM (if better rate)
```

### Horizon SSE
Real-time payment streaming:
```typescript
server.payments().forAccount(address).cursor("now").stream(...)
```

### Testnet
All transactions on **Stellar Testnet** — safe to test!

---

## 🏆 Why SplitFlow Wins

1. **Real Blockchain Payments** — Not just a UI, actual Stellar transactions
2. **Smart Contract** — Rust/Soroban contract for on-chain logic
3. **Beautiful UX** — Animated debt graph, live balances, karma scores
4. **Demo Ready** — One-click demo for judges
5. **Production Quality** — TypeScript, error handling, notifications

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

## 👤 Author

Built for **Stellar Meridian Hackathon 2025**

---

*Powered by Stellar · Freighter · Soroban*
