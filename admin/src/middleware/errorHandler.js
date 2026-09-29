const { isAppError } = require("../errors");

function toErrorResponse(error) {
  if (isAppError(error) && error.expose) {
    console.warn(`[admin] ${error.code}: ${error.message}`);
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      },
    };
  }

  console.error("[admin] Unhandled error");
  console.error(error);

  return {
    status: 500,
    body: {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
      },
    },
  };
}

module.exports = {
  toErrorResponse,
};
