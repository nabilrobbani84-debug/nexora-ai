# NEXORA AI

Enterprise omnichannel B2B/B2C customer retention and lead scoring CRM. This repository is delivered in phases. **Phase 1 (Foundation)** is implemented: a secure, multi-tenant monorepo with authentication, RBAC, tenant isolation, a protected API, an enterprise web shell, and container/compose setup.

> Phases 2–6 (executive dashboard, Customer 360, 3D intelligence, AI conversation/churn/lead engines, workflow automation, analytics/reporting) are specified in [`docs/architecture/implementation-plan.md`](docs/architecture/implementation-plan.md) and build on these boundaries.

## Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Web | Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS 4, shadcn-style components, Framer Motion, TanStack Query, React Hook Form, Zod |
| API | Node.js 22, Express 5, TypeScript, REST `/api/v1`, Socket.IO, BullMQ |
| Data | PostgreSQL 16, Prisma ORM 7, Redis 7 |
| Security | Argon2id, JWT access/refresh rotation, HttpOnly cookies, CSRF, Helmet, rate limiting |
| Tooling | Docker, Docker Compose, OpenAPI/Swagger, Vitest, ESLint, Prettier |

## Repository layout

```
nexora-ai/
  apps/
    web/   Next.js application (landing, login, protected dashboard shell)
    api/   Express API (auth, RBAC, health, OpenAPI, realtime, worker, Prisma)
  packages/
    shared/  Zod schemas and constants shared across runtimes
    types/   Shared type declarations
    config/  Shared TypeScript config
  infrastructure/docker/  Dockerfiles
  docs/{architecture,database,api,security}/
  docker-compose.yml
```

## Prerequisites

- Node.js 22.18+ and pnpm 10+
- PostgreSQL 16 and Redis 7 (or Docker Compose)

## Quick start with Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Compose starts PostgreSQL and Redis, runs the Prisma schema push + seed (the `migrate` service), then starts the API, worker, and web app.

- Web: http://localhost:3000
- API health: http://localhost:4000/api/v1/health/ready
- Swagger UI: http://localhost:4000/api/docs

## Local development (without containers)

```bash
cp .env.example .env            # set DATABASE_URL / REDIS_URL / JWT secrets
pnpm install
pnpm db:generate                # generate Prisma client
pnpm db:migrate                 # create and apply the migration
pnpm db:seed                    # seed demo org, roles, permissions, users
pnpm dev                        # run web (3000) and api (4000)
```

## Demo credentials (local/demo only)

One user per system role is seeded; all share `DEMO_ADMIN_PASSWORD` (default `Nexora-Demo-2026!`). The login page defaults to the Enterprise Administrator:

| Email | Role |
|---|---|
| `superadmin@nexora.demo` | Super Admin |
| `admin@nexora.demo` | Enterprise Administrator |
| `sales.manager@nexora.demo` | Sales Manager |
| `service.manager@nexora.demo` | Customer Service Manager |
| `sales.agent@nexora.demo` | Sales Agent |
| `service.agent@nexora.demo` | Customer Service Agent |
| `analyst@nexora.demo` | Business Analyst |

Do not use these credentials or the compose secrets outside local/demo environments.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Run all apps in watch mode |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint every workspace |
| `pnpm typecheck` | Type-check every workspace |
| `pnpm test` | Run unit and integration tests |
| `pnpm db:generate` / `db:migrate` / `db:seed` | Prisma lifecycle |

## Environment variables

See [`.env.example`](.env.example). Key values:

- `DATABASE_URL`, `REDIS_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (≥ 32 chars each)
- `WEB_ORIGIN` (trusted CORS/CSRF origin)
- `ACCESS_TOKEN_TTL_MINUTES`, `REFRESH_TOKEN_TTL_DAYS`
- `AI_PROVIDER` / `GEMINI_API_KEY` / `GEMINI_MODEL` are reserved for Phase 3 and stay server-side only.

## Security model

Summarized in [`docs/security/authentication.md`](docs/security/authentication.md): Argon2id hashing, short-lived access tokens, rotating refresh families with reuse detection, HttpOnly/Secure cookies, double-submit CSRF plus trusted-origin checks, server-enforced tenant isolation, deny-by-default RBAC, and audit logging.

## Documentation

- [System architecture](docs/architecture/system-architecture.md)
- [Implementation plan](docs/architecture/implementation-plan.md)
- [Dependencies and risks](docs/architecture/dependencies-and-risks.md)
- [Database schema](docs/database/schema.md)
- [API endpoints](docs/api/foundation-endpoints.md)
- [Authentication and authorization](docs/security/authentication.md)

## Build and validation status

This workspace was authored in a network-restricted sandbox where the npm registry is blocked and the container runtime is unavailable, so dependency installation, compilation, and container startup could not be executed here. The commands above are the verification steps to run in a dependency-enabled environment. See the risk register in [`docs/architecture/dependencies-and-risks.md`](docs/architecture/dependencies-and-risks.md) for details.
