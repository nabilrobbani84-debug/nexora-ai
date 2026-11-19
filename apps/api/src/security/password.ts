import argon2 from 'argon2';
import { env } from '../config/env.js';

const options: argon2.Options & { raw?: false } = {
  type: argon2.argon2id,
  memoryCost: env.ARGON2_MEMORY_KIB,
  timeCost: env.ARGON2_ITERATIONS,
  parallelism: env.ARGON2_PARALLELISM,
};

export const hashPassword = (password: string): Promise<string> => argon2.hash(password, options);

export const verifyPassword = (hash: string, password: string): Promise<boolean> =>
  argon2.verify(hash, password, options);
