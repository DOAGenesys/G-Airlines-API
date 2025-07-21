import { NextResponse } from 'next/server';
import { createLog } from '@/lib/utils';
import { FlightAvailabilityRequest, FlightAvailabilityResponse } from '@/types/flightApi';

export async function POST(request: Request) {
    const invocationId = `func-inv-${crypto.randomUUID()}`;
    try {
        const body: FlightAvailabilityRequest = await request.json();
        createLog('INFO', 'Function execution started: flight_availability_search', { invocationId });
        createLog('DEBUG', 'Received event payload', { invocationId, event: body });

        const { Origin, Destination, DepartureDate } = body;

        if (!Origin || !Destination || !DepartureDate) {
            const errorDetail = "Missing one or more required parameters: Origin, Destination, DepartureDate.";
            createLog('ERROR', 'Input validation failed', { invocationId, event: body });
            return NextResponse.json({ status: 400, error: errorDetail }, { status: 400 });
        }

        createLog('INFO', 'Input validation successful', { invocationId, Origin, Destination, DepartureDate });

        const availableFlights = [];
        const baseDate = new Date(DepartureDate);
        const flightTimes = [
            { hour: 8, minute: 30, durationHours: 5, economyPrice: 450.0, businessPrice: 1200.0 },
            { hour: 14, minute: 0, durationHours: 5.5, economyPrice: 500.0, businessPrice: 1300.0 },
            { hour: 19, minute: 15, durationHours: 4.75, economyPrice: 550.0, businessPrice: 1400.0 }
        ];

        for (let i = 0; i < flightTimes.length; i++) {
            const depTime = new Date(baseDate.toISOString());
            depTime.setUTCHours(flightTimes[i].hour, flightTimes[i].minute, 0, 0);

            const arrTime = new Date(depTime.getTime());
            arrTime.setUTCHours(arrTime.getUTCHours() + flightTimes[i].durationHours);

            availableFlights.push({
                FlightOptionID: `OPT-${crypto.randomUUID()}`,
                FlightNumber: `FZ${1700 + i}`,
                DepartureDateTime: depTime.toISOString(),
                ArrivalDateTime: arrTime.toISOString(),
                EconomyPrice: flightTimes[i].economyPrice,
                BusinessPrice: flightTimes[i].businessPrice,
                Currency: "AED"
            });
        }

        const response: FlightAvailabilityResponse = { AvailableFlights: availableFlights };
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
            error: "An internal error occurred while searching for flights."
        }, { status: 500 });
    }
}
