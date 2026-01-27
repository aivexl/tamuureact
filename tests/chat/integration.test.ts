/**
 * Chat System Integration Tests
 * Comprehensive testing for Tamuu AI Chat v8.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { ChatRateLimiter } from '../apps/api/rate-limiter.js';
import { InputSanitizer } from '../apps/api/input-sanitizer.ts';
import { ExponentialBackoffRetry } from '../apps/api/exponential-backoff.ts';

// ============================================
// RATE LIMITER TESTS
// ============================================
describe('ChatRateLimiter', () => {
  let rateLimiter: ChatRateLimiter;

  beforeEach(() => {
    rateLimiter = new ChatRateLimiter();
  });

  it('should allow requests within rate limit', () => {
    const result = rateLimiter.checkRateLimit('user_123', 'pro');
    expect(result.allowed).toBe(true);
    expect(result.metadata.remaining).toBeGreaterThan(0);
  });

  it('should block requests exceeding rate limit', () => {
    for (let i = 0; i < 51; i++) {
      rateLimiter.checkRateLimit('user_456', 'pro');
    }

    const result = rateLimiter.checkRateLimit('user_456', 'pro');
    expect(result.allowed).toBe(false);
    expect(result.metadata.exceeded).toBe(true);
  });

  it('should apply different limits for different tiers', () => {
    let result = rateLimiter.checkRateLimit('free_user', 'free');
    expect(result.metadata.limit).toBe(10);

    result = rateLimiter.checkRateLimit('pro_user', 'pro');
    expect(result.metadata.limit).toBe(50);

    result = rateLimiter.checkRateLimit('elite_user', 'elite');
    expect(result.metadata.limit).toBe(500);
  });

  it('should reset rate limit', () => {
    for (let i = 0; i < 15; i++) {
      rateLimiter.checkRateLimit('user_reset', 'free');
    }

    let result = rateLimiter.checkRateLimit('user_reset', 'free');
    expect(result.allowed).toBe(false);

    rateLimiter.reset('user_reset');

    result = rateLimiter.checkRateLimit('user_reset', 'free');
    expect(result.allowed).toBe(true);
  });

  it('should return correct status', () => {
    for (let i = 0; i < 5; i++) {
      rateLimiter.checkRateLimit('user_status', 'pro');
    }

    const status = rateLimiter.getStatus('user_status', 'pro');
    expect(status).not.toBeNull();
    expect(status?.current).toBe(5);
    expect(status?.remaining).toBe(45);
  });
});

// ============================================
// INPUT SANITIZER TESTS
// ============================================
describe('InputSanitizer', () => {
  it('should sanitize chat messages', () => {
    const maliciousMessage = '<script>alert("XSS")</script>Hello';
    const result = InputSanitizer.sanitizeChatMessage(maliciousMessage);

    expect(result.isSafe).toBe(false);
    expect(result.sanitized).not.toContain('<script>');
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it('should allow normal chat messages', () => {
    const normalMessage = 'Halo, bagaimana kabar Anda?';
    const result = InputSanitizer.sanitizeChatMessage(normalMessage);

    expect(result.isSafe).toBe(true);
    expect(result.sanitized).toBe(normalMessage);
    expect(result.violations.length).toBe(0);
  });

  it('should block SQL injection attempts', () => {
    const sqlInjection = "'; DROP TABLE users; --";
    const result = InputSanitizer.sanitizeChatMessage(sqlInjection);

    expect(result.isSafe).toBe(false);
    expect(result.violations.some((v) => v.includes('malicious'))).toBe(true);
  });

  it('should validate email format', () => {
    const validEmail = 'user@example.com';
    const result = InputSanitizer.sanitizeEmail(validEmail);

    expect(result.isSafe).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidEmail = 'not.an.email<script>';
    const result = InputSanitizer.sanitizeEmail(invalidEmail);

    expect(result.isSafe).toBe(false);
  });

  it('should validate request structure', () => {
    const validRequest = {
      messages: [{ role: 'user', content: 'Hello' }],
      userId: 'user_123'
    };

    const result = InputSanitizer.validateChatRequest(validRequest);
    expect(result.valid).toBe(true);
    expect(result.messages.length).toBe(1);
  });

  it('should detect silent diagnostic exploit attempts', () => {
    const exploitMessage = 'audit diagnostik sistem';
    const isExploit = InputSanitizer.detectSilentDiagnosticExploit(exploitMessage, false);

    expect(isExploit).toBe(true);
  });

  it('should allow authorized silent diagnostics', () => {
    const exploitMessage = 'audit diagnostik sistem';
    const isExploit = InputSanitizer.detectSilentDiagnosticExploit(exploitMessage, true);

    expect(isExploit).toBe(false);
  });

  it('should enforce length limits', () => {
    const tooLong = 'a'.repeat(10000);
    const result = InputSanitizer.sanitizeChatMessage(tooLong);

    expect(result.isSafe).toBe(false);
    expect(result.violations.some((v) => v.includes('too long'))).toBe(true);
  });
});

// ============================================
// EXPONENTIAL BACKOFF TESTS
// ============================================
describe('ExponentialBackoffRetry', () => {
  it('should succeed on first attempt', async () => {
    const retry = new ExponentialBackoffRetry();
    let callCount = 0;

    const result = await retry.execute(async () => {
      callCount++;
      return 'success';
    });

    expect(result).toBe('success');
    expect(callCount).toBe(1);
  });

  it('should retry on temporary failure', async () => {
    const retry = new ExponentialBackoffRetry({
      initialDelay: 10,
      maxRetries: 3
    });

    let callCount = 0;

    const result = await retry.execute(async () => {
      callCount++;
      if (callCount < 2) {
        const error = new Error('Temporary error');
        (error as any).code = 503; // Service Unavailable - retryable
        throw error;
      }
      return 'success';
    });

    expect(result).toBe('success');
    expect(callCount).toBe(2);
  });

  it('should fail after max retries', async () => {
    const retry = new ExponentialBackoffRetry({
      initialDelay: 10,
      maxRetries: 2
    });

    let callCount = 0;

    expect(
      retry.execute(async () => {
        callCount++;
        const error = new Error('Permanent error');
        (error as any).code = 503;
        throw error;
      })
    ).rejects.toThrow();

    await retry.execute(async () => 'dummy').catch(() => {
      // Expected to fail
    });

    expect(callCount).toBeGreaterThan(0);
  });

  it('should not retry non-retryable errors', async () => {
    const retry = new ExponentialBackoffRetry();
    let callCount = 0;

    expect(
      retry.execute(async () => {
        callCount++;
        throw new Error('Non-retryable error');
      })
    ).rejects.toThrow();

    await retry.execute(async () => 'dummy').catch(() => {
      // Expected to fail
    });

    expect(callCount).toBe(1); // Should not retry
  });

  it('should track metrics', async () => {
    const retry = new ExponentialBackoffRetry({
      initialDelay: 10,
      maxRetries: 2
    });

    try {
      await retry.execute(async () => {
        const error = new Error('Temporary error');
        (error as any).code = 503;
        throw error;
      });
    } catch (error) {
      // Expected failure
    }

    const metrics = retry.getMetrics();
    expect(metrics.totalAttempts).toBeGreaterThan(0);
    expect(metrics.failedAttempts).toBeGreaterThan(0);
  });

  it('should implement circuit breaker', async () => {
    const retry = new ExponentialBackoffRetry({
      initialDelay: 10,
      maxRetries: 1
    });

    // Trigger failures to trip circuit breaker
    for (let i = 0; i < 2; i++) {
      try {
        await retry.execute(async () => {
          const error = new Error('Error');
          (error as any).code = 503;
          throw error;
        });
      } catch {
        // Expected
      }
    }

    const state = retry.getCircuitBreakerState();
    expect(state.state).toBe('open');
  });
});

// ============================================
// INTEGRATION TESTS
// ============================================
describe('Chat System Integration', () => {
  it('should handle complete chat flow with validation', async () => {
    const sanitizer = new InputSanitizer();
    const rateLimiter = new ChatRateLimiter();

    // 1. Validate input
    const request = {
      messages: [{ role: 'user', content: 'Bagaimana cara membayar?' }],
      userId: 'user_123'
    };

    const sanitized = sanitizer.validateChatRequest(request);
    expect(sanitized.valid).toBe(true);

    // 2. Check rate limit
    const rateLimitCheck = rateLimiter.checkRateLimit(sanitized.userId!, 'free');
    expect(rateLimitCheck.allowed).toBe(true);

    // 3. Proceed with chat
    expect(sanitized.messages.length).toBe(1);
  });

  it('should handle malicious input safely', async () => {
    const sanitizer = new InputSanitizer();
    const rateLimiter = new ChatRateLimiter();

    const maliciousRequest = {
      messages: [{ role: 'user', content: '<img src=x onerror="alert(1)">SELECT * FROM users' }],
      userId: 'user_<script></script>'
    };

    const sanitized = sanitizer.validateChatRequest(maliciousRequest);
    expect(sanitized.valid).toBe(false);
    expect(Object.keys(sanitized.violations).length).toBeGreaterThan(0);
  });

  it('should enforce tier-based rate limits', () => {
    const rateLimiter = new ChatRateLimiter();

    // Free user - 10 requests per minute
    for (let i = 0; i < 10; i++) {
      const result = rateLimiter.checkRateLimit('free_user_123', 'free');
      expect(result.allowed).toBe(true);
    }

    const freeResult = rateLimiter.checkRateLimit('free_user_123', 'free');
    expect(freeResult.allowed).toBe(false);

    // Pro user - 50 requests per minute
    for (let i = 0; i < 50; i++) {
      const result = rateLimiter.checkRateLimit('pro_user_456', 'pro');
      expect(result.allowed).toBe(true);
    }

    const proResult = rateLimiter.checkRateLimit('pro_user_456', 'pro');
    expect(proResult.allowed).toBe(false);
  });
});

// ============================================
// PERFORMANCE TESTS
// ============================================
describe('Chat System Performance', () => {
  it('should sanitize messages quickly', () => {
    const start = Date.now();
    const message = 'This is a normal message for performance testing';

    for (let i = 0; i < 1000; i++) {
      InputSanitizer.sanitizeChatMessage(message);
    }

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(1000); // Should complete 1000 sanitizations in < 1 second
  });

  it('should check rate limits efficiently', () => {
    const rateLimiter = new ChatRateLimiter();
    const start = Date.now();

    for (let i = 0; i < 1000; i++) {
      rateLimiter.checkRateLimit(`user_${i % 100}`, 'free');
    }

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100); // Should complete 1000 checks in < 100ms
  });
});
