const { AppError } = require("../utils/errors");
const userRepository = require("../repositories/userRepository");

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function listUsers() {
  return userRepository.findAll().map(toPublicUser);
}

function getUserById(id) {
  const user = userRepository.findById(id);
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }
  return toPublicUser(user);
}

function createUser(input) {
  const existing = userRepository.findByEmail(input.email);
  if (existing) {
    throw new AppError("A user with this email already exists.", 409, "USER_EMAIL_CONFLICT");
  }
  return toPublicUser(userRepository.create(input));
}

function updateUser(id, changes) {
  const existing = userRepository.findById(id);
  if (!existing) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (changes.email && changes.email !== existing.email) {
    const duplicate = userRepository.findByEmail(changes.email);
    if (duplicate && duplicate.id !== existing.id) {
      throw new AppError("A user with this email already exists.", 409, "USER_EMAIL_CONFLICT");
    }
  }

  return toPublicUser(userRepository.update(id, changes));
}

function deleteUser(id) {
  const removed = userRepository.delete(id);
  if (!removed) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }
  return { id: removed.id, deleted: true };
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
