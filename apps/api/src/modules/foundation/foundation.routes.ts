import { Router } from 'express';
import { sendData } from '../../lib/api-response.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/authorize.js';

export const foundationRouter = Router();

foundationRouter.get(
  '/status',
  authenticate,
  requirePermission('dashboard:executive:read'),
  (request, response) =>
    sendData(response, {
      phase: 1,
      name: 'Foundation',
      status: 'operational',
      organizationId: request.principal?.organizationId,
      capabilities: ['Secure authentication', 'Tenant isolation', 'RBAC', 'Audit logging'],
    }),
);
