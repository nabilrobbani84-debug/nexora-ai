process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.DATABASE_URL ??= 'postgresql://nexora:nexora@localhost:5432/nexora_test';
process.env.REDIS_URL ??= 'redis://localhost:6379/1';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-at-least-32-characters-long';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-at-least-32-characters-long';
process.env.WEB_ORIGIN ??= 'http://localhost:3000';
