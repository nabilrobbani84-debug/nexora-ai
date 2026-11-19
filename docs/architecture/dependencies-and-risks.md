# Dependencies and Technical Risks

## Baseline decisions

| Area | Decision | Reason |
|---|---|---|
| Runtime | Node.js 22.18+ | Available in the sandbox and compatible with the supported Prisma 7 runtime line. |
| Monorepo | pnpm workspaces + Turborepo | Deterministic workspace linking, shared scripts, and parallel validation. |
| Web | Next.js 16 App Router + React 19 | Current Next.js major with server/client boundaries and route-level code splitting. |
| Styling | Tailwind CSS 4 + local shadcn-style components | Design-token control without runtime UI dependencies. |
| API | Express 5 | Stable async-capable routing with a broad middleware ecosystem. |
| Validation | Zod | One schema language across API boundaries and forms. |
| Data | PostgreSQL 16 + Prisma ORM 7 | Mature relational constraints and type-safe repository access. |
| Cache/jobs | Redis 7 + BullMQ | Shared caching, distributed jobs, retries, and scheduling. |
| Auth | Argon2id + JWT access/refresh rotation | Strong password hashing and revocable sessions. |
| Realtime | Socket.IO over WebSocket | Authentication hooks, rooms, reconnection, and transport fallback. |
| Tests | Vitest + Supertest | Fast TypeScript unit and API integration tests. |

Next.js 16.3 is the current documented release line in the [official Next.js release post](https://nextjs.org/blog/next-16-3). Prisma's current documentation states that the 7.x line remains supported and documents Node 22.18+ for PostgreSQL projects in its [PostgreSQL setup guide](https://www.prisma.io/docs/prisma-orm/add-to-existing-project/postgresql). Gemini model identifiers will be validated against Google's [official model catalog](https://ai.google.dev/gemini-api/docs/models) at Phase 3 implementation time rather than guessed now.

Content was rephrased for compliance with licensing restrictions.

## Environment findings

- Workspace was empty at project start.
- Node.js `v22.23.4`, npm `11.4.2`, TypeScript `5.9.2`, ESLint `10.13.0`, and Prettier `3.9.10` are installed globally.
- Network mode is `INTEGRATIONS_ONLY`; direct npm registry access returns HTTP 403.
- The `docker` command is backed by a Podman wrapper whose `conmon` runtime is missing. Containers cannot be started in this sandbox.

These constraints permit source generation and static review, but dependency installation, compilation, migrations, and container execution cannot be truthfully marked successful until a dependency-enabled environment runs them.

## Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Package registry blocked | No local install/build/test evidence | Pin compatible major/minor versions, include a lockfile when installation becomes available, and report validation as blocked rather than passing. |
| Container runtime incomplete | Compose services cannot be launched here | Validate Compose structure where possible; provide health checks and run instructions for a normal Docker environment. |
| Tenant data leak | Critical confidentiality breach | Tenant context from token only, tenant-first repositories, relationship revalidation, negative integration tests, audit logs, optional PostgreSQL RLS. |
| Refresh-token theft/reuse | Account takeover | HttpOnly/Secure cookies, hashed tokens, family rotation, reuse detection, short access TTL, session revocation. |
| CSRF with cookie auth | Unauthorized mutations | SameSite cookies, trusted-origin validation, double-submit CSRF header for all unsafe methods. |
| LLM prompt injection or malformed output | Bad advice or unsafe automation | Treat content as data, structured schema validation, provider abstraction, deterministic policy gate, no direct action execution. |
| Unsupported Gemini model name | Production AI outage | Provider startup/list-model verification, configurable model ID, mock fallback outside production, official model catalog review. |
| Churn/lead claims exceed evidence | Misleading business decisions | Separate scored rules/models from LLM narrative, expose version/factors/confidence/limitations, do not label scores as calibrated probabilities without evaluation. |
| Webhook SSRF/data exfiltration | Internal network compromise | HTTPS allow lists, DNS/IP validation on every redirect, signed payloads, encrypted secrets, egress controls, redacted logs. |
| 3D rendering harms dashboard | Poor UX and accessibility | Dynamic import, bounded particles, instancing, offscreen pause, reduced-motion support, functional 2D fallback. |
| Synthetic KPI inconsistency | Loss of demo credibility | Seeded generator, persisted records, server-side aggregate definitions, reset transaction, no random render-time values. |
| Analytics query growth | Slow dashboards | Tenant/date composite indexes, pagination, bounded date windows, Redis cache, query metrics, later materialized views. |
