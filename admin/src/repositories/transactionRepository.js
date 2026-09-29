const { getState, copy } = require("../data/memoryStore");
const { matchesText } = require("../utils/query");

function byCreatedAt(left, right) {
  if (left.createdAt === right.createdAt) {
    return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
  }
  return left.createdAt < right.createdAt ? -1 : 1;
}

function findById(id) {
  return copy(getState().transactions.find((transaction) => transaction.id === id) || null);
}

function query(filters) {
  const matched = [];

  for (const transaction of getState().transactions) {
    if (filters.status && transaction.status !== filters.status) {
      continue;
    }
    if (filters.type && transaction.type !== filters.type) {
      continue;
    }
    if (filters.userId && transaction.userId !== filters.userId) {
      continue;
    }
    if (filters.portfolioId && transaction.portfolioId !== filters.portfolioId) {
      continue;
    }
    if (filters.search && !matchesText(transaction, ["id", "asset", "userId", "portfolioId"], filters.search)) {
      continue;
    }
    matched.push(transaction);
  }

  matched.sort(byCreatedAt);
  const items = matched
    .slice(filters.offset, filters.offset + filters.limit)
    .map((transaction) => copy(transaction));

  return { items, total: matched.length };
}

function update(id, changes) {
  const transaction = getState().transactions.find((item) => item.id === id);
  if (!transaction) {
    return null;
  }
  Object.assign(transaction, changes, { updatedAt: new Date().toISOString() });
  return copy(transaction);
}

function summarize() {
  const byStatus = {};
  const byType = {};

  for (const transaction of getState().transactions) {
    byStatus[transaction.status] = (byStatus[transaction.status] || 0) + 1;
    byType[transaction.type] = (byType[transaction.type] || 0) + 1;
  }

  return {
    total: getState().transactions.length,
    byStatus,
    byType,
  };
}

module.exports = {
  findById,
  query,
  update,
  summarize,
};
