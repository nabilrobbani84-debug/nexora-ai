import { randomUUID } from 'node:crypto';
import {
  PERMISSIONS,
  SYSTEM_ROLES,
  sessionUserSchema,
  type AuthSession,
  type LoginInput,
  type Permission,
  type SessionUser,
  type SystemRole,
} from '@nexora/shared';
import { errors } from '../../lib/app-error.js';
import { hashPassword, verifyPassword } from '../../security/password.js';
import {
  accessTokenExpiresAt,
  hashToken,
  refreshTokenExpiresAt,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../security/token.js';
import { authRepository, type AuthRepository } from './auth.repository.js';

const dummyHash = hashPassword('Nexora-Dummy-Password-Only!');

interface RequestMetadata {
  requestId: string;
  userAgent?: string;
  ipAddress?: string;
}

interface IssuedSession {
  response: AuthSession;
  accessToken: string;
  refreshToken: string;
}

type UserRecord = NonNullable<Awaited<ReturnType<AuthRepository['findUserById']>>>;

function toSessionUser(user: UserRecord): SessionUser {
  const roleCodes = user.userRoles.map(({ role }) => role.code);
  const permissionCodes = user.userRoles.flatMap(({ role }) =>
    role.rolePermissions.map(({ permission }) => permission.code),
  );

  const roles = [...new Set(roleCodes)].filter((role): role is SystemRole =>
    SYSTEM_ROLES.includes(role as SystemRole),
  );
  const permissions = [...new Set(permissionCodes)].filter((permission): permission is Permission =>
    PERMISSIONS.includes(permission as Permission),
  );

  return sessionUserSchema.parse({
    id: user.id,
    organizationId: user.organizationId,
    organizationName: user.organization.name,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles,
    permissions,
  });
}

export class AuthService {
  constructor(private readonly repository: AuthRepository) {}

  async login(input: LoginInput, metadata: RequestMetadata): Promise<IssuedSession> {
    const user = await this.repository.findUserByEmail(input.email);
    const passwordHash = user?.passwordHash ?? (await dummyHash);
    const passwordValid = await verifyPassword(passwordHash, input.password);

    if (
      !user ||
      !passwordValid ||
      user.status !== 'ACTIVE' ||
      user.organization.status !== 'ACTIVE' ||
      user.organization.deletedAt
    ) {
      throw errors.unauthorized('INVALID_CREDENTIALS', 'Email or password is incorrect.');
    }

    const sessionUser = toSessionUser(user);
    const sessionId = randomUUID();
    const familyId = randomUUID();
    const refreshToken = await signRefreshToken({
      userId: user.id,
      organizationId: user.organizationId,
      sessionId,
      familyId,
    });
    const accessToken = await signAccessToken({
      userId: user.id,
      organizationId: user.organizationId,
      sessionId,
      roles: sessionUser.roles,
      permissions: sessionUser.permissions,
    });

    await this.repository.createLoginSession({
      id: sessionId,
      organizationId: user.organizationId,
      userId: user.id,
      familyId,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshTokenExpiresAt(),
      requestId: metadata.requestId,
      ...(metadata.userAgent ? { userAgent: metadata.userAgent } : {}),
      ...(metadata.ipAddress ? { ipAddress: metadata.ipAddress } : {}),
    });

    return {
      accessToken,
      refreshToken,
      response: {
        user: sessionUser,
        accessTokenExpiresAt: accessTokenExpiresAt().toISOString(),
      },
    };
  }

  async refresh(rawToken: string | undefined, metadata: RequestMetadata): Promise<IssuedSession> {
    if (!rawToken) {
      throw errors.unauthorized('REFRESH_TOKEN_REQUIRED', 'A refresh token is required.');
    }

    const claims = await verifyRefreshToken(rawToken);
    const currentSession = await this.repository.findSession(claims.sessionId);
    const presentedHash = hashToken(rawToken);

    if (
      !currentSession ||
      currentSession.familyId !== claims.familyId ||
      currentSession.userId !== claims.sub ||
      currentSession.organizationId !== claims.organizationId ||
      currentSession.tokenHash !== presentedHash ||
      currentSession.revokedAt ||
      currentSession.expiresAt <= new Date()
    ) {
      if (currentSession) {
        await this.repository.revokeFamily(currentSession.familyId, 'TOKEN_REUSE_DETECTED', metadata.requestId);
      }
      throw errors.unauthorized('REFRESH_TOKEN_REUSED', 'The session is no longer valid. Sign in again.');
    }

    const user = await this.repository.findUserById(claims.sub, claims.organizationId);
    if (!user || user.status !== 'ACTIVE' || user.organization.status !== 'ACTIVE') {
      await this.repository.revokeFamily(claims.familyId, 'ACCOUNT_INACTIVE', metadata.requestId);
      throw errors.unauthorized('ACCOUNT_INACTIVE', 'The account is not active.');
    }

    const sessionUser = toSessionUser(user);
    const nextSessionId = randomUUID();
    const refreshToken = await signRefreshToken({
      userId: user.id,
      organizationId: user.organizationId,
      sessionId: nextSessionId,
      familyId: claims.familyId,
    });
    const accessToken = await signAccessToken({
      userId: user.id,
      organizationId: user.organizationId,
      sessionId: nextSessionId,
      roles: sessionUser.roles,
      permissions: sessionUser.permissions,
    });

    const rotated = await this.repository.rotateSession({
      previousSessionId: currentSession.id,
      previousTokenHash: presentedHash,
      id: nextSessionId,
      organizationId: user.organizationId,
      userId: user.id,
      familyId: claims.familyId,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshTokenExpiresAt(),
      requestId: metadata.requestId,
      ...(metadata.userAgent ? { userAgent: metadata.userAgent } : {}),
      ...(metadata.ipAddress ? { ipAddress: metadata.ipAddress } : {}),
    });

    if (!rotated) {
      await this.repository.revokeFamily(claims.familyId, 'CONCURRENT_TOKEN_REUSE', metadata.requestId);
      throw errors.unauthorized('REFRESH_TOKEN_REUSED', 'The session is no longer valid. Sign in again.');
    }

    return {
      accessToken,
      refreshToken,
      response: {
        user: sessionUser,
        accessTokenExpiresAt: accessTokenExpiresAt().toISOString(),
      },
    };
  }

  async currentUser(userId: string, organizationId: string): Promise<SessionUser> {
    const user = await this.repository.findUserById(userId, organizationId);
    if (!user || user.status !== 'ACTIVE' || user.organization.status !== 'ACTIVE') {
      throw errors.unauthorized('ACCOUNT_INACTIVE', 'The account is not active.');
    }
    return toSessionUser(user);
  }

  async logout(sessionId: string, requestId: string): Promise<void> {
    const session = await this.repository.findSession(sessionId);
    if (session) await this.repository.revokeFamily(session.familyId, 'USER_LOGOUT', requestId);
  }
}

export const authService = new AuthService(authRepository);
