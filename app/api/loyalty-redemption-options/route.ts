import { NextResponse } from 'next/server';
import { createLog } from '@/lib/utils';
import { LoyaltyRedemptionRequest, LoyaltyRedemptionResponse } from '@/types/flightApi';

export async function POST(request: Request) {
    const invocationId = `func-inv-${crypto.randomUUID()}`;
    try {
        const body: LoyaltyRedemptionRequest = await request.json();
        createLog('INFO', 'Function execution started: loyalty_redemption_options', { invocationId });
        createLog('DEBUG', 'Received event payload', { invocationId, event: body });

        const { BookingReference, QuoteID } = body;

        // --- Input Validation ---
        if (!BookingReference || !QuoteID) {
            const errorDetail = "Missing required parameters. 'BookingReference' and 'QuoteID' are required.";
            createLog('ERROR', 'Input validation failed', { invocationId, event: body });
            return NextResponse.json({ status: 400, error: errorDetail }, { status: 400 });
        }

        createLog('INFO', 'Input validation successful', { invocationId, BookingReference, QuoteID });

        // --- Mock Data Generation ---
        const response: LoyaltyRedemptionResponse = {
            MilesEarned: {
                Economy: 2500,
                Business: 7500
            },
            RedemptionOptions: [
                {
                    RedemptionCode: "UPG-BUS",
                    OptionType: "UPGRADE",
                    Description: "Upgrade to Business Class on one segment",
                    MilesRequired: 25000
                },
                {
                    RedemptionCode: "PWM-100",
                    OptionType: "PAY_WITH_MILES",
                    Description: "Pay 100 AED of the total due with miles",
                    MilesRequired: 10000
                },
                {
                    RedemptionCode: "PWM-ALL",
                    OptionType: "PAY_WITH_MILES",
                    Description: "Pay the entire due amount with miles",
                    MilesRequired: 45000
                }
            ]
        };

        createLog('INFO', 'Function execution completed successfully', { invocationId });
        return NextResponse.json(response);

    } catch (error: any) {
        createLog('FATAL', 'An unhandled error occurred', {
            invocationId,
            error: error.message,
            stack: error.stack
        });
        return NextResponse.json({
            status: 500,
            error: "An internal error occurred while fetching loyalty options."
        }, { status: 500 });
    }
}
