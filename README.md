# Genesys Flight API Demo

This project is a standalone Next.js API that refactors a set of Genesys Cloud Functions into modern, serverless API endpoints. The API replicates the exact logic and data contracts of the original functions, providing a secure, rate-limited, and easily deployable solution for demonstration purposes, hosted on Vercel.

## ✨ Features

* **Five Core Endpoints**: Replicates all original flight-related functions.

* **Secure by Default**: API Key Authorization and IP-based Rate Limiting.

* **Modern Tech Stack**: Next.js 14, TypeScript, Vercel.

* **Integrated Tooling**: Uses `@upstash/ratelimit` with the standard `redis` client for rate limiting.

## ☁️ Deployment on Vercel

This project is optimized for a direct deployment on [Vercel](https://vercel.com).

**Important Note on Compatibility:** The middleware uses the standard `redis` package, which is **not compatible with Vercel's Edge Runtime**. This configuration will likely cause deployment errors. The Vercel-recommended approach for middleware is to use the `@upstash/redis` package.

### Deployment Steps

1. **Push to a Git Repository**: Push the project code to a GitHub, GitLab, or Bitbucket repository.

2. **Import Project on Vercel**: From your Vercel dashboard, import the Git repository. Vercel will automatically detect the Next.js framework.

3. **Connect Redis Database**:

   * From the Vercel dashboard, navigate to the **Storage** tab.

   * Create a new Redis database (e.g., via the Upstash integration).

   * Connect the database to your project. This will automatically create the required `REDIS_URL` environment variable.

4. **Add API Key Environment Variable**:

   * In your project's **Settings** -> **Environment Variables** tab, add a new variable for `API_KEY`.

   * Provide a secure, randomly generated string as its value.

5. **Deploy**: Trigger a new deployment from the "Deployments" tab. Your API will be live at the domain provided by Vercel.

## 🔑 API Endpoints

All endpoints require a `Content-Type: application/json` header and an `x-api-key` header. The base URL is `https://g-airlines-api.vercel.app`.

---

### 1. Get Flight Details

Fetches a detailed, mock record of a flight reservation.

* **Endpoint**: `POST /api/get-flight-details`

* **Sample Request**:
    ```json
    {
      "BookingReference": "299:E6KUA7"
    }
    ```

* **Sample Response (200 OK)**:
    ```json
    {
        "BookingReference": "299:E6KUA7",
        "ConfirmationNumber": "E6KUA7",
        "BookingAgent": "claudius.lewis",
        "BookDate": "...",
        "ReservationType": "STANDARD",
        "Cabin": "ECONOMY",
        "ReservationBalance": 0.0,
        "LogicalFlightCount": 2,
        "ActivePassengerCount": 1,
        "BalancedReservation": true,
        "ReservationCurrency": "AED",
        "logicalFlights": [
            {
                "Key": "...",
                "Origin": "DXB",
                "Destination": "DAR",
                "FlightNumber": "1687",
                "DepartureTime": "...",
                "Arrivaltime": "...",
                "physicalFlightsJson": "...",
                "customersJson": "..."
            }
        ],
        "Payments": [...],
        "ReservationContacts": [...],
        "ContactInfos": [...],
        "Exceptions": [{"ExceptionCode": 0, "ExceptionDescription": "Successful Transaction"}]
    }
    ```

---

### 2. Flight Availability Search

Searches for mock available flights based on origin, destination, and date.

* **Endpoint**: `POST /api/flight-availability-search`

* **Sample Request**:
    ```json
    {
      "Origin": "DXB",
      "Destination": "LHR",
      "DepartureDate": "2025-12-10"
    }
    ```

* **Sample Response (200 OK)**:
    ```json
    {
      "AvailableFlights": [
        {
          "FlightOptionID": "OPT-a1b2c3d4-...",
          "FlightNumber": "FZ1700",
          "DepartureDateTime": "2025-12-10T08:30:00.000Z",
          "ArrivalDateTime": "2025-12-10T13:30:00.000Z",
          "EconomyPrice": 450,
          "BusinessPrice": 1200,
          "Currency": "AED"
        },
        {
          "FlightOptionID": "OPT-e5f6g7h8-...",
          "FlightNumber": "FZ1701",
          "DepartureDateTime": "2025-12-10T14:00:00.000Z",
          "ArrivalDateTime": "2025-12-10T19:30:00.000Z",
          "EconomyPrice": 500,
          "BusinessPrice": 1300,
          "Currency": "AED"
        }
      ]
    }
    ```

---

### 3. Flight Change Quote

Calculates the cost of a proposed flight change deterministically.

* **Endpoint**: `POST /api/flight-change-quote`

* **Sample Request**:
    ```json
    {
      "BookingReference": "PLATINUM-PNR-123",
      "FlightOptionIDs": "OPT-a1b2c3d4-...,OPT-e5f6g7h8-..."
    }
    ```

* **Sample Response (200 OK)**:
    ```json
    {
        "QuoteID": "QUOTE-f9e8d7c6-...",
        "FareDifference": 155,
        "ChangeFee": 0,
        "TaxesAndSurcharges": 23.25,
        "TotalDue": 178.25,
        "Currency": "AED",
        "FeeWaiver": {
            "IsWaived": true,
            "Reason": "Gold Tier Benefit"
        }
    }
    ```

---

### 4. Get Ancillary Offers

Retrieves a list of available add-ons (seats, baggage, meals).

* **Endpoint**: `POST /api/get-ancillary-offers`

* **Sample Request**:
    ```json
    {
      "BookingReference": "299:E6KUA7",
      "FlightOptionIDs": "OPT-a1b2c3d4-..."
    }
    ```

* **Sample Response (200 OK)**:
    ```json
    {
      "AncillaryOffers": [
        {
          "AncillaryCode": "SEAT-EX1A",
          "AncillaryType": "SEAT",
          "Description": "Exit Row Seat 1A",
          "Price": 75,
          "Currency": "AED"
        },
        {
          "AncillaryCode": "BG23",
          "AncillaryType": "BAGGAGE",
          "Description": "1 Piece up to 23kg",
          "Price": 120,
          "Currency": "AED"
        }
      ]
    }
    ```

---

### 5. Confirm Flight Change

Finalizes a flight change using a `QuoteID`.

* **Endpoint**: `POST /api/confirm-flight-change`

* **Sample Request**:
    ```json
    {
      "BookingReference": "299:E6KUA7",
      "QuoteID": "QUOTE-f9e8d7c6-..."
    }
    ```

* **Sample Response (200 OK)**:
    ```json
    {
      "Status": "SUCCESS",
      "NewConfirmationNumber": "XB45K1",
      "Message": "Your flight change is confirmed. Your new confirmation number is XB45K1.",
      "FinalAmountCharged": 285.50,
      "Currency": "AED"
    }
    ```
