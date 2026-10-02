const { getConfig } = require("./config");
const { createApp } = require("./app");

function start() {
  const config = getConfig();
  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`[backend] ${config.serviceName} listening on http://localhost:${config.port}`);
  });

  server.on("error", (error) => {
    console.error("[backend] Failed to start HTTP server");
    console.error(error && error.message ? error.message : error);
    process.exit(1);
  });

  const shutdown = (signal) => {
    console.log(`[backend] Received ${signal}, shutting down`);
    server.close((closeError) => {
      if (closeError) {
        console.error(closeError);
        process.exit(1);
      }
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  return server;
}

if (require.main === module) {
  try {
    start();
  } catch (error) {
    console.error(error && error.message ? error.message : error);
    process.exit(1);
  }
}

module.exports = {
  start,
};
