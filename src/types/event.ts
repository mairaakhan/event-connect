export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description?: string;
}

export interface EventPromotion {
  id: string;
  eventId: string;
  vendorId: string;
  promotionType: 'featured' | 'sponsored' | 'premium';
  budget: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  views: number;
  clicks: number;
  createdAt: string;
}

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
  ticketCategories?: TicketCategory[];
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
  promotion?: EventPromotion;
}

export interface Vendor {
  id: string;
  organizationName: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  registrationDetails?: string;
  paymentDetails?: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    iban?: string;
    mobileWallet?: string;
    paymentMethodType: 'bank' | 'mobile-wallet' | 'both';
  };
}

export interface BookingItem {
  categoryId: string;
  categoryName: string;
  quantity: number;
  price: number;
}

export interface Booking {
  id: string;
  eventId: string;
  eventName: string;
  items: BookingItem[];
  totalAmount: number;
  discountApplied?: number;
  paymentMethod: 'bank-transfer' | 'easypaisa' | 'jazzcash';
  status: 'reserved' | 'paid' | 'cancelled';
  createdAt: string;
  expiresAt: string; // 24 hour timeout
  paidBy?: string; // user email/name who paid
  vendorId?: string;
  platformCommission: number; // 8%
}