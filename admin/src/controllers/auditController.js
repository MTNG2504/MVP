const { parsePagination } = require("../utils/pagination");
const { parseAuditListQuery } = require("../utils/validation");
const auditService = require("../services/auditService");

function list(req) {
  const query = parseAuditListQuery(req.query, parsePagination(req.query));
  return { status: 200, body: auditService.list(req.admin, query) };
}

module.exports = {
  list,
};
