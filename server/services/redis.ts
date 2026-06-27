import Redis from "ioredis";

let redisClient: Redis | null = null;
let redisInitialized = false;

/**
 * Returns the active Redis client if configured and operational, or null otherwise.
 */
export function getRedisClient(): Redis | null {
  if (!redisInitialized) {
    redisInitialized = true;
    const redisUrl = process.env.REDIS_URL;

    if (redisUrl && redisUrl.trim() !== "") {
      try {
        console.log(`Initializing Redis client with URL: ${redisUrl}`);
        redisClient = new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          lazyConnect: true, // Connect on the first command
          retryStrategy(times) {
            // Keep retrying but print warnings, max retry delay 5s
            if (times > 10) {
              console.warn(
                "Redis reconnection attempts exceeded threshold. Suspending Redis operations.",
              );
              return null; // Stop retrying
            }
            return Math.min(times * 100, 2000);
          },
        });

        redisClient.on("error", (err) => {
          // Suppress uncaught exception crashes
          console.warn("Redis client warning:", err.message);
        });
      } catch (err) {
        console.error("Failed to initialize Redis client:", err);
        redisClient = null;
      }
    } else {
      console.warn(
        "No REDIS_URL environment variable found. Redis caching and rate limiting disabled.",
      );
    }
  }

  // Only return the client if it's in a valid state
  if (
    redisClient &&
    (redisClient.status === "ready" ||
      redisClient.status === "connecting" ||
      redisClient.status === "wait")
  ) {
    return redisClient;
  }
  return null;
}
