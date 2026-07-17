export type PaymentStatus = 'pending' | 'under_review' | 'paid' | 'cancelled' | 'refunded';

export type RegistrationSummary = {
  registrationNumber: string;
  ticketCode: string;
  name: string;
  ticketQuantity: number;
  tickets: Array<{
    registrationNumber: string;
    ticketCode: string;
    name: string;
  }>;
  wantsShirt: boolean;
  shirtColor?: 'branca' | 'preta' | '';
  shirtSize?: string;
  shirtQuantity: number;
  wantsButton: boolean;
  buttonQuantity: number;
  wantsCup: boolean;
  cupQuantity: number;
  wantsMug: boolean;
  mugQuantity: number;
  totalAmount: number;
  recoveryToken?: string;
};

export type Ticket = {
  registration_number: string;
  name: string;
  ticket_code: string;
  payment_status: PaymentStatus;
  checked_in: boolean;
};
