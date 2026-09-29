const STATUS_BY_CODE = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

function createAppError(code, message, details) {
  const error = new Error(message);
  error.name = "AppError";
  error.code = code;
  error.status = STATUS_BY_CODE[code] || 500;
  error.details = details;
  error.expose = code !== "INTERNAL_ERROR";
  return error;
}

function isAppError(error) {
  return Boolean(error && error.name === "AppError" && error.code);
}

module.exports = {
  createAppError,
  isAppError,
  STATUS_BY_CODE,
};
