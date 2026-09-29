const { ROLES } = require("../config/roles");
const { USER_STATUSES, USER_ROLES, TRANSACTION_TYPES } = require("../domain/constants");

const DEMO_ADMINS = [
  {
    id: "admin-ops",
    email: "admin@localhost",
    fullName: "Operations Admin",
    role: ROLES.ADMIN,
  },
  {
    id: "admin-support",
    email: "support@localhost",
    fullName: "Support Admin",
    role: ROLES.SUPPORT,
  },
];

const FIRST_NAMES = ["Ava", "Liam", "Noah", "Mia", "Ethan", "Sofia", "Lucas", "Amelia", "Leo", "Chloe"];
const LAST_NAMES = ["Kim", "Patel", "Nguyen", "Garcia", "Brown", "Singh", "Martinez", "Lee", "Wilson", "Clark"];
const ASSETS = [
  { symbol: "BTC", name: "Bitcoin", coinId: "bitcoin" },
  { symbol: "ETH", name: "Ethereum", coinId: "ethereum" },
];

function emptyState() {
  return {
    admins: [],
    sessions: [],
    users: [],
    portfolios: [],
    transactions: [],
    auditLogs: [],
    settings: {
      maintenanceMode: false,
      supportEmail: "support@example.com",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  };
}

let state = emptyState();

function getState() {
  return state;
}

function copy(value) {
  if (value === undefined) {
    return undefined;
  }
  return structuredClone(value);
}

function timestampForDay(day) {
  return new Date(Date.UTC(2024, 0, day)).toISOString();
}

function seed(options) {
  state = emptyState();
  const createdAt = timestampForDay(1);
  const bootstrapEmail = String(options.bootstrapEmail || "").trim().toLowerCase();

  state.admins.push({
    id: "admin-super",
    email: bootstrapEmail,
    fullName: "Bootstrap Super Admin",
    role: ROLES.SUPER_ADMIN,
    status: "active",
    passwordHash: options.bootstrapPasswordHash,
    createdAt,
    updatedAt: createdAt,
  });

  if (options.demoPasswordHash) {
    for (const demo of DEMO_ADMINS) {
      if (demo.email === bootstrapEmail) {
        continue;
      }
      state.admins.push({
        ...demo,
        status: "active",
        passwordHash: options.demoPasswordHash,
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  for (let index = 1; index <= 30; index += 1) {
    const created = timestampForDay(index);
    state.users.push({
      id: `user-${index}`,
      email: `user${index}@example.com`,
      fullName: `${FIRST_NAMES[(index - 1) % FIRST_NAMES.length]} ${LAST_NAMES[(index - 1) % LAST_NAMES.length]}`,
      status: USER_STATUSES[(index - 1) % USER_STATUSES.length],
      role: USER_ROLES[(index - 1) % USER_ROLES.length],
      createdAt: created,
      updatedAt: created,
    });
  }

  for (let index = 1; index <= 12; index += 1) {
    const asset = ASSETS[(index - 1) % ASSETS.length];
    const created = timestampForDay(index);
    state.portfolios.push({
      id: `portfolio-${index}`,
      userId: `user-${index}`,
      symbol: asset.symbol,
      name: asset.name,
      coinId: asset.coinId,
      amount: index,
      avgPrice: 1000 * index,
      purchaseDate: created.slice(0, 10),
      notes: "",
      status: index % 5 === 0 ? "frozen" : "active",
      createdAt: created,
      updatedAt: created,
    });
  }

  for (let index = 1; index <= 20; index += 1) {
    const portfolioIndex = ((index - 1) % 12) + 1;
    const created = timestampForDay(index);
    let status = "completed";
    if (index % 7 === 0) {
      status = "pending";
    } else if (index % 11 === 0) {
      status = "failed";
    }

    state.transactions.push({
      id: `txn-${index}`,
      userId: `user-${portfolioIndex}`,
      portfolioId: `portfolio-${portfolioIndex}`,
      type: TRANSACTION_TYPES[(index - 1) % TRANSACTION_TYPES.length],
      amount: index * 10,
      asset: ASSETS[(index - 1) % ASSETS.length].symbol,
      status,
      createdAt: created,
      updatedAt: created,
    });
  }
}

module.exports = {
  DEMO_ADMINS,
  getState,
  seed,
  copy,
};
