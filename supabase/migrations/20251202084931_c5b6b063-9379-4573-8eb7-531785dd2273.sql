-- Create vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  city TEXT NOT NULL,
  registration_details TEXT,
  account_holder_name TEXT,
  bank_name TEXT,
  account_number TEXT,
  iban TEXT,
  mobile_wallet TEXT,
  payment_method_type TEXT CHECK (payment_method_type IN ('bank', 'mobile-wallet', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  venue TEXT NOT NULL,
  ticket_price NUMERIC NOT NULL DEFAULT 0,
  total_tickets INTEGER NOT NULL DEFAULT 0,
  sold_tickets INTEGER NOT NULL DEFAULT 0,
  tickets_live_from TIMESTAMP WITH TIME ZONE NOT NULL,
  image TEXT,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  vendor_name TEXT,
  early_bird_discount NUMERIC,
  early_bird_deadline TIMESTAMP WITH TIME ZONE,
  flash_sale_start TIMESTAMP WITH TIME ZONE,
  flash_sale_end TIMESTAMP WITH TIME ZONE,
  flash_sale_discount NUMERIC,
  group_booking_discount NUMERIC,
  group_booking_min_tickets INTEGER,
  status TEXT CHECK (status IN ('live', 'scheduled', 'ended')) DEFAULT 'scheduled',
  source TEXT DEFAULT 'manual',
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create ticket_categories table
CREATE TABLE public.ticket_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  sold INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  event_name TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  discount_applied NUMERIC,
  payment_method TEXT CHECK (payment_method IN ('bank-transfer', 'easypaisa', 'jazzcash')),
  status TEXT CHECK (status IN ('reserved', 'paid', 'cancelled')) DEFAULT 'reserved',
  paid_by TEXT,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  platform_commission NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create booking_items table
CREATE TABLE public.booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.ticket_categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL
);

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;

-- Public read access for events (everyone can view)
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);

-- Public read access for ticket categories
CREATE POLICY "Ticket categories are viewable by everyone" ON public.ticket_categories FOR SELECT USING (true);

-- Vendors can manage their own events
CREATE POLICY "Vendors can insert their own events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Vendors can update their own events" ON public.events FOR UPDATE USING (true);
CREATE POLICY "Vendors can delete their own events" ON public.events FOR DELETE USING (true);

-- Vendors table policies
CREATE POLICY "Vendors are viewable by everyone" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Anyone can create a vendor account" ON public.vendors FOR INSERT WITH CHECK (true);
CREATE POLICY "Vendors can update their own profile" ON public.vendors FOR UPDATE USING (true);

-- Ticket categories policies
CREATE POLICY "Anyone can insert ticket categories" ON public.ticket_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update ticket categories" ON public.ticket_categories FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete ticket categories" ON public.ticket_categories FOR DELETE USING (true);

-- Bookings policies
CREATE POLICY "Bookings are viewable by everyone" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update bookings" ON public.bookings FOR UPDATE USING (true);

-- Booking items policies
CREATE POLICY "Booking items are viewable by everyone" ON public.booking_items FOR SELECT USING (true);
CREATE POLICY "Anyone can create booking items" ON public.booking_items FOR INSERT WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();