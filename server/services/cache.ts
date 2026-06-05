import crypto from "crypto";
import { prisma } from "../../src/db";

/**
 * Normalizes input fields and generates a unique SHA-256 cache key.
 */
export function generateCacheKey(skills: string[], level: string, interest: string): string {
  const sortedSkills = [...skills].map(s => s.toLowerCase().trim()).sort();
  const rawKey = `${sortedSkills.join(",")}:${level.toLowerCase().trim()}:${interest.toLowerCase().trim()}`;
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Retrieves cached recommendations from database. Returns null on miss.
 */
export async function getCachedRecommendations(key: string): Promise<any | null> {
  try {
    const record = await prisma.recommendationCache.findUnique({
      where: { key }
    });
    if (record) {
      console.log(`Cache HIT for key: ${key}`);
      return JSON.parse(record.response);
    }
    console.log(`Cache MISS for key: ${key}`);
    return null;
  } catch (err) {
    console.error("Failed to read recommendation cache:", err);
    return null;
  }
}

/**
 * Saves generated recommendations to database cache.
 */
export async function setCachedRecommendations(key: string, response: any): Promise<void> {
  try {
    await prisma.recommendationCache.upsert({
      where: { key },
      update: {
        response: JSON.stringify(response)
      },
      create: {
        key,
        response: JSON.stringify(response)
      }
    });
    console.log(`Cache WRITE successful for key: ${key}`);
  } catch (err) {
    console.error("Failed to write to recommendation cache:", err);
  }
}
