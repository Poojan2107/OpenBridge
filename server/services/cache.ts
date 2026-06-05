import crypto from "crypto";
import { prisma } from "../../src/db";
import { getRedisClient } from "./redis";

/**
 * Normalizes input fields and generates a unique SHA-256 cache key.
 */
export function generateCacheKey(skills: string[], level: string, interest: string): string {
  const sortedSkills = [...skills].map(s => s.toLowerCase().trim()).sort();
  const rawKey = `${sortedSkills.join(",")}:${level.toLowerCase().trim()}:${interest.toLowerCase().trim()}`;
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Retrieves cached recommendations. First queries Redis, then falls back to Prisma database.
 */
export async function getCachedRecommendations(key: string): Promise<any | null> {
  const redis = getRedisClient();
  const redisKey = `recommend:${key}`;

  if (redis) {
    try {
      const cached = await redis.get(redisKey);
      if (cached) {
        console.log(`Redis Cache HIT for key: ${key}`);
        return JSON.parse(cached);
      }
    } catch (err: any) {
      console.warn("Redis cache read failed, falling back to database. Error:", err.message);
    }
  }

  // Database fallback
  try {
    const record = await prisma.recommendationCache.findUnique({
      where: { key }
    });
    if (record) {
      console.log(`Database Cache HIT for key: ${key}`);
      
      // If Redis is online but was missed, backfill it
      if (redis) {
        try {
          await redis.setex(redisKey, 86400, record.response);
        } catch {}
      }
      
      return JSON.parse(record.response);
    }
    console.log(`Cache MISS for key: ${key}`);
    return null;
  } catch (err) {
    console.error("Failed to read recommendation cache from database:", err);
    return null;
  }
}

/**
 * Saves generated recommendations to both Redis (24h expiry) and Database cache.
 */
export async function setCachedRecommendations(key: string, response: any): Promise<void> {
  const responseStr = JSON.stringify(response);
  const redis = getRedisClient();
  const redisKey = `recommend:${key}`;

  if (redis) {
    try {
      await redis.setex(redisKey, 86400, responseStr); // 24 hours expiry
      console.log(`Redis Cache WRITE successful for key: ${key}`);
    } catch (err: any) {
      console.warn("Redis cache write failed. Error:", err.message);
    }
  }

  try {
    await prisma.recommendationCache.upsert({
      where: { key },
      update: {
        response: responseStr
      },
      create: {
        key,
        response: responseStr
      }
    });
    console.log(`Database Cache WRITE successful for key: ${key}`);
  } catch (err) {
    console.error("Failed to write to recommendation cache in database:", err);
  }
}
