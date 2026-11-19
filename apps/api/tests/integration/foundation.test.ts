import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';

const app = createApp();

describe('foundation API', () => {
  it('exposes a liveness endpoint under API v1', async () => {
    const response = await request(app).get('/api/v1/health/live');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('rejects unsafe requests without a CSRF token before authentication', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@nexora.demo',
      password: 'Nexora-Demo-2026!',
    });
    expect(response.status).toBe(403);
    expect(response.body.code).toBe('CSRF_TOKEN_INVALID');
  });

  it('returns a documented problem for unknown routes', async () => {
    const response = await request(app).get('/api/v1/not-a-route');
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('ROUTE_NOT_FOUND');
  });
});
