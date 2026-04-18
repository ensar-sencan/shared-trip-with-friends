/**
 * Mock data for demo purposes
 * Creates realistic-looking Stellar addresses and expenses for visual demonstration
 * Note: Amounts are in stroops (1 XLM = 10,000,000 stroops)
 */

import type { Expense, GroupState } from "../types/splitflow"

// Generate realistic-looking Stellar addresses for demo
export const MOCK_ADDRESSES = {
  alice: "GALICE7XKQWXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQ",
  bob: "GBOBBBB7XKQWXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQ",
  charlie: "GCHARLI7XKQWXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQ",
  diana: "GDIANA77XKQWXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQ",
}

export const MOCK_NAMES: Record<string, string> = {
  [MOCK_ADDRESSES.alice]: "Alice",
  [MOCK_ADDRESSES.bob]: "Bob",
  [MOCK_ADDRESSES.charlie]: "Charlie",
  [MOCK_ADDRESSES.diana]: "Diana",
}

// Helper to convert XLM to stroops
const xlm = (amount: number) => amount * 10_000_000

/**
 * Generate mock expenses for demo - YOU OWE ~10 XLM to Alice
 * @param realUserAddress - Your actual Freighter address (will be included in the group)
 * @returns Array of mock expenses with realistic scenarios
 */
export function generateMockExpenses(realUserAddress: string): Expense[] {
  const allMembers = [
    realUserAddress,
    MOCK_ADDRESSES.alice,
    MOCK_ADDRESSES.bob,
    MOCK_ADDRESSES.charlie,
    MOCK_ADDRESSES.diana,
  ]

  const now = Math.floor(Date.now() / 1000)
  const dayInSeconds = 86400

  return [
    // Day 1 - Arrival
    {
      id: "mock-exp-1",
      payer: MOCK_ADDRESSES.alice,
      amount: xlm(150), // 150 XLM - Hotel
      description: "Otel Rezervasyonu",
      category: "hotel" as const,
      timestamp: now - dayInSeconds * 4,
      splitAmong: allMembers, // 5 people = 30 XLM each
    },
    {
      id: "mock-exp-2",
      payer: MOCK_ADDRESSES.bob,
      amount: xlm(40), // 40 XLM - Taxi
      description: "Havaalanı Taksisi",
      category: "transport" as const,
      timestamp: now - dayInSeconds * 4 + 3600,
      splitAmong: [MOCK_ADDRESSES.alice, MOCK_ADDRESSES.bob, MOCK_ADDRESSES.charlie],
    },
    {
      id: "mock-exp-3",
      payer: realUserAddress,
      amount: xlm(100), // 100 XLM - Dinner
      description: "Hoşgeldin Yemeği",
      category: "food" as const,
      timestamp: now - dayInSeconds * 4 + 7200,
      splitAmong: allMembers, // 5 people = 20 XLM each
    },

    // Day 2 - Activities
    {
      id: "mock-exp-4",
      payer: MOCK_ADDRESSES.charlie,
      amount: xlm(60), // 60 XLM - Breakfast
      description: "Kahvaltı Büfesi",
      category: "food" as const,
      timestamp: now - dayInSeconds * 3,
      splitAmong: allMembers,
    },
    {
      id: "mock-exp-5",
      payer: MOCK_ADDRESSES.diana,
      amount: xlm(120), // 120 XLM - Museum
      description: "Müze Biletleri",
      category: "activity" as const,
      timestamp: now - dayInSeconds * 3 + 14400,
      splitAmong: [realUserAddress, MOCK_ADDRESSES.alice, MOCK_ADDRESSES.diana, MOCK_ADDRESSES.charlie],
    },
    {
      id: "mock-exp-6",
      payer: MOCK_ADDRESSES.alice,
      amount: xlm(80), // 80 XLM - Lunch
      description: "Öğle Yemeği",
      category: "food" as const,
      timestamp: now - dayInSeconds * 3 + 18000,
      splitAmong: allMembers,
    },

    // Day 3 - More activities
    {
      id: "mock-exp-7",
      payer: MOCK_ADDRESSES.bob,
      amount: xlm(50), // 50 XLM - Coffee
      description: "Kahve Molası",
      category: "food" as const,
      timestamp: now - dayInSeconds * 2,
      splitAmong: allMembers,
    },
    {
      id: "mock-exp-8",
      payer: realUserAddress,
      amount: xlm(90), // 90 XLM - Boat tour
      description: "Tekne Turu",
      category: "activity" as const,
      timestamp: now - dayInSeconds * 2 + 10800,
      splitAmong: [realUserAddress, MOCK_ADDRESSES.bob, MOCK_ADDRESSES.diana],
    },
    {
      id: "mock-exp-9",
      payer: MOCK_ADDRESSES.charlie,
      amount: xlm(110), // 110 XLM - Dinner
      description: "Balık Restoranı",
      category: "food" as const,
      timestamp: now - dayInSeconds * 2 + 25200,
      splitAmong: allMembers,
    },

    // Day 4 - Shopping
    {
      id: "mock-exp-10",
      payer: MOCK_ADDRESSES.diana,
      amount: xlm(30), // 30 XLM - Uber
      description: "AVM'ye Uber",
      category: "transport" as const,
      timestamp: now - dayInSeconds,
      splitAmong: [MOCK_ADDRESSES.charlie, MOCK_ADDRESSES.diana, realUserAddress],
    },
    {
      id: "mock-exp-11",
      payer: MOCK_ADDRESSES.alice,
      amount: xlm(70), // 70 XLM - Lunch
      description: "Food Court",
      category: "food" as const,
      timestamp: now - dayInSeconds + 14400,
      splitAmong: [realUserAddress, MOCK_ADDRESSES.alice, MOCK_ADDRESSES.bob],
    },
    {
      id: "mock-exp-12",
      payer: MOCK_ADDRESSES.bob,
      amount: xlm(45), // 45 XLM - Snacks
      description: "Dondurma & İçecek",
      category: "food" as const,
      timestamp: now - dayInSeconds + 21600,
      splitAmong: allMembers,
    },

    // Day 5 - Last day
    {
      id: "mock-exp-13",
      payer: MOCK_ADDRESSES.charlie,
      amount: xlm(130), // 130 XLM - Farewell dinner
      description: "Veda Yemeği",
      category: "food" as const,
      timestamp: now - 7200,
      splitAmong: allMembers,
    },
    {
      id: "mock-exp-14",
      payer: MOCK_ADDRESSES.diana,
      amount: xlm(55), // 55 XLM - Airport transfer
      description: "Havaalanı Transferi",
      category: "transport" as const,
      timestamp: now - 3600,
      splitAmong: [realUserAddress, MOCK_ADDRESSES.alice, MOCK_ADDRESSES.bob, MOCK_ADDRESSES.diana],
    },
  ]
}

/**
 * Create a demo group with mock data
 * @param realUserAddress - Your actual Freighter address
 * @returns Complete GroupState with mock members and expenses
 */
export function createDemoGroup(realUserAddress: string): GroupState {
  const members = [
    realUserAddress,
    MOCK_ADDRESSES.alice,
    MOCK_ADDRESSES.bob,
    MOCK_ADDRESSES.charlie,
    MOCK_ADDRESSES.diana,
  ]

  const expenses = generateMockExpenses(realUserAddress)

  return {
    groupId: `demo-group-${Date.now()}`,
    members,
    expenses,
    settlements: [], // Will be computed by useGroup hook
    isClosed: false,
  }
}

/**
 * Get display name for an address (mock or real)
 */
export function getDisplayName(address: string, realUserAddress?: string): string {
  if (address === realUserAddress) return "Sen"
  return MOCK_NAMES[address] || `User ${address.slice(0, 6)}`
}

/**
 * Check if an address is a mock address
 */
export function isMockAddress(address: string): boolean {
  return Object.values(MOCK_ADDRESSES).includes(address)
}
