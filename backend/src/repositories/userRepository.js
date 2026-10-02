const { randomUUID } = require("crypto");

const users = new Map();

function clone(record) {
  return record ? { ...record } : null;
}

function findById(id) {
  return clone(users.get(id) || null);
}

function findByEmail(email) {
  const normalized = String(email || "").toLowerCase();
  for (const record of users.values()) {
    if (record.email === normalized) {
      return clone(record);
    }
  }
  return null;
}

function findAll() {
  return Array.from(users.values()).map(clone);
}

function create(data) {
  const now = new Date().toISOString();
  const record = {
    id: randomUUID(),
    email: data.email,
    name: data.name,
    createdAt: now,
    updatedAt: now,
  };
  users.set(record.id, record);
  return clone(record);
}

function update(id, changes) {
  const existing = users.get(id);
  if (!existing) {
    return null;
  }
  Object.assign(existing, changes, { updatedAt: new Date().toISOString() });
  return clone(existing);
}

function remove(id) {
  const existing = users.get(id);
  if (!existing) {
    return null;
  }
  users.delete(id);
  return clone(existing);
}

module.exports = {
  findById,
  findByEmail,
  findAll,
  create,
  update,
  delete: remove,
};
