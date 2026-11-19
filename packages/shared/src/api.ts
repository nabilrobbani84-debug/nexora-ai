import { z } from 'zod';

export interface ApiSuccess<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiProblem {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: string;
  requestId?: string;
  errors?: Record<string, string[]>;
}

export const apiProblemSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string(),
  code: z.string(),
  requestId: z.string().optional(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
});

export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  version: z.string(),
  timestamp: z.string().datetime(),
  dependencies: z.object({
    database: z.enum(['up', 'down']),
    redis: z.enum(['up', 'down']),
  }),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
