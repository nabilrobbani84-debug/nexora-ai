import { z } from 'zod';

export const SYSTEM_ROLES = [
  'SUPER_ADMIN',
  'ENTERPRISE_ADMIN',
  'SALES_MANAGER',
  'CUSTOMER_SERVICE_MANAGER',
  'SALES_AGENT',
  'CUSTOMER_SERVICE_AGENT',
  'BUSINESS_ANALYST',
] as const;

export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const PERMISSIONS = [
  'platform:organizations:manage',
  'organization:settings:manage',
  'dashboard:executive:read',
  'users:read',
  'users:manage',
  'roles:read',
  'roles:manage',
  'customers:read',
  'customers:write',
  'customers:delete',
  'customers:pii:read',
  'conversations:read',
  'conversations:write',
  'intelligence:read',
  'intelligence:run',
  'churn:read',
  'churn:score',
  'leads:read',
  'leads:write',
  'leads:score',
  'recommendations:read',
  'recommendations:manage',
  'workflows:read',
  'workflows:manage',
  'analytics:read',
  'reports:read',
  'reports:export',
  'integrations:read',
  'integrations:manage',
  'audit:read',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const loginInputSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(128),
});

export const csrfResponseSchema = z.object({
  csrfToken: z.string().min(32),
});

export const sessionUserSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  organizationName: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  roles: z.array(z.enum(SYSTEM_ROLES)),
  permissions: z.array(z.enum(PERMISSIONS)),
});

export const authSessionSchema = z.object({
  user: sessionUserSchema,
  accessTokenExpiresAt: z.string().datetime(),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
export type SessionUser = z.infer<typeof sessionUserSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
