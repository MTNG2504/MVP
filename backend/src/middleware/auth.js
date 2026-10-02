const { AppError } = require("../utils/errors");

function readBearerToken(req) {
  const header = req.headers.authorization;
  if (!header) {
    return null;
  }
  const match = /^Bearer\s+(\S+)$/.exec(String(header));
  return match ? match[1] : null;
}

function requireAuth(req, res, next) {
  const token = readBearerToken(req);

  if (!token) {
    next(new AppError("Authentication is required.", 401, "UNAUTHORIZED"));
    return;
  }

  // A real identity provider (Clerk session JWT, etc.) should be verified here.
  // Client-supplied user IDs are never treated as proof of identity.
  next(new AppError("Authentication is not configured.", 401, "AUTH_NOT_CONFIGURED"));
}

function publicRoute(req, res, next) {
  next();
}

module.exports = {
  requireAuth,
  publicRoute,
};
