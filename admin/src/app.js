const http = require("http");
const { createAppError } = require("./errors");
const { getConfig } = require("./config/config");
const { PERMISSIONS } = require("./config/permissions");
const { validationError } = require("./utils/validation");
const { sendJson, sendError } = require("./utils/response");
const { authenticate } = require("./middleware/authentication");
const { requirePermission } = require("./middleware/authorization");
const { bootstrap } = require("./bootstrap");
require("./services/userService");
const adminController = require("./controllers/adminController");
const userController = require("./controllers/userController");
const portfolioController = require("./controllers/portfolioController");
const transactionController = require("./controllers/transactionController");
const auditController = require("./controllers/auditController");

const MAX_BODY_BYTES = 1000000;

const routes = [
  { method: "GET", path: "/api/health", auth: false, handler: health },
  { method: "POST", path: "/api/admin/login", auth: false, handler: adminController.login },
  { method: "POST", path: "/api/admin/logout", handler: adminController.logout },
  { method: "GET", path: "/api/admin/me", handler: adminController.me },
  { method: "GET", path: "/api/admins", permission: PERMISSIONS.MANAGE_ADMINS, handler: adminController.list },
  { method: "PATCH", path: "/api/admins/:id/role", permission: PERMISSIONS.MANAGE_ADMINS, handler: adminController.changeRole },
  { method: "GET", path: "/api/settings", permission: PERMISSIONS.MODIFY_SETTINGS, handler: adminController.getSettings },
  { method: "PATCH", path: "/api/settings", permission: PERMISSIONS.MODIFY_SETTINGS, handler: adminController.updateSettings },
  { method: "GET", path: "/api/stats", handler: adminController.summary },
  { method: "GET", path: "/api/users", permission: PERMISSIONS.VIEW_USERS, handler: userController.list },
  { method: "GET", path: "/api/users/:id", permission: PERMISSIONS.VIEW_USERS, handler: userController.getById },
  { method: "PATCH", path: "/api/users/:id", permission: PERMISSIONS.MANAGE_USERS, handler: userController.update },
  { method: "PATCH", path: "/api/users/:id/status", permission: PERMISSIONS.MANAGE_USERS, handler: userController.updateStatus },
  { method: "GET", path: "/api/portfolios", permission: PERMISSIONS.VIEW_PORTFOLIOS, handler: portfolioController.list },
  { method: "GET", path: "/api/portfolios/:id", permission: PERMISSIONS.VIEW_PORTFOLIOS, handler: portfolioController.getById },
  { method: "PATCH", path: "/api/portfolios/:id", permission: PERMISSIONS.MANAGE_PORTFOLIOS, handler: portfolioController.update },
  { method: "GET", path: "/api/transactions", permission: PERMISSIONS.VIEW_TRANSACTIONS, handler: transactionController.list },
  { method: "GET", path: "/api/transactions/:id", permission: PERMISSIONS.VIEW_TRANSACTIONS, handler: transactionController.getById },
  { method: "PATCH", path: "/api/transactions/:id", permission: PERMISSIONS.MANAGE_TRANSACTIONS, handler: transactionController.update },
  { method: "GET", path: "/api/audit", permission: PERMISSIONS.VIEW_AUDIT_LOGS, handler: auditController.list },
];

function health() {
  return { status: 200, body: { data: { status: "ok" } } };
}

function matchPath(pattern, pathname) {
  const expected = pattern.split("/").filter(Boolean);
  const actual = pathname.split("/").filter(Boolean);
  if (expected.length !== actual.length) {
    return null;
  }

  const params = {};
  for (let index = 0; index < expected.length; index += 1) {
    if (expected[index].startsWith(":")) {
      params[expected[index].slice(1)] = decodeURIComponent(actual[index]);
    } else if (expected[index] !== actual[index]) {
      return null;
    }
  }
  return params;
}

function matchRoute(method, pathname) {
  for (const route of routes) {
    if (route.method !== method) {
      continue;
    }
    const params = matchPath(route.path, pathname);
    if (params) {
      return { route, params };
    }
  }
  return null;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let settled = false;

    const finish = (callback, value) => {
      if (settled) {
        return;
      }
      settled = true;
      callback(value);
    };

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        finish(reject, validationError([{ field: "body", message: "Request body is too large." }]));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      if (!chunks.length) {
        finish(resolve, {});
        return;
      }

      try {
        finish(resolve, JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (error) {
        finish(reject, validationError([{ field: "body", message: "Request body must be valid JSON." }]));
      }
    });

    req.on("error", (error) => finish(reject, error));
  });
}

async function handleRequest(req, res) {
  const method = req.method || "GET";
  const requestUrl = new URL(req.url || "/", "http://localhost");
  const matched = matchRoute(method, requestUrl.pathname);

  if (!matched) {
    throw createAppError("NOT_FOUND", "Route was not found.");
  }

  let body = {};
  if (method !== "GET" && method !== "HEAD") {
    body = await readBody(req);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw validationError([{ field: "body", message: "JSON body must be an object." }]);
    }
  }

  const context = {
    params: matched.params,
    query: Object.fromEntries(requestUrl.searchParams.entries()),
    body,
    headers: req.headers,
    admin: null,
    token: null,
  };

  if (matched.route.auth !== false) {
    authenticate(context);
  }
  if (matched.route.permission) {
    requirePermission(matched.route.permission)(context);
  }

  const result = matched.route.handler(context);
  sendJson(res, result.status, result.body);
}

function createServer() {
  return http.createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      if (!res.headersSent) {
        sendError(res, error);
      }
    });
  });
}

function start() {
  bootstrap();
  const server = createServer();
  const { port } = getConfig();

  server.listen(port, () => {
    console.log(`[admin] Listening on http://localhost:${port}`);
  });

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
  createServer,
  start,
};
