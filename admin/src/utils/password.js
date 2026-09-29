const { scryptSync, randomBytes, timingSafeEqual } = require("crypto");

const KEY_LENGTH = 32;

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (typeof password !== "string" || typeof stored !== "string") {
    return false;
  }

  const separator = stored.indexOf(":");
  if (separator === -1) {
    return false;
  }

  const salt = stored.slice(0, separator);
  const expected = Buffer.from(stored.slice(separator + 1), "hex");
  const actual = scryptSync(password, salt, KEY_LENGTH);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
