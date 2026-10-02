const { sendSuccess } = require("../utils/response");
const healthService = require("../services/healthService");

function getHealth(req, res) {
  return sendSuccess(res, healthService.getStatus());
}

module.exports = {
  getHealth,
};
