const fs = require("fs");
const path = require("path");

const ENV_PATH = path.join(__dirname, "..", "..", ".env");

function loadEnvFile() {
  if (!fs.existsSync(ENV_PATH)) {
    return;
  }

  const text = fs.readFileSync(ENV_PATH, "utf8");
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function readPositiveNumber(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Environment variable ${name} must be a positive number.`);
  }

  return value;
}

function getConfig() {
  return {
    port: readPositiveNumber("PORT", 3001),
    tokenTtlMs: readPositiveNumber("ADMIN_TOKEN_TTL_MS", 8 * 60 * 60 * 1000),
    defaultPageSize: 20,
    maxPageSize: 100,
    maxOffset: 1000000,
    bootstrapEmail: process.env.ADMIN_BOOTSTRAP_EMAIL || "",
    bootstrapPassword: process.env.ADMIN_BOOTSTRAP_PASSWORD || "",
    demoPassword: process.env.ADMIN_DEMO_PASSWORD || "",
  };
}

loadEnvFile();

module.exports = {
  getConfig,
  loadEnvFile,
};
