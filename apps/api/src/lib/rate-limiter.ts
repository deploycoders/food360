import type { Request, Response, NextFunction } from "express";

export interface RateLimiterOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  skip?: (req: Request) => boolean;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export function createRateLimiter(options: RateLimiterOptions = {}) {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 30;
  const message =
    options.message ?? "Demasiadas solicitudes. Por favor intente más tarde.";

  const hits = new Map<string, RateLimitRecord>();

  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    hits.forEach((record, key) => {
      if (record.resetTime <= now) {
        hits.delete(key);
      }
    });
  }, Math.min(windowMs, 60_000));

  if (typeof cleanupTimer.unref === "function") {
    cleanupTimer.unref();
  }

  const middleware = (req: Request, res: Response, next: NextFunction) => {
    if (options.skip?.(req)) {
      return next();
    }

    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    const now = Date.now();
    let record = hits.get(ip);

    if (!record || record.resetTime <= now) {
      record = { count: 1, resetTime: now + windowMs };
      hits.set(ip, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetSeconds);

    if (record.count > max) {
      res.setHeader("Retry-After", resetSeconds);
      return res.status(429).json({
        success: false,
        error: message,
      });
    }

    return next();
  };

  middleware.reset = () => {
    hits.clear();
  };

  middleware.close = () => {
    clearInterval(cleanupTimer);
    hits.clear();
  };

  return middleware;
}
