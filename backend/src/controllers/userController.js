const { sendSuccess } = require("../utils/response");
const { asyncHandler } = require("../utils/asyncHandler");
const { parseCreateUser, parseUpdateUser, requireId } = require("../validators/userValidator");
const userService = require("../services/userService");

const list = asyncHandler(async (req, res) => {
  const users = userService.listUsers();
  sendSuccess(res, { users });
});

const getById = asyncHandler(async (req, res) => {
  const id = requireId(req.params.id);
  const user = userService.getUserById(id);
  sendSuccess(res, { user });
});

const create = asyncHandler(async (req, res) => {
  const input = parseCreateUser(req.body);
  const user = userService.createUser(input);
  sendSuccess(res, { user }, 201);
});

const update = asyncHandler(async (req, res) => {
  const id = requireId(req.params.id);
  const changes = parseUpdateUser(req.body);
  const user = userService.updateUser(id, changes);
  sendSuccess(res, { user });
});

const remove = asyncHandler(async (req, res) => {
  const id = requireId(req.params.id);
  const result = userService.deleteUser(id);
  sendSuccess(res, result);
});

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
