import { NextResponse } from 'next/server';
import { createLog, formatForChargeDesc, formatTime, formatTo12Hour } from '@/lib/utils';
import { FlightAvailabilityRequest, FlightAvailabilityResponse, FeeWaiver, GetFlightDetailsResponse, FlightChangeOption } from '@/types/flightApi';

// Helper function to calculate a deterministic value from a string.
const getDeterministicValueFromString = (inputString: string): number => {
    let value = 0;
    for (let i = 0; i < inputString.length; i++) {
        value += inputString.charCodeAt(i);
    }
    return value;
};

// Internal helper to fetch reservation details, adapted from get-flight-details endpoint.
const fetchReservationDetails = async (bookingReference: string, invocationId: string): Promise<GetFlightDetailsResponse | null> => {
    createLog('INFO', 'Starting internal reservation details lookup', { invocationId, bookingReference });
    // This is a mock implementation. In a real scenario, this would call a database or another service.
    if (!bookingReference) return null;

    const parts = bookingReference.split(':');
    const confirmationNumber = parts.length > 1 ? parts[1] : bookingReference;
    const now = new Date();
    const bookDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const firstDep = new Date(bookDate);
    firstDep.setDate(firstDep.getDate() + 1);
    firstDep.setHours(10, 0, 0, 0);
    const firstArr = new Date(firstDep);
    firstArr.setHours(16, 10, 0, 0);

    return {
        BookingReference: bookingReference,
        ConfirmationNumber: confirmationNumber,
        BookingAgent: "claudius.lewis",
        BookDate: bookDate.toISOString(),
        ReservationType: "STANDARD",
        Cabin: "ECONOMY",
        ReservationBalance: 0.0,
        LogicalFlightCount: 2,
        ActivePassengerCount: 1,
        BalancedReservation: true,
        ReservationCurrency: "AED",
        logicalFlights: [{
            Key: `16087794:16087794:${formatTo12Hour(firstDep)}`,
            Origin: "DXB", Destination: "DAR", FlightNumber: "1687",
            DepartureTime: firstDep.toISOString(), Arrivaltime: firstArr.toISOString(),
            physicalFlightsJson: "[]",
            customersJson: "[]"
        }],
        Payments: [],
        ReservationContacts: [],
        ContactInfos: [],
        Exceptions: [{ ExceptionCode: 0, ExceptionDescription: "Successful Transaction" }]
    };
};


export async function POST(request: Request) {
    const invocationId = `func-inv-${crypto.randomUUID()}`;
    try {
        const body: FlightAvailabilityRequest = await request.json();
        createLog('INFO', 'Function execution started: flight_availability_search', { invocationId });
        createLog('DEBUG', 'Received event payload', { invocationId, event: body });

        const { DepartureDate, BookingReference, Origin, Destination } = body;

        // --- Input Validation ---
        if (!DepartureDate || (!BookingReference && (!Origin || !Destination))) {
            const errorDetail = "Missing required parameters. Provide 'DepartureDate' and either 'BookingReference' or both 'Origin' and 'Destination'.";
            createLog('ERROR', 'Input validation failed', { invocationId, event: body });
            return NextResponse.json({ status: 400, error: errorDetail }, { status: 400 });
        }

        let searchOrigin = Origin;
        let searchDestination = Destination;
        const pnrForQuote = BookingReference || `ANON-${crypto.randomUUID()}`; // Use real PNR or a dummy one for quote calculation

        // If BookingReference is provided, use it to find Origin and Destination
        if (BookingReference) {
            const reservationDetails = await fetchReservationDetails(BookingReference, invocationId);
            if (reservationDetails && reservationDetails.logicalFlights.length > 0) {
                searchOrigin = reservationDetails.logicalFlights[0].Origin;
                searchDestination = reservationDetails.logicalFlights[0].Destination;
                createLog('INFO', 'Extracted O&D from booking reference', { invocationId, Origin: searchOrigin, Destination: searchDestination });
            } else {
                const errorDetail = `Could not retrieve flight details for BookingReference: ${BookingReference}`;
                createLog('ERROR', 'Booking reference lookup failed', { invocationId, BookingReference });
                return NextResponse.json({ status: 404, error: errorDetail }, { status: 404 });
            }
        }
        
        createLog('INFO', 'Input validation successful', { invocationId, searchOrigin, searchDestination, DepartureDate });

        const availableFlightQuotes: FlightChangeOption[] = [];
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

            const flightOptionID = `OPT-${crypto.randomUUID()}`;

            // --- Quote Calculation Logic (merged from flight-change-quote) ---
            const bookingValue = getDeterministicValueFromString(pnrForQuote);
            const flightsValue = getDeterministicValueFromString(flightOptionID);
            const fareDifference = 50 + ((bookingValue + flightsValue) % 201);
            let changeFee = 150.0;
            const taxesAndSurcharges = fareDifference * 0.15;
            const isElite = pnrForQuote.toUpperCase().includes("GOLD") || pnrForQuote.toUpperCase().includes("PLATINUM");
            let feeWaiver: FeeWaiver = { IsWaived: false, Reason: null };

            if (isElite) {
                changeFee = 0.0;
                feeWaiver = { IsWaived: true, Reason: "Gold Tier Benefit" };
            }

            const totalDue = fareDifference + changeFee + taxesAndSurcharges;
            // --- End of Quote Calculation ---

            availableFlightQuotes.push({
                // Flight details
                FlightOptionID: flightOptionID,
                FlightNumber: `FZ${1700 + i}`,
                DepartureDateTime: depTime.toISOString(),
                ArrivalDateTime: arrTime.toISOString(),
                EconomyPrice: flightTimes[i].economyPrice,
                BusinessPrice: flightTimes[i].businessPrice,
                // Quote details
                QuoteID: `QUOTE-${crypto.randomUUID()}`,
                FareDifference: parseFloat(fareDifference.toFixed(2)),
                ChangeFee: parseFloat(changeFee.toFixed(2)),
                TaxesAndSurcharges: parseFloat(taxesAndSurcharges.toFixed(2)),
                TotalDue: parseFloat(totalDue.toFixed(2)),
                Currency: "AED",
                FeeWaiver: feeWaiver
            });
        }

        const response: FlightAvailabilityResponse = { AvailableFlightQuotes: availableFlightQuotes };
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
