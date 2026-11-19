# Phase 1 API Endpoints

Base path: `/api/v1`

| Method | Path | Authentication | Purpose |
|---|---|---|---|
| GET | `/health/live` | Public | Process liveness |
| GET | `/health/ready` | Public | PostgreSQL and Redis readiness |
| GET | `/openapi.json` | Public | OpenAPI 3.1 document |
| GET | `/auth/csrf` | Public | Issue CSRF cookie/token pair |
| POST | `/auth/login` | CSRF | Authenticate and establish session |
| POST | `/auth/refresh` | Refresh cookie + CSRF | Rotate session and cookies |
| POST | `/auth/logout` | Access cookie + CSRF | Revoke session family |
| GET | `/auth/me` | Access cookie | Current user, tenant, roles, permissions |
| GET | `/foundation/status` | Access cookie + `dashboard:executive:read` | Verify protected RBAC path |

Swagger UI is mounted at `/api/docs`.

All successful JSON payloads use `{ "data": ... }`. Errors use problem details containing `type`, `title`, `status`, `detail`, `code`, and `requestId`.
