import { apiSuccess, apiError, parseBody, checkRateLimit } from '@/lib/api-helpers';

export async function GET(request: Request) {
  // Example of rate limiting using IP address
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  if (!checkRateLimit(ip, 5, 60000)) {
    return apiError('Too many requests', 429, 'Rate Limit Exceeded');
  }

  return apiSuccess({
    message: 'API route is working!',
    method: 'GET',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await parseBody(request);
  
  if (!body) {
    return apiError('Invalid JSON body', 400, 'Bad Request');
  }

  return apiSuccess({
    message: 'POST request received',
    received: body,
    timestamp: new Date().toISOString(),
  });
}