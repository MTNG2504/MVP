const { ROLES } = require("./roles");

const PERMISSIONS = {
  MANAGE_ADMINS: "admins.manage",
  MANAGE_USERS: "users.manage",
  VIEW_USERS: "users.view",
  MANAGE_PORTFOLIOS: "portfolios.manage",
  VIEW_PORTFOLIOS: "portfolios.view",
  MANAGE_TRANSACTIONS: "transactions.manage",
  VIEW_TRANSACTIONS: "transactions.view",
  VIEW_AUDIT_LOGS: "audit.view",
  MODIFY_SETTINGS: "settings.modify",
};

const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_PORTFOLIOS,
    PERMISSIONS.VIEW_TRANSACTIONS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],
  [ROLES.SUPPORT]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_PORTFOLIOS,
    PERMISSIONS.VIEW_TRANSACTIONS,
  ],
};

function hasPermission(role, permission) {
  const granted = ROLE_PERMISSIONS[role];
  return Array.isArray(granted) && granted.includes(permission);
}

function permissionsForRole(role) {
  return (ROLE_PERMISSIONS[role] || []).slice();
}

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  permissionsForRole,
};
