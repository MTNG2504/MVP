const fs = require("fs");
const path = require("path");
const { createAppError } = require("../errors");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");

function detectPackageManager() {
  if (fs.existsSync(path.join(PROJECT_ROOT, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (fs.existsSync(path.join(PROJECT_ROOT, "yarn.lock"))) {
    return "yarn";
  }
  return "npm";
}

function snapshot() {
  const manager = detectPackageManager();
  return {
    status: "idle",
    manager,
    command: `${manager} install`,
    progress: null,
    step: null,
    logs: [],
    success: null,
    startedAt: null,
    finishedAt: null,
  };
}

function start() {
  const manager = detectPackageManager();
  throw createAppError(
    "CONFLICT",
    `Run ${manager} install in the project terminal. Package manager output is shown there, not through this API.`
  );
}

function subscribe() {
  return () => {};
}

module.exports = {
  detectPackageManager,
  snapshot,
  start,
  subscribe,
};
