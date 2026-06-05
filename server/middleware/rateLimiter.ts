import { Request, Response, NextFunction } from "express";
import { getRedisClient } from "../services/redis";

const rateLimits: { [ip: string]: number[] } = {};
const LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 15;

/**
 * Sliding window rate limiter supporting Redis and local memory fallback.
 */
export async function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "anonymous";
  const now = Date.now();
  const redis = getRedisClient();

  if (redis) {
    try {
      const key = `rate:${ip}`;
      const clearBefore = now - LIMIT_WINDOW_MS;
      
      const multi = redis.multi();
      // Add member to sorted set (timestamp + random string to avoid duplicate members)
      multi.zadd(key, now, `${now}:${Math.random()}`);
      // Remove elements older than window
      multi.zremrangebyscore(key, 0, clearBefore);
      // Count remaining elements
      multi.zcard(key);
      // Set expiration to clean up old keys
      multi.pexpire(key, LIMIT_WINDOW_MS);

      const results = await multi.exec();
      
      if (results) {
        // results is an array of [error, result]
        const zcardError = results[2][0];
        const count = results[2][1] as number;

        if (zcardError) {
          throw zcardError;
        }

        if (count > MAX_REQUESTS) {
          return res.status(429).json({
            error: "Too many requests. Please wait a moment before trying again."
          });
        }
        return next();
      }
    } catch (err: any) {
      console.warn("Redis rate limiter failed, falling back to local memory. Error:", err.message);
    }
  }

  // Local Memory Fallback
  if (!rateLimits[ip]) {
    rateLimits[ip] = [];
  }

  rateLimits[ip] = rateLimits[ip].filter(timestamp => now - timestamp < LIMIT_WINDOW_MS);

  if (rateLimits[ip].length >= MAX_REQUESTS) {
    return res.status(429).json({
      error: "Too many requests. Please wait a moment before trying again."
    });
  }

  rateLimits[ip].push(now);
  next();
}
