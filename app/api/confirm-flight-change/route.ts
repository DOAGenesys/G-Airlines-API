import { NextResponse } from 'next/server';
import { createLog } from '@/lib/utils';
import { ConfirmFlightChangeRequest, ConfirmFlightChangeResponse } from '@/types/flightApi';

const generateConfirmationCode = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export async function POST(request: Request) {
    const invocationId = `func-inv-${crypto.randomUUID()}`;
    try {
        const body: ConfirmFlightChangeRequest = await request.json();
        createLog('INFO', 'Function execution started: confirm_flight_change', { invocationId });
        createLog('DEBUG', 'Received event payload', { invocationId, event: body });

        const { BookingReference, QuoteID } = body;

        if (!BookingReference || !QuoteID) {
            const errorDetail = "Missing required parameters. 'BookingReference' and 'QuoteID' are required.";
            createLog('ERROR', 'Input validation failed', { invocationId, event: body });
            return NextResponse.json({ status: 400, error: errorDetail }, { status: 400 });
        }

        createLog('INFO', 'Input validation successful', { invocationId, BookingReference, QuoteID });

        if (QuoteID.toUpperCase().includes("FAIL")) {
            createLog('WARN', 'Simulating a failed confirmation', { invocationId, QuoteID });
            const failedResponse: ConfirmFlightChangeResponse = {
                Status: "FAILED",
                NewConfirmationNumber: null,
                Message: "Payment processing failed. Please try a different payment method.",
                FinalAmountCharged: 0.0,
                Currency: "AED"
            };
            return NextResponse.json(failedResponse);
        }

        const newConfirmation = generateConfirmationCode(6);
        const finalAmount = Math.floor(Math.random() * 300) + 100;

        const confirmationResponse: ConfirmFlightChangeResponse = {
            Status: "SUCCESS",
            NewConfirmationNumber: newConfirmation,
            Message: `Your flight change is confirmed. Your new confirmation number is ${newConfirmation}.`,
            FinalAmountCharged: parseFloat(finalAmount.toFixed(2)),
            Currency: "AED"
        };
        
        createLog('INFO', 'Function execution completed successfully', { invocationId });
        return NextResponse.json(confirmationResponse);

    } catch (error: any) {
        createLog('FATAL', 'An unhandled error occurred', {
            invocationId,
            error: error.message,
            stack: error.stack
        });
        return NextResponse.json({
            status: 500,
            error: "An internal error occurred during the flight change confirmation."
        }, { status: 500 });
    }
}
