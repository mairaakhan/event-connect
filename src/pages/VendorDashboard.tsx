import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VendorNavbar } from "@/components/VendorNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Ticket, Loader2 } from "lucide-react";
import { Event, Booking } from "@/types/event";
import { SalesAnalyticsChart } from "@/components/SalesAnalyticsChart";
import { supabase } from "@/integrations/supabase/client";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("vendorAuth");
    if (!auth) {
      navigate("/vendor/signin");
      return;
    }
    
    const vendorData = JSON.parse(auth);
    setVendor(vendorData);

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch vendor's events from Supabase
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('vendor_id', vendorData.id)
          .order('start_date', { ascending: false });

        if (eventsError) throw eventsError;

        // Fetch ticket categories for all events
        const eventIds = eventsData?.map(e => e.id) || [];
        const { data: categoriesData } = await supabase
          .from('ticket_categories')
          .select('*')
          .in('event_id', eventIds);

        // Fetch bookings for vendor's events
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*, booking_items(*)')
          .in('event_id', eventIds)
          .eq('status', 'paid');

        if (bookingsError) throw bookingsError;

        // Transform events data
        const transformedEvents: Event[] = (eventsData || []).map(e => ({
          id: e.id,
          name: e.name,
          description: e.description || '',
          startDate: e.start_date,
          endDate: e.end_date || undefined,
          category: e.category,
          city: e.city,
          venue: e.venue,
          ticketPrice: e.ticket_price,
          totalTickets: e.total_tickets,
          soldTickets: e.sold_tickets,
          ticketsLiveFrom: e.tickets_live_from,
          image: e.image || '/placeholder.svg',
          vendorId: e.vendor_id || undefined,
          vendorName: e.vendor_name || undefined,
          status: (e.status as 'live' | 'scheduled' | 'ended') || 'scheduled',
          ticketCategories: categoriesData?.filter(c => c.event_id === e.id).map(cat => ({
            id: cat.id,
            name: cat.name,
            price: cat.price,
            quantity: cat.quantity,
            sold: cat.sold,
            description: cat.description || '',
          })) || [],
        }));

        // Transform bookings data
        const transformedBookings: Booking[] = (bookingsData || []).map(b => ({
          id: b.id,
          eventId: b.event_id,
          eventName: b.event_name,
          items: (b.booking_items || []).map((item: any) => ({
            categoryId: item.category_id,
            categoryName: item.category_name,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: b.total_amount,
          discountApplied: b.discount_applied || 0,
          paymentMethod: (b.payment_method as 'bank-transfer' | 'easypaisa' | 'jazzcash') || 'easypaisa',
          status: (b.status as 'reserved' | 'paid' | 'cancelled') || 'reserved',
          createdAt: b.created_at,
          expiresAt: b.expires_at,
          vendorId: b.vendor_id || undefined,
          platformCommission: b.platform_commission,
        }));

        setEvents(transformedEvents);
        setBookings(transformedBookings);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const totalEvents = events.length;
  
  // Calculate from bookings
  const totalTicketsSold = bookings.reduce((sum, booking) => 
    sum + booking.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const platformCommission = totalRevenue * 0.08;
  const organizerEarnings = totalRevenue * 0.92;

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
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome, {vendor?.organizationName}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Here's an overview of your event performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tickets Sold
              </CardTitle>
              <Ticket className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTicketsSold}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                Rs. {totalRevenue.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your earnings: Rs. {organizerEarnings.toFixed(0)} (92%) • Platform: Rs. {platformCommission.toFixed(0)} (8%)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Analytics Chart */}
        <div className="mb-6 sm:mb-8">
          <SalesAnalyticsChart events={events} bookings={bookings} />
        </div>

        {/* Events with Categories Breakdown */}
        {events.some(e => e.ticketCategories && e.ticketCategories.length > 0) && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle>Ticket Categories Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {events.filter(e => e.ticketCategories && e.ticketCategories.length > 0).map(event => (
                  <div key={event.id} className="border-b pb-4 last:border-0">
                    <h3 className="font-semibold mb-3">{event.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {event.ticketCategories!.map((cat) => (
                        <Card key={cat.id}>
                          <CardContent className="p-4">
                            <p className="font-medium">{cat.name}</p>
                            <p className="text-sm text-muted-foreground">Rs. {cat.price}</p>
                            <div className="mt-2 flex justify-between text-sm">
                              <span className="text-green-600">Sold: {cat.sold || 0}</span>
                              <span className="text-muted-foreground">Left: {cat.quantity - (cat.sold || 0)}</span>
                            </div>
                            <div className="mt-1 w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${((cat.sold || 0) / cat.quantity) * 100}%` }}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button
              onClick={() => navigate("/vendor/events/new")}
              className="bg-gradient-accent hover:opacity-90"
            >
              List New Event
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/vendor/events")}
            >
              View All Events
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboard;
