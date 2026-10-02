class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.expose = statusCode < 500;
  }
}

module.exports = {
  AppError,
};
