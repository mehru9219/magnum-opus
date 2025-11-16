/**
 * Redis Caching Utilities
 * Cache AI responses to reduce costs and improve performance
 */

import type { CacheEntry } from "../ai/types";
import * as crypto from "crypto";

/**
 * Redis client singleton (placeholder - will use Upstash Redis in production)
 */
class RedisClient {
  private cache: Map<string, any> = new Map();
  private connected = false;

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    // In production, this would connect to Upstash Redis:
    // const redis = new Redis({
    //   url: process.env.UPSTASH_REDIS_URL,
    //   token: process.env.UPSTASH_REDIS_TOKEN,
    // });

    // For now, use in-memory cache as fallback
    this.connected = true;
    console.log("Redis client initialized (in-memory mode)");
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.connected) await this.connect();

    // Production: return await redis.get(key);
    const value = this.cache.get(key);
    return value ?? null;
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    if (!this.connected) await this.connect();

    // Production: await redis.setex(key, ttlSeconds, JSON.stringify(value));
    this.cache.set(key, value);

    // Simulate TTL with setTimeout
    setTimeout(() => {
      this.cache.delete(key);
    }, ttlSeconds * 1000);
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    if (!this.connected) await this.connect();

    // Production: await redis.del(key);
    this.cache.delete(key);
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.connected) await this.connect();

    // Production: return (await redis.exists(key)) === 1;
    return this.cache.has(key);
  }

  /**
   * Get keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    if (!this.connected) await this.connect();

    // Production: return await redis.keys(pattern);
    const regex = new RegExp(pattern.replace("*", ".*"));
    return Array.from(this.cache.keys()).filter((key) => regex.test(key));
  }

  /**
   * Clear all keys matching pattern
   */
  async clearPattern(pattern: string): Promise<number> {
    const keys = await this.keys(pattern);
    for (const key of keys) {
      await this.delete(key);
    }
    return keys.length;
  }

  /**
   * Get cache statistics
   */
  async stats(): Promise<{
    keys: number;
    memoryUsage: number;
  }> {
    // Production: return await redis.info('stats');
    return {
      keys: this.cache.size,
      memoryUsage: 0, // Would get actual memory usage in production
    };
  }

  /**
   * Flush all cache
   */
  async flush(): Promise<void> {
    if (!this.connected) await this.connect();

    // Production: await redis.flushall();
    this.cache.clear();
  }
}

/**
 * Global Redis client instance
 */
export const redis = new RedisClient();

/**
 * Cache key prefixes for organization
 */
export const CACHE_PREFIXES = {
  AI_RESPONSE: "ai:response:",
  AI_PROMPT: "ai:prompt:",
  RATE_LIMIT: "ratelimit:",
  USER_SESSION: "session:",
  TEMP_DATA: "temp:",
} as const;

/**
 * Default TTL values (in seconds)
 */
export const DEFAULT_TTL = {
  AI_RESPONSE: 86400, // 24 hours
  SHORT_TERM: 3600, // 1 hour
  MEDIUM_TERM: 43200, // 12 hours
  LONG_TERM: 604800, // 7 days
  PERMANENT: 2592000, // 30 days
} as const;

/**
 * Generate cache key hash from prompt
 */
export function generateCacheKey(
  prefix: string,
  data: string | object
): string {
  const content = typeof data === "string" ? data : JSON.stringify(data);
  const hash = crypto.createHash("sha256").update(content).digest("hex");
  return `${prefix}${hash}`;
}

/**
 * Cache AI response
 */
export async function cacheAIResponse(
  prompt: string,
  model: string,
  response: string,
  ttl = DEFAULT_TTL.AI_RESPONSE
): Promise<void> {
  const key = generateCacheKey(
    CACHE_PREFIXES.AI_RESPONSE,
    `${model}:${prompt}`
  );

  const entry: CacheEntry = {
    key,
    value: response,
    ttl,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttl * 1000,
  };

  await redis.set(key, entry, ttl);
}

/**
 * Get cached AI response
 */
export async function getCachedAIResponse(
  prompt: string,
  model: string
): Promise<string | null> {
  const key = generateCacheKey(
    CACHE_PREFIXES.AI_RESPONSE,
    `${model}:${prompt}`
  );

  const entry = await redis.get<CacheEntry>(key);

  if (!entry) return null;

  // Check if expired (extra safety check)
  if (entry.expiresAt < Date.now()) {
    await redis.delete(key);
    return null;
  }

  return entry.value;
}

/**
 * Cache with automatic serialization
 */
export async function cacheSet<T>(
  prefix: string,
  key: string,
  value: T,
  ttl = DEFAULT_TTL.MEDIUM_TERM
): Promise<void> {
  const fullKey = `${prefix}${key}`;
  await redis.set(fullKey, value, ttl);
}

/**
 * Get from cache with automatic deserialization
 */
export async function cacheGet<T>(
  prefix: string,
  key: string
): Promise<T | null> {
  const fullKey = `${prefix}${key}`;
  return await redis.get<T>(fullKey);
}

/**
 * Cache with TTL check
 */
export async function cacheGetOrSet<T>(
  prefix: string,
  key: string,
  factory: () => Promise<T>,
  ttl = DEFAULT_TTL.MEDIUM_TERM
): Promise<T> {
  // Try to get from cache
  const cached = await cacheGet<T>(prefix, key);
  if (cached !== null) {
    return cached;
  }

  // Not in cache, generate new value
  const value = await factory();

  // Cache the new value
  await cacheSet(prefix, key, value, ttl);

  return value;
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCache(pattern: string): Promise<number> {
  return await redis.clearPattern(pattern);
}

/**
 * Rate limiting with Redis
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  const key = `${CACHE_PREFIXES.RATE_LIMIT}${identifier}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Get current count
  const data = await redis.get<{
    count: number;
    resetAt: number;
  }>(key);

  if (!data) {
    // First request in window
    const resetAt = now + windowMs;
    await redis.set(
      key,
      { count: 1, resetAt },
      windowSeconds
    );

    return {
      allowed: true,
      remaining: limit - 1,
      resetAt,
    };
  }

  // Check if window has expired
  if (data.resetAt < now) {
    // Window expired, reset
    const resetAt = now + windowMs;
    await redis.set(
      key,
      { count: 1, resetAt },
      windowSeconds
    );

    return {
      allowed: true,
      remaining: limit - 1,
      resetAt,
    };
  }

  // Within window, check limit
  if (data.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: data.resetAt,
    };
  }

  // Increment count
  data.count++;
  const ttl = Math.ceil((data.resetAt - now) / 1000);
  await redis.set(key, data, ttl);

  return {
    allowed: true,
    remaining: limit - data.count,
    resetAt: data.resetAt,
  };
}

/**
 * Cache statistics and monitoring
 */
export async function getCacheStats(prefix?: string): Promise<{
  totalKeys: number;
  memoryUsage: number;
  hitRate?: number;
}> {
  const stats = await redis.stats();

  if (prefix) {
    const keys = await redis.keys(`${prefix}*`);
    return {
      totalKeys: keys.length,
      memoryUsage: stats.memoryUsage,
    };
  }

  return {
    totalKeys: stats.keys,
    memoryUsage: stats.memoryUsage,
  };
}

/**
 * Batch cache operations
 */
export async function batchCacheSet<T>(
  prefix: string,
  items: Array<{ key: string; value: T }>,
  ttl = DEFAULT_TTL.MEDIUM_TERM
): Promise<void> {
  const promises = items.map((item) =>
    cacheSet(prefix, item.key, item.value, ttl)
  );
  await Promise.all(promises);
}

/**
 * Batch cache get
 */
export async function batchCacheGet<T>(
  prefix: string,
  keys: string[]
): Promise<Array<T | null>> {
  const promises = keys.map((key) => cacheGet<T>(prefix, key));
  return await Promise.all(promises);
}

/**
 * Clear all AI response cache
 */
export async function clearAICache(): Promise<number> {
  return await invalidateCache(`${CACHE_PREFIXES.AI_RESPONSE}*`);
}

/**
 * Clear cache for specific user
 */
export async function clearUserCache(userId: string): Promise<number> {
  return await invalidateCache(`*:${userId}:*`);
}

/**
 * Warm cache with common prompts (optional optimization)
 */
export async function warmCache(
  prompts: Array<{ prompt: string; model: string; response: string }>
): Promise<void> {
  const promises = prompts.map((item) =>
    cacheAIResponse(item.prompt, item.model, item.response)
  );
  await Promise.all(promises);
}

/**
 * Health check for Redis connection
 */
export async function healthCheck(): Promise<{
  healthy: boolean;
  latencyMs: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    await redis.set("health:check", "ok", 10);
    const value = await redis.get("health:check");

    return {
      healthy: value === "ok",
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      healthy: false,
      latencyMs: Date.now() - startTime,
      error: (error as Error).message,
    };
  }
}

/**
 * Initialize Redis client on module load
 */
redis.connect().catch((error) => {
  console.error("Failed to connect to Redis:", error);
});
