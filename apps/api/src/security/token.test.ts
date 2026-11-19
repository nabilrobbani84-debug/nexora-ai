import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { hashToken, signAccessToken, verifyAccessToken } from './token.js';

describe('token security', () => {
  it('signs and verifies an access token with tenant and session context', async () => {
    const input = {
      userId: randomUUID(),
      organizationId: randomUUID(),
      sessionId: randomUUID(),
      roles: ['BUSINESS_ANALYST' as const],
      permissions: ['analytics:read' as const],
    };
    const token = await signAccessToken(input);
    const claims = await verifyAccessToken(token);

    expect(claims.sub).toBe(input.userId);
    expect(claims.organizationId).toBe(input.organizationId);
    expect(claims.sessionId).toBe(input.sessionId);
    expect(claims.tokenType).toBe('access');
  });

  it('hashes tokens deterministically without retaining the token', () => {
    const token = 'sensitive-refresh-token';
    const digest = hashToken(token);
    expect(digest).toHaveLength(64);
    expect(digest).not.toContain(token);
    expect(hashToken(token)).toBe(digest);
  });
});
