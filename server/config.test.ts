import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('dotenv', () => ({
  default: {
    config: () => ({ parsed: {} })
  }
}));

describe('config.ts', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should use process.env.JWT_SECRET if provided', async () => {
    process.env.JWT_SECRET = 'my-super-secret-key';
    const { AUTH_CONFIG } = await import('./config');
    expect(AUTH_CONFIG.JWT_SECRET).toBe('my-super-secret-key');
  });

  it('should generate a random secret if JWT_SECRET is not provided (non-production)', async () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'development';
    const { AUTH_CONFIG } = await import('./config');
    expect(AUTH_CONFIG.JWT_SECRET).toHaveLength(64); // 32 bytes hex = 64 chars
  });

  it('should throw an error if JWT_SECRET is not provided in production', async () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'production';
    await expect(import('./config')).rejects.toThrow('FATAL: JWT_SECRET environment variable is required in production.');
  });
});
