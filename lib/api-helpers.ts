import { NextResponse } from 'next/server';

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface ApiSuccess<T = any> {
  data: T;
  message?: string;
}

/**
 * Standard API error response
 */
export function apiError(
  message: string,
  statusCode: number = 500,
  error: string = 'Internal Server Error'
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error,
      message,
      statusCode,
    },
    { status: statusCode }
  );
}

/**
 * Standard API success response
 */
export function apiSuccess<T = any>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      data,
      ...(message && { message }),
    },
    { status: statusCode }
  );
}

/**
 * Validate required fields in request body
 */
export function validateRequired(
  body: Record<string, any>,
  requiredFields: string[]
): string | null {
  for (const field of requiredFields) {
    if (!body[field]) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

/**
 * Parse JSON body safely
 */
export async function parseBody<T = any>(request: Request): Promise<T | null> {
  try {
    const body = await request.json();
    return body as T;
  } catch (error) {
    return null;
  }
}

/**
 * Rate limiting helper (simple in-memory implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * CORS headers for API routes
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};