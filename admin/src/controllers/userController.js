const { parsePagination } = require("../utils/pagination");
const {
  parseUserListQuery,
  parseUserUpdate,
  parseUserStatus,
  requireId,
} = require("../utils/validation");
const userService = require("../services/userService");

function list(req) {
  const query = parseUserListQuery(req.query, parsePagination(req.query));
  return { status: 200, body: userService.list(req.admin, query) };
}

function getById(req) {
  const userId = requireId(req.params.id, "id");
  return { status: 200, body: { data: userService.getById(req.admin, userId) } };
}

function update(req) {
  const userId = requireId(req.params.id, "id");
  const changes = parseUserUpdate(req.body);
  return { status: 200, body: { data: userService.update(req.admin, userId, changes) } };
}

function updateStatus(req) {
  const userId = requireId(req.params.id, "id");
  const status = parseUserStatus(req.body);
  return { status: 200, body: { data: userService.updateStatus(req.admin, userId, status) } };
}

module.exports = {
  list,
  getById,
  update,
  updateStatus,
};
