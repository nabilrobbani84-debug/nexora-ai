# NEXORA AI Implementation Plan

## Delivery approach

NEXORA AI is delivered as six independently runnable phases. Each phase has an explicit validation gate. Phase 1 establishes production-oriented boundaries without prematurely implementing later product modules.

## Phase 1 — Foundation (current scope)

### Deliverables

- pnpm monorepo with `apps/web`, `apps/api`, and shared packages.
- Next.js App Router web application using strict TypeScript and Tailwind CSS.
- Express REST API with `/api/v1`, WebSocket bootstrap, OpenAPI documentation, structured logging, and centralized errors.
- PostgreSQL schema in Prisma with tenant keys, indexes, audit data, refresh-token sessions, and the complete planned domain model.
- Redis connection abstraction for cache/session/queues.
- Secure login, refresh rotation, logout, current-session lookup, RBAC, tenant-bound authorization, and CSRF protection for cookie-authenticated mutations.
- Seed data for one demo organization, all seven roles, permissions, and demo users.
- Enterprise design tokens, login experience, and a protected application shell.
- Dockerfiles, Docker Compose, environment template, and foundation documentation.
- Focused unit/integration tests for auth security and authorization boundaries.

### Phase 1 acceptance gate

1. Workspace dependency graph is valid.
2. Type checking, linting, and tests pass.
3. PostgreSQL and Redis health checks pass.
4. Prisma migration and seed complete.
5. Login issues short-lived access and rotating refresh cookies.
6. Protected API rejects anonymous, unauthorized, and cross-tenant access.
7. The web app can authenticate against the API and render the current user and role.
8. OpenAPI is available at `/api/docs` and `/api/v1/openapi.json`.
9. Docker Compose configuration is syntactically valid.

## Phase 2 — Enterprise UI

- Public landing page and product narrative.
- Executive dashboard backed by aggregate API queries.
- Customer list, Customer 360, pagination, filters, CSV export, masking, and tenant-safe CRUD.
- Lazy-loaded Customer Intelligence Universe with a useful 2D fallback and reduced-motion mode.
- Deterministic synthetic-data generator seeded by a fixed value.

## Phase 3 — AI intelligence

- Provider-neutral AI contracts and mock provider.
- Gemini provider configured exclusively on the API server.
- Runtime model discovery/validation instead of an unverified hard-coded model identifier.
- Structured conversation analysis with Zod validation, timeout, retries, and audit logs.
- Separate deterministic churn and lead-scoring services with versioned factors and honest confidence metadata.
- Eligibility-filtered product recommendations.

## Phase 4 — Automation

- Persisted node-based workflow builder.
- BullMQ execution engine, retries, idempotency keys, execution logs, and dead-letter handling.
- Webhook signing, SSRF defenses, allow-list controls, delivery history, and test delivery.
- WebSocket events scoped by organization and user permission.

## Phase 5 — Analytics and reporting

- Agent/team performance and enterprise analytics.
- Database-backed KPI definitions with shared filter semantics.
- CSV and PDF report generation through background jobs.
- Explicit data-freshness and report-generation status.

## Phase 6 — Quality assurance

- Security and tenant-isolation review.
- Query, bundle, 3D, and Lighthouse optimization.
- Unit, integration, and end-to-end test completion.
- Operational runbooks, backup/restore guidance, deployment docs, and final acceptance report.

## Working assumptions

- Indonesian locale is the default product locale; code, API fields, and developer documentation use English.
- Phase 1 ships demo credentials only for local/demo environments.
- All integration channels are represented as disconnected/demo until credentials and provider contracts exist.
- LLM output can propose actions but cannot execute privileged actions without deterministic validation and authorization.
- A single user belongs to one organization in the initial schema. Cross-organization Super Admin access is explicit and audited.
