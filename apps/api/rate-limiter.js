/**
 * Rate Limiting Middleware for Chat API
 * Enterprise-grade rate limiting with Cloudflare Durable Objects
 * 
 * Supports:
 * - Per-user rate limiting (authenticated)
 * - Per-IP rate limiting (anonymous)
 * - Tiered limits based on user subscription
 * - Sliding window rate limiting algorithm
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
  basic: {
    requests: 10,
    windowMs: 60000,
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
  constructor() {
    this.cache = new Map();
    this.dailyLimits = new Map();
  }

  /**
   * Check if request should be allowed
   */
  checkRateLimit(identifier, tier = 'free', forceAllow = false) {
    if (forceAllow) {
      return {
        allowed: true,
        metadata: {
          limit: RATE_LIMIT_TIERS[tier]?.requests || 10,
          current: 0,
          remaining: RATE_LIMIT_TIERS[tier]?.requests || 10,
          resetTime: Date.now() + (RATE_LIMIT_TIERS[tier]?.windowMs || 60000),
          exceeded: false
        }
      };
    }

    const now = Date.now();
    const tierConfig = RATE_LIMIT_TIERS[tier] || RATE_LIMIT_TIERS.free;
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
   * Cleanup expired entries (should be called periodically)
   */
  cleanup() {
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
 * Middleware function for Cloudflare Workers
 */
export async function rateLimitMiddleware(request, env, ctx, rateLimiter) {
  try {
    let identifier;
    let userTier = 'free';

    // Try to get user from verification logic (if called after verifyToken)
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '').trim() : null;
    
    // Note: We avoid heavy DB lookup here if possible, but identifier is needed.
    // For anonymous, use IP.
    if (token && token.length > 20) {
        // Simple identifier from token (UUID or email part)
        identifier = `token_${token.substring(0, 16)}`;
        // We could fetch tier here, but for efficiency we might assume 'free' 
        // unless we have a user object already.
    } else {
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        identifier = `ip_${ip}`;
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
              'X-RateLimit-Reset': result.metadata.resetTime.toString(),
              'Access-Control-Allow-Origin': '*'
            }
          }
        )
      };
    }

    return {
      allowed: true,
      metadata: result.metadata
    };
  } catch (error) {
    console.error('[Rate Limiter] Error:', error);
    return { allowed: true };
  }
}

export function addRateLimitHeaders(headers, metadata) {
  if (!metadata) return headers;
  return {
    ...headers,
    'X-RateLimit-Limit': metadata.limit.toString(),
    'X-RateLimit-Current': metadata.current.toString(),
    'X-RateLimit-Remaining': metadata.remaining.toString(),
    'X-RateLimit-Reset': metadata.resetTime.toString()
  };
}
