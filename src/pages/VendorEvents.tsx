import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VendorNavbar } from "@/components/VendorNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Edit,
  Trash2,
  BarChart3,
  Ticket,
  DollarSign,
  Loader2,
} from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const VendorEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("vendorAuth");
    if (!auth) {
      navigate("/vendor/signin");
      return;
    }

    const vendorData = JSON.parse(auth);
    setVendor(vendorData);

    loadEvents(vendorData.id);
  }, [navigate]);

  const loadEvents = async (vendorId: string) => {
    setLoading(true);
    try {
      // Fetch vendor's events from Supabase
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('start_date', { ascending: false });

      if (eventsError) throw eventsError;

      // Fetch ticket categories for all events
      const eventIds = eventsData?.map(e => e.id) || [];
      const { data: categoriesData } = await supabase
        .from('ticket_categories')
        .select('*')
        .in('event_id', eventIds);

      // Fetch bookings for these events
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, booking_items(*)')
        .in('event_id', eventIds)
        .eq('status', 'paid');

      // Transform and calculate analytics
      const eventsWithAnalytics = (eventsData || []).map(event => {
        const eventBookings = bookingsData?.filter(b => b.event_id === event.id) || [];
        
        const soldTickets = eventBookings.reduce((sum, booking) => 
          sum + (booking.booking_items || []).reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
        );
        
        const revenue = eventBookings.reduce((sum, booking) => sum + booking.total_amount, 0);
        const organizerEarnings = revenue * 0.92;

        const ticketCategories = categoriesData?.filter(c => c.event_id === event.id).map(cat => ({
          id: cat.id,
          name: cat.name,
          price: cat.price,
          quantity: cat.quantity,
          sold: cat.sold,
          description: cat.description,
        })) || [];

        return {
          id: event.id,
          name: event.name,
          startDate: event.start_date,
          endDate: event.end_date,
          city: event.city,
          venue: event.venue,
          image: event.image,
          totalTickets: event.total_tickets,
          ticketsLiveFrom: event.tickets_live_from,
          soldTickets,
          revenue,
          organizerEarnings,
          ticketCategories,
        };
      });

      setEvents(eventsWithAnalytics);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      // Delete ticket categories first (due to foreign key)
      await supabase.from('ticket_categories').delete().eq('event_id', eventId);
      
      // Delete event
      const { error } = await supabase.from('events').delete().eq('id', eventId);
      if (error) throw error;
      
      loadEvents(vendor.id);
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const getEventStatus = (event: any) => {
    const eventEndDate = new Date(event.endDate || event.startDate);
    const ticketsLiveDate = new Date(event.ticketsLiveFrom);
    const daysUntilLive = differenceInDays(ticketsLiveDate, new Date());
    
    // Check if event has already ended
    if (isPast(eventEndDate)) {
      return { label: "Tickets Expired", variant: "destructive" as const };
    }
    
    if (isPast(ticketsLiveDate)) {
      return { label: "Tickets are Live", variant: "default" as const };
    } else {
      return { label: `Will go live in ${daysUntilLive} days`, variant: "secondary" as const };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <VendorNavbar />
      
      <div className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Events</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your listed events
            </p>
          </div>
          <Button
            onClick={() => navigate("/vendor/events/new")}
            className="bg-gradient-accent hover:opacity-90 w-full sm:w-auto"
          >
            List New Event
          </Button>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by listing your first event
              </p>
              <Button
                onClick={() => navigate("/vendor/events/new")}
                className="bg-gradient-accent hover:opacity-90"
              >
                List New Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((event) => {
              const status = getEventStatus(event);
              const soldTickets = event.soldTickets || 0;
              const revenue = event.revenue || 0;
              const organizerEarnings = revenue * 0.92;

              return (
                <Card key={event.id} className="overflow-hidden">
                  {event.image && (
                    <div className="relative h-40">
                      <img
                        src={event.image}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        variant={status.variant}
                        className="absolute top-3 left-3"
                      >
                        {status.label}
                      </Badge>
                    </div>
                  )}
                  <CardContent className={event.image ? "p-4" : "p-4 pt-6"}>
                    {!event.image && (
                      <Badge variant={status.variant} className="mb-2">
                        {status.label}
                      </Badge>
                    )}
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                      {event.name}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(event.startDate), "PPP")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.city}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Ticket className="w-3 h-3" />
                          Sold
                        </div>
                        <div className="font-bold">{soldTickets}/{event.totalTickets}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <DollarSign className="w-3 h-3" />
                          Earnings
                        </div>
                        <div className="font-bold text-primary">Rs. {organizerEarnings.toFixed(0)}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/vendor/events/edit/${event.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/vendor/events/analytics/${event.id}`)}
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this event? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(event.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorEvents;
