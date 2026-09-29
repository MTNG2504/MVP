const { toErrorResponse } = require("../middleware/errorHandler");

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Cache-Control": "no-store",
  });
  res.end(payload);
}

function sendError(res, error) {
  const result = toErrorResponse(error);
  sendJson(res, result.status, result.body);
}

module.exports = {
  sendJson,
  sendError,
};
