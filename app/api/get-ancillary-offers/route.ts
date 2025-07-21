import { NextResponse } from 'next/server';
import { createLog } from '@/lib/utils';
import { AncillaryOffersRequest, AncillaryOffersResponse } from '@/types/flightApi';

export async function POST(request: Request) {
    const invocationId = `func-inv-${crypto.randomUUID()}`;
    try {
        const body: AncillaryOffersRequest = await request.json();
        createLog('INFO', 'Function execution started: get_ancillary_offers', { invocationId });
        createLog('DEBUG', 'Received event payload', { invocationId, event: body });

        const { BookingReference, FlightOptionIDs } = body;

        if (!BookingReference || !FlightOptionIDs) {
            const errorDetail = "Missing or invalid parameters. 'BookingReference' and 'FlightOptionIDs' (as a string) are required.";
            createLog('ERROR', 'Input validation failed', { invocationId, event: body });
            return NextResponse.json({ status: 400, error: errorDetail }, { status: 400 });
        }
        
        const parsedFlightIDs = FlightOptionIDs.split(',');
        createLog('INFO', 'Input validation successful and IDs parsed', { invocationId, parsedFlightIDs });
        
        const offers = [
            { AncillaryCode: 'SEAT-EX1A', AncillaryType: 'SEAT', Description: 'Exit Row Seat 1A', Price: 75.0, Currency: 'AED' },
            { AncillaryCode: 'SEAT-UPF2', AncillaryType: 'SEAT', Description: 'Up-Front Seat 2F', Price: 50.0, Currency: 'AED' },
            { AncillaryCode: 'BG23', AncillaryType: 'BAGGAGE', Description: '1 Piece up to 23kg', Price: 120.0, Currency: 'AED' },
            { AncillaryCode: 'BG32', AncillaryType: 'BAGGAGE', Description: '1 Piece up to 32kg', Price: 180.0, Currency: 'AED' },
            { AncillaryCode: 'MLVGML', AncillaryType: 'MEAL', Description: 'Vegetarian Meal', Price: 35.0, Currency: 'AED' },
            { AncillaryCode: 'MLSPML', AncillaryType: 'MEAL', Description: 'Seafood Meal', Price: 45.0, Currency: 'AED' },
        ];

        const response: AncillaryOffersResponse = { AncillaryOffers: offers as any };

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
            error: "An internal error occurred while fetching ancillary offers."
        }, { status: 500 });
    }
}
