const { createAppError } = require("../errors");
const { PERMISSIONS, hasPermission } = require("../config/permissions");
const { assertPermission } = require("../auth/access");
const { buildPage } = require("../utils/pagination");
const transactionRepository = require("../repositories/transactionRepository");
const auditService = require("./auditService");

const STATUS_TRANSITIONS = {
  pending: ["completed", "failed"],
  completed: ["reversed"],
  failed: [],
  reversed: [],
};

function list(admin, query) {
  assertPermission(admin, PERMISSIONS.VIEW_TRANSACTIONS);
  const result = transactionRepository.query(query);
  return buildPage(result.items, result.total, query);
}

function getById(admin, transactionId) {
  assertPermission(admin, PERMISSIONS.VIEW_TRANSACTIONS);
  const transaction = transactionRepository.findById(transactionId);
  if (!transaction) {
    throw createAppError("NOT_FOUND", "Transaction was not found.");
  }
  return transaction;
}

function update(admin, transactionId, input) {
  assertPermission(admin, PERMISSIONS.MANAGE_TRANSACTIONS);
  const existing = transactionRepository.findById(transactionId);
  if (!existing) {
    throw createAppError("NOT_FOUND", "Transaction was not found.");
  }
  if (existing.status === input.status) {
    throw createAppError("CONFLICT", "Transaction already has this status.");
  }

  const allowed = STATUS_TRANSITIONS[existing.status] || [];
  if (!allowed.includes(input.status)) {
    throw createAppError(
      "CONFLICT",
      `Cannot change transaction status from ${existing.status} to ${input.status}.`
    );
  }

  const updated = transactionRepository.update(transactionId, { status: input.status });
  const metadata = { from: existing.status, to: input.status };
  if (input.reason) {
    metadata.reason = input.reason;
  }

  auditService.record({
    adminId: admin.id,
    action: "TRANSACTION_UPDATED",
    resource: "transaction",
    resourceId: transactionId,
    metadata,
  });
  return updated;
}

function summarize(admin) {
  if (!admin || !hasPermission(admin.role, PERMISSIONS.VIEW_TRANSACTIONS)) {
    return null;
  }
  return transactionRepository.summarize();
}

module.exports = {
  list,
  getById,
  update,
  summarize,
};
