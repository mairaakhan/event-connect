import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { VendorNavbar } from "@/components/VendorNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Booking, Event, BookingItem } from "@/types/event";
import { format } from "date-fns";
import { Calendar, Package, DollarSign, Loader2 } from "lucide-react";

const VendorBookings = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("vendorAuth");
    if (!auth) {
      navigate("/vendor/signin");
      return;
    }

    const vendorData = JSON.parse(auth);
    setVendor(vendorData);
    fetchData(vendorData.id);
  }, [navigate]);

  const fetchData = async (vendorId: string) => {
    setLoading(true);
    try {
      // Fetch vendor's events from Supabase
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('vendor_id', vendorId);

      if (eventsError) throw eventsError;

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
      }));
      setEvents(transformedEvents);

      // Fetch bookings with items for vendor's events
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          booking_items(*)
        `)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      const transformedBookings: Booking[] = (bookingsData || []).map(b => ({
        id: b.id,
        eventId: b.event_id,
        eventName: b.event_name,
        items: (b.booking_items || []).map((item: any) => ({
          categoryId: item.category_id || 'general',
          categoryName: item.category_name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: b.total_amount,
        discountApplied: b.discount_applied || 0,
        paymentMethod: b.payment_method as 'bank-transfer' | 'easypaisa' | 'jazzcash',
        status: b.status as 'reserved' | 'paid' | 'cancelled',
        createdAt: b.created_at,
        expiresAt: b.expires_at,
        paidBy: b.paid_by || undefined,
        vendorId: b.vendor_id || undefined,
        platformCommission: b.platform_commission,
      }));
      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const eventMatch = selectedEvent === "all" || booking.eventId === selectedEvent;
    const statusMatch = statusFilter === "all" || booking.status === statusFilter;
    
    const bookingDate = new Date(booking.createdAt);
    const dateMatch = (!startDate || bookingDate >= new Date(startDate)) && 
                      (!endDate || bookingDate <= new Date(endDate + "T23:59:59"));
    
    return eventMatch && statusMatch && dateMatch;
  });

  const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalTickets = filteredBookings.reduce(
    (sum, b) => sum + b.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "reserved":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <VendorNavbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <VendorNavbar />

      <div className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">All Bookings</h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
            Manage all ticket bookings for your events
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Bookings
              </CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">{filteredBookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Tickets
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">{totalTickets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">Rs. {totalRevenue.toFixed(0)}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Your earnings: Rs. {(totalRevenue * 0.92).toFixed(0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="pt-4 sm:pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex-1">
                <label className="text-xs sm:text-sm font-medium mb-2 block">Filter by Event</label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="All Events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-xs sm:text-sm font-medium mb-2 block">Filter by Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-xs sm:text-sm font-medium mb-2 block">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="flex-1">
                <label className="text-xs sm:text-sm font-medium mb-2 block">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg lg:text-xl">
              Bookings ({filteredBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Package className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No bookings found</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  No bookings match your current filters
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-semibold text-sm sm:text-base truncate">{booking.eventName}</h4>
                            <Badge className={`${getStatusColor(booking.status)} text-[10px] sm:text-xs`}>
                              {booking.status}
                            </Badge>
                          </div>

                          <div className="space-y-1 text-[10px] sm:text-xs lg:text-sm mb-3">
                            <p className="text-muted-foreground truncate">
                              Booking ID: {booking.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-muted-foreground">
                              Booked: {format(new Date(booking.createdAt), "PPP 'at' p")}
                            </p>
                            {booking.status === "reserved" && (
                              <p className="text-yellow-600 font-medium">
                                Expires: {format(new Date(booking.expiresAt), "PPP 'at' p")}
                              </p>
                            )}
                            {booking.paidBy && (
                              <p className="text-muted-foreground">
                                Paid by: {booking.paidBy}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1">
                            {booking.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-[10px] sm:text-xs lg:text-sm bg-muted/50 p-2 rounded"
                              >
                                <span className="truncate mr-2">
                                  {item.categoryName} × {item.quantity}
                                </span>
                                <span className="font-medium flex-shrink-0">
                                  Rs. {(item.price * item.quantity).toFixed(0)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Total Amount</p>
                          <p className="font-bold text-lg sm:text-xl lg:text-2xl text-primary">
                            Rs. {booking.totalAmount.toFixed(0)}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                            Your earnings: Rs. {(booking.totalAmount * 0.92).toFixed(0)}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            Platform fee: Rs. {(booking.totalAmount * 0.08).toFixed(0)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorBookings;
