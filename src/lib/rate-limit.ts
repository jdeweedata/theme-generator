import { NextRequest, NextResponse } from "next/server"

// ============================================================================
// Simple In-Memory Rate Limiter
// Note: For production serverless, consider Upstash (@upstash/ratelimit)
// This implementation works for single-instance deployments
// ============================================================================

interface RateLimitEntry {
  count: number
  resetAt: number
}

/**
 * In-memory store for rate limit tracking
 * Note: Cleared on server restart, doesn't persist across serverless instances
 */
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  limit: number
  /** Time window in seconds */
  windowSeconds: number
}

/**
 * Default rate limit: 10 requests per minute
 * Generous for normal use, protective against abuse
 */
export const defaultRateLimitConfig: RateLimitConfig = {
  limit: 10,
  windowSeconds: 60,
}

/**
 * Stricter rate limit for expensive AI operations: 5 per minute
 */
export const aiOperationRateLimitConfig: RateLimitConfig = {
  limit: 5,
  windowSeconds: 60,
}

/**
 * Extract client identifier from request
 * Uses X-Forwarded-For header (for proxies) or falls back to IP
 */
function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    // Take the first IP in the chain
    return forwarded.split(",")[0].trim()
  }

  // Fallback to request IP (may be undefined in some environments)
  const ip = request.headers.get("x-real-ip") || "anonymous"
  return ip
}

/**
 * Clean up expired entries periodically
 * Called automatically during rate limit checks
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  const keysToDelete: string[] = []
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetAt < now) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach((key) => rateLimitStore.delete(key))
}

/**
 * Check rate limit for a request
 * Returns { success, limit, remaining, resetAt } or null if no limiting needed
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = defaultRateLimitConfig
): {
  success: boolean
  limit: number
  remaining: number
  resetAt: number
} {
  const clientId = getClientId(request)
  const key = `${clientId}:${request.nextUrl.pathname}`
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000

  // Cleanup expired entries occasionally (1 in 10 requests)
  if (Math.random() < 0.1) {
    cleanupExpiredEntries()
  }

  let entry = rateLimitStore.get(key)

  // If no entry or window expired, create new entry
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + windowMs,
    }
    rateLimitStore.set(key, entry)
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt: entry.resetAt,
    }
  }

  // Increment count
  entry.count++

  // Check if over limit
  if (entry.count > config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Create rate limit response headers
 */
export function rateLimitHeaders(result: {
  limit: number
  remaining: number
  resetAt: number
}): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.resetAt / 1000).toString(),
  }
}

/**
 * Create 429 Too Many Requests response
 */
export function rateLimitExceededResponse(result: {
  limit: number
  remaining: number
  resetAt: number
}): NextResponse {
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000)

  return NextResponse.json(
    {
      success: false,
      error: "Too many requests. Please try again later.",
      retryAfter,
    },
    {
      status: 429,
      headers: {
        ...rateLimitHeaders(result),
        "Retry-After": retryAfter.toString(),
      },
    }
  )
}
