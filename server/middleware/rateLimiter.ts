import { Request, Response, NextFunction } from "express";

// TODO: Replace in-memory rate limiter with Redis for production multi-instance deployments
// Current implementation resets on server restart and is not shared across instances.
const rateLimits: { [ip: string]: number[] } = {};
const LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 15;

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "anonymous";
  const now = Date.now();
  
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
