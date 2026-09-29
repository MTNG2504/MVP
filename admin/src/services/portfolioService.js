const { createAppError } = require("../errors");
const { PERMISSIONS, hasPermission } = require("../config/permissions");
const { assertPermission } = require("../auth/access");
const { buildPage } = require("../utils/pagination");
const portfolioRepository = require("../repositories/portfolioRepository");
const auditService = require("./auditService");

const STATUS_TRANSITIONS = {
  active: ["frozen", "closed"],
  frozen: ["active", "closed"],
  closed: [],
};

function list(admin, query) {
  assertPermission(admin, PERMISSIONS.VIEW_PORTFOLIOS);
  const result = portfolioRepository.query(query);
  return buildPage(result.items, result.total, query);
}

function getById(admin, portfolioId) {
  assertPermission(admin, PERMISSIONS.VIEW_PORTFOLIOS);
  const portfolio = portfolioRepository.findById(portfolioId);
  if (!portfolio) {
    throw createAppError("NOT_FOUND", "Portfolio was not found.");
  }
  return portfolio;
}

function update(admin, portfolioId, changes) {
  assertPermission(admin, PERMISSIONS.MANAGE_PORTFOLIOS);
  const existing = portfolioRepository.findById(portfolioId);
  if (!existing) {
    throw createAppError("NOT_FOUND", "Portfolio was not found.");
  }

  const next = { ...changes };
  if (next.status !== undefined) {
    if (next.status === existing.status) {
      if (Object.keys(next).length === 1) {
        throw createAppError("CONFLICT", "Portfolio already has this status.");
      }
      delete next.status;
    } else if (!(STATUS_TRANSITIONS[existing.status] || []).includes(next.status)) {
      throw createAppError(
        "CONFLICT",
        `Cannot change portfolio status from ${existing.status} to ${next.status}.`
      );
    }
  }

  if (existing.status === "closed" && Object.keys(next).some((field) => field !== "status")) {
    throw createAppError("CONFLICT", "Closed portfolios cannot be changed.");
  }

  const metadata = {};
  for (const field of Object.keys(next)) {
    if (next[field] !== existing[field]) {
      metadata[field] = { from: existing[field], to: next[field] };
    }
  }
  if (!Object.keys(metadata).length) {
    return existing;
  }

  const updated = portfolioRepository.update(portfolioId, next);
  auditService.record({
    adminId: admin.id,
    action: "PORTFOLIO_UPDATED",
    resource: "portfolio",
    resourceId: portfolioId,
    metadata,
  });
  return updated;
}

function summarize(admin) {
  if (!admin || !hasPermission(admin.role, PERMISSIONS.VIEW_PORTFOLIOS)) {
    return null;
  }
  return portfolioRepository.summarize();
}

module.exports = {
  list,
  getById,
  update,
  summarize,
};
