const { parsePagination } = require("../utils/pagination");
const {
  parseTransactionListQuery,
  parseTransactionUpdate,
  requireId,
} = require("../utils/validation");
const transactionService = require("../services/transactionService");

function list(req) {
  const query = parseTransactionListQuery(req.query, parsePagination(req.query));
  return { status: 200, body: transactionService.list(req.admin, query) };
}

function getById(req) {
  const transactionId = requireId(req.params.id, "id");
  return { status: 200, body: { data: transactionService.getById(req.admin, transactionId) } };
}

function update(req) {
  const transactionId = requireId(req.params.id, "id");
  const input = parseTransactionUpdate(req.body);
  return { status: 200, body: { data: transactionService.update(req.admin, transactionId, input) } };
}

module.exports = {
  list,
  getById,
  update,
};
