# Genesys Flight API Demo

This project is a standalone Next.js API that refactors a set of Genesys Cloud Functions into modern, serverless API endpoints. The API replicates the exact logic and data contracts of the original functions, providing a secure, rate-limited, and easily deployable solution for demonstration purposes, hosted on Vercel.

## ✨ Features

- **Five Core Endpoints**: Replicates all original flight-related functions:
  - `get-flight-details`: Fetches detailed, mock reservation data.
  - `flight-availability-search`: Searches for available flights on a given route and date.
  - `flight-change-quote`: Generates a deterministic quote for changing a flight.
  - `get-ancillary-offers`: Retrieves available add-ons like seats and baggage.
  - `confirm-flight-change`: Finalizes a flight change with a confirmation.
- **Secure by Default**:
  - **API Key Authorization**: All endpoints are protected and require a valid `x-api-key` in the header.
  - **Rate Limiting**: IP-based rate limiting (20 requests per 30 seconds) is enforced via middleware to prevent abuse.
- **Modern Tech Stack**: Built with Next.js 14 (App Router), TypeScript, and deployed on Vercel.
- **Integrated Tooling**: Uses `@upstash/ratelimit` with the standard `redis` client for rate limiting.
- **Structured Logging**: Each function call produces structured JSON logs for easy monitoring and debugging.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18.0 or later)
- `npm`, `yarn`, or `pnpm`
- A [Vercel](https://vercel.com) account (for deployment)
- A Redis instance and its connection URL (`REDIS_URL`).
- A Git client

### Installation

1.  **Set up environment variables:**
    -   Create a `.env.local` file in the root of the project by copying the example file.
        ```bash
        cp .env.local.example .env.local
        ```
    -   Open `.env.local` and add your `API_KEY` and `REDIS_URL`.
        ```
        # .env.local

        # Generate a secure, random string for this value.
        API_KEY="your-super-secret-api-key"

        # Your Redis database connection string.
        # Example: "redis://default:password@us-east-1-redis.upstash.io:6379"
        REDIS_URL=""
        ```

---

## ☁️ Deployment

This project is optimized for deployment on [Vercel](https://vercel.com).

**Important Note on Compatibility:** The middleware uses the standard `redis` package, which is not fully compatible with Vercel's Edge Runtime. This may lead to deployment errors. The Vercel-recommended approach is to use the `@upstash/redis` package.

1.  **Push to Git:** Push your project to a GitHub, GitLab, or Bitbucket repository.

2.  **Import Project on Vercel:** From your Vercel dashboard, import the Git repository.

3.  **Connect Redis Database:**
    -   From the Vercel dashboard, navigate to the "Storage" tab.
    -   Select a Redis provider (like Upstash) and create a new database.
    -   Connect the database to your project. Ensure the `REDIS_URL` environment variable is created.

4.  **Add API Key Environment Variable:**
    -   Navigate to the "Settings" -> "Environment Variables" tab.
    -   Add your `API_KEY` with the same value you used in your `.env.local` file.

5.  **Deploy:** Trigger a new deployment. Your API will be live at `https://g-airlines-api.vercel.app`.

---

## 🔑 API Endpoints

All endpoints require a `Content-Type: application/json` header for `POST` requests and an `x-api-key` header for authorization.

### 1. Get Flight Details

-   **Endpoint**: `POST https://g-airlines-api.vercel.app/api/get-flight-details`
-   **cURL Example**:
    ```bash
    curl -X POST [https://g-airlines-api.vercel.app/api/get-flight-details](https://g-airlines-api.vercel.app/api/get-flight-details) \
      -H "Content-Type: application/json" \
      -H "x-api-key: your-super-secret-api-key" \
      -d '{ "BookingReference": "299:E6KUA7" }'
    ```

### 2. Flight Availability Search

-   **Endpoint**: `POST https://g-airlines-api.vercel.app/api/flight-availability-search`
-   **cURL Example**:
    ```bash
    curl -X POST [https://g-airlines-api.vercel.app/api/flight-availability-search](https://g-airlines-api.vercel.app/api/flight-availability-search) \
      -H "Content-Type: application/json" \
      -H "x-api-key: your-super-secret-api-key" \
      -d '{ "Origin": "DXB", "Destination": "LGW", "DepartureDate": "2025-10-28" }'
    ```

### 3. Flight Change Quote

-   **Endpoint**: `POST https://g-airlines-api.vercel.app/api/flight-change-quote`
-   **cURL Example**:
    ```bash
    curl -X POST [https://g-airlines-api.vercel.app/api/flight-change-quote](https://g-airlines-api.vercel.app/api/flight-change-quote) \
      -H "Content-Type: application/json" \
      -H "x-api-key: your-super-secret-api-key" \
      -d '{ "BookingReference": "GOLD-TIER-PNR", "FlightOptionIDs": "OPT-123,OPT-456" }'
    ```

### 4. Get Ancillary Offers

-   **Endpoint**: `POST https://g-airlines-api.vercel.app/api/get-ancillary-offers`
-   **cURL Example**:
    ```bash
    curl -X POST [https://g-airlines-api.vercel.app/api/get-ancillary-offers](https://g-airlines-api.vercel.app/api/get-ancillary-offers) \
      -H "Content-Type: application/json" \
      -H "x-api-key: your-super-secret-api-key" \
      -d '{ "BookingReference": "299:E6KUA7", "FlightOptionIDs": "OPT-123" }'
    ```

### 5. Confirm Flight Change

-   **Endpoint**: `POST https://g-airlines-api.vercel.app/api/confirm-flight-change`
-   **cURL Example**:
    ```bash
    curl -X POST [https://g-airlines-api.vercel.app/api/confirm-flight-change](https://g-airlines-api.vercel.app/api/confirm-flight-change) \
      -H "Content-Type: application/json" \
      -H "x-api-key: your-super-secret-api-key" \
      -d '{ "BookingReference": "299:E6KUA7", "QuoteID": "QUOTE-..." }'
    ```
