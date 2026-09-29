# Admin workspace

Business-logic and HTTP API foundation for managing Coin Rich. There is no admin UI in this package.

The customer application stays where it is (Next.js, Clerk, Supabase). This workspace is a separate CommonJS Node process.

## Architecture

```
HTTP request
  → controller   validate input, call a service, return JSON
  → service      permissions, status transitions, audit records
  → repository   query and write the data source
  → data source  in-memory store today
```

Controllers do not contain business rules. Services do not import the in-memory store. A later database repository can replace the current one without rewriting those rules.

Coin Rich already stores `profiles` and `portfolio_holdings` in Supabase. It does not store admin accounts, sessions, user status, transactions, settings, or audit logs. Those records live behind the admin repositories for now.

## Folder structure

```
admin/
├── src/
│   ├── app.js                 HTTP server and routes
│   ├── bootstrap.js           Seeds the first admin from .env
│   ├── auth/access.js         Permission checks
│   ├── config/                Port, env, roles, permissions
│   ├── controllers/           Request handlers
│   ├── data/memoryStore.js    Development data source
│   ├── domain/constants.js    Status and role values
│   ├── middleware/            Authentication, authorization, errors
│   ├── repositories/          Data access
│   ├── services/              Business rules
│   └── utils/                 Validation, pagination, passwords, responses
├── test/foundation.test.js
├── package.json
├── .env.example
└── .env                       Local only. Gitignored.
```

## Install and run

Requires Node.js 18 or newer. The admin workspace has no npm dependencies of its own.

From the repository root, one command installs both projects and one command starts both:

```sh
npm install
npm run dev
```

Coin Rich listens on `http://localhost:3000`. This API listens on `http://localhost:3001`.

To run only the admin workspace:

```sh
cd admin
npm install
npm test
npm start
```

Sign in with `POST /api/admin/login`:

```json
{ "email": "super@localhost", "password": "<ADMIN_BOOTSTRAP_PASSWORD>" }
```

Send the returned token as `Authorization: Bearer <token>`.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No | HTTP port. Default `3001`. |
| `ADMIN_TOKEN_TTL_MS` | No | Session lifetime in milliseconds. Default 8 hours. |
| `ADMIN_BOOTSTRAP_EMAIL` | Yes | Email of the seeded super admin. |
| `ADMIN_BOOTSTRAP_PASSWORD` | Yes | Password of the seeded super admin. At least 8 characters. |
| `ADMIN_DEMO_PASSWORD` | No | When set, also seeds `admin@localhost` (`ADMIN`) and `support@localhost` (`SUPPORT`). |

Copy `.env.example` to `.env`. Do not commit `.env`. Passwords are hashed with Node's `scrypt` and are never written to logs, API responses, or audit metadata.

The in-memory data is rebuilt on every process start.

## Modules

| Module | Responsibility |
|---|---|
| Admin | Login, logout, current admin, role changes, settings |
| Users | List, get, search, filter, update profile, update status |
| Portfolios | List, get, filter, update holdings and status |
| Transactions | List, get, filter, move status through allowed transitions |
| Audit | Append-only record of administrative mutations |
| Stats | Counts visible to the signed-in role |

### Routes

| Method | Path | Permission |
|---|---|---|
| `GET` | `/api/health` | Public |
| `POST` | `/api/admin/login` | Public |
| `POST` | `/api/admin/logout` | Authenticated |
| `GET` | `/api/admin/me` | Authenticated |
| `GET` | `/api/admins` | `admins.manage` |
| `PATCH` | `/api/admins/:id/role` | `admins.manage` |
| `GET` | `/api/settings` | `settings.modify` |
| `PATCH` | `/api/settings` | `settings.modify` |
| `GET` | `/api/stats` | Authenticated. Sections depend on role. |
| `GET` | `/api/users` | `users.view` |
| `GET` | `/api/users/:id` | `users.view` |
| `PATCH` | `/api/users/:id` | `users.manage` |
| `PATCH` | `/api/users/:id/status` | `users.manage` |
| `GET` | `/api/portfolios` | `portfolios.view` |
| `GET` | `/api/portfolios/:id` | `portfolios.view` |
| `PATCH` | `/api/portfolios/:id` | `portfolios.manage` |
| `GET` | `/api/transactions` | `transactions.view` |
| `GET` | `/api/transactions/:id` | `transactions.view` |
| `PATCH` | `/api/transactions/:id` | `transactions.manage` |
| `GET` | `/api/audit` | `audit.view` |

List routes accept `page`, `limit`, and `offset`. `limit` cannot exceed 100. A page result looks like:

```json
{
  "data": [],
  "pagination": { "page": 1, "limit": 20, "offset": 0, "total": 0, "totalPages": 0 }
}
```

User search matches id, email, and name. User filters: `status`, `role`, `createdFrom`, `createdTo`.

## Roles and permissions

| Permission | SUPER_ADMIN | ADMIN | SUPPORT |
|---|---|---|---|
| Manage admins | Yes | | |
| Manage users | Yes | Yes | |
| View users | Yes | Yes | Yes |
| Manage portfolios | Yes | | |
| View portfolios | Yes | Yes | Yes |
| Manage transactions | Yes | | |
| View transactions | Yes | Yes | Yes |
| View audit logs | Yes | Yes | |
| Modify settings | Yes | | |

`hasPermission(role, permission)` in `src/config/permissions.js` is the only permission check. Middleware and services both use it.

User status can move `pending → active|disabled`, `active → suspended|disabled`, `suspended → active|disabled`, and `disabled → active`.

Portfolio status can move `active → frozen|closed` and `frozen → active|closed`. Closed portfolios cannot be changed.

Transaction status can move `pending → completed|failed` and `completed → reversed`.

The last `SUPER_ADMIN` cannot be demoted.

## Data layer

`src/data/memoryStore.js` is the only module that owns the arrays. Repositories are the only modules that read and write it. Services depend on repositories, not on the store.

Seeded development data includes 30 users, 12 portfolios, and 20 transactions so search, filters, and pagination can be exercised. Restarting the process resets it.

To use a database later, replace the repository implementations and keep the exported function names (`query`, `findById`, `update`, and so on). Map Supabase `profiles.full_name` and `portfolio_holdings` at that boundary.

## Errors

API errors use `{ error: { code, message, details } }`.

Codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `CONFLICT`, `INTERNAL_ERROR`.

Unexpected failures return `INTERNAL_ERROR` without a stack trace. The server logs the underlying error locally.

## Adding an admin UI later

Keep this package as the API. A separate UI can call these routes with a bearer token. Do not import this package into the Coin Rich React application, and do not add React or Tailwind here.

Suggested UI order: login, user list with the existing query parameters, user status actions, then read-only portfolios, transactions, and audit logs.
