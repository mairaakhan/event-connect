import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserNavbar } from "@/components/UserNavbar";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Ticket,
  Users,
  Zap,
  Clock,
  ArrowLeft,
  Percent,
  Plus,
  Minus,
  Gift,
  CalendarDays,
} from "lucide-react";
import { format, differenceInDays, isPast, isFuture } from "date-fns";
import { toast } from "sonner";
import type { Event, TicketCategory, Booking, BookingItem } from "@/types/event";

interface EventSchedule {
  id: string;
  dayDate: string;
  startTime: string;
  endTime: string;
}

interface TicketCategoryWithSchedule extends TicketCategory {
  scheduleId?: string;
}

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [isBooking, setIsBooking] = useState(false);
  const [eventSchedules, setEventSchedules] = useState<EventSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [sameTicketsAllDays, setSameTicketsAllDays] = useState(true);
  const [allTicketCategories, setAllTicketCategories] = useState<TicketCategoryWithSchedule[]>([]);

  // Load event from Supabase
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch event
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (eventError) throw eventError;
        
        if (!eventData) {
          setEvent(null);
          setLoading(false);
          return;
        }

        // Fetch ticket categories for this event
        const { data: categories, error: catError } = await supabase
          .from('ticket_categories')
          .select('*')
          .eq('event_id', id);

        if (catError) throw catError;

        // Fetch event schedules
        const { data: schedules } = await supabase
          .from('event_schedules')
          .select('*')
          .eq('event_id', id)
          .order('day_date', { ascending: true });

        if (schedules && schedules.length > 0) {
          const transformedSchedules = schedules.map(s => ({
            id: s.id,
            dayDate: s.day_date,
            startTime: s.start_time,
            endTime: s.end_time,
          }));
          setEventSchedules(transformedSchedules);
          // Auto-select first date if day-wise tickets
          if (!(eventData as any).same_tickets_all_days) {
            setSelectedDate(transformedSchedules[0].id);
          }
        }

        setSameTicketsAllDays((eventData as any).same_tickets_all_days !== false);

        // Store all categories with schedule info
        const allCats = categories?.map(cat => ({
          id: cat.id,
          name: cat.name,
          price: cat.price,
          quantity: cat.quantity,
          sold: cat.sold,
          description: cat.description || '',
          scheduleId: (cat as any).schedule_id || undefined,
        })) || [];
        setAllTicketCategories(allCats);

        // Transform to frontend Event type with requiresRegistration
        const transformedEvent: Event & { requiresRegistration?: boolean } = {
          id: eventData.id,
          name: eventData.name,
          description: eventData.description || '',
          startDate: eventData.start_date,
          endDate: eventData.end_date || undefined,
          category: eventData.category,
          city: eventData.city,
          venue: eventData.venue,
          ticketPrice: eventData.ticket_price,
          totalTickets: eventData.total_tickets,
          soldTickets: eventData.sold_tickets,
          ticketsLiveFrom: eventData.tickets_live_from,
          image: eventData.image || '/placeholder.svg',
          vendorId: eventData.vendor_id || undefined,
          vendorName: eventData.vendor_name || undefined,
          status: (eventData.status as 'live' | 'scheduled' | 'ended') || 'scheduled',
          requiresRegistration: (eventData as any).requires_registration || false,
          earlyBird: eventData.early_bird_discount ? {
            discount: eventData.early_bird_discount,
            deadline: eventData.early_bird_deadline || '',
          } : undefined,
          flashSale: eventData.flash_sale_discount ? {
            discount: eventData.flash_sale_discount,
            startDate: eventData.flash_sale_start || '',
            endDate: eventData.flash_sale_end || '',
          } : undefined,
          groupBooking: eventData.group_booking_discount ? {
            discount: eventData.group_booking_discount,
            minTickets: eventData.group_booking_min_tickets || 5,
          } : undefined,
          ticketCategories: allCats,
        };

        setEvent(transformedEvent);
      } catch (error) {
        console.error('Error fetching event:', error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <UserNavbar />
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const ticketsLiveDate = new Date(event.ticketsLiveFrom);
  const daysUntilLive = differenceInDays(ticketsLiveDate, new Date());
  const isLive = isPast(ticketsLiveDate);
  const hasFlashSale =
    event.flashSale &&
    isFuture(new Date(event.flashSale.endDate)) &&
    isPast(new Date(event.flashSale.startDate));

  // Filter categories based on selected date for day-wise tickets
  const displayCategories = !sameTicketsAllDays && selectedDate
    ? allTicketCategories.filter(c => c.scheduleId === selectedDate)
    : allTicketCategories.filter(c => !c.scheduleId);

  const hasCategories = displayCategories && displayCategories.length > 0;
  const availableTickets = event.totalTickets - event.soldTickets;
  const hasMultipleDays = eventSchedules.length > 0;
  const requiresDateSelection = hasMultipleDays && !sameTicketsAllDays;

  const updateTicketCount = (categoryId: string, change: number) => {
    setSelectedTickets(prev => {
      const current = prev[categoryId] || 0;
      const newValue = Math.max(0, current + change);
      
      // Find the category to check availability
      const category = displayCategories?.find(c => c.id === categoryId);
      const maxAvailable = category ? category.quantity - category.sold : 0;
      
      if (newValue > maxAvailable) {
        toast.error("Not enough tickets available");
        return prev;
      }
      
      if (newValue === 0) {
        const { [categoryId]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [categoryId]: newValue };
    });
  };

  const calculateTotal = () => {
    let price = 0;
    
    if (hasCategories) {
      Object.entries(selectedTickets).forEach(([categoryId, quantity]) => {
        const category = event.ticketCategories!.find(c => c.id === categoryId);
        if (category) {
          price += category.price * quantity;
        }
      });
    } else {
      // For events without categories, use general admission price
      const quantity = selectedTickets['general'] || 0;
      price = event.ticketPrice * quantity;
    }
    
    let discount = 0;
    const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

    if (hasFlashSale && event.flashSale) {
      discount = (price * event.flashSale.discount) / 100;
    } else if (event.earlyBird && isFuture(new Date(event.earlyBird.deadline))) {
      discount = (price * event.earlyBird.discount) / 100;
    }

    if (event.groupBooking && totalTickets >= event.groupBooking.minTickets) {
      discount = Math.max(discount, (price * event.groupBooking.discount) / 100);
    }

    return { total: price - discount, discount };
  };

  const { total, discount } = calculateTotal();
  const totalTicketsSelected = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

  const isFreeEvent = event.ticketPrice === 0 && (!hasCategories || event.ticketCategories!.every(c => c.price === 0));

  const handleContinueToBook = () => {
    if (!isLive) {
      toast.error("Tickets are not live yet!");
      return;
    }
    if (!isFreeEvent && totalTicketsSelected === 0) {
      toast.error("Please select at least one ticket");
      return;
    }
    
    // Skip payment method selection, go directly to booking confirmation
    handleConfirmBooking();
  };

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    
    try {
      // Create booking items from selected tickets
      const bookingItems: BookingItem[] = [];
      
      if (hasCategories) {
        Object.entries(selectedTickets).forEach(([categoryId, quantity]) => {
          const category = event.ticketCategories!.find(c => c.id === categoryId);
          if (category && quantity > 0) {
            bookingItems.push({
              categoryId,
              categoryName: category.name,
              quantity,
              price: category.price,
            });
          }
        });
      } else if (!isFreeEvent) {
        // Handle events without categories (general admission)
        const quantity = selectedTickets['general'] || 0;
        if (quantity > 0) {
          bookingItems.push({
            categoryId: 'general',
            categoryName: 'General Admission',
            quantity,
            price: event.ticketPrice,
          });
        }
      }

      // Create booking object
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      const platformCommission = isFreeEvent ? 0 : total * 0.08; // 8% platform commission (0 for free events)

      // Save booking to Supabase
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          event_id: event.id,
          event_name: event.name,
          total_amount: total,
          discount_applied: discount,
          payment_method: isFreeEvent ? "free" : "easypaisa",
          status: isFreeEvent ? "paid" : "reserved", // Free events are immediately "paid"
          expires_at: expiresAt.toISOString(),
          vendor_id: event.vendorId || null,
          platform_commission: platformCommission,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Save booking items to Supabase
      if (bookingItems.length > 0) {
        const itemsToInsert = bookingItems.map(item => ({
          booking_id: bookingData.id,
          category_id: item.categoryId === 'general' ? null : item.categoryId,
          category_name: item.categoryName,
          quantity: item.quantity,
          price: item.price,
        }));

        const { error: itemsError } = await supabase
          .from('booking_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      // Update ticket category sold counts in database
      if (hasCategories) {
        for (const item of bookingItems) {
          if (item.categoryId !== 'general') {
            await supabase
              .from('ticket_categories')
              .update({ sold: (event.ticketCategories!.find(c => c.id === item.categoryId)?.sold || 0) + item.quantity })
              .eq('id', item.categoryId);
          }
        }
      }

      // Update event sold_tickets count
      const totalQuantity = bookingItems.reduce((sum, item) => sum + item.quantity, 0);
      await supabase
        .from('events')
        .update({ sold_tickets: event.soldTickets + totalQuantity })
        .eq('id', event.id);

      toast.success(isFreeEvent ? "Registration Confirmed!" : "Booking Confirmed!", {
        description: "Redirecting to confirmation page..."
      });
      
      setTimeout(() => navigate(`/booking-confirmation/${bookingData.id}`), 1000);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <UserNavbar />
      
      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <img
                src={event.image}
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                {isFreeEvent && (
                  <Badge className="bg-emerald-500 text-white border-0">
                    <Gift className="w-3 h-3 mr-1" />
                    Free Event
                  </Badge>
                )}
                {isLive ? (
                  <Badge className="bg-green-500 text-white border-0">Tickets are Live</Badge>
                ) : (
                  <Badge className="bg-yellow-500 text-white border-0">
                    Live in {daysUntilLive} days
                  </Badge>
                )}
                {hasFlashSale && !isFreeEvent && (
                  <Badge className="bg-gradient-accent text-white border-0">
                    <Zap className="w-3 h-3 mr-1" />
                    Flash Sale - {event.flashSale!.discount}% OFF
                  </Badge>
                )}
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {event.category}
                    </Badge>
                    <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
                    {event.vendorName && (
                      <p className="text-muted-foreground">by {event.vendorName}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {isFreeEvent ? (
                      <Badge className="bg-emerald-500 text-white border-0 text-base px-3 py-1">
                        Free
                      </Badge>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">Starting from</p>
                        <p className="text-3xl font-bold text-primary">
                          Rs. {hasCategories ? Math.min(...event.ticketCategories!.map(c => c.price)) : event.ticketPrice}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold">{format(new Date(event.startDate), "PPP")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-semibold">{format(new Date(event.startDate), "p")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Venue</p>
                      <p className="font-semibold">{event.venue}</p>
                      <p className="text-sm text-muted-foreground">{event.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Ticket className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Availability</p>
                      <p className="font-semibold">
                        {hasCategories 
                          ? event.ticketCategories!.reduce((sum, cat) => sum + (cat.quantity - cat.sold), 0)
                          : event.totalTickets - event.soldTickets
                        } tickets left
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-xl font-bold mb-3">About This Event</h2>
                  <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                </div>

                {/* Multi-Day Schedule Display */}
                {hasMultipleDays && (
                  <div className="border-t pt-6 mt-6">
                    <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      Event Schedule
                    </h2>
                    <div className="space-y-2">
                      {eventSchedules.map((schedule) => (
                        <div 
                          key={schedule.id} 
                          className="flex justify-between items-center p-3 rounded-lg bg-muted/50"
                        >
                          <span className="font-medium">
                            {format(new Date(schedule.dayDate), "EEEE, MMMM d")}
                          </span>
                          <span className="text-muted-foreground">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isFreeEvent && (event.earlyBird || event.groupBooking) && (
                  <div className="border-t pt-6 mt-6">
                    <h2 className="text-xl font-bold mb-3">Special Offers</h2>
                    <div className="space-y-2">
                      {event.earlyBird && isFuture(new Date(event.earlyBird.deadline)) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Percent className="h-4 w-4 text-accent" />
                          <span>
                            Early Bird: {event.earlyBird.discount}% off until{" "}
                            {format(new Date(event.earlyBird.deadline), "PPP")}
                          </span>
                        </div>
                      )}
                      {event.groupBooking && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-accent" />
                          <span>
                            Group Discount: {event.groupBooking.discount}% off for{" "}
                            {event.groupBooking.minTickets}+ tickets
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">
                    {isFreeEvent ? "Register for Event" : "Book Tickets"}
                  </h3>
                  
                  {/* Free Event - Registration Options */}
                  {isFreeEvent ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="h-5 w-5 text-emerald-600" />
                          <span className="font-semibold text-emerald-800 dark:text-emerald-200">Free Event</span>
                        </div>
                        <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                          {(event as any).requiresRegistration 
                            ? "Registration is required to attend this event."
                            : "This event is free and open to everyone."
                          }
                        </p>
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-xs sm:text-sm mb-2">
                          <span>Available Spots</span>
                          <span className="font-semibold">
                            {event.totalTickets > 0 
                              ? `${event.totalTickets - event.soldTickets} of ${event.totalTickets}`
                              : 'Unlimited'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between font-bold text-base sm:text-lg pt-2 border-t">
                          <span>Price</span>
                          <span className="text-emerald-600">Free</span>
                        </div>
                      </div>

                      {(event as any).requiresRegistration ? (
                        <Button
                          onClick={() => navigate(`/event/${event.id}/register`)}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-sm sm:text-base"
                          disabled={!isLive}
                        >
                          {!isLive 
                            ? `Registration opens in ${daysUntilLive} days` 
                            : "Register for Event"
                          }
                        </Button>
                      ) : (
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground">
                            No registration required. Just show up and enjoy!
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Date Selection for day-wise tickets */}
                      {requiresDateSelection && (
                        <div className="space-y-3">
                          <Label>Select Date</Label>
                          <Select value={selectedDate} onValueChange={(val) => {
                            setSelectedDate(val);
                            setSelectedTickets({}); // Reset tickets when date changes
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a date" />
                            </SelectTrigger>
                            <SelectContent>
                              {eventSchedules.map((schedule) => (
                                <SelectItem key={schedule.id} value={schedule.id}>
                                  {format(new Date(schedule.dayDate), "EEEE, MMM d")} ({schedule.startTime} - {schedule.endTime})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Ticket Categories Selection with +/- buttons */}
                      {hasCategories ? (
                        <div className="space-y-3">
                          <Label>Select Tickets</Label>
                          {(!requiresDateSelection || selectedDate) ? (
                            displayCategories.map((category) => {
                              const available = category.quantity - category.sold;
                              const isSoldOut = available <= 0;
                              const selected = selectedTickets[category.id] || 0;
                              
                              return (
                                <Card 
                                  key={category.id}
                                  className={`${isSoldOut ? 'opacity-50' : ''}`}
                                >
                                  <CardContent className="p-4">
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <p className="font-semibold">{category.name}</p>
                                          {category.description && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                              {category.description}
                                            </p>
                                          )}
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {isSoldOut ? 'Sold Out' : `${available} available`}
                                          </p>
                                        </div>
                                        <p className="font-bold text-primary">Rs. {category.price}</p>
                                      </div>
                                      
                                      {!isSoldOut && (
                                        <div className="flex items-center justify-center gap-3">
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => updateTicketCount(category.id, -1)}
                                            disabled={selected === 0}
                                          >
                                            <Minus className="h-4 w-4" />
                                          </Button>
                                          <span className="font-bold text-lg min-w-[3rem] text-center">
                                            {selected}
                                          </span>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => updateTicketCount(category.id, 1)}
                                            disabled={selected >= available}
                                          >
                                            <Plus className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Please select a date first to see available tickets
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Label>Number of Tickets</Label>
                          <Card>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-semibold">General Admission</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {availableTickets} available
                                    </p>
                                  </div>
                                  <p className="font-bold text-primary">Rs. {event.ticketPrice}</p>
                                </div>
                                
                                <div className="flex items-center justify-center gap-3">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      const current = selectedTickets['general'] || 0;
                                      if (current > 0) {
                                        setSelectedTickets({ general: current - 1 });
                                      }
                                    }}
                                    disabled={!selectedTickets['general'] || selectedTickets['general'] === 0}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="font-bold text-lg min-w-[3rem] text-center">
                                    {selectedTickets['general'] || 0}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      const current = selectedTickets['general'] || 0;
                                      if (current < availableTickets) {
                                        setSelectedTickets({ general: current + 1 });
                                      }
                                    }}
                                    disabled={(selectedTickets['general'] || 0) >= availableTickets}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Tickets</span>
                          <span>{totalTicketsSelected}</span>
                        </div>
                        {hasCategories ? (
                          Object.entries(selectedTickets).map(([categoryId, quantity]) => {
                            const category = event.ticketCategories!.find(c => c.id === categoryId);
                            if (!category || quantity === 0) return null;
                            return (
                              <div key={categoryId} className="flex justify-between text-sm text-muted-foreground">
                                <span>{category.name} × {quantity}</span>
                                <span>Rs. {(category.price * quantity).toFixed(0)}</span>
                              </div>
                            );
                          })
                        ) : (
                          selectedTickets['general'] > 0 && (
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>General Admission × {selectedTickets['general']}</span>
                              <span>Rs. {(event.ticketPrice * selectedTickets['general']).toFixed(0)}</span>
                            </div>
                          )
                        )}
                        {discount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount</span>
                            <span>- Rs. {discount.toFixed(0)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                          <span>Total</span>
                          <span className="text-primary">Rs. {total.toFixed(0)}</span>
                        </div>
                      </div>

                      <Button
                        onClick={handleContinueToBook}
                        className="w-full bg-gradient-accent hover:opacity-90"
                        disabled={!isLive || isBooking}
                      >
                        {isBooking ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Booking...
                          </>
                        ) : !isLive 
                          ? `Live in ${daysUntilLive} days` 
                          : totalTicketsSelected === 0 
                          ? "Select Tickets First"
                          : "Continue to Book"
                        }
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
