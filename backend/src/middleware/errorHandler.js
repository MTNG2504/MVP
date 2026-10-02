const { getConfig } = require("../config");
const { AppError } = require("../utils/errors");
const { sendError } = require("../utils/response");

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  const config = getConfig();

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    sendError(res, 400, "VALIDATION_ERROR", "Request body must be valid JSON.");
    return;
  }
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : "INTERNAL_ERROR";
  const message = isAppError && err.expose
    ? err.message
    : statusCode < 500
      ? err.message
      : "An unexpected error occurred.";

  if (!isAppError || statusCode >= 500) {
    console.error(err);
  } else if (!config.isProduction) {
    console.warn(`[${code}] ${err.message}`);
  }

  sendError(res, statusCode, code, message);
}

module.exports = {
  errorHandler,
};
