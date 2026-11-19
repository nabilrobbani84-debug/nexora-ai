import type { RequestPrincipal } from '@nexora/types';

declare global {
  namespace Express {
    interface Request {
      id: string;
      principal?: RequestPrincipal;
    }
  }
}

export {};
