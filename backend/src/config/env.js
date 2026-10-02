const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

function requiredString(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === "") {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`${name} is required.`);
  }
  return value;
}

function positiveInteger(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return value;
}

function loadEnv() {
  const nodeEnv = requiredString("NODE_ENV", "development");
  if (!["development", "test", "production"].includes(nodeEnv)) {
    throw new Error("NODE_ENV must be development, test, or production.");
  }

  return {
    nodeEnv,
    isProduction: nodeEnv === "production",
    port: positiveInteger("PORT", 3002),
    corsOrigin: requiredString("CORS_ORIGIN", "http://localhost:3000"),
    serviceName: "backend",
  };
}

module.exports = {
  loadEnv,
};
