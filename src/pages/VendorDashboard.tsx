import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VendorNavbar } from "@/components/VendorNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Ticket, TrendingUp } from "lucide-react";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const auth = localStorage.getItem("vendorAuth");
    if (!auth) {
      navigate("/vendor/signin");
      return;
    }
    
    const vendorData = JSON.parse(auth);
    setVendor(vendorData);

    // Get vendor's events
    const allEvents = JSON.parse(localStorage.getItem("vendorEvents") || "[]");
    const vendorEvents = allEvents.filter((e: any) => e.vendorId === vendorData.id);
    setEvents(vendorEvents);
  }, [navigate]);

  const totalEvents = events.length;
  
  // Calculate total tickets sold across all categories
  const totalTicketsSold = events.reduce((sum, e) => {
    if (e.ticketCategories && e.ticketCategories.length > 0) {
      return sum + e.ticketCategories.reduce((catSum: number, cat: any) => catSum + (cat.sold || 0), 0);
    }
    return sum + (e.soldTickets || 0);
  }, 0);

  // Calculate total revenue (92% after 8% commission)
  const totalRevenue = events.reduce((sum, e) => {
    if (e.ticketCategories && e.ticketCategories.length > 0) {
      const eventRevenue = e.ticketCategories.reduce((catSum: number, cat: any) => {
        return catSum + ((cat.sold || 0) * cat.price * 0.92);
      }, 0);
      return sum + eventRevenue;
    }
    const sold = e.soldTickets || 0;
    const revenue = sold * e.ticketPrice * 0.92;
    return sum + revenue;
  }, 0);

  // Calculate total tickets available
  const totalTicketsAvailable = events.reduce((sum, e) => {
    if (e.ticketCategories && e.ticketCategories.length > 0) {
      return sum + e.ticketCategories.reduce((catSum: number, cat: any) => catSum + cat.quantity, 0);
    }
    return sum + e.totalTickets;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <VendorNavbar />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {vendor?.organizationName}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your event performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                Revenue (After Commission)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                Rs. {totalRevenue.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                92% of total sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Performance
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {totalTicketsAvailable > 0 
                  ? ((totalTicketsSold / totalTicketsAvailable) * 100).toFixed(0)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg. ticket sales
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Events with Categories Breakdown */}
        {events.some(e => e.ticketCategories && e.ticketCategories.length > 0) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ticket Categories Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {events.filter(e => e.ticketCategories && e.ticketCategories.length > 0).map(event => (
                  <div key={event.id} className="border-b pb-4 last:border-0">
                    <h3 className="font-semibold mb-3">{event.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {event.ticketCategories.map((cat: any) => (
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
