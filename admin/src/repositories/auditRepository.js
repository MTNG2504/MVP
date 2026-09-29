const { randomUUID } = require("crypto");
const { getState, copy } = require("../data/memoryStore");

function insert(entry) {
  const record = {
    id: randomUUID(),
    adminId: entry.adminId,
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId || null,
    timestamp: new Date().toISOString(),
    metadata: copy(entry.metadata || {}),
  };
  getState().auditLogs.push(record);
  return copy(record);
}

function query(filters) {
  const matched = [];

  for (const entry of getState().auditLogs) {
    if (filters.adminId && entry.adminId !== filters.adminId) {
      continue;
    }
    if (filters.action && entry.action !== filters.action) {
      continue;
    }
    if (filters.resource && entry.resource !== filters.resource) {
      continue;
    }
    matched.push(entry);
  }

  matched.sort((left, right) => (left.timestamp < right.timestamp ? 1 : left.timestamp > right.timestamp ? -1 : 0));
  const items = matched
    .slice(filters.offset, filters.offset + filters.limit)
    .map((entry) => copy(entry));

  return { items, total: matched.length };
}

function count() {
  return getState().auditLogs.length;
}

module.exports = {
  insert,
  query,
  count,
};
