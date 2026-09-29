const { createAppError } = require("../errors");
const adminService = require("../services/adminService");

function authenticate(req) {
  const header = req.headers.authorization || "";
  const match = /^Bearer\s+(\S+)$/.exec(String(header));

  if (!match) {
    throw createAppError("UNAUTHORIZED", "Authentication is required.");
  }

  const result = adminService.authenticate(match[1]);
  req.token = result.token;
  req.admin = result.admin;
}

module.exports = {
  authenticate,
};
