const { parsePagination } = require("../utils/pagination");
const {
  parseLogin,
  parseRoleChange,
  parseSettingsUpdate,
  requireId,
} = require("../utils/validation");
const adminService = require("../services/adminService");
const userService = require("../services/userService");
const portfolioService = require("../services/portfolioService");
const transactionService = require("../services/transactionService");
const auditService = require("../services/auditService");

function login(req) {
  const input = parseLogin(req.body);
  return { status: 200, body: { data: adminService.login(input.email, input.password) } };
}

function logout(req) {
  adminService.logout(req.admin, req.token);
  return { status: 200, body: { data: { loggedOut: true } } };
}

function me(req) {
  return { status: 200, body: { data: req.admin } };
}

function list(req) {
  const query = parsePagination(req.query);
  return { status: 200, body: adminService.list(req.admin, query) };
}

function changeRole(req) {
  const adminId = requireId(req.params.id, "id");
  const role = parseRoleChange(req.body);
  return { status: 200, body: { data: adminService.changeRole(req.admin, adminId, role) } };
}

function getSettings(req) {
  return { status: 200, body: { data: adminService.getSettings(req.admin) } };
}

function updateSettings(req) {
  const changes = parseSettingsUpdate(req.body);
  return { status: 200, body: { data: adminService.updateSettings(req.admin, changes) } };
}

function summary(req) {
  const data = {};
  const users = userService.summarize(req.admin);
  const portfolios = portfolioService.summarize(req.admin);
  const transactions = transactionService.summarize(req.admin);
  const audit = auditService.summarize(req.admin);

  if (users) data.users = users;
  if (portfolios) data.portfolios = portfolios;
  if (transactions) data.transactions = transactions;
  if (audit) data.audit = audit;

  return { status: 200, body: { data } };
}

module.exports = {
  login,
  logout,
  me,
  list,
  changeRole,
  getSettings,
  updateSettings,
  summary,
};
