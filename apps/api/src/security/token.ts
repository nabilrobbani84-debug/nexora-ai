import { createHash } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';
import type { Permission, SystemRole } from '@nexora/shared';
import { env } from '../config/env.js';
import { errors } from '../lib/app-error.js';

const issuer = 'nexora-api';
const audience = 'nexora-web';
const accessKey = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const refreshKey = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

const accessClaimsSchema = z.object({
  sub: z.string().uuid(),
  organizationId: z.string().uuid(),
  sessionId: z.string().uuid(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  tokenType: z.literal('access'),
  exp: z.number(),
});

const refreshClaimsSchema = z.object({
  sub: z.string().uuid(),
  organizationId: z.string().uuid(),
  sessionId: z.string().uuid(),
  familyId: z.string().uuid(),
  tokenType: z.literal('refresh'),
  exp: z.number(),
});

export interface AccessTokenInput {
  userId: string;
  organizationId: string;
  sessionId: string;
  roles: SystemRole[];
  permissions: Permission[];
}

export interface RefreshTokenInput {
  userId: string;
  organizationId: string;
  sessionId: string;
  familyId: string;
}

export type AccessClaims = z.infer<typeof accessClaimsSchema>;
export type RefreshClaims = z.infer<typeof refreshClaimsSchema>;

export async function signAccessToken(input: AccessTokenInput): Promise<string> {
  return new SignJWT({
    organizationId: input.organizationId,
    sessionId: input.sessionId,
    roles: input.roles,
    permissions: input.permissions,
    tokenType: 'access',
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(input.userId)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(`${env.ACCESS_TOKEN_TTL_MINUTES}m`)
    .sign(accessKey);
}

export async function signRefreshToken(input: RefreshTokenInput): Promise<string> {
  return new SignJWT({
    organizationId: input.organizationId,
    sessionId: input.sessionId,
    familyId: input.familyId,
    tokenType: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(input.userId)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(`${env.REFRESH_TOKEN_TTL_DAYS}d`)
    .sign(refreshKey);
}

export async function verifyAccessToken(token: string): Promise<AccessClaims> {
  try {
    const { payload } = await jwtVerify(token, accessKey, { issuer, audience, algorithms: ['HS256'] });
    return accessClaimsSchema.parse(payload);
  } catch {
    throw errors.unauthorized('ACCESS_TOKEN_INVALID', 'The access token is invalid or expired.');
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshClaims> {
  try {
    const { payload } = await jwtVerify(token, refreshKey, { issuer, audience, algorithms: ['HS256'] });
    return refreshClaimsSchema.parse(payload);
  } catch {
    throw errors.unauthorized('REFRESH_TOKEN_INVALID', 'The refresh token is invalid or expired.');
  }
}

export const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');

export const accessTokenExpiresAt = (): Date =>
  new Date(Date.now() + env.ACCESS_TOKEN_TTL_MINUTES * 60 * 1_000);

export const refreshTokenExpiresAt = (): Date =>
  new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1_000);
