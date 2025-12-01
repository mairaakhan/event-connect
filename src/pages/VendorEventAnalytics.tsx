import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { VendorNavbar } from "@/components/VendorNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, DollarSign, Ticket, TrendingUp, Share2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const VendorEventAnalytics = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    const auth = localStorage.getItem("vendorAuth");
    if (!auth) {
      navigate("/vendor/signin");
      return;
    }

    const vendorData = JSON.parse(auth);
    const events = JSON.parse(localStorage.getItem("vendorEvents") || "[]");
    const foundEvent = events.find((e: any) => e.id === id && e.vendorId === vendorData.id);
    
    if (foundEvent) {
      // Calculate real-time analytics from PAID bookings only for THIS vendor's event
      const allBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
      const eventBookings = allBookings.filter(
        (b: any) => b.eventId === foundEvent.id && b.vendorId === vendorData.id && b.status === 'paid'
      );
      
      const totalSold = eventBookings.reduce((sum: number, booking: any) => 
        sum + booking.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
      );
      
      const revenue = eventBookings.reduce((sum: number, booking: any) => sum + booking.totalAmount, 0);
      
      // Update ticket categories with sold counts
      let updatedEvent = { ...foundEvent, soldTickets: totalSold, revenue };
      
      if (foundEvent.ticketCategories && foundEvent.ticketCategories.length > 0) {
        const updatedCategories = foundEvent.ticketCategories.map((category: any) => {
          const soldCount = eventBookings.reduce((sum: number, booking: any) => {
            const categoryItem = booking.items.find((item: any) => item.categoryId === category.id);
            return sum + (categoryItem?.quantity || 0);
          }, 0);
          
          return { ...category, sold: soldCount };
        });
        
        updatedEvent = { ...updatedEvent, ticketCategories: updatedCategories };
      }
      
      setEvent(updatedEvent);
    } else {
      navigate("/vendor/events");
    }
  }, [navigate, id]);

  if (!event) return null;

  const soldTickets = event.soldTickets || 0;
  const totalRevenue = event.revenue || 0;
  const revenueAfterCommission = totalRevenue * 0.92;
  const commission = totalRevenue * 0.08;
  
  const totalTickets = event.ticketCategories && event.ticketCategories.length > 0
    ? event.ticketCategories.reduce((sum: number, cat: any) => sum + cat.quantity, 0)
    : event.totalTickets;
  
  const salesPercentage = ((soldTickets / totalTickets) * 100).toFixed(1);

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
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{event.name}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {event.city} • {format(new Date(event.startDate), "PPP")}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rs. {totalRevenue.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Before commission
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Your Earnings
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  Rs. {revenueAfterCommission.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  After 8% commission
                </p>
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
                <div className="text-2xl font-bold">{soldTickets}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  of {event.totalTickets} available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sales Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesPercentage}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Conversion rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Event Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <p className="font-semibold capitalize">{event.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Venue</p>
                  <p className="font-semibold">{event.venue}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Tickets</p>
                  <p className="font-semibold">{totalTickets}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="font-semibold capitalize">{event.status}</p>
                </div>
              </div>

              {(event.earlyBird || event.flashSale || event.groupBooking) && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Active Promotions</h4>
                  <div className="space-y-2">
                    {event.earlyBird && (
                      <p className="text-sm">
                        • Early Bird: {event.earlyBird.discount}% off
                      </p>
                    )}
                    {event.flashSale && (
                      <p className="text-sm">
                        • Flash Sale: {event.flashSale.discount}% off
                      </p>
                    )}
                    {event.groupBooking && (
                      <p className="text-sm">
                        • Group Discount: {event.groupBooking.discount}% off for{" "}
                        {event.groupBooking.minTickets}+ tickets
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Breakdown */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Financial Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span>Gross Revenue</span>
                  <span className="font-semibold">Rs. {totalRevenue.toFixed(0)}</span>
                </div>
                <div className="flex justify-between py-2 border-t">
                  <span>Platform Commission (8%)</span>
                  <span className="font-semibold text-destructive">
                    - Rs. {commission.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t font-bold text-lg">
                  <span>Net Revenue</span>
                  <span className="text-green-600">Rs. {revenueAfterCommission.toFixed(0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>Social Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleShare}
                className="bg-gradient-accent hover:opacity-90"
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
