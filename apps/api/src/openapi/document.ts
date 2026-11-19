export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'NEXORA AI API',
    version: '0.1.0',
    description: 'Versioned multi-tenant REST API for NEXORA AI.',
  },
  servers: [{ url: '/api/v1' }],
  tags: [
    { name: 'Health' },
    { name: 'Authentication' },
    { name: 'Foundation' },
  ],
  paths: {
    '/health/live': {
      get: {
        tags: ['Health'],
        summary: 'Process liveness',
        responses: { 200: { description: 'API process is live' } },
      },
    },
    '/health/ready': {
      get: {
        tags: ['Health'],
        summary: 'Dependency readiness',
        responses: {
          200: { description: 'PostgreSQL and Redis are ready' },
          503: { description: 'One or more dependencies are unavailable' },
        },
      },
    },
    '/auth/csrf': {
      get: {
        tags: ['Authentication'],
        summary: 'Issue a double-submit CSRF token',
        responses: { 200: { description: 'CSRF cookie and response token' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate with email and password',
        parameters: [{ $ref: '#/components/parameters/CsrfHeader' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } },
          },
        },
        responses: {
          200: { description: 'Authenticated; secure cookies are set' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          429: { description: 'Rate limited' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Rotate the refresh session',
        parameters: [{ $ref: '#/components/parameters/CsrfHeader' }],
        security: [{ refreshCookie: [] }],
        responses: {
          200: { description: 'Tokens rotated' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Revoke the session family',
        parameters: [{ $ref: '#/components/parameters/CsrfHeader' }],
        security: [{ accessCookie: [] }],
        responses: { 204: { description: 'Logged out' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Return the current tenant user and permissions',
        security: [{ accessCookie: [] }],
        responses: {
          200: { description: 'Current user' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/foundation/status': {
      get: {
        tags: ['Foundation'],
        summary: 'Verify authenticated RBAC access',
        security: [{ accessCookie: [] }],
        responses: {
          200: { description: 'Foundation status' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
  },
  components: {
    parameters: {
      CsrfHeader: {
        name: 'x-csrf-token',
        in: 'header',
        required: true,
        schema: { type: 'string' },
      },
    },
    securitySchemes: {
      accessCookie: { type: 'apiKey', in: 'cookie', name: 'nexora_access' },
      refreshCookie: { type: 'apiKey', in: 'cookie', name: 'nexora_refresh' },
    },
    schemas: {
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        additionalProperties: false,
        properties: {
          email: { type: 'string', format: 'email', maxLength: 254 },
          password: { type: 'string', format: 'password', minLength: 12, maxLength: 128 },
        },
      },
      Problem: {
        type: 'object',
        required: ['type', 'title', 'status', 'detail', 'code'],
        properties: {
          type: { type: 'string', format: 'uri' },
          title: { type: 'string' },
          status: { type: 'integer' },
          detail: { type: 'string' },
          code: { type: 'string' },
          requestId: { type: 'string', format: 'uuid' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Authentication failed',
        content: { 'application/problem+json': { schema: { $ref: '#/components/schemas/Problem' } } },
      },
      Forbidden: {
        description: 'Authorization or CSRF validation failed',
        content: { 'application/problem+json': { schema: { $ref: '#/components/schemas/Problem' } } },
      },
    },
  },
} as const;
