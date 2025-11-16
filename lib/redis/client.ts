import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

/**
 * Cache AI responses to reduce API costs
 * TTL: 24 hours (86400 seconds)
 */
export async function cacheAIResponse(
  prompt: string,
  model: string,
  response: string
): Promise<void> {
  const key = `ai:${model}:${hashPrompt(prompt)}`;
  await redis.setex(key, 86400, response);
}

/**
 * Get cached AI response
 */
export async function getCachedAIResponse(
  prompt: string,
  model: string
): Promise<string | null> {
  const key = `ai:${model}:${hashPrompt(prompt)}`;
  return await redis.get(key);
}

/**
 * Simple hash function for prompt keys
 */
function hashPrompt(prompt: string): string {
  // Use first 100 chars + length as a simple hash
  // In production, consider using a proper hash function
  return Buffer.from(prompt.slice(0, 100) + prompt.length).toString("base64");
}

/**
 * Rate limiting for API calls
 */
export async function checkRateLimit(
  userId: string,
  action: string,
  limit: number,
  window: number
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `ratelimit:${userId}:${action}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, window);
  }

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
  };
}
