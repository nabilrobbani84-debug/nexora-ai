import { prisma } from '../../infrastructure/prisma.js';

const userGraph = {
  organization: true,
  userRoles: {
    include: {
      role: {
        include: {
          rolePermissions: { include: { permission: true } },
        },
      },
    },
  },
} as const;

export class AuthRepository {
  findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: userGraph,
    });
  }

  findUserById(userId: string, organizationId: string) {
    return prisma.user.findFirst({
      where: { id: userId, organizationId, deletedAt: null },
      include: userGraph,
    });
  }

  findSession(sessionId: string) {
    return prisma.authSession.findUnique({ where: { id: sessionId } });
  }

  findActiveSession(sessionId: string, userId: string, organizationId: string) {
    return prisma.authSession.findFirst({
      where: {
        id: sessionId,
        userId,
        organizationId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        user: { status: 'ACTIVE', deletedAt: null },
        organization: { status: 'ACTIVE', deletedAt: null },
      },
    });
  }

  async createLoginSession(input: {
    id: string;
    organizationId: string;
    userId: string;
    familyId: string;
    tokenHash: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
    requestId: string;
  }): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      await transaction.authSession.create({
        data: {
          id: input.id,
          organizationId: input.organizationId,
          userId: input.userId,
          familyId: input.familyId,
          tokenHash: input.tokenHash,
          userAgent: input.userAgent,
          ipAddress: input.ipAddress,
          expiresAt: input.expiresAt,
        },
      });
      await transaction.user.update({
        where: { id: input.userId },
        data: { lastLoginAt: new Date() },
      });
      await transaction.auditLog.create({
        data: {
          organizationId: input.organizationId,
          actorUserId: input.userId,
          action: 'auth.login.succeeded',
          resourceType: 'auth_session',
          resourceId: input.id,
          requestId: input.requestId,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        },
      });
    });
  }

  async rotateSession(input: {
    previousSessionId: string;
    previousTokenHash: string;
    id: string;
    organizationId: string;
    userId: string;
    familyId: string;
    tokenHash: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
    requestId: string;
  }): Promise<boolean> {
    return prisma.$transaction(async (transaction) => {
      const update = await transaction.authSession.updateMany({
        where: {
          id: input.previousSessionId,
          tokenHash: input.previousTokenHash,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: {
          revokedAt: new Date(),
          revocationReason: 'ROTATED',
          replacedById: input.id,
          lastUsedAt: new Date(),
        },
      });

      if (update.count !== 1) return false;

      await transaction.authSession.create({
        data: {
          id: input.id,
          organizationId: input.organizationId,
          userId: input.userId,
          familyId: input.familyId,
          tokenHash: input.tokenHash,
          userAgent: input.userAgent,
          ipAddress: input.ipAddress,
          expiresAt: input.expiresAt,
        },
      });
      await transaction.auditLog.create({
        data: {
          organizationId: input.organizationId,
          actorUserId: input.userId,
          action: 'auth.session.rotated',
          resourceType: 'auth_session',
          resourceId: input.id,
          requestId: input.requestId,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        },
      });
      return true;
    });
  }

  async revokeFamily(familyId: string, reason: string, requestId?: string): Promise<void> {
    const sessions = await prisma.authSession.findMany({
      where: { familyId },
      select: { id: true, organizationId: true, userId: true },
    });
    await prisma.$transaction(async (transaction) => {
      await transaction.authSession.updateMany({
        where: { familyId, revokedAt: null },
        data: { revokedAt: new Date(), revocationReason: reason },
      });
      const first = sessions[0];
      if (first) {
        await transaction.auditLog.create({
          data: {
            organizationId: first.organizationId,
            actorUserId: first.userId,
            action: 'auth.session_family.revoked',
            resourceType: 'auth_session_family',
            resourceId: familyId,
            requestId,
            metadata: { reason },
          },
        });
      }
    });
  }
}

export const authRepository = new AuthRepository();
