-- Create promotion types enum
CREATE TYPE public.promotion_type AS ENUM ('featured', 'sponsored', 'premium');

-- Create event_promotions table
CREATE TABLE public.event_promotions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    promotion_type promotion_type NOT NULL DEFAULT 'featured',
    budget NUMERIC NOT NULL DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    views INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_promotions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Event promotions are viewable by everyone"
ON public.event_promotions
FOR SELECT
USING (true);

CREATE POLICY "Vendors can create their own promotions"
ON public.event_promotions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Vendors can update their own promotions"
ON public.event_promotions
FOR UPDATE
USING (true);

CREATE POLICY "Vendors can delete their own promotions"
ON public.event_promotions
FOR DELETE
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_event_promotions_updated_at
BEFORE UPDATE ON public.event_promotions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();