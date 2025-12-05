-- Create event_schedules table for multi-day events with different timings per day
CREATE TABLE public.event_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add requires_registration column to events table
ALTER TABLE public.events ADD COLUMN requires_registration BOOLEAN DEFAULT false;

-- Enable Row Level Security
ALTER TABLE public.event_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Event schedules are viewable by everyone" 
ON public.event_schedules 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert event schedules" 
ON public.event_schedules 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update event schedules" 
ON public.event_schedules 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete event schedules" 
ON public.event_schedules 
FOR DELETE 
USING (true);