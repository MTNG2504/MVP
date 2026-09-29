export const DEMO_PRICES: Record<string, number> = {
  bitcoin: 90000,
  ethereum: 3200,
  solana: 180,
};

export interface DemoCoin {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number;
}

export const DEMO_COINS: DemoCoin[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", market_cap_rank: 1 },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", market_cap_rank: 2 },
  { id: "solana", symbol: "SOL", name: "Solana", market_cap_rank: 3 },
];

export function getDemoPrice(coinId: string): number | null {
  const price = DEMO_PRICES[coinId.trim().toLowerCase()];
  return typeof price === "number" ? price : null;
}

export function findDemoCoin(symbolOrId: string): DemoCoin | null {
  const query = symbolOrId.trim().toLowerCase();
  return DEMO_COINS.find((coin) => coin.id === query || coin.symbol.toLowerCase() === query) ?? null;
}
