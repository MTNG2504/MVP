const { AppError } = require("../utils/errors");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireObject(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError("Request body must be a JSON object.", 400, "VALIDATION_ERROR");
  }
}

function requireString(value, field, min, max) {
  if (typeof value !== "string") {
    throw new AppError(`${field} must be a string.`, 400, "VALIDATION_ERROR");
  }
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new AppError(`${field} must be between ${min} and ${max} characters.`, 400, "VALIDATION_ERROR");
  }
  return trimmed;
}

function requireEmail(value) {
  const email = requireString(value, "email", 3, 254).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    throw new AppError("email must be a valid email address.", 400, "VALIDATION_ERROR");
  }
  return email;
}

function requireId(value) {
  if (typeof value !== "string" || !/^[0-9a-f-]{36}$/i.test(value)) {
    throw new AppError("id is invalid.", 400, "VALIDATION_ERROR");
  }
  return value;
}

function parseCreateUser(body) {
  requireObject(body);
  return {
    email: requireEmail(body.email),
    name: requireString(body.name, "name", 1, 120),
  };
}

function parseUpdateUser(body) {
  requireObject(body);
  const changes = {};
  if (body.email !== undefined) {
    changes.email = requireEmail(body.email);
  }
  if (body.name !== undefined) {
    changes.name = requireString(body.name, "name", 1, 120);
  }
  if (!Object.keys(changes).length) {
    throw new AppError("At least one field is required.", 400, "VALIDATION_ERROR");
  }
  return changes;
}

module.exports = {
  parseCreateUser,
  parseUpdateUser,
  requireId,
};
