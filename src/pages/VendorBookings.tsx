import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VendorNavbar } from "@/components/VendorNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Booking, Event } from "@/types/event";
import { format } from "date-fns";
import { Calendar, Package, DollarSign } from "lucide-react";

const VendorBookings = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

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
    const vendorEvents = allEvents.filter((e: Event) => e.vendorId === vendorData.id);
    setEvents(vendorEvents);

    // Get vendor's bookings
    const allBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    const vendorBookings = allBookings.filter((b: Booking) => b.vendorId === vendorData.id);
    setBookings(vendorBookings);
  }, [navigate]);

  const filteredBookings = bookings.filter((booking) => {
    const eventMatch = selectedEvent === "all" || booking.eventId === selectedEvent;
    const statusMatch = statusFilter === "all" || booking.status === statusFilter;
    
    // Date filtering
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

  return (
    <div className="min-h-screen bg-gradient-hero">
      <VendorNavbar />

      <div className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">All Bookings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage all ticket bookings for your events
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredBookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tickets
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTickets}</div>
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
              <div className="text-3xl font-bold">Rs. {totalRevenue.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground mt-1">
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
                <label className="text-sm font-medium mb-2 block">Filter by Event</label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
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
                <label className="text-sm font-medium mb-2 block">Filter by Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
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
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Bookings ({filteredBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground">
                  No bookings match your current filters
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{booking.eventName}</h4>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>

                          <div className="space-y-1 text-sm mb-3">
                            <p className="text-muted-foreground">
                              Booking ID: {booking.id}
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
                                className="flex justify-between text-sm bg-muted/50 p-2 rounded"
                              >
                                <span>
                                  {item.categoryName} × {item.quantity}
                                </span>
                                <span className="font-medium">
                                  Rs. {(item.price * item.quantity).toFixed(0)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                          <p className="font-bold text-2xl text-primary">
                            Rs. {booking.totalAmount.toFixed(0)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Your earnings: Rs. {(booking.totalAmount * 0.92).toFixed(0)}
                          </p>
                          <p className="text-xs text-muted-foreground">
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
