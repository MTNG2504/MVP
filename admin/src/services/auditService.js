const { createAppError } = require("../errors");
const { PERMISSIONS, hasPermission } = require("../config/permissions");
const { assertPermission } = require("../auth/access");
const { buildPage } = require("../utils/pagination");
const auditRepository = require("../repositories/auditRepository");

const SENSITIVE_KEY = /password|token|secret|apikey|api_key|authorization|credential/i;

function sanitize(value, depth) {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (depth > 4) {
    return "[truncated]";
  }
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitize(item, depth + 1));
  }
  if (typeof value === "object") {
    const clean = {};
    for (const key of Object.keys(value)) {
      if (SENSITIVE_KEY.test(key)) {
        continue;
      }
      clean[key] = sanitize(value[key], depth + 1);
    }
    return clean;
  }
  return undefined;
}

function record(entry) {
  if (!entry || !entry.adminId || !entry.action || !entry.resource) {
    throw createAppError("INTERNAL_ERROR", "Audit record is incomplete.");
  }

  return auditRepository.insert({
    adminId: entry.adminId,
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId || null,
    metadata: sanitize(entry.metadata || {}, 0),
  });
}

function list(admin, query) {
  assertPermission(admin, PERMISSIONS.VIEW_AUDIT_LOGS);
  const result = auditRepository.query(query);
  return buildPage(result.items, result.total, query);
}

function summarize(admin) {
  if (!admin || !hasPermission(admin.role, PERMISSIONS.VIEW_AUDIT_LOGS)) {
    return null;
  }
  return { total: auditRepository.count() };
}

module.exports = {
  record,
  list,
  summarize,
};
