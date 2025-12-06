import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/event';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;

      // Transform database format to frontend format
      const transformedEvents: Event[] = (data || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        description: e.description || '',
        startDate: e.start_date,
        endDate: e.end_date,
        category: e.category,
        city: e.city,
        venue: e.venue,
        ticketPrice: Number(e.ticket_price),
        totalTickets: e.total_tickets,
        soldTickets: e.sold_tickets,
        ticketsLiveFrom: e.tickets_live_from,
        image: e.image || '',
        vendorId: e.vendor_id,
        vendorName: e.vendor_name,
        status: e.status as 'live' | 'scheduled' | 'ended',
        earlyBird: e.early_bird_discount ? {
          discount: Number(e.early_bird_discount),
          deadline: e.early_bird_deadline,
        } : undefined,
        flashSale: e.flash_sale_start ? {
          startDate: e.flash_sale_start,
          endDate: e.flash_sale_end,
          discount: Number(e.flash_sale_discount),
        } : undefined,
        groupBooking: e.group_booking_discount ? {
          discount: Number(e.group_booking_discount),
          minTickets: e.group_booking_min_tickets,
        } : undefined,
      }));

      setEvents(transformedEvents);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, error, refetch: fetchEvents };
};

export const useVendorEvents = (vendorId: string | undefined) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database format to frontend format
      const transformedEvents: Event[] = (data || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        description: e.description || '',
        startDate: e.start_date,
        endDate: e.end_date,
        category: e.category,
        city: e.city,
        venue: e.venue,
        ticketPrice: Number(e.ticket_price),
        totalTickets: e.total_tickets,
        soldTickets: e.sold_tickets,
        ticketsLiveFrom: e.tickets_live_from,
        image: e.image || '',
        vendorId: e.vendor_id,
        vendorName: e.vendor_name,
        status: e.status as 'live' | 'scheduled' | 'ended',
        earlyBird: e.early_bird_discount ? {
          discount: Number(e.early_bird_discount),
          deadline: e.early_bird_deadline,
        } : undefined,
        flashSale: e.flash_sale_start ? {
          startDate: e.flash_sale_start,
          endDate: e.flash_sale_end,
          discount: Number(e.flash_sale_discount),
        } : undefined,
        groupBooking: e.group_booking_discount ? {
          discount: Number(e.group_booking_discount),
          minTickets: e.group_booking_min_tickets,
        } : undefined,
      }));

      setEvents(transformedEvents);
    } catch (err: any) {
      console.error('Error fetching vendor events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [vendorId]);

  return { events, loading, error, refetch: fetchEvents };
};

export const createEvent = async (event: any, vendorId: string, vendorName: string) => {
  const { data, error } = await supabase
    .from('events')
    .insert({
      name: event.name,
      description: event.description,
      start_date: event.startDate,
      end_date: event.endDate || null,
      category: event.category,
      city: event.city,
      venue: event.venue,
      ticket_price: event.ticketPrice,
      total_tickets: event.totalTickets,
      sold_tickets: 0,
      tickets_live_from: event.ticketsLiveFrom,
      image: event.image || null,
      vendor_id: vendorId,
      vendor_name: vendorName,
      status: event.status,
      requires_registration: event.requiresRegistration || false,
      same_tickets_all_days: event.sameTicketsAllDays !== false,
      early_bird_discount: event.earlyBird?.discount || null,
      early_bird_deadline: event.earlyBird?.deadline || null,
      flash_sale_start: event.flashSale?.startDate || null,
      flash_sale_end: event.flashSale?.endDate || null,
      flash_sale_discount: event.flashSale?.discount || null,
      group_booking_discount: event.groupBooking?.discount || null,
      group_booking_min_tickets: event.groupBooking?.minTickets || null,
      source: 'manual',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEvent = async (eventId: string, event: any) => {
  const { data, error } = await supabase
    .from('events')
    .update({
      name: event.name,
      description: event.description,
      start_date: event.startDate,
      end_date: event.endDate || null,
      category: event.category,
      city: event.city,
      venue: event.venue,
      ticket_price: event.ticketPrice,
      total_tickets: event.totalTickets,
      tickets_live_from: event.ticketsLiveFrom,
      image: event.image || null,
      status: event.status,
      requires_registration: event.requiresRegistration || false,
      same_tickets_all_days: event.sameTicketsAllDays !== false,
      early_bird_discount: event.earlyBird?.discount || null,
      early_bird_deadline: event.earlyBird?.deadline || null,
      flash_sale_start: event.flashSale?.startDate || null,
      flash_sale_end: event.flashSale?.endDate || null,
      flash_sale_discount: event.flashSale?.discount || null,
      group_booking_discount: event.groupBooking?.discount || null,
      group_booking_min_tickets: event.groupBooking?.minTickets || null,
    })
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEvent = async (eventId: string) => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) throw error;
};
