/**
 * Google Drive API Error Handler
 * Handles quota limits, rate limiting, and retry logic with exponential backoff
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

export interface QuotaError {
  isQuotaError: boolean;
  isRateLimitError: boolean;
  retryAfterMs?: number;
  errorCode?: string;
  message: string;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 5,
  initialDelayMs: 1000,    // Start with 1 second
  maxDelayMs: 32000,       // Max 32 seconds
  backoffMultiplier: 2,    // Double each time
};

/**
 * Check if an error is a quota or rate limit error
 */
export function parseGoogleDriveError(error: any): QuotaError {
  // Handle standard Google API errors
  if (error?.code === 403 || error?.status === 403) {
    // User rate limit exceeded
    if (error?.errors?.[0]?.reason === 'userRateLimitExceeded' ||
        error?.message?.includes('User rate limit exceeded')) {
      return {
        isQuotaError: true,
        isRateLimitError: true,
        errorCode: 'userRateLimitExceeded',
        message: 'User rate limit exceeded - too many requests from this user',
        retryAfterMs: 100000, // Back off for 100 seconds
      };
    }

    // Project rate limit exceeded
    if (error?.errors?.[0]?.reason === 'rateLimitExceeded' ||
        error?.message?.includes('Rate Limit Exceeded')) {
      return {
        isQuotaError: true,
        isRateLimitError: true,
        errorCode: 'rateLimitExceeded',
        message: 'Project rate limit exceeded - too many requests overall',
        retryAfterMs: 100000, // Back off for 100 seconds
      };
    }

    // Daily limit exceeded (quota)
    if (error?.errors?.[0]?.reason === 'dailyLimitExceeded' ||
        error?.message?.includes('Daily Limit Exceeded')) {
      return {
        isQuotaError: true,
        isRateLimitError: false,
        errorCode: 'dailyLimitExceeded',
        message: 'Daily quota limit exceeded - try again tomorrow',
        // Don't retry for daily limits
      };
    }
  }

  // Handle 429 Too Many Requests
  if (error?.code === 429 || error?.status === 429) {
    // Check for Retry-After header
    let retryAfterMs = 60000; // Default to 60 seconds

    if (error?.headers?.['retry-after']) {
      const retryAfter = parseInt(error.headers['retry-after']);
      if (!isNaN(retryAfter)) {
        retryAfterMs = retryAfter * 1000; // Convert to milliseconds
      }
    }

    return {
      isQuotaError: true,
      isRateLimitError: true,
      errorCode: 'tooManyRequests',
      message: 'Too many requests - please slow down',
      retryAfterMs,
    };
  }

  // Check for storage quota exceeded
  if (error?.code === 507 || error?.status === 507 ||
      error?.errors?.[0]?.reason === 'storageQuotaExceeded' ||
      error?.message?.includes('storage quota')) {
    return {
      isQuotaError: true,
      isRateLimitError: false,
      errorCode: 'storageQuotaExceeded',
      message: 'Google Drive storage quota exceeded',
      // Don't retry for storage limits
    };
  }

  // Not a quota error
  return {
    isQuotaError: false,
    isRateLimitError: false,
    message: error?.message || 'Unknown error',
  };
}

/**
 * Calculate exponential backoff delay
 */
export function calculateBackoffDelay(
  attemptNumber: number,
  options: RetryOptions = {}
): number {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };

  // Calculate delay with exponential backoff
  const delay = Math.min(
    opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attemptNumber),
    opts.maxDelayMs
  );

  // Add jitter (±10%) to prevent thundering herd
  const jitter = delay * 0.1 * (Math.random() * 2 - 1);

  return Math.round(delay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      // Try to execute the function
      return await fn();
    } catch (error) {
      lastError = error;

      // Parse the error to check if it's a quota/rate limit error
      const quotaError = parseGoogleDriveError(error);

      // If it's not a quota error or we've exhausted retries, throw
      if (!quotaError.isQuotaError || attempt === opts.maxRetries) {
        throw error;
      }

      // If it's a daily limit or storage quota, don't retry
      if (!quotaError.isRateLimitError && !quotaError.retryAfterMs) {
        throw error;
      }

      // Calculate delay
      let delayMs: number;
      if (quotaError.retryAfterMs) {
        // Use the server-suggested retry delay if available
        delayMs = quotaError.retryAfterMs;
      } else {
        // Otherwise use exponential backoff
        delayMs = calculateBackoffDelay(attempt, opts);
      }

      console.log(
        `[Drive API] Rate limit hit (${quotaError.errorCode}). ` +
        `Retry ${attempt + 1}/${opts.maxRetries} after ${delayMs}ms`
      );

      // Wait before retrying
      await sleep(delayMs);
    }
  }

  // If we get here, all retries failed
  throw lastError;
}

/**
 * Batch operations to reduce API calls
 * Useful for reducing quota consumption
 */
export class BatchOperationQueue<T> {
  private queue: Array<() => Promise<T>> = [];
  private processing = false;
  private batchSize: number;
  private delayBetweenBatches: number;

  constructor(
    batchSize = 10,
    delayBetweenBatches = 1000 // 1 second between batches
  ) {
    this.batchSize = batchSize;
    this.delayBetweenBatches = delayBetweenBatches;
  }

  /**
   * Add an operation to the queue
   */
  async add(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      });

      // Start processing if not already running
      if (!this.processing) {
        this.process();
      }
    });
  }

  /**
   * Process the queue in batches
   */
  private async process(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      // Take a batch from the queue
      const batch = this.queue.splice(0, this.batchSize);

      // Execute batch operations with retry logic
      const promises = batch.map(operation =>
        withRetry(operation, {
          maxRetries: 3,
          initialDelayMs: 500,
        })
      );

      try {
        await Promise.allSettled(promises);
      } catch (error) {
        console.error('[Drive API] Batch operation failed:', error);
      }

      // Wait before processing next batch (rate limiting)
      if (this.queue.length > 0) {
        await sleep(this.delayBetweenBatches);
      }
    }

    this.processing = false;
  }

  /**
   * Get current queue size
   */
  get size(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is processing
   */
  get isProcessing(): boolean {
    return this.processing;
  }
}

/**
 * Track and manage API quota usage
 */
export class QuotaTracker {
  private requestCounts: Map<string, number[]> = new Map();
  private readonly windowMs = 100000; // 100 seconds

  /**
   * Record a request
   */
  recordRequest(userId = 'default'): void {
    const now = Date.now();
    const requests = this.requestCounts.get(userId) || [];

    // Remove old requests outside the window
    const filtered = requests.filter(time => now - time < this.windowMs);

    // Add current request
    filtered.push(now);

    this.requestCounts.set(userId, filtered);
  }

  /**
   * Get current request count for a user
   */
  getRequestCount(userId = 'default'): number {
    const now = Date.now();
    const requests = this.requestCounts.get(userId) || [];

    // Count requests within the window
    return requests.filter(time => now - time < this.windowMs).length;
  }

  /**
   * Check if we're approaching quota limits
   */
  isApproachingLimit(userId = 'default', threshold = 0.8): boolean {
    const count = this.getRequestCount(userId);
    const userLimit = 1000; // Per-user limit per 100 seconds

    return count >= userLimit * threshold;
  }

  /**
   * Get recommended delay before next request
   */
  getRecommendedDelay(userId = 'default'): number {
    if (!this.isApproachingLimit(userId)) {
      return 0; // No delay needed
    }

    const count = this.getRequestCount(userId);

    // Progressive delay based on how close we are to the limit
    if (count >= 900) return 5000;  // 5 seconds
    if (count >= 800) return 2000;  // 2 seconds
    if (count >= 700) return 1000;  // 1 second
    return 500; // 500ms
  }

  /**
   * Reset tracker for a user
   */
  reset(userId = 'default'): void {
    this.requestCounts.delete(userId);
  }

  /**
   * Get all tracked users and their counts
   */
  getStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    for (const [userId, requests] of this.requestCounts.entries()) {
      stats[userId] = this.getRequestCount(userId);
    }

    return stats;
  }
}

// Export a global quota tracker instance
export const globalQuotaTracker = new QuotaTracker();