const { getConfig } = require("../config");

function getStatus() {
  const config = getConfig();
  return {
    status: "ok",
    service: config.serviceName,
  };
}

module.exports = {
  getStatus,
};
