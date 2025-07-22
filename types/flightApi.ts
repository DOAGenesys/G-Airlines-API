// flight_availability_search
export interface FlightAvailabilityRequest {
    BookingReference: string;
    DepartureDate: string; // YYYY-MM-DD
}

export interface FeeWaiver {
    IsWaived: boolean;
    Reason: string | null;
}

export interface FlightChangeOption {
    // Flight details
    FlightNumber: string;
    DepartureDateTime: string; // ISO 8601
    ArrivalDateTime: string; // ISO 8601
    EconomyPrice: number;
    BusinessPrice: number;
    // Quote details
    QuoteID: string;
    FareDifference: number;
    ChangeFee: number;
    TaxesAndSurcharges: number;
    TotalDue: number;
    Currency: string;
    FeeWaiver: FeeWaiver;
}

export interface FlightAvailabilityResponse {
    AvailableFlightQuotes: FlightChangeOption[];
}

// get_ancillary_offers
export interface AncillaryOffersRequest {
    BookingReference: string;
    QuoteIDs: string; // Comma-separated
}

export interface AncillaryOffer {
    AncillaryCode: string;
    AncillaryType: 'SEAT' | 'BAGGAGE' | 'MEAL';
    Description: string;
    Price: number;
    Currency: string;
}

export interface AncillaryOffersResponse {
    AncillaryOffers: AncillaryOffer[];
}

// confirm_flight_change
export interface ConfirmFlightChangeRequest {
    BookingReference: string;
    QuoteID: string;
}

export interface ConfirmFlightChangeResponse {
    Status: 'SUCCESS' | 'FAILED';
    NewConfirmationNumber: string | null;
    Message: string;
    FinalAmountCharged: number;
    Currency: string;
}

// loyalty-redemption-options
export interface LoyaltyRedemptionRequest {
    BookingReference: string;
    QuoteID: string;
}

export interface RedemptionOption {
    RedemptionCode: string;
    OptionType: "UPGRADE" | "PAY_WITH_MILES";
    Description: string;
    MilesRequired: number;
}

export interface LoyaltyRedemptionResponse {
    MilesEarned: {
        Economy: number;
        Business: number;
    };
    RedemptionOptions: RedemptionOption[];
}


// get_flight_details
export interface GetFlightDetailsRequest {
    BookingReference: string;
}

export interface GetFlightDetailsResponse {
    BookingReference: string;
    ConfirmationNumber: string;
    BookingAgent: string;
    BookDate: string; // ISO 8601
    ReservationType: string;
    Cabin: string;
    ReservationBalance: number;
    LogicalFlightCount: number;
    ActivePassengerCount: number;
    BalancedReservation: boolean;
    ReservationCurrency: string;
    logicalFlights: {
        Key: string;
        Origin: string;
        Destination: string;
        FlightNumber: string;
        DepartureTime: string; // ISO 8601
        Arrivaltime: string; // ISO 8601
        physicalFlightsJson: string; // Stringified JSON
        customersJson: string; // Stringified JSON
    }[];
    Payments: {
        ReservationPaymentID: number;
        PaymentAmount: number;
        CurrencyPaid: string;
        PaymentMethod: string;
        DatePaid: string; // ISO 8601
        PersonOrgID: number;
        FirstName: string;
        LastName: string;
    }[];
    ReservationContacts: {
        PersonOrgID: number;
        FirstName: string;
        LastName: string;
        PTCID: number;
    }[];
    ContactInfos: {
        ContactID: number;
        ContactType: number;
        ContactField: string;
        PreferredContactMethod: boolean;
    }[];
    Exceptions: {
        ExceptionCode: number;
        ExceptionDescription: string;
    }[];
}
