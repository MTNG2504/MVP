const { getConfig } = require("./config/config");
const { hashPassword } = require("./utils/password");
const { requireEmail } = require("./utils/validation");
const { seed } = require("./data/memoryStore");
require("./services/userService");

function bootstrap() {
  const config = getConfig();
  let email = "";

  try {
    email = requireEmail(config.bootstrapEmail, "ADMIN_BOOTSTRAP_EMAIL");
  } catch (error) {
    throw new Error("ADMIN_BOOTSTRAP_EMAIL must be a valid email address.");
  }

  if (typeof config.bootstrapPassword !== "string" || config.bootstrapPassword.length < 8) {
    throw new Error("ADMIN_BOOTSTRAP_PASSWORD must be at least 8 characters.");
  }

  if (config.demoPassword && config.demoPassword.length < 8) {
    throw new Error("ADMIN_DEMO_PASSWORD must be at least 8 characters when it is set.");
  }

  seed({
    bootstrapEmail: email,
    bootstrapPasswordHash: hashPassword(config.bootstrapPassword),
    demoPasswordHash: config.demoPassword ? hashPassword(config.demoPassword) : null,
  });

  if (!config.demoPassword) {
    console.warn("[admin] ADMIN_DEMO_PASSWORD is not set. Only the bootstrap super admin was seeded.");
  }
}

module.exports = {
  bootstrap,
};
