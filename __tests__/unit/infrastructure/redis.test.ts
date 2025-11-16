import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Redis client
vi.mock('@upstash/redis', () => {
  return {
    Redis: class {
      async setex() { return 'OK'; }
      async get() { return null; }
      async incr() { return 1; }
      async expire() { return 1; }
    },
  };
});

describe('Redis Client Infrastructure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export Redis client configuration', async () => {
    const { redis } = await import('@/lib/redis/client');
    expect(redis).toBeDefined();
  });

  it('should export caching functions', async () => {
    const { cacheAIResponse, getCachedAIResponse } = await import('@/lib/redis/client');
    expect(cacheAIResponse).toBeDefined();
    expect(getCachedAIResponse).toBeDefined();
    expect(typeof cacheAIResponse).toBe('function');
    expect(typeof getCachedAIResponse).toBe('function');
  });

  it('should export rate limiting function', async () => {
    const { checkRateLimit } = await import('@/lib/redis/client');
    expect(checkRateLimit).toBeDefined();
    expect(typeof checkRateLimit).toBe('function');
  });
});
