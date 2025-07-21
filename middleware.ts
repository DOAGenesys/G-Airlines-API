import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

// Initialize the rate limiter to allow 20 requests per 30 seconds from a single IP.
const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(20, '30 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
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
