import { describe, expect, it } from 'vitest';
import { createCsrfToken, csrfTokensMatch } from './csrf.js';

describe('CSRF token protection', () => {
  it('accepts an identical cookie and header token', () => {
    const token = createCsrfToken();
    expect(csrfTokensMatch(token, token)).toBe(true);
  });

  it('rejects missing, different, and differently sized tokens', () => {
    const token = createCsrfToken();
    expect(csrfTokensMatch(token, undefined)).toBe(false);
    expect(csrfTokensMatch(token, createCsrfToken())).toBe(false);
    expect(csrfTokensMatch(token, `${token}extra`)).toBe(false);
  });
});
