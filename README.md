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
- **Integrated Tooling**: Uses `@upstash/ratelimit` with a standard Redis client for efficient, serverless rate limiting.
- **Structured Logging**: Each function call produces structured JSON logs for easy monitoring and debugging.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18.0 or later)
- `npm`, `yarn`, or `pnpm`
- A [Vercel](https://vercel.com) account (for deployment)
- A Redis instance (e.g., from Vercel's marketplace) and its connection URL.
- A Git client

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
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

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The API will now be running at `http://localhost:3000`.

---

## ☁️ Deployment

This project is optimized for deployment on [Vercel](https://vercel.com).

1.  **Push to Git:** Push your project to a GitHub, GitLab, or Bitbucket repository.

2.  **Import Project on Vercel:** From your Vercel dashboard, import the Git repository. Vercel will automatically detect that it is a Next.js project.

3.  **Connect Redis Database:**
    -   From the Vercel dashboard, navigate to the "Storage" tab.
    -   Select a Redis provider (like Upstash or Redis) and create a new database.
    -   Connect the database to your project. Vercel will automatically add the `REDIS_URL` environment variable.

4.  **Add API Key Environment Variable:**
    -   Navigate to the "Settings" -> "Environment Variables" tab.
    -   Add your `API_KEY` with the same value you used in your `.env.local` file.

5.  **Deploy:** Trigger a new deployment. Your API will be live at the domain provided by Vercel.

---

## 🔑 API Endpoints

All endpoints require a `Content-Type: application/json` header for `POST` requests and an `x-api-key` header for authorization.

### 1. Get Flight Details

Fetches a detailed, mock record of a flight reservation.

-   **Endpoint**: `POST /api/get-flight-details`
-   **Request Body**:
    ```json
    {
      "BookingReference": "299:E6KUA7"
    }
    ```
-   **cURL Example**:
    ```bash
    curl -X POST http://localhost:3000/api/get-flight-details \
      -H "Content-Type: application/json" \
      -H "x-api-key: your-super-secret-api-key" \
      -d '{ "BookingReference": "299:E6KUA7" }'
    ```

### 2. Flight Availability Search

Searches for mock available flights based on origin, destination, and date.

-   **Endpoint**: `POST /api/flight-availability-search`
-   **Request Body**:
    ```json
    {
      "Origin": "DXB",
      "Destination": "LGW",
      "DepartureDate": "2025-10-28"
    }
    ```
-   **cURL Example**:
    ```bash
    curl -X POST http://localhost:3000/api/flight-availability-search \
      -H "Content-Type: application/json" \
      -H "x-api-key: your-super-secret-api-key" \
      -d '{ "Origin": "DXB", "Destination": "LGW", "DepartureDate": "2025-10-28" }'
    ```

### 3. Flight Change Quote

Calculates the cost of a proposed flight change deterministically.

-   **Endpoint**: `POST /api/flight-change-quote`
-   **Request Body**:
    ```json
    {
      "BookingReference": "GOLD-TIER-PNR",
      "FlightOptionIDs": "OPT-a73da26d-cebe-40c4-ad2f-17af4dba3c99,OPT-39464896-990d-422b-b5aa-a587f80ea87a"
    }
    ```
-   **cURL Example**:
    ```bash
    curl -X POST http://localhost:3000/api/flight-change-quote \
      -H "Content-Type: application/json" \
      -H "x-api-key: your-super-secret-api-key" \
      -d '{ "BookingReference": "GOLD-TIER-PNR", "FlightOptionIDs": "OPT-123,OPT-456" }'
    ```

### 4. Get Ancillary Offers

Retrieves a list of available add-ons (seats, baggage, meals).

-   **Endpoint**: `POST /api/get-ancillary-offers`
-   **Request Body**:
    ```json
    {
      "BookingReference": "299:E6KUA7",
      "FlightOptionIDs": "OPT-a73da26d-cebe-40c4-ad2f-17af4dba3c99"
    }
    ```
-   **cURL Example**:
    ```bash
    curl -X POST http://localhost:3000/api/get-ancillary-offers \
      -H "Content-Type: application/json" \
      -H "x-api-key: your-super-secret-api-key" \
      -d '{ "BookingReference": "299:E6KUA7", "FlightOptionIDs": "OPT-123" }'
    ```

### 5. Confirm Flight Change

Finalizes a flight change using a `QuoteID`.

-   **Endpoint**: `POST /api/confirm-flight-change`
-   **Request Body**:
    ```json
    {
      "BookingReference": "299:E6KUA7",
      "QuoteID": "QUOTE-..."
    }
    ```
-   **cURL Example**:
    ```bash
    curl -X POST http://localhost:3000/api/confirm-flight-change \
      -H "Content-Type: application/json" \
      -H "x-api-key: your-super-secret-api-key" \
      -d '{ "BookingReference": "299:E6KUA7", "QuoteID": "QUOTE-..." }'
    ```
