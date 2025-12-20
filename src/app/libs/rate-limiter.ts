import "server-only";
import { env } from "./env";
import { RateLimitError } from "./errors";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// TODO: rate limiting maybe in redis
class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private maxRequests: number = env.RATE_LIMIT_MAX_REQUESTS,
    private windowMs: number = env.RATE_LIMIT_WINDOW_MS,
  ) {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) {
        this.store.delete(key);
      }
    }
  }

  check(identifier: string): void {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || entry.resetAt < now) {
      this.store.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return;
    }

    if (entry.count >= this.maxRequests) {
      const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000);
      throw new RateLimitError(
        `Too many requests. Please try again in ${resetInSeconds} seconds.`,
      );
    }

    entry.count++;
  }

  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

export const rateLimiter = new RateLimiter();
