export interface DemoHolding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  avgPrice: number;
  purchaseDate: string;
  coinId: string;
  notes?: string;
}

const storageKey = (userId: string) => `coin-rich-demo-portfolio-${userId}`;

const seedHoldings = (): DemoHolding[] => [
  {
    id: "demo-bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    amount: 0.25,
    avgPrice: 64250,
    purchaseDate: "2024-11-12",
    coinId: "bitcoin",
    notes: "Demo holding",
  },
  {
    id: "demo-ethereum",
    symbol: "ETH",
    name: "Ethereum",
    amount: 2.4,
    avgPrice: 3180,
    purchaseDate: "2025-01-08",
    coinId: "ethereum",
    notes: "Demo holding",
  },
  {
    id: "demo-solana",
    symbol: "SOL",
    name: "Solana",
    amount: 18,
    avgPrice: 148.5,
    purchaseDate: "2025-03-21",
    coinId: "solana",
    notes: "Demo holding",
  },
];

const toPortfolioHolding = (holding: DemoHolding) => ({
  id: holding.id,
  symbol: holding.symbol,
  name: holding.name,
  amount: holding.amount,
  avgPrice: holding.avgPrice,
  currentPrice: holding.avgPrice,
  purchaseDate: holding.purchaseDate,
  coinId: holding.coinId,
  notes: holding.notes,
});

const readHoldings = (userId: string): DemoHolding[] => {
  if (typeof window === "undefined") return [];

  const key = storageKey(userId);
  const raw = window.localStorage.getItem(key);
  if (raw === null) {
    const seeded = seedHoldings();
    window.localStorage.setItem(key, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      const seeded = seedHoldings();
      window.localStorage.setItem(key, JSON.stringify(seeded));
      return seeded;
    }
    return parsed as DemoHolding[];
  } catch {
    const seeded = seedHoldings();
    window.localStorage.setItem(key, JSON.stringify(seeded));
    return seeded;
  }
};

const writeHoldings = (userId: string, holdings: DemoHolding[]) => {
  if (typeof window === "undefined") {
    throw new Error("Demo portfolio storage is only available in the browser");
  }
  window.localStorage.setItem(storageKey(userId), JSON.stringify(holdings));
};

class DemoPortfolioService {
  async fetchHoldings(userId: string, _getValidToken?: () => Promise<string | null>) {
    return readHoldings(userId).map(toPortfolioHolding);
  }

  async createHolding(
    userId: string,
    _getValidToken: () => Promise<string | null>,
    holdingData: {
      symbol: string;
      name: string;
      amount: number;
      avgPrice: number;
      purchaseDate: string;
      coinId: string;
      notes?: string;
    }
  ) {
    const holdings = readHoldings(userId);
    const created: DemoHolding = {
      id: crypto.randomUUID(),
      symbol: holdingData.symbol,
      name: holdingData.name,
      amount: holdingData.amount,
      avgPrice: holdingData.avgPrice,
      purchaseDate: holdingData.purchaseDate,
      coinId: holdingData.coinId,
      notes: holdingData.notes,
    };
    writeHoldings(userId, [created, ...holdings]);
    return created;
  }

  async deleteHolding(
    userId: string,
    _getValidToken: () => Promise<string | null>,
    holdingId: string
  ) {
    const holdings = readHoldings(userId).filter((holding) => holding.id !== holdingId);
    writeHoldings(userId, holdings);
  }
}

export const demoPortfolioService = new DemoPortfolioService();
