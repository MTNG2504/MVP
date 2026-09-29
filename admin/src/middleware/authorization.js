const { assertPermission } = require("../auth/access");

function requirePermission(permission) {
  return function authorize(req) {
    assertPermission(req.admin, permission);
  };
}

module.exports = {
  requirePermission,
};
