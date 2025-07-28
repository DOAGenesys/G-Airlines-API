import { NextResponse } from 'next/server';
import { createLog, formatForChargeDesc, formatTime, formatTo12Hour } from '@/lib/utils';
import { GetFlightDetailsRequest, GetFlightDetailsResponse } from '@/types/flightApi';

const fetchReservationDetails = async (bookingReference: string, invocationId: string): Promise<GetFlightDetailsResponse> => {
    createLog('INFO', 'Starting reservation details lookup', { invocationId, bookingReference });

    const parts = bookingReference.split(':');
    const confirmationNumber = parts.length > 1 ? parts[1] : bookingReference;

    const now = new Date();
    const bookDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    bookDate.setHours(6, 48, 58, 0);

    const firstDep = new Date(bookDate);
    firstDep.setDate(firstDep.getDate() + 1);
    firstDep.setHours(10, 0, 0, 0);

    const firstArr = new Date(firstDep);
    firstArr.setHours(16, 10, 0, 0);

    const phys1Arr = new Date(firstDep);
    phys1Arr.setHours(14, 30, 0, 0);

    const phys2Dep = new Date(phys1Arr);
    phys2Dep.setHours(15, 30, 0, 0);

    const returnDep = new Date(firstDep);
    returnDep.setDate(returnDep.getDate() + 3);
    returnDep.setHours(19, 50, 0, 0);

    const returnArr = new Date(returnDep);
    returnArr.setDate(returnArr.getDate() + 1);
    returnArr.setHours(4, 15, 0, 0);

    const phys3Arr = new Date(returnDep);
    phys3Arr.setHours(20, 30, 0, 0);

    const phys4Dep = new Date(phys3Arr);
    phys4Dep.setHours(21, 30, 0, 0);
    
    // Simulating the original logic for generating keys and descriptions
    const firstKeyDate = formatTo12Hour(new Date(firstDep.getFullYear(), firstDep.getMonth(), firstDep.getDate(), 10, 0, 0));
    const returnKeyDate = formatTo12Hour(new Date(returnDep.getFullYear(), returnDep.getMonth(), returnDep.getDate(), 19, 50, 0)).replace('07:50:00 PM', '7:50:00 PM');
    
    const mockReservationData: GetFlightDetailsResponse = {
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
        logicalFlights: [
            {
                Key: `16087794:16087794:${firstKeyDate}`,
                Origin: "DXB", Destination: "DAR", FlightNumber: "1687",
                DepartureTime: firstDep.toISOString(), Arrivaltime: firstArr.toISOString(),
                physicalFlightsJson: JSON.stringify([
                    { Origin: "DXB", Destination: "ZNZ", DepartureTime: firstDep.toISOString(), Arrivaltime: phys1Arr.toISOString(), AirCraftType: "73X" },
                    { Origin: "ZNZ", Destination: "DAR", DepartureTime: phys2Dep.toISOString(), Arrivaltime: firstArr.toISOString(), AirCraftType: "TMPX" }
                ]),
                customersJson: JSON.stringify([
                    { AirlinePersons: [ { PersonOrgID: 246255753, FirstName: "JOHN", LastName: "DOE", PTCID: 1, FareClassCode: "R", WebFareType: "Lite", FareBasisCode: "RR6AE2", Cabin: "ECONOMY", Charges: [ { CodeType: "AIR", Amount: 575.0, Description: `FZ 1687 DXB-ZNZ ${formatForChargeDesc(firstDep)} ${formatTime(firstDep)} ${formatTime(phys1Arr)}\nFZ 1687 ZNZ-DAR ${formatForChargeDesc(firstDep)} ${formatTime(phys2Dep)} ${formatTime(firstArr)}` }, { CodeType: "TAX", TaxCode: "AE", Amount: 75.0, Description: "AE: Passenger Service Charge (Intl)" }, { CodeType: "TAX", TaxCode: "F6", Amount: 45.0, Description: "F6: Passenger Facilities Charge." }, { CodeType: "TAX", TaxCode: "YQ", Amount: 280.0, Description: "YQ: YQ - DUMMY" }, { CodeType: "TAX", TaxCode: "ZR", Amount: 5.0, Description: "ZR: Advanced passenger information fee" }, { CodeType: "TAX", TaxCode: "TP", Amount: 5.0, Description: "TP: Passengers Security & Safety Service Fees" } ] } ] }
                ])
            },
            {
                Key: `16087788:16087788:${returnKeyDate}`,
                Origin: "DAR", Destination: "DXB", FlightNumber: "1688",
                DepartureTime: returnDep.toISOString(), Arrivaltime: returnArr.toISOString(),
                physicalFlightsJson: JSON.stringify([
                    { Origin: "DAR", Destination: "ZNZ", DepartureTime: returnDep.toISOString(), Arrivaltime: phys3Arr.toISOString(), AirCraftType: "TMPX" },
                    { Origin: "ZNZ", Destination: "DXB", DepartureTime: phys4Dep.toISOString(), Arrivaltime: returnArr.toISOString(), AirCraftType: "73X" }
                ]),
                customersJson: JSON.stringify([
                    { AirlinePersons: [ { PersonOrgID: 246255753, FirstName: "JOHN", LastName: "DOE", PTCID: 1, FareClassCode: "R", WebFareType: "Lite", FareBasisCode: "RR6AE2", Cabin: "ECONOMY", Charges: [ { CodeType: "AIR", Amount: 580.0, Description: `FZ 1688 DAR-ZNZ ${formatForChargeDesc(returnDep)} ${formatTime(returnDep)} ${formatTime(phys3Arr)}\nFZ 1688 ZNZ-DXB ${formatForChargeDesc(returnDep)} ${formatTime(phys4Dep)} ${formatTime(returnArr)}` }, { CodeType: "TAX", TaxCode: "YQ", Amount: 280.0, Description: "YQ: YQ - DUMMY" }, { CodeType: "TAX", TaxCode: "ZR", Amount: 5.0, Description: "ZR: Advanced passenger information fee" }, { CodeType: "TAX", TaxCode: "HY", Amount: 40.0, Description: "HY: Aviation Safety Fee" }, { CodeType: "TAX", TaxCode: "TZ", Amount: 150.0, Description: "TZ: Airport Tax" }, { CodeType: "TAX", TaxCode: "M4", Amount: 20.0, Description: "M4: Security Fee" } ] } ] }
                ])
            }
        ],
        Payments: [
            { ReservationPaymentID: 185800246, PaymentAmount: 2060.0, CurrencyPaid: "AED", PaymentMethod: "TCSH", DatePaid: bookDate.toISOString(), PersonOrgID: 246255753, FirstName: "JOHN", LastName: "DOE" }
        ],
        ReservationContacts: [
            { PersonOrgID: 246255753, FirstName: "JOHN", LastName: "DOE", PTCID: 1 }
        ],
        ContactInfos: [
            { ContactID: 304356199, ContactType: 4, ContactField: "claudius.lewis@gairlines.com", PreferredContactMethod: true }
        ],
        Exceptions: [
            { ExceptionCode: 0, ExceptionDescription: "Successful Transaction" }
        ]
    };
    await new Promise(resolve => setTimeout(resolve, 250)); // Simulate network delay
    createLog('INFO', 'Successfully fetched mock reservation details', { invocationId, bookingReference });
    return mockReservationData;
};

export async function POST(request: Request) {
    const invocationId = `func-inv-${crypto.randomUUID()}`;
    try {
        const body: GetFlightDetailsRequest = await request.json();
        createLog('INFO', 'Function execution started: get_flight_details', { invocationId });
        createLog('DEBUG', 'Received event payload', { invocationId, event: body });

        const { BookingReference } = body;

        if (!BookingReference) {
            const errorDetail = "Missing required parameter. 'BookingReference' is required.";
            createLog('ERROR', 'Input validation failed', { invocationId, missingParams: { BookingReference: !BookingReference } });
            return NextResponse.json({ status: 400, error: errorDetail }, { status: 400 });
        }

        createLog('INFO', 'Input validation successful', { invocationId, BookingReference });

        const reservationDetails = await fetchReservationDetails(BookingReference, invocationId);

        createLog('INFO', 'Function execution completed successfully', { invocationId });
        return NextResponse.json(reservationDetails);

    } catch (error: any) {
        createLog('FATAL', 'An unhandled error occurred during execution', { invocationId, error: error.message, stack: error.stack });
        return NextResponse.json({ status: 500, error: "An internal error occurred." }, { status: 500 });
    }
}
