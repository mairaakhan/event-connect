-- Add day_id to ticket_categories for day-wise ticket support
ALTER TABLE public.ticket_categories ADD COLUMN IF NOT EXISTS schedule_id uuid REFERENCES public.event_schedules(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_ticket_categories_schedule_id ON public.ticket_categories(schedule_id);

-- Add same_tickets_all_days flag to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS same_tickets_all_days boolean DEFAULT true;