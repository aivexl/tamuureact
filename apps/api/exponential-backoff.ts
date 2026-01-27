/**
 * Exponential Backoff with Jitter for Gemini API
 * Enterprise-grade retry logic with exponential backoff and jitter
 * 
 * Features:
 * - Configurable retry attempts and delays
 * - Exponential backoff with configurable multiplier
 * - Random jitter to prevent thundering herd
 * - Retry-able error detection
 * - Circuit breaker pattern
 * - Metrics tracking
 */

/**
 * Backoff configuration with sensible defaults
 */
export const DEFAULT_BACKOFF_CONFIG = {
  initialDelay: 1000, // 1 second
  maxDelay: 32000, // 32 seconds
  multiplier: 2,
  maxRetries: 3,
  jitterFactor: 0.1 // 10% jitter
};

/**
 * Retry-able error codes that should trigger exponential backoff
 */
const RETRYABLE_ERRORS = {
  429: 'RATE_LIMIT', // Too Many Requests
  500: 'INTERNAL_SERVER_ERROR', // Server Error
  502: 'BAD_GATEWAY',
  503: 'SERVICE_UNAVAILABLE',
  504: 'GATEWAY_TIMEOUT',
  408: 'REQUEST_TIMEOUT',
  ECONNRESET: 'CONNECTION_RESET',
  ECONNREFUSED: 'CONNECTION_REFUSED',
  ETIMEDOUT: 'TIMEOUT',
  EHOSTUNREACH: 'HOST_UNREACHABLE',
  ENETUNREACH: 'NETWORK_UNREACHABLE'
};

/**
 * Exponential backoff retry handler
 */
export class ExponentialBackoffRetry {
  private config: typeof DEFAULT_BACKOFF_CONFIG;
  private metrics: {
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    totalRetries: number;
    circuitBreakerTrips: number;
  };
  private circuitBreakerState: 'closed' | 'open' | 'half-open' = 'closed';
  private circuitBreakerResetTime: number = 0;

  constructor(config: Partial<typeof DEFAULT_BACKOFF_CONFIG> = {}) {
    this.config = { ...DEFAULT_BACKOFF_CONFIG, ...config };
    this.metrics = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      totalRetries: 0,
      circuitBreakerTrips: 0
    };
  }

  /**
   * Execute async function with exponential backoff retry
   * Returns the result if successful after retries, or throws error
   */
  async execute<T>(
    fn: () => Promise<T>,
    errorHandler?: (error: Error, attempt: number, nextRetryTime: number) => void
  ): Promise<T> {
    this.metrics.totalAttempts++;

    // Check circuit breaker
    if (this.circuitBreakerState === 'open') {
      const now = Date.now();
      if (now < this.circuitBreakerResetTime) {
        throw new Error('Circuit breaker is open. Too many failures. Please retry later.');
      }
      this.circuitBreakerState = 'half-open';
    }

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < this.config.maxRetries) {
      try {
        const result = await fn();
        this.metrics.successfulAttempts++;

        // Reset circuit breaker on success
        if (this.circuitBreakerState === 'half-open') {
          this.circuitBreakerState = 'closed';
        }

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if error is retryable
        if (!this.isRetryableError(lastError)) {
          this.metrics.failedAttempts++;
          throw lastError;
        }

        attempt++;
        this.metrics.totalRetries++;

        if (attempt < this.config.maxRetries) {
          const delay = this.calculateDelay(attempt);

          if (errorHandler) {
            errorHandler(lastError, attempt, Date.now() + delay);
          }

          console.warn(
            `[Backoff] Retrying (attempt ${attempt}/${this.config.maxRetries}) after ${delay}ms. Error: ${lastError.message}`
          );

          // Wait before retrying
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted
    this.metrics.failedAttempts++;

    // Trip circuit breaker on repeated failures
    this.circuitBreakerState = 'open';
    this.circuitBreakerResetTime = Date.now() + 60000; // 1 minute reset time
    this.metrics.circuitBreakerTrips++;

    throw new Error(
      `Failed after ${this.config.maxRetries} retries. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Calculate delay for exponential backoff with jitter
   */
  private calculateDelay(attempt: number): number {
    // Base exponential delay: initialDelay * (multiplier ^ (attempt - 1))
    const exponentialDelay = Math.min(
      this.config.initialDelay * Math.pow(this.config.multiplier, attempt - 1),
      this.config.maxDelay
    );

    // Add random jitter (±jitterFactor * exponentialDelay)
    const jitterRange = exponentialDelay * this.config.jitterFactor;
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;

    return Math.max(0, Math.round(exponentialDelay + jitter));
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    const errorCode = (error as any).code || (error as any).status;

    // Check status codes
    if (errorCode && RETRYABLE_ERRORS[errorCode]) {
      return true;
    }

    // Check error messages and types
    for (const [code, type] of Object.entries(RETRYABLE_ERRORS)) {
      if (!isNaN(Number(code))) continue; // Skip numeric codes

      if (errorMessage.includes(code.toLowerCase())) {
        return true;
      }
    }

    // Timeout errors
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return true;
    }

    // Connection errors
    if (errorMessage.includes('econnreset') || errorMessage.includes('connection reset')) {
      return true;
    }

    // Network errors
    if (errorMessage.includes('network') && errorMessage.includes('error')) {
      return true;
    }

    return false;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get retry metrics
   */
  getMetrics(): typeof this.metrics & { circuitBreakerState: string } {
    return {
      ...this.metrics,
      circuitBreakerState: this.circuitBreakerState
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      totalRetries: 0,
      circuitBreakerTrips: 0
    };
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(): void {
    this.circuitBreakerState = 'closed';
    this.circuitBreakerResetTime = 0;
  }

  /**
   * Get circuit breaker state
   */
  getCircuitBreakerState(): {
    state: string;
    resetTime: number;
    secondsUntilReset: number;
  } {
    const now = Date.now();
    const secondsUntilReset = Math.ceil((this.circuitBreakerResetTime - now) / 1000);

    return {
      state: this.circuitBreakerState,
      resetTime: this.circuitBreakerResetTime,
      secondsUntilReset: Math.max(0, secondsUntilReset)
    };
  }
}

/**
 * Specific retry handler for Gemini API
 */
export class GeminiAPIRetry extends ExponentialBackoffRetry {
  private geminiApiKey: string;
  private geminiBaseUrl: string;
  private lastQuotaError: number = 0;

  constructor(geminiApiKey: string, config?: Partial<typeof DEFAULT_BACKOFF_CONFIG>) {
    super(config);
    this.geminiApiKey = geminiApiKey;
    this.geminiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  }

  /**
   * Make Gemini API call with exponential backoff
   */
  async callGeminiAPI(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.execute(async () => {
      const response = await fetch(
        `${this.geminiBaseUrl}?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const error = new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        (error as any).status = response.status;

        // Track quota errors separately
        if (response.status === 429) {
          this.lastQuotaError = Date.now();
          console.warn('[GeminiRetry] Quota exceeded. Backing off...');
        }

        throw error;
      }

      const data = await response.json();

      if (data.error) {
        const error = new Error(`Gemini API error: ${data.error.message}`);
        (error as any).code = data.error.code;
        throw error;
      }

      return data;
    });
  }

  /**
   * Get quota status
   */
  getQuotaStatus(): {
    lastQuotaErrorTime: number | null;
    timeSinceLastQuotaError: number | null;
    isCurrentlyQuotaLimited: boolean;
  } {
    const now = Date.now();
    const timeSince = this.lastQuotaError > 0 ? now - this.lastQuotaError : null;

    return {
      lastQuotaErrorTime: this.lastQuotaError > 0 ? this.lastQuotaError : null,
      timeSinceLastQuotaError: timeSince,
      isCurrentlyQuotaLimited: timeSince !== null && timeSince < 60000 // 1 minute window
    };
  }
}

/**
 * Utility function to execute with exponential backoff
 */
export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  config?: Partial<typeof DEFAULT_BACKOFF_CONFIG>
): Promise<T> {
  const retry = new ExponentialBackoffRetry(config);
  return retry.execute(fn);
}
