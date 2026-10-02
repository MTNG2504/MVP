# Backend API

Independent Node.js API for Coin Rich. This process is separate from the Next.js frontend and from the existing `admin/` workspace.

The frontend still uses Clerk in the browser. This API does not verify Clerk tokens yet. Do not send Clerk secrets to the client.

## Architecture

```
HTTP request
  → routes
  → controllers     read the request, call a service, send JSON
  → services        business rules
  → repositories    data access
  → data source     in-memory Map in userRepository.js (replace later)
```

Middleware covers request logging, CORS, JSON parsing, 404s, errors, and auth placeholders.

## Ports

| Process | Default URL |
|---|---|
| Frontend (Next.js) | http://localhost:3000 |
| Admin workspace | http://localhost:3001 |
| This backend | http://localhost:3002 |

Port 3001 is already used by `admin/`. This API uses **3002** so both can run at once.

## Install and run

```sh
cd backend
npm install
npm run check
npm run dev
```

Production-style start:

```sh
npm start
```

The backend starts without the frontend.

## Environment

Copy `.env.example` to `.env`. Values are loaded only through `src/config/env.js`.

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3002` | HTTP port |
| `NODE_ENV` | `development` | `development`, `test`, or `production` |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed browser origin |

Do not commit secrets. `.env` is gitignored.

## Endpoints

Base path: `/api/v1`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | Public | Service status |
| `GET` | `/api/v1/users` | Public | List users |
| `GET` | `/api/v1/users/:id` | Public | Get one user |
| `POST` | `/api/v1/users` | Public | Create a user |
| `PATCH` | `/api/v1/users/:id` | Protected | Update a user |
| `DELETE` | `/api/v1/users/:id` | Protected | Delete a user |

Protected routes use `requireAuth`. Until a real provider is wired, they return `401 AUTH_NOT_CONFIGURED` if a Bearer token is present, or `401 UNAUTHORIZED` if it is missing. Client-supplied user IDs are not treated as authentication.

### Health

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "backend"
  }
}
```

### Errors

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

Unknown routes return `404 NOT_FOUND` in the same shape.

## Data

`userRepository.js` owns an in-memory `Map`. Controllers and services never touch that store. Swap the repository implementation later for PostgreSQL or another database without changing HTTP layers.

Users are not pre-seeded. Create them with `POST /api/v1/users`.

## Auth integration later

Frontend auth is Clerk (`@clerk/clerk-react`). When this API should trust browser sessions, verify Clerk JWTs in `middleware/auth.js` using a **server-side** Clerk secret from env. Do not copy the existing frontend Clerk flow into this process, and do not hardcode keys.

## Scripts

| Script | Command |
|---|---|
| `npm run dev` | `node --watch src/server.js` |
| `npm start` | `node src/server.js` |
| `npm run check` | `node --check src/server.js` |
