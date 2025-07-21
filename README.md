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
- **Integrated Tooling**: Uses `@upstash/ratelimit` with Vercel KV for efficient, serverless rate limiting.
- **Structured Logging**: Each function call produces structured JSON logs for easy monitoring and debugging.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18.0 or later)
- `npm`, `yarn`, or `pnpm`
- A [Vercel](https://vercel.com) account (for deployment and Vercel KV)
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
    -   Open `.env.local` and add a secure, randomly generated string for `API_KEY`. This is the key you will use to authenticate requests.
        ```
        # .env.local

        # Generate a secure, random string for this value.
        API_KEY="your-super-secret-api-key"

        # These will be configured automatically when you link a KV store on Vercel.
        # For local development, you can create a free KV store on Upstash.
        KV_URL=""
        KV_REST_API_URL=""
        KV_REST_API_TOKEN=""
        KV_REST_API_READ_ONLY_TOKEN=""
        ```
    -   **For Local Rate Limiting**: To test rate limiting locally, create a free Vercel KV or Upstash Redis database and populate the `KV_*` variables in your `.env.local` file.

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

3.  **Connect Vercel KV Store:**
    -   Navigate to the "Storage" tab in your Vercel project settings.
    -   Create and connect a new KV (Serverless Redis) database.
    -   Vercel will automatically add the required `KV_*` environment variables to your project.

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
-   **Success Response (200 OK)**: Returns a comprehensive JSON object with flight, passenger, and payment details, matching the original `get_flight_details` output contract.

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
-   **Success Response (200 OK)**:
    ```json
    {
      "AvailableFlights": [
        {
          "FlightOptionID": "OPT-...",
          "FlightNumber": "FZ1700",
          "DepartureDateTime": "2025-10-28T08:30:00.000Z",
          "ArrivalDateTime": "2025-10-28T13:30:00.000Z",
          "EconomyPrice": 450,
          "BusinessPrice": 1200,
          "Currency": "AED"
        }
      ]
    }
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
-   **Success Response (200 OK)**:
    ```json
    {
        "QuoteID": "QUOTE-...",
        "FareDifference": 183,
        "ChangeFee": 0,
        "TaxesAndSurcharges": 27.45,
        "TotalDue": 210.45,
        "Currency": "AED",
        "FeeWaiver": {
            "IsWaived": true,
            "Reason": "Gold Tier Benefit"
        }
    }
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
-   **Success Response (200 OK)**:
    ```json
    {
      "AncillaryOffers": [
        {
          "AncillaryCode": "SEAT-EX1A",
          "AncillaryType": "SEAT",
          "Description": "Exit Row Seat 1A",
          "Price": 75,
          "Currency": "AED"
        }
      ]
    }
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
-   **Success Response (200 OK)**:
    ```json
    {
      "Status": "SUCCESS",
      "NewConfirmationNumber": "A4B9C1",
      "Message": "Your flight change is confirmed. Your new confirmation number is A4B9C1.",
      "FinalAmountCharged": 257,
      "Currency": "AED"
    }
    ```

---

## 🏗️ Project Structure

.├── app/│   └── api/│       ├── confirm-flight-change/│       │   └── route.ts│       ├── flight-availability-search/│       │   └── route.ts│       ├── flight-change-quote/│       │   └── route.ts│       ├── get-ancillary-offers/│       │   └── route.ts│       └── get-flight-details/│           └── route.ts├── lib/│   └── utils.ts├── types/│   └── flightApi.ts├── .env.local.example├── .gitignore├── middleware.ts├── package.json└── tsconfig.json
-   `/app/api/*`: Each folder contains a `route.ts` file that defines an API endpoint using the Next.js App Router convention.
-   `/lib/utils.ts`: Contains shared helper functions (logging, date formatting) used across multiple endpoints.
-   `/types/flightApi.ts`: Defines all TypeScript interfaces for request and response bodies, ensuring type safety.
-   `middleware.ts`: Handles security for all API routes, checking for a valid API key and enforcing rate limits before the request reaches the endpoint logic.

