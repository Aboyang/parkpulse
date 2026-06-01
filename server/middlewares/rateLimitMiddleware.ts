import type { Request, Response, NextFunction } from 'express';
import { incrementCounter } from '../config/redis.js';

const WINDOW_SECS = 60;
const WINDOW_TTL_SECS = 90;

interface RateLimitOptions {
  label: string;
  limit: number;
}

export function createRateLimiter({ label, limit }: RateLimitOptions) {
  return async function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const windowStart = Math.floor(Date.now() / 1000 / WINDOW_SECS);
    const key = `rl:${label}:${ip}:${windowStart}`;

    let count: number;
    try {
      count = await incrementCounter(key, WINDOW_TTL_SECS);
    } catch (err) {
      console.error('[RateLimit] Redis error, failing open:', err);
      return next();
    }

    res.set('X-RateLimit-Limit', String(limit));

    if (count > limit) {
      console.log(`[RateLimit] ${ip} exceeded limit for ${label}: ${count} > ${limit}`);
      const retryAfter = WINDOW_SECS - (Math.floor(Date.now() / 1000) % WINDOW_SECS);
      res.set('Retry-After', String(retryAfter));
      res.set('X-RateLimit-Remaining', '0');
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    res.set('X-RateLimit-Remaining', String(Math.max(0, limit - count)));
    next();
  };
}
