function requestLogger(req, res, next) {
  res.on("finish", () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  next();
}

module.exports = {
  requestLogger,
};
