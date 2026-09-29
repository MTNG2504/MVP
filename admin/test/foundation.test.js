const { describe, it, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");

process.env.ADMIN_BOOTSTRAP_EMAIL = "super@localhost";
process.env.ADMIN_BOOTSTRAP_PASSWORD = "super-pass-123";
process.env.ADMIN_DEMO_PASSWORD = "demo-pass-123";

const { hashPassword } = require("../src/utils/password");
const { seed } = require("../src/data/memoryStore");
const { createServer } = require("../src/app");
const { hasPermission, PERMISSIONS } = require("../src/config/permissions");
const { toErrorResponse } = require("../src/middleware/errorHandler");
const userService = require("../src/services/userService");
const auditService = require("../src/services/auditService");

const PASSWORDS = {
  super: "super-pass-123",
  demo: "demo-pass-123",
};

let server;
let seedOptions;

function request(method, path, options = {}) {
  const payload = options.raw !== undefined
    ? options.raw
    : options.body === undefined
      ? null
      : JSON.stringify(options.body);
  const { port } = server.address();

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: "127.0.0.1",
      port,
      path,
      method,
      headers: {
        ...(payload !== null
          ? {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
          }
          : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
    }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve({
          status: res.statusCode,
          body: text ? JSON.parse(text) : null,
        });
      });
    });

    req.on("error", reject);
    if (payload !== null) {
      req.write(payload);
    }
    req.end();
  });
}

async function login(email, password) {
  const response = await request("POST", "/api/admin/login", {
    body: { email, password },
  });
  assert.equal(response.status, 200, JSON.stringify(response.body));
  return response.body.data.token;
}

describe("admin workspace", () => {
  before(async () => {
    seedOptions = {
      bootstrapEmail: "super@localhost",
      bootstrapPasswordHash: hashPassword(PASSWORDS.super),
      demoPasswordHash: hashPassword(PASSWORDS.demo),
    };
    seed(seedOptions);
    server = createServer();
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  });

  after(() => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  }));

  beforeEach(() => {
    seed(seedOptions);
  });

  it("allows health checks without authentication", async () => {
    const response = await request("GET", "/api/health");
    assert.equal(response.status, 200);
    assert.equal(response.body.data.status, "ok");
  });

  it("rejects missing and invalid sessions", async () => {
    const missing = await request("GET", "/api/users");
    assert.equal(missing.status, 401);
    assert.equal(missing.body.error.code, "UNAUTHORIZED");
    assert.equal(JSON.stringify(missing.body).includes("stack"), false);

    const unknown = await request("POST", "/api/admin/login", {
      body: { email: "missing@localhost", password: "not-the-password" },
    });
    const wrong = await request("POST", "/api/admin/login", {
      body: { email: "super@localhost", password: "wrong-password-1" },
    });
    assert.equal(unknown.status, 401);
    assert.equal(wrong.status, 401);
    assert.equal(unknown.body.error.message, wrong.body.error.message);
  });

  it("logs in, returns the admin without secrets, and logs out", async () => {
    const response = await request("POST", "/api/admin/login", {
      body: { email: "super@localhost", password: PASSWORDS.super },
    });
    assert.equal(response.status, 200);
    assert.equal(response.body.data.admin.role, "SUPER_ADMIN");
    assert.equal(JSON.stringify(response.body).includes("passwordHash"), false);
    assert.equal(JSON.stringify(response.body).includes(PASSWORDS.super), false);

    const token = response.body.data.token;
    const me = await request("GET", "/api/admin/me", { token });
    assert.equal(me.status, 200);
    assert.ok(me.body.data.permissions.includes(PERMISSIONS.MANAGE_ADMINS));

    const loggedOut = await request("POST", "/api/admin/logout", { token });
    assert.equal(loggedOut.status, 200);
    const after = await request("GET", "/api/admin/me", { token });
    assert.equal(after.status, 401);
  });

  it("paginates, searches, and filters users", async () => {
    const token = await login("support@localhost", PASSWORDS.demo);
    const page = await request("GET", "/api/users?page=2&limit=5", { token });
    assert.equal(page.status, 200);
    assert.equal(page.body.data[0].id, "user-6");
    assert.deepEqual(page.body.pagination, {
      page: 2,
      limit: 5,
      offset: 5,
      total: 30,
      totalPages: 6,
    });

    const byOffset = await request("GET", "/api/users?offset=5&limit=5", { token });
    assert.equal(byOffset.body.pagination.page, 2);
    assert.equal(byOffset.body.data[0].id, "user-6");

    const byEmail = await request("GET", "/api/users?search=user11@example.com", { token });
    assert.equal(byEmail.body.pagination.total, 1);
    assert.equal(byEmail.body.data[0].id, "user-11");

    const byName = await request("GET", "/api/users?search=Ava%20Kim", { token });
    assert.deepEqual(byName.body.data.map((user) => user.id), ["user-1", "user-11", "user-21"]);

    const filtered = await request("GET", "/api/users?status=suspended&role=user", { token });
    assert.equal(filtered.body.pagination.total, 7);

    const dated = await request("GET", "/api/users?createdFrom=2024-01-10&createdTo=2024-01-12", { token });
    assert.deepEqual(dated.body.data.map((user) => user.id), ["user-10", "user-11", "user-12"]);
  });

  it("rejects invalid pagination, search, and user input", async () => {
    const token = await login("admin@localhost", PASSWORDS.demo);
    const limit = await request("GET", "/api/users?limit=101", { token });
    assert.equal(limit.status, 400);
    assert.equal(limit.body.error.code, "VALIDATION_ERROR");
    assert.equal(limit.body.error.details[0].field, "limit");

    const page = await request("GET", "/api/users?page=0", { token });
    assert.equal(page.status, 400);

    const offset = await request("GET", "/api/users?page=1&limit=5&offset=5", { token });
    assert.equal(offset.status, 400);
    assert.equal(offset.body.error.details[0].field, "offset");

    const search = await request("GET", `/api/users?search=${"a".repeat(101)}`, { token });
    assert.equal(search.status, 400);

    const email = await request("PATCH", "/api/users/user-1", {
      token,
      body: { email: "not-an-email" },
    });
    assert.equal(email.status, 400);
    assert.equal(email.body.error.details[0].field, "email");

    const status = await request("PATCH", "/api/users/user-1/status", {
      token,
      body: { status: "archived" },
    });
    assert.equal(status.status, 400);

    const json = await request("POST", "/api/admin/login", { raw: "{" });
    assert.equal(json.status, 400);
    assert.equal(json.body.error.details[0].message, "Request body must be valid JSON.");
  });

  it("enforces roles on user management and writes an audit record", async () => {
    const support = await login("support@localhost", PASSWORDS.demo);
    const forbidden = await request("PATCH", "/api/users/user-1/status", {
      token: support,
      body: { status: "active" },
    });
    assert.equal(forbidden.status, 403);
    assert.equal(forbidden.body.error.code, "FORBIDDEN");

    const admin = await login("admin@localhost", PASSWORDS.demo);
    const invalid = await request("PATCH", "/api/users/user-1/status", {
      token: admin,
      body: { status: "suspended" },
    });
    assert.equal(invalid.status, 409);
    assert.equal(invalid.body.error.code, "CONFLICT");

    const updated = await request("PATCH", "/api/users/user-1/status", {
      token: admin,
      body: { status: "active" },
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.status, "active");

    const renamed = await request("PATCH", "/api/users/user-1", {
      token: admin,
      body: { fullName: "Ava Updated", email: "user2@example.com" },
    });
    assert.equal(renamed.status, 409);

    const saved = await request("PATCH", "/api/users/user-1", {
      token: admin,
      body: { fullName: "Ava Updated" },
    });
    assert.equal(saved.status, 200);
    assert.equal(saved.body.data.fullName, "Ava Updated");

    const audit = await request("GET", "/api/audit?resource=user", { token: admin });
    const actions = audit.body.data.map((entry) => entry.action);
    assert.ok(actions.includes("USER_STATUS_UPDATED"));
    assert.ok(actions.includes("USER_UPDATED"));
    assert.equal(JSON.stringify(audit.body).includes("password"), false);
  });

  it("checks permissions for portfolios, transactions, settings, and admins", async () => {
    const support = await login("support@localhost", PASSWORDS.demo);
    const admin = await login("admin@localhost", PASSWORDS.demo);
    const superToken = await login("super@localhost", PASSWORDS.super);

    const supportPortfolios = await request("GET", "/api/portfolios?status=frozen", { token: support });
    assert.equal(supportPortfolios.status, 200);
    assert.equal(supportPortfolios.body.pagination.total, 2);

    const supportWrite = await request("PATCH", "/api/portfolios/portfolio-1", {
      token: support,
      body: { status: "frozen" },
    });
    assert.equal(supportWrite.status, 403);

    const adminWrite = await request("PATCH", "/api/transactions/txn-1", {
      token: admin,
      body: { status: "reversed" },
    });
    assert.equal(adminWrite.status, 403);

    const supportAudit = await request("GET", "/api/audit", { token: support });
    assert.equal(supportAudit.status, 403);

    const supportSettings = await request("GET", "/api/settings", { token: support });
    assert.equal(supportSettings.status, 403);

    const frozen = await request("PATCH", "/api/portfolios/portfolio-1", {
      token: superToken,
      body: { status: "frozen", notes: "compliance hold" },
    });
    assert.equal(frozen.status, 200);
    assert.equal(frozen.body.data.status, "frozen");

    const closed = await request("PATCH", "/api/portfolios/portfolio-1", {
      token: superToken,
      body: { status: "closed" },
    });
    assert.equal(closed.status, 200);
    const closedAgain = await request("PATCH", "/api/portfolios/portfolio-1", {
      token: superToken,
      body: { notes: "too late" },
    });
    assert.equal(closedAgain.status, 409);

    const badTransaction = await request("PATCH", "/api/transactions/txn-1", {
      token: superToken,
      body: { status: "failed" },
    });
    assert.equal(badTransaction.status, 409);
    const reversed = await request("PATCH", "/api/transactions/txn-1", {
      token: superToken,
      body: { status: "reversed", reason: "duplicate fill" },
    });
    assert.equal(reversed.status, 200);
    assert.equal(reversed.body.data.status, "reversed");

    const pending = await request("GET", "/api/transactions?status=pending", { token: support });
    assert.equal(pending.body.pagination.total, 2);

    const settings = await request("PATCH", "/api/settings", {
      token: superToken,
      body: { maintenanceMode: true },
    });
    assert.equal(settings.status, 200);
    assert.equal(settings.body.data.maintenanceMode, true);

    const admins = await request("GET", "/api/admins", { token: superToken });
    assert.equal(JSON.stringify(admins.body).includes("passwordHash"), false);

    const lastSuper = await request("PATCH", "/api/admins/admin-super/role", {
      token: superToken,
      body: { role: "ADMIN" },
    });
    assert.equal(lastSuper.status, 409);

    const demoted = await request("PATCH", "/api/admins/admin-ops/role", {
      token: superToken,
      body: { role: "SUPPORT" },
    });
    assert.equal(demoted.status, 200);
    assert.equal(demoted.body.data.role, "SUPPORT");

    const supportStats = await request("GET", "/api/stats", { token: support });
    assert.equal(supportStats.body.data.users.total, 30);
    assert.equal(supportStats.body.data.portfolios.total, 12);
    assert.equal(supportStats.body.data.transactions.total, 20);
    assert.equal(supportStats.body.data.audit, undefined);

    const superStats = await request("GET", "/api/stats", { token: superToken });
    assert.equal(typeof superStats.body.data.audit.total, "number");
    assert.ok(superStats.body.data.audit.total >= 1);
  });

  it("hides internal errors and strips secrets from audit metadata", () => {
    assert.equal(hasPermission("SUPPORT", PERMISSIONS.MANAGE_USERS), false);
    assert.equal(hasPermission("ADMIN", PERMISSIONS.VIEW_AUDIT_LOGS), true);
    assert.equal(hasPermission("SUPER_ADMIN", PERMISSIONS.MODIFY_SETTINGS), true);

    const support = { id: "admin-support", role: "SUPPORT" };
    assert.throws(
      () => userService.updateStatus(support, "user-1", "active"),
      (error) => error.code === "FORBIDDEN"
    );

    const entry = auditService.record({
      adminId: "admin-super",
      action: "USER_UPDATED",
      resource: "user",
      resourceId: "user-1",
      metadata: { password: "hunter2", token: "abc", note: "kept" },
    });
    assert.equal(entry.metadata.password, undefined);
    assert.equal(entry.metadata.token, undefined);
    assert.equal(entry.metadata.note, "kept");
    assert.ok(entry.timestamp);

    const hidden = toErrorResponse(new Error("database password=secret"));
    assert.equal(hidden.status, 500);
    assert.equal(hidden.body.error.code, "INTERNAL_ERROR");
    assert.equal(JSON.stringify(hidden.body).includes("secret"), false);
    assert.equal(hidden.body.error.stack, undefined);
  });

  it("returns not found for unknown routes and records", async () => {
    const missingRoute = await request("GET", "/api/does-not-exist");
    assert.equal(missingRoute.status, 404);
    assert.equal(missingRoute.body.error.code, "NOT_FOUND");
    assert.equal(missingRoute.body.error.stack, undefined);

    const token = await login("support@localhost", PASSWORDS.demo);
    const missingUser = await request("GET", "/api/users/user-999", { token });
    assert.equal(missingUser.status, 404);
  });
});
