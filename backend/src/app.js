const express = require("express");
const cors = require("cors");
const { getConfig } = require("./config");
const { requestLogger } = require("./middleware/requestLogger");
const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");
const v1Routes = require("./routes");

function createApp() {
  const config = getConfig();
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));
  app.use(cors({ origin: config.corsOrigin }));
  app.use(requestLogger);
  app.use("/api/v1", v1Routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};
