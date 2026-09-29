const { createAppError } = require("../errors");
const { hasPermission } = require("../config/permissions");

function assertPermission(admin, permission) {
  if (!admin) {
    throw createAppError("UNAUTHORIZED", "Authentication is required.");
  }

  if (!hasPermission(admin.role, permission)) {
    throw createAppError("FORBIDDEN", "You do not have permission to perform this action.");
  }
}

module.exports = {
  assertPermission,
};
