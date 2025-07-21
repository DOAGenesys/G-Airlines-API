import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { createClient } from 'redis';

// Create a new Redis client.
// The `createClient` function will automatically use the REDIS_URL environment variable.
const redis = createClient({
  url: process.env.REDIS_URL
});

// We only need to connect once, so we can do it here.
// The `connect()` method returns a promise, but we can let the client
// handle the connection state internally for subsequent requests.
redis.connect().catch(console.error);

// Initialize the rate limiter, now using the Redis client instance.
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, '30 s'),
  analytics: true,
  prefix: 'flight_api_ratelimit',
});

export async function middleware(request: NextRequest) {
  // Only apply middleware to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const apiKey = request.headers.get('x-api-key');
    const ip = request.ip ?? '127.0.0.1';

    // 1. Check for API Key
    if (!apiKey) {
      return new NextResponse(
        JSON.stringify({ error: 'Authorization required. Missing API key.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Validate API Key
    if (apiKey !== process.env.API_KEY) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid API key.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Apply Rate Limiting
    const { success, limit, remaining } = await ratelimit.limit(ip);
    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
