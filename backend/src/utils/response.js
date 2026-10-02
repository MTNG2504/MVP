function sendSuccess(res, data, statusCode) {
  return res.status(statusCode || 200).json({
    success: true,
    data,
  });
}

function sendError(res, statusCode, code, message) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

module.exports = {
  sendSuccess,
  sendError,
};
