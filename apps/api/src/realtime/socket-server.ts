import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { authRepository } from '../modules/auth/auth.repository.js';
import { cookieNames } from '../security/cookies.js';
import { verifyAccessToken } from '../security/token.js';
import { logger } from '../infrastructure/logger.js';

function cookieValue(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...valueParts] = part.trim().split('=');
    if (key === name) return decodeURIComponent(valueParts.join('='));
  }
  return undefined;
}

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: { origin: env.WEB_ORIGIN, credentials: true },
    transports: ['websocket', 'polling'],
  });

  io.use(async (socket, next) => {
    try {
      const token = cookieValue(socket.handshake.headers.cookie, cookieNames.access);
      if (!token) throw new Error('Missing access token');
      const claims = await verifyAccessToken(token);
      const session = await authRepository.findActiveSession(
        claims.sessionId,
        claims.sub,
        claims.organizationId,
      );
      if (!session) throw new Error('Inactive session');
      socket.data.principal = claims;
      next();
    } catch {
      next(new Error('Authentication required'));
    }
  });

  io.on('connection', (socket) => {
    const principal = socket.data.principal as { organizationId: string; sub: string };
    void socket.join(`organization:${principal.organizationId}`);
    void socket.join(`user:${principal.sub}`);
    socket.emit('system:ready', {
      phase: 1,
      timestamp: new Date().toISOString(),
    });
  });

  io.engine.on('connection_error', (error) => {
    logger.warn({ code: error.code, message: error.message }, 'Realtime connection rejected');
  });

  return io;
}
