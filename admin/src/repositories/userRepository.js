const { getState, copy } = require("../data/memoryStore");
const { matchesText, inDateRange } = require("../utils/query");

function byCreatedAt(left, right) {
  if (left.createdAt === right.createdAt) {
    return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
  }
  return left.createdAt < right.createdAt ? -1 : 1;
}

function findById(id) {
  return copy(getState().users.find((user) => user.id === id) || null);
}

function findByEmail(email) {
  const normalized = String(email || "").toLowerCase();
  return copy(getState().users.find((user) => user.email === normalized) || null);
}

function query(filters) {
  const matched = [];

  for (const user of getState().users) {
    if (filters.status && user.status !== filters.status) {
      continue;
    }
    if (filters.role && user.role !== filters.role) {
      continue;
    }
    if ((filters.createdFrom || filters.createdTo) && !inDateRange(user.createdAt, filters.createdFrom, filters.createdTo)) {
      continue;
    }
    if (filters.search && !matchesText(user, ["id", "email", "fullName"], filters.search)) {
      continue;
    }
    matched.push(user);
  }

  matched.sort(byCreatedAt);
  const items = matched
    .slice(filters.offset, filters.offset + filters.limit)
    .map((user) => copy(user));

  return { items, total: matched.length };
}

function update(id, changes) {
  const user = getState().users.find((item) => item.id === id);
  if (!user) {
    return null;
  }
  Object.assign(user, changes, { updatedAt: new Date().toISOString() });
  return copy(user);
}

function summarize() {
  const byStatus = {};
  const byRole = {};

  for (const user of getState().users) {
    byStatus[user.status] = (byStatus[user.status] || 0) + 1;
    byRole[user.role] = (byRole[user.role] || 0) + 1;
  }

  return {
    total: getState().users.length,
    byStatus,
    byRole,
  };
}

module.exports = {
  findById,
  findByEmail,
  query,
  update,
  summarize,
};
