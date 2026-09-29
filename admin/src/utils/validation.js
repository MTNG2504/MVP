const { createAppError } = require("../errors");
const {
  USER_STATUSES,
  USER_ROLES,
  PORTFOLIO_STATUSES,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
} = require("../domain/constants");
const { isAdminRole } = require("../config/roles");

function validationError(details) {
  return createAppError("VALIDATION_ERROR", "Validation failed.", details);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assertPlainObject(value) {
  if (!isPlainObject(value)) {
    throw validationError([{ field: "body", message: "JSON body must be an object." }]);
  }
}

function rejectUnknown(body, allowed) {
  const unknown = Object.keys(body).filter((field) => !allowed.includes(field));
  if (unknown.length) {
    throw validationError(unknown.map((field) => ({
      field,
      message: `${field} is not allowed.`,
    })));
  }
}

function requireOneOf(value, allowed, field) {
  if (!allowed.includes(value)) {
    throw validationError([{
      field,
      message: `${field} must be one of: ${allowed.join(", ")}.`,
    }]);
  }
  return value;
}

function optionalOneOf(value, allowed, field) {
  if (value === undefined || value === "") {
    return undefined;
  }
  return requireOneOf(value, allowed, field);
}

function requireEmail(value, field) {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  const domain = email.slice(email.indexOf("@") + 1);
  const hasSingleAt = email.includes("@") && domain && !domain.includes("@");
  const domainAllowed = domain === "localhost" || /^[^.\s@][^@]*\.[^@\s]+$/.test(domain);
  const valid = hasSingleAt && domainAllowed && email.length <= 254 && !email.includes(" ");

  if (!valid) {
    throw validationError([{ field, message: "Enter a valid email address." }]);
  }
  return email;
}

function requireId(value, field) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(value)) {
    throw validationError([{ field, message: "ID is invalid." }]);
  }
  return value;
}

function optionalId(value, field) {
  if (value === undefined || value === "") {
    return undefined;
  }
  return requireId(value, field);
}

function requireBoundedString(value, field, min, max) {
  if (typeof value !== "string") {
    throw validationError([{ field, message: `${field} must be a string.` }]);
  }
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw validationError([{
      field,
      message: `${field} must be between ${min} and ${max} characters.`,
    }]);
  }
  return trimmed;
}

function optionalSearch(value) {
  if (value === undefined || value === "") {
    return undefined;
  }
  if (typeof value !== "string") {
    throw validationError([{ field: "search", message: "search must be a string." }]);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.length > 100) {
    throw validationError([{ field: "search", message: "search must be at most 100 characters." }]);
  }
  return trimmed;
}

function optionalDate(value, field) {
  if (value === undefined || value === "") {
    return undefined;
  }
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw validationError([{ field, message: `${field} must be a valid date.` }]);
  }
  return new Date(value).toISOString();
}

function assertDateOrder(from, to) {
  if (from && to && Date.parse(from) > Date.parse(to)) {
    throw validationError([{
      field: "createdTo",
      message: "createdTo must be on or after createdFrom.",
    }]);
  }
}

function requireFiniteNumber(value, field, min, max) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw validationError([{ field, message: `${field} must be a number.` }]);
  }
  if (value < min || value > max) {
    throw validationError([{
      field,
      message: `${field} must be between ${min} and ${max}.`,
    }]);
  }
  return value;
}

function optionalAction(value) {
  if (value === undefined || value === "") {
    return undefined;
  }
  if (typeof value !== "string" || !/^[A-Z0-9_]{1,64}$/.test(value)) {
    throw validationError([{
      field: "action",
      message: "action must contain only uppercase letters, numbers, and underscores.",
    }]);
  }
  return value;
}

function optionalResource(value) {
  if (value === undefined || value === "") {
    return undefined;
  }
  if (typeof value !== "string" || !/^[a-z0-9_-]{1,64}$/.test(value)) {
    throw validationError([{ field: "resource", message: "resource is invalid." }]);
  }
  return value;
}

function parseLogin(body) {
  assertPlainObject(body);
  rejectUnknown(body, ["email", "password"]);
  return {
    email: requireEmail(body.email, "email"),
    password: requireBoundedString(body.password, "password", 1, 200),
  };
}

function parseRoleChange(body) {
  assertPlainObject(body);
  rejectUnknown(body, ["role"]);
  if (!isAdminRole(body.role)) {
    throw validationError([{
      field: "role",
      message: "role must be one of: SUPER_ADMIN, ADMIN, SUPPORT.",
    }]);
  }
  return body.role;
}

function parseUserUpdate(body) {
  assertPlainObject(body);
  rejectUnknown(body, ["fullName", "email", "role"]);
  const changes = {};

  if (body.fullName !== undefined) {
    changes.fullName = requireBoundedString(body.fullName, "fullName", 1, 120);
  }
  if (body.email !== undefined) {
    changes.email = requireEmail(body.email, "email");
  }
  if (body.role !== undefined) {
    changes.role = requireOneOf(body.role, USER_ROLES, "role");
  }
  if (!Object.keys(changes).length) {
    throw validationError([{ field: "body", message: "At least one field is required." }]);
  }

  return changes;
}

function parseUserStatus(body) {
  assertPlainObject(body);
  rejectUnknown(body, ["status"]);
  return requireOneOf(body.status, USER_STATUSES, "status");
}

function parseUserListQuery(query, page) {
  const search = optionalSearch(query.search);
  const status = optionalOneOf(query.status, USER_STATUSES, "status");
  const role = optionalOneOf(query.role, USER_ROLES, "role");
  const createdFrom = optionalDate(query.createdFrom, "createdFrom");
  const createdTo = optionalDate(query.createdTo, "createdTo");
  assertDateOrder(createdFrom, createdTo);

  return {
    ...page,
    search,
    status,
    role,
    createdFrom,
    createdTo,
  };
}

function parsePortfolioUpdate(body) {
  assertPlainObject(body);
  rejectUnknown(body, ["amount", "avgPrice", "notes", "status"]);
  const changes = {};

  if (body.amount !== undefined) {
    changes.amount = requireFiniteNumber(body.amount, "amount", 0.00000001, 1000000000000);
  }
  if (body.avgPrice !== undefined) {
    changes.avgPrice = requireFiniteNumber(body.avgPrice, "avgPrice", 0, 1000000000000);
  }
  if (body.notes !== undefined) {
    if (typeof body.notes !== "string" || body.notes.trim().length > 500) {
      throw validationError([{ field: "notes", message: "notes must be a string up to 500 characters." }]);
    }
    changes.notes = body.notes.trim();
  }
  if (body.status !== undefined) {
    changes.status = requireOneOf(body.status, PORTFOLIO_STATUSES, "status");
  }
  if (!Object.keys(changes).length) {
    throw validationError([{ field: "body", message: "At least one field is required." }]);
  }

  return changes;
}

function parsePortfolioListQuery(query, page) {
  return {
    ...page,
    search: optionalSearch(query.search),
    status: optionalOneOf(query.status, PORTFOLIO_STATUSES, "status"),
    userId: optionalId(query.userId, "userId"),
  };
}

function parseTransactionUpdate(body) {
  assertPlainObject(body);
  rejectUnknown(body, ["status", "reason"]);
  const status = requireOneOf(body.status, TRANSACTION_STATUSES, "status");
  let reason;
  if (body.reason !== undefined) {
    reason = requireBoundedString(body.reason, "reason", 1, 300);
  }
  return { status, reason };
}

function parseTransactionListQuery(query, page) {
  return {
    ...page,
    search: optionalSearch(query.search),
    status: optionalOneOf(query.status, TRANSACTION_STATUSES, "status"),
    type: optionalOneOf(query.type, TRANSACTION_TYPES, "type"),
    userId: optionalId(query.userId, "userId"),
    portfolioId: optionalId(query.portfolioId, "portfolioId"),
  };
}

function parseAuditListQuery(query, page) {
  return {
    ...page,
    adminId: optionalId(query.adminId, "adminId"),
    action: optionalAction(query.action),
    resource: optionalResource(query.resource),
  };
}

function parseSettingsUpdate(body) {
  assertPlainObject(body);
  rejectUnknown(body, ["maintenanceMode", "supportEmail"]);
  const changes = {};

  if (body.maintenanceMode !== undefined) {
    if (typeof body.maintenanceMode !== "boolean") {
      throw validationError([{ field: "maintenanceMode", message: "maintenanceMode must be a boolean." }]);
    }
    changes.maintenanceMode = body.maintenanceMode;
  }
  if (body.supportEmail !== undefined) {
    changes.supportEmail = requireEmail(body.supportEmail, "supportEmail");
  }
  if (!Object.keys(changes).length) {
    throw validationError([{ field: "body", message: "At least one setting is required." }]);
  }

  return changes;
}

module.exports = {
  validationError,
  assertPlainObject,
  requireEmail,
  requireId,
  optionalSearch,
  parseLogin,
  parseRoleChange,
  parseUserUpdate,
  parseUserStatus,
  parseUserListQuery,
  parsePortfolioUpdate,
  parsePortfolioListQuery,
  parseTransactionUpdate,
  parseTransactionListQuery,
  parseAuditListQuery,
  parseSettingsUpdate,
};
