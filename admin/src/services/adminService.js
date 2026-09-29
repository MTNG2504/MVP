const { randomBytes } = require("crypto");
const { createAppError } = require("../errors");
const { ROLES } = require("../config/roles");
const { PERMISSIONS, permissionsForRole } = require("../config/permissions");
const { assertPermission } = require("../auth/access");
const { getConfig } = require("../config/config");
const { hashPassword, verifyPassword } = require("../utils/password");
const { buildPage } = require("../utils/pagination");
const adminRepository = require("../repositories/adminRepository");
const settingsRepository = require("../repositories/settingsRepository");
const auditService = require("./auditService");

let dummyPasswordHash;

function getDummyPasswordHash() {
  if (!dummyPasswordHash) {
    dummyPasswordHash = hashPassword("dummy-password-not-used-for-login");
  }
  return dummyPasswordHash;
}

function toPublicAdmin(admin) {
  return {
    id: admin.id,
    email: admin.email,
    fullName: admin.fullName,
    role: admin.role,
    status: admin.status,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
}

function present(admin) {
  return {
    ...toPublicAdmin(admin),
    permissions: permissionsForRole(admin.role),
  };
}

function login(email, password) {
  const admin = adminRepository.findByEmail(email);
  const passwordHash = admin ? admin.passwordHash : getDummyPasswordHash();
  const passwordMatches = verifyPassword(password, passwordHash);

  if (!admin || !passwordMatches || admin.status !== "active") {
    throw createAppError("UNAUTHORIZED", "Invalid email or password.");
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + getConfig().tokenTtlMs;
  adminRepository.createSession({
    token,
    adminId: admin.id,
    expiresAt,
  });

  auditService.record({
    adminId: admin.id,
    action: "ADMIN_LOGIN",
    resource: "admin",
    resourceId: admin.id,
    metadata: { email: admin.email },
  });

  return {
    token,
    expiresAt: new Date(expiresAt).toISOString(),
    admin: present(admin),
  };
}

function authenticate(token) {
  const session = adminRepository.findSession(token);
  if (!session) {
    throw createAppError("UNAUTHORIZED", "Invalid or expired session.");
  }

  const admin = adminRepository.findById(session.adminId);
  if (!admin || admin.status !== "active") {
    throw createAppError("UNAUTHORIZED", "Invalid or expired session.");
  }

  return {
    token,
    admin: present(admin),
  };
}

function logout(admin, token) {
  adminRepository.deleteSession(token);
  auditService.record({
    adminId: admin.id,
    action: "ADMIN_LOGOUT",
    resource: "admin",
    resourceId: admin.id,
    metadata: {},
  });
}

function list(admin, query) {
  assertPermission(admin, PERMISSIONS.MANAGE_ADMINS);
  const result = adminRepository.query(query);
  return buildPage(result.items.map(toPublicAdmin), result.total, query);
}

function changeRole(actor, adminId, role) {
  assertPermission(actor, PERMISSIONS.MANAGE_ADMINS);

  const target = adminRepository.findById(adminId);
  if (!target) {
    throw createAppError("NOT_FOUND", "Admin was not found.");
  }
  if (target.role === role) {
    throw createAppError("CONFLICT", "Admin already has this role.");
  }
  if (
    target.role === ROLES.SUPER_ADMIN &&
    role !== ROLES.SUPER_ADMIN &&
    adminRepository.countByRole(ROLES.SUPER_ADMIN) <= 1
  ) {
    throw createAppError("CONFLICT", "Cannot change the role of the last super admin.");
  }

  const updated = adminRepository.update(adminId, { role });
  auditService.record({
    adminId: actor.id,
    action: "ADMIN_PERMISSION_CHANGED",
    resource: "admin",
    resourceId: adminId,
    metadata: { from: target.role, to: role },
  });

  return toPublicAdmin(updated);
}

function getSettings(admin) {
  assertPermission(admin, PERMISSIONS.MODIFY_SETTINGS);
  return settingsRepository.get();
}

function updateSettings(admin, changes) {
  assertPermission(admin, PERMISSIONS.MODIFY_SETTINGS);
  const current = settingsRepository.get();
  const updated = settingsRepository.update(changes);
  const metadata = {};

  for (const field of Object.keys(changes)) {
    metadata[field] = { from: current[field], to: changes[field] };
  }

  auditService.record({
    adminId: admin.id,
    action: "SETTINGS_UPDATED",
    resource: "settings",
    resourceId: "settings",
    metadata,
  });

  return updated;
}

module.exports = {
  login,
  authenticate,
  logout,
  list,
  changeRole,
  getSettings,
  updateSettings,
  present,
};
