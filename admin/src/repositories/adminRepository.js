const { getState, copy } = require("../data/memoryStore");

function byCreatedAt(left, right) {
  if (left.createdAt === right.createdAt) {
    return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
  }
  return left.createdAt < right.createdAt ? -1 : 1;
}

function pageOf(rows, filters) {
  const items = rows
    .slice(filters.offset, filters.offset + filters.limit)
    .map((row) => copy(row));
  return { items, total: rows.length };
}

function findById(id) {
  return copy(getState().admins.find((admin) => admin.id === id) || null);
}

function findByEmail(email) {
  const normalized = String(email || "").toLowerCase();
  return copy(getState().admins.find((admin) => admin.email === normalized) || null);
}

function countByRole(role) {
  return getState().admins.filter((admin) => admin.role === role).length;
}

function query(filters) {
  const rows = getState().admins.slice().sort(byCreatedAt);
  return pageOf(rows, filters);
}

function update(id, changes) {
  const admin = getState().admins.find((item) => item.id === id);
  if (!admin) {
    return null;
  }
  Object.assign(admin, changes, { updatedAt: new Date().toISOString() });
  return copy(admin);
}

function findSession(token) {
  const now = Date.now();
  const sessions = getState().sessions;

  for (let index = sessions.length - 1; index >= 0; index -= 1) {
    if (sessions[index].expiresAt <= now) {
      sessions.splice(index, 1);
    }
  }

  return copy(sessions.find((session) => session.token === token) || null);
}

function createSession(session) {
  const sessions = getState().sessions;
  sessions.push(session);

  const owned = sessions.filter((item) => item.adminId === session.adminId);
  if (owned.length > 10) {
    owned.sort((left, right) => left.expiresAt - right.expiresAt);
    deleteSession(owned[0].token);
  }

  return copy(session);
}

function deleteSession(token) {
  const sessions = getState().sessions;
  const index = sessions.findIndex((session) => session.token === token);
  if (index >= 0) {
    sessions.splice(index, 1);
  }
}

module.exports = {
  findById,
  findByEmail,
  countByRole,
  query,
  update,
  findSession,
  createSession,
  deleteSession,
};
