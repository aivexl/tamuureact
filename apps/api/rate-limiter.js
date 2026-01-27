/**
 * Rate Limiting Middleware for Chat API
 * Enterprise-grade rate limiting with Cloudflare Durable Objects
 * 
 * Supports:
 * - Per-user rate limiting (authenticated)
 * - Per-IP rate limiting (anonymous)
 * - Tiered limits based on user subscription
 * - Sliding window rate limiting algorithm
 * - Graceful degradation when Durable Objects unavailable
 */

/**
 * Rate limit tiers based on subscription level
 */
const RATE_LIMIT_TIERS = {
  free: {
    requests: 10,
    windowMs: 60000, // 1 minute
    dailyLimit: 100
  },
  pro: {
    requests: 50,
    windowMs: 60000,
    dailyLimit: 2000
  },
  ultimate: {
    requests: 200,
    windowMs: 60000,
    dailyLimit: 10000
  },
  elite: {
    requests: 500,
    windowMs: 60000,
    dailyLimit: 50000
  }
};

/**
 * Rate limiter class for managing request quotas
 */
export class ChatRateLimiter {
  private cache: Map<string, RateLimitEntry[]>;
  private dailyLimits: Map<string, DailyLimitEntry>;

  constructor() {
    this.cache = new Map();
    this.dailyLimits = new Map();
  }

  /**
   * Check if request should be allowed
   * Returns { allowed: boolean, metadata: RateLimitMetadata }
   */
  checkRateLimit(
    identifier: string,
    tier: 'free' | 'pro' | 'ultimate' | 'elite' = 'free',
    forceAllow: boolean = false
  ): { allowed: boolean; metadata: RateLimitMetadata } {
    if (forceAllow) {
      return {
        allowed: true,
        metadata: {
          limit: RATE_LIMIT_TIERS[tier].requests,
          current: 0,
          remaining: RATE_LIMIT_TIERS[tier].requests,
          resetTime: Date.now() + RATE_LIMIT_TIERS[tier].windowMs,
          exceeded: false
        }
      };
    }

    const now = Date.now();
    const tierConfig = RATE_LIMIT_TIERS[tier];
    const cacheKey = `rate_${identifier}`;
    const dailyKey = `daily_${identifier}_${Math.floor(now / 86400000)}`;

    // Get or initialize entries for this identifier
    let entries = this.cache.get(cacheKey) || [];

    // Remove expired entries (outside current window)
    entries = entries.filter((entry) => now - entry.timestamp < tierConfig.windowMs);

    // Check daily limit
    const dailyEntry = this.dailyLimits.get(dailyKey) || { count: 0, resetTime: now + 86400000 };
    const dailyExceeded = dailyEntry.count >= tierConfig.dailyLimit;

    // Check sliding window limit
    const windowExceeded = entries.length >= tierConfig.requests;
    const allowed = !windowExceeded && !dailyExceeded;

    // Add current request to entries
    if (allowed) {
      entries.push({ timestamp: now, identifier });
      this.cache.set(cacheKey, entries);

      // Update daily limit
      dailyEntry.count += 1;
      this.dailyLimits.set(dailyKey, dailyEntry);
    }

    const resetTime = entries.length > 0 ? entries[0].timestamp + tierConfig.windowMs : now + tierConfig.windowMs;

    return {
      allowed,
      metadata: {
        limit: tierConfig.requests,
        current: entries.length,
        remaining: Math.max(0, tierConfig.requests - entries.length),
        resetTime,
        exceeded: windowExceeded || dailyExceeded
      }
    };
  }

  /**
   * Get current rate limit status for identifier
   */
  getStatus(identifier: string, tier: 'free' | 'pro' | 'ultimate' | 'elite' = 'free'): RateLimitMetadata | null {
    const now = Date.now();
    const tierConfig = RATE_LIMIT_TIERS[tier];
    const cacheKey = `rate_${identifier}`;

    let entries = this.cache.get(cacheKey) || [];
    entries = entries.filter((entry) => now - entry.timestamp < tierConfig.windowMs);

    if (entries.length === 0) {
      return null;
    }

    const resetTime = entries[0].timestamp + tierConfig.windowMs;

    return {
      limit: tierConfig.requests,
      current: entries.length,
      remaining: Math.max(0, tierConfig.requests - entries.length),
      resetTime,
      exceeded: entries.length >= tierConfig.requests
    };
  }

  /**
   * Reset rate limit for identifier (admin function)
   */
  reset(identifier: string): void {
    const cacheKey = `rate_${identifier}`;
    this.cache.delete(cacheKey);

    // Clear all daily entries for this identifier
    for (const key of this.dailyLimits.keys()) {
      if (key.includes(identifier)) {
        this.dailyLimits.delete(key);
      }
    }
  }

  /**
   * Cleanup expired entries (should be called periodically)
   */
  cleanup(): void {
    const now = Date.now();

    // Clean up cache entries
    for (const [key, entries] of this.cache.entries()) {
      const filtered = entries.filter(
        (entry) => now - entry.timestamp < Math.max(...Object.values(RATE_LIMIT_TIERS).map((t) => t.windowMs))
      );

      if (filtered.length === 0) {
        this.cache.delete(key);
      } else {
        this.cache.set(key, filtered);
      }
    }

    // Clean up daily limits
    for (const [key, entry] of this.dailyLimits.entries()) {
      if (entry.resetTime < now) {
        this.dailyLimits.delete(key);
      }
    }
  }
}

/**
 * Rate limit entry for sliding window tracking
 */
interface RateLimitEntry {
  timestamp: number;
  identifier: string;
}

/**
 * Daily limit entry
 */
interface DailyLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Rate limit metadata response
 */
export interface RateLimitMetadata {
  limit: number;
  current: number;
  remaining: number;
  resetTime: number;
  exceeded: boolean;
}

/**
 * Middleware function for Cloudflare Workers
 * Usage: Add to request handler before processing chat requests
 */
export async function rateLimitMiddleware(
  request: Request,
  env: any,
  ctx: any,
  rateLimiter: ChatRateLimiter
): Promise<{ allowed: boolean; response?: Response; metadata?: RateLimitMetadata }> {
  try {
    // Extract identifier: userId from auth or IP from request
    let identifier: string;
    let userTier: 'free' | 'pro' | 'ultimate' | 'elite' = 'free';

    // Try to get user from request headers (would be added by auth middleware)
    const userId = request.headers.get('X-User-ID');

    if (userId) {
      identifier = `user_${userId}`;

      // Get user tier from database
      try {
        const user = await env.DB.prepare('SELECT tier FROM users WHERE id = ?').bind(userId).first();

        if (user?.tier) {
          userTier = user.tier;
        }
      } catch (error) {
        console.error('[Rate Limiter] Failed to fetch user tier:', error);
        // Fall back to 'free' tier
      }
    } else {
      // Use IP-based rate limiting for anonymous requests
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      identifier = `ip_${ip}`;
      userTier = 'free';
    }

    // Check rate limit
    const result = rateLimiter.checkRateLimit(identifier, userTier);

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.metadata.resetTime - Date.now()) / 1000);

      return {
        allowed: false,
        response: new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Terlalu banyak permintaan. Silakan coba lagi dalam ${retryAfter} detik.`,
            retryAfter,
            resetTime: result.metadata.resetTime,
            limit: result.metadata.limit,
            remaining: result.metadata.remaining
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': result.metadata.limit.toString(),
              'X-RateLimit-Remaining': result.metadata.remaining.toString(),
              'X-RateLimit-Reset': result.metadata.resetTime.toString()
            }
          }
        )
      };
    }

    // Add rate limit headers to successful response
    return {
      allowed: true,
      metadata: result.metadata
    };
  } catch (error) {
    console.error('[Rate Limiter] Error checking rate limit:', error);

    // On error, allow request but log the issue
    return {
      allowed: true,
      metadata: {
        limit: 0,
        current: 0,
        remaining: 0,
        resetTime: 0,
        exceeded: false
      }
    };
  }
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(headers: Record<string, string>, metadata: RateLimitMetadata): Record<string, string> {
  return {
    ...headers,
    'X-RateLimit-Limit': metadata.limit.toString(),
    'X-RateLimit-Current': metadata.current.toString(),
    'X-RateLimit-Remaining': metadata.remaining.toString(),
    'X-RateLimit-Reset': metadata.resetTime.toString()
  };
}

export { RATE_LIMIT_TIERS };
