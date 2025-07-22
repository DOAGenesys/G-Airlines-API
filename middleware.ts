import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

// Create Redis client with connection pooling
let redis: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (!redis) {
    if (!process.env.REDIS_URL) {
      throw new Error("REDIS_URL environment variable is not set");
    }
    
    redis = createClient({
      url: process.env.REDIS_URL,
    });

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
      redis = null; // Reset on error to allow reconnection
    });

    await redis.connect();
  }
  
  return redis;
}

// Simple rate limiter implementation
async function checkRateLimit(ip: string): Promise<{ success: boolean; limit: number; remaining: number }> {
  try {
    const client = await getRedisClient();
    const key = `flight_api_ratelimit:${ip}`;
    const window = 30; // 30 seconds
    const limit = 20; // 20 requests per window
    
    const now = Date.now();
    const windowStart = now - (window * 1000);
    
    // Remove old entries and add current request
    await client.zRemRangeByScore(key, 0, windowStart);
    const current = await client.zCard(key);
    
    if (current >= limit) {
      return { success: false, limit, remaining: 0 };
    }
    
    // Add current request
    await client.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
    await client.expire(key, window);
    
    const remaining = Math.max(0, limit - current - 1);
    return { success: true, limit, remaining };
    
  } catch (error) {
    console.error('Rate limiting error:', error);
    // On error, allow the request (fail open)
    return { success: true, limit: 20, remaining: 19 };
  }
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip ?? request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
    
    console.log({
        message: "Middleware execution started",
        pathname: request.nextUrl.pathname,
        ip: ip,
    });

    // Check API key
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

    // Check rate limit
    try {
        const { success, limit, remaining } = await checkRateLimit(ip);
        
        if (!success) {
            console.warn({
                message: "Rate limit exceeded for IP",
                ip: ip,
                limit: limit,
                remaining: remaining
            });
            return new NextResponse(
                JSON.stringify({ error: 'Too many requests. Please try again later.' }),
                { 
                  status: 429, 
                  headers: { 
                    'Content-Type': 'application/json',
                    'X-RateLimit-Limit': limit.toString(),
                    'X-RateLimit-Remaining': remaining.toString()
                  } 
                }
            );
        }
        
        console.log("Rate limit check passed", { remaining });
        
    } catch (error) {
        console.error({
            message: "Error during rate limiting check",
            errorMessage: (error as Error).message,
        });
        // Continue with the request even if rate limiting fails
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
