import { NextResponse } from 'next/server';
import { createLog } from '@/lib/utils';
import { FlightChangeQuoteRequest, FlightChangeQuoteResponse, FeeWaiver } from '@/types/flightApi';

/**
 * Calculates a deterministic value from a string based on its character codes.
 * @param inputString The string to process.
 * @returns A numerical value.
 */
const getDeterministicValueFromString = (inputString: string): number => {
    let value = 0;
    for (let i = 0; i < inputString.length; i++) {
        value += inputString.charCodeAt(i);
    }
    return value;
};

export async function POST(request: Request) {
    const invocationId = `func-inv-${crypto.randomUUID()}`;
    try {
        const body: FlightChangeQuoteRequest = await request.json();
        createLog('INFO', 'Function execution started: flight_change_quote', { invocationId });
        createLog('DEBUG', 'Received event payload', { invocationId, event: body });

        const { BookingReference, FlightOptionIDs } = body;

        if (!BookingReference || !FlightOptionIDs) {
            const errorDetail = "Missing or invalid parameters. 'BookingReference' and 'FlightOptionIDs' (as a string) are required.";
            createLog('ERROR', 'Input validation failed', { invocationId, event: body });
            return NextResponse.json({ status: 400, error: errorDetail }, { status: 400 });
        }

        const parsedFlightIDs = FlightOptionIDs.split(',');
        createLog('INFO', 'Input validation successful and IDs parsed', { invocationId, BookingReference, parsedFlightIDs });

        const bookingValue = getDeterministicValueFromString(BookingReference);
        const flightsValue = getDeterministicValueFromString(FlightOptionIDs);
        const fareDifference = 50 + ((bookingValue + flightsValue) % 201);

        let changeFee = 150.0;
        const taxesAndSurcharges = fareDifference * 0.15;

        const isElite = BookingReference.toUpperCase().includes("GOLD") || BookingReference.toUpperCase().includes("PLATINUM");
        
        // FIX: Explicitly type `feeWaiver` with the FeeWaiver interface.
        // This tells TypeScript that `Reason` can be a string OR null.
        let feeWaiver: FeeWaiver = { IsWaived: false, Reason: null };

        if (isElite) {
            changeFee = 0.0;
            // This assignment is now valid.
            feeWaiver = { IsWaived: true, Reason: "Gold Tier Benefit" };
        }

        const totalDue = fareDifference + changeFee + taxesAndSurcharges;

        const quote: FlightChangeQuoteResponse = {
            QuoteID: `QUOTE-${crypto.randomUUID()}`,
            FareDifference: parseFloat(fareDifference.toFixed(2)),
            ChangeFee: parseFloat(changeFee.toFixed(2)),
            TaxesAndSurcharges: parseFloat(taxesAndSurcharges.toFixed(2)),
            TotalDue: parseFloat(totalDue.toFixed(2)),
            Currency: "AED",
            FeeWaiver: feeWaiver
        };

        createLog('INFO', 'Function execution completed successfully', { invocationId });
        return NextResponse.json(quote);

    } catch (error: any) {
        createLog('FATAL', 'An unhandled error occurred', {
            invocationId,
            error: error.message,
            stack: error.stack
        });
        return NextResponse.json({
            status: 500,
            error: "An internal error occurred while generating the quote."
        }, { status: 500 });
    }
}
