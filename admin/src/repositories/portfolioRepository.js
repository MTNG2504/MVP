const { getState, copy } = require("../data/memoryStore");
const { matchesText } = require("../utils/query");

function byCreatedAt(left, right) {
  if (left.createdAt === right.createdAt) {
    return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
  }
  return left.createdAt < right.createdAt ? -1 : 1;
}

function findById(id) {
  return copy(getState().portfolios.find((portfolio) => portfolio.id === id) || null);
}

function query(filters) {
  const matched = [];

  for (const portfolio of getState().portfolios) {
    if (filters.status && portfolio.status !== filters.status) {
      continue;
    }
    if (filters.userId && portfolio.userId !== filters.userId) {
      continue;
    }
    if (filters.search && !matchesText(portfolio, ["id", "symbol", "name", "coinId", "userId"], filters.search)) {
      continue;
    }
    matched.push(portfolio);
  }

  matched.sort(byCreatedAt);
  const items = matched
    .slice(filters.offset, filters.offset + filters.limit)
    .map((portfolio) => copy(portfolio));

  return { items, total: matched.length };
}

function update(id, changes) {
  const portfolio = getState().portfolios.find((item) => item.id === id);
  if (!portfolio) {
    return null;
  }
  Object.assign(portfolio, changes, { updatedAt: new Date().toISOString() });
  return copy(portfolio);
}

function summarize() {
  const byStatus = {};

  for (const portfolio of getState().portfolios) {
    byStatus[portfolio.status] = (byStatus[portfolio.status] || 0) + 1;
  }

  return {
    total: getState().portfolios.length,
    byStatus,
  };
}

module.exports = {
  findById,
  query,
  update,
  summarize,
};
