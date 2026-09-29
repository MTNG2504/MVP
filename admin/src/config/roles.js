const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  SUPPORT: "SUPPORT",
};

function isAdminRole(value) {
  return Object.values(ROLES).includes(value);
}

module.exports = {
  ROLES,
  isAdminRole,
};
