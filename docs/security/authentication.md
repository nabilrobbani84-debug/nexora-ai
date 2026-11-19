# Authentication and Authorization

## Browser flow

1. The browser requests `GET /api/v1/auth/csrf` with credentials enabled.
2. The API sets a readable, same-site CSRF cookie and returns the same random value.
3. The browser submits the value in `x-csrf-token` for each unsafe request.
4. Successful login sets a short-lived access cookie and a refresh cookie restricted to `/api/v1/auth`.
5. The access JWT carries user, organization, session, role, and permission context. API middleware also verifies that the persisted session, user, and organization remain active.
6. Refresh rotates to a new persisted session ID. Reuse of an old token revokes the complete token family.
7. Logout revokes the family and clears both authentication cookies.

## Cookie policy

Production cookies are `Secure`, `SameSite=Lax`, and authentication cookies are `HttpOnly`. Deploy the web and API under the same site. Set `COOKIE_DOMAIN` only when shared subdomain behavior is required and reviewed.

## RBAC and tenancy

- Permission checks use stable action codes such as `customers:read`.
- Roles are bundles of permissions, not conditional logic in controllers.
- The authenticated organization comes from the verified session. Endpoints must never accept a client organization ID as authorization evidence.
- Repository operations on tenant-owned data require an organization ID from request context.
- Cross-tenant Super Admin operations require `platform:organizations:manage` and an audit event.

## Demo credentials

The local seed creates one user per required system role. All use the password configured in `DEMO_ADMIN_PASSWORD` (default `Nexora-Demo-2026!`). The default login page uses `admin@nexora.demo`, which has Enterprise Administrator permissions.

Demo credentials and compose secrets must not be used in shared, staging, or production environments.
