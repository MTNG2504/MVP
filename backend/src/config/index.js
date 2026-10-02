const { loadEnv } = require("./env");

let cached;

function getConfig() {
  if (!cached) {
    cached = loadEnv();
  }
  return cached;
}

module.exports = {
  getConfig,
};
