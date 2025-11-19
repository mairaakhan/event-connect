export interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  category: string;
  city: string;
  venue: string;
  ticketPrice: number;
  totalTickets: number;
  soldTickets: number;
  ticketsLiveFrom: string;
  image: string;
  vendorId?: string;
  vendorName?: string;
  earlyBird?: {
    discount: number;
    deadline: string;
  };
  flashSale?: {
    startDate: string;
    endDate: string;
    discount: number;
  };
  groupBooking?: {
    discount: number;
    minTickets: number;
  };
  status: 'live' | 'scheduled' | 'ended';
}

export interface Vendor {
  id: string;
  organizationName: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  registrationDetails?: string;
}

export interface Booking {
  id: string;
  eventId: string;
  tickets: number;
  totalAmount: number;
  discountApplied?: number;
  paymentMethod: 'bank-transfer' | 'easypaisa';
  status: 'pending' | 'confirmed';
  createdAt: string;
}
