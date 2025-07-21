import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { createClient } from 'redis';

if (!process.env.REDIS_URL) {
    console.error("FATAL: The REDIS_URL environment variable is not set.");
}

const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on('error', (err) => console.error('Redis Client Error', err));
if (!redis.isOpen) {
    redis.connect();
}

const ratelimit = new Ratelimit({
  redis: redis as any,
  limiter: Ratelimit.slidingWindow(20, '30 s'),
  analytics: true,
  prefix: 'flight_api_ratelimit',
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip ?? '127.0.0.1';
    
    console.log({
        message: "Middleware execution started",
        pathname: request.nextUrl.pathname,
        ip: ip,
    });

    const apiKey = request.headers.get('x-api-key');

    if (!apiKey) {
      console.error("API key validation failed: Missing 'x-api-key' header");
      return new NextResponse(
        JSON.stringify({ error: "Authorization required. Missing API key." }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (apiKey !== process.env.API_KEY) {
      console.error("API key validation failed: Invalid API key provided");
      return new NextResponse(
        JSON.stringify({ error: 'Invalid API key.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log("API key validation successful");

    try {
        const { success, limit, remaining } = await ratelimit.limit(ip);
        if (!success) {
            console.warn({
                message: "Rate limit exceeded for IP",
                ip: ip,
                limit: limit,
                remaining: remaining
            });
          return new NextResponse(
            JSON.stringify({ error: 'Too many requests. Please try again later.' }),
            { status: 429, headers: { 'Content-Type': 'application/json' } }
          );
        }
    } catch (error) {
        console.error({
            message: "Error during rate limiting check with 'redis' package",
            errorMessage: (error as Error).message,
        });
        return new NextResponse(
            JSON.stringify({ error: 'Internal Server Error: Could not connect to rate limiter.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
