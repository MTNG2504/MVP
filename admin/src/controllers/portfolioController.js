const { parsePagination } = require("../utils/pagination");
const { parsePortfolioListQuery, parsePortfolioUpdate, requireId } = require("../utils/validation");
const portfolioService = require("../services/portfolioService");

function list(req) {
  const query = parsePortfolioListQuery(req.query, parsePagination(req.query));
  return { status: 200, body: portfolioService.list(req.admin, query) };
}

function getById(req) {
  const portfolioId = requireId(req.params.id, "id");
  return { status: 200, body: { data: portfolioService.getById(req.admin, portfolioId) } };
}

function update(req) {
  const portfolioId = requireId(req.params.id, "id");
  const changes = parsePortfolioUpdate(req.body);
  return { status: 200, body: { data: portfolioService.update(req.admin, portfolioId, changes) } };
}

module.exports = {
  list,
  getById,
  update,
};
