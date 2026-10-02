const { createAppError } = require("../errors");
const installService = require("../services/installService");

function isLocalRequest(req) {
  const address = req.socket && req.socket.remoteAddress;
  const local = address === "127.0.0.1" || address === "::1" || address === ":ffff:127.0.0.1" || address === "::ffff:127.0.0.1";
  const host = String(req.headers.host || "");
  const localHost = /^localhost:\d+$/i.test(host) || /^127\.0\.0\.1:\d+$/.test(host);
  return local && localHost;
}

function assertLocal(req) {
  if (!isLocalRequest(req)) {
    throw createAppError("FORBIDDEN", "Dependency installation is only available from this machine.");
  }
}

function meta() {
  const state = installService.snapshot();
  return {
    manager: installService.detectPackageManager(),
    currentManager: state.manager,
    command: state.command,
    status: state.status,
    progress: state.progress,
    step: state.step,
    success: state.success,
  };
}

function status(context) {
  assertLocal(context.req);
  return { status: 200, body: { data: installService.snapshot() } };
}

function run(context) {
  assertLocal(context.req);
  const action = context.body && context.body.action;
  const packages = context.body && context.body.packages;
  const data = installService.start(action, packages);
  return { status: 202, body: { data } };
}

function stream(context) {
  assertLocal(context.req);
  throw createAppError(
    "CONFLICT",
    "Installation progress is not streamed to the browser. Run the package manager in the terminal."
  );
}

module.exports = {
  meta,
  status,
  run,
  stream,
  isLocalRequest,
};
