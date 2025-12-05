import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { VendorNavbar } from "@/components/VendorNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, DollarSign, Ticket, TrendingUp, Share2, Gift, Info } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const VendorEventAnalytics = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("vendorAuth");
    if (!auth) {
      navigate("/vendor/signin");
      return;
    }

    const vendorData = JSON.parse(auth);
    loadEventAnalytics(vendorData.id);
  }, [navigate, id]);

  const loadEventAnalytics = async (vendorId: string) => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Fetch event from Supabase
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('vendor_id', vendorId)
        .maybeSingle();

      if (eventError) throw eventError;

      if (!eventData) {
        toast.error("Event not found");
        navigate("/vendor/events");
        return;
      }

      // Fetch ticket categories
      const { data: categories } = await supabase
        .from('ticket_categories')
        .select('*')
        .eq('event_id', id);

      // Fetch paid bookings for this event
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, booking_items(*)')
        .eq('event_id', id)
        .eq('status', 'paid');

      // Calculate analytics
      const totalSold = (bookings || []).reduce((sum, booking) => 
        sum + (booking.booking_items || []).reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
      );
      
      const revenue = (bookings || []).reduce((sum, booking) => sum + Number(booking.total_amount), 0);

      // Update ticket categories with sold counts
      const ticketCategories = (categories || []).map((cat) => {
        const soldCount = (bookings || []).reduce((sum, booking) => {
          const categoryItem = (booking.booking_items || []).find((item: any) => item.category_id === cat.id);
          return sum + (categoryItem?.quantity || 0);
        }, 0);
        
        return {
          id: cat.id,
          name: cat.name,
          price: cat.price,
          quantity: cat.quantity,
          sold: soldCount,
          description: cat.description,
        };
      });

      setEvent({
        ...eventData,
        startDate: eventData.start_date,
        endDate: eventData.end_date,
        ticketPrice: eventData.ticket_price,
        totalTickets: eventData.total_tickets,
        soldTickets: totalSold,
        revenue,
        ticketCategories,
        earlyBird: eventData.early_bird_discount ? {
          discount: eventData.early_bird_discount,
          deadline: eventData.early_bird_deadline,
        } : undefined,
        flashSale: eventData.flash_sale_discount ? {
          discount: eventData.flash_sale_discount,
          startDate: eventData.flash_sale_start,
          endDate: eventData.flash_sale_end,
        } : undefined,
        groupBooking: eventData.group_booking_discount ? {
          discount: eventData.group_booking_discount,
          minTickets: eventData.group_booking_min_tickets,
        } : undefined,
      });
    } catch (error) {
      console.error('Error loading event analytics:', error);
      toast.error('Failed to load event analytics');
      navigate("/vendor/events");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) return null;

  const isFreeEvent = Number(event.ticket_price || event.ticketPrice) === 0;
  const soldTickets = event.soldTickets || 0;
  const totalRevenue = event.revenue || 0;
  const revenueAfterCommission = totalRevenue * 0.92;
  const commission = totalRevenue * 0.08;
  
  const totalTickets = event.ticketCategories && event.ticketCategories.length > 0
    ? event.ticketCategories.reduce((sum: number, cat: any) => sum + cat.quantity, 0)
    : event.total_tickets || event.totalTickets;
  
  const salesPercentage = totalTickets > 0 ? ((soldTickets / totalTickets) * 100).toFixed(1) : "0";

  const handleShare = () => {
    const url = `${window.location.origin}/event/${event.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Event link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <VendorNavbar />
      
      <div className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/vendor/events")}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <div className="max-w-5xl">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{event.name}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {event.city} • {format(new Date(event.startDate || event.start_date), "PPP")}
              </p>
            </div>
            {isFreeEvent && (
              <Badge className="bg-emerald-500 text-white border-0 w-fit">
                <Gift className="w-3 h-3 mr-1" />
                Free Event
              </Badge>
            )}
          </div>

          {/* Free Event Notice */}
          {isFreeEvent ? (
            <Card className="mb-6 sm:mb-8 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                      Free Event - No Revenue Analytics
                    </h3>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      This is a free event without ticket sales. Revenue analytics are not available for free events. 
                      You can still track registrations and share your event link.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Stats Grid - Only for paid events */
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-lg sm:text-2xl font-bold">Rs. {totalRevenue.toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Before commission
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Your Earnings
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    Rs. {revenueAfterCommission.toFixed(0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    After 8% commission
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Tickets Sold
                  </CardTitle>
                  <Ticket className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{soldTickets}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    of {totalTickets} available
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Sales Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{salesPercentage}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Conversion rate
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Registration Stats for Free Events */}
          {isFreeEvent && (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Registrations
                  </CardTitle>
                  <Ticket className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{soldTickets}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalTickets > 0 ? `of ${totalTickets} capacity` : 'Unlimited capacity'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Registration Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{salesPercentage}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Of total capacity
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Event Details */}
          <Card className="mb-6">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Category</p>
                  <p className="font-semibold capitalize text-sm sm:text-base">{event.category}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Venue</p>
                  <p className="font-semibold text-sm sm:text-base">{event.venue}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    {isFreeEvent ? 'Total Capacity' : 'Total Tickets'}
                  </p>
                  <p className="font-semibold text-sm sm:text-base">
                    {totalTickets > 0 ? totalTickets : 'Unlimited'}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Status</p>
                  <p className="font-semibold capitalize text-sm sm:text-base">{event.status}</p>
                </div>
              </div>

              {!isFreeEvent && (event.earlyBird || event.flashSale || event.groupBooking) && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Active Promotions</h4>
                  <div className="space-y-2">
                    {event.earlyBird && (
                      <p className="text-xs sm:text-sm">
                        • Early Bird: {event.earlyBird.discount}% off
                      </p>
                    )}
                    {event.flashSale && (
                      <p className="text-xs sm:text-sm">
                        • Flash Sale: {event.flashSale.discount}% off
                      </p>
                    )}
                    {event.groupBooking && (
                      <p className="text-xs sm:text-sm">
                        • Group Discount: {event.groupBooking.discount}% off for{" "}
                        {event.groupBooking.minTickets}+ tickets
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Breakdown - Only for paid events */}
          {!isFreeEvent && (
            <Card className="mb-6">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Financial Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 text-sm sm:text-base">
                    <span>Gross Revenue</span>
                    <span className="font-semibold">Rs. {totalRevenue.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t text-sm sm:text-base">
                    <span>Platform Commission (8%)</span>
                    <span className="font-semibold text-destructive">
                      - Rs. {commission.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-t font-bold text-base sm:text-lg">
                    <span>Net Revenue</span>
                    <span className="text-green-600">Rs. {revenueAfterCommission.toFixed(0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Sharing */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Social Sharing</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <Button
                onClick={handleShare}
                className="bg-gradient-accent hover:opacity-90 w-full sm:w-auto"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Event Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VendorEventAnalytics;
