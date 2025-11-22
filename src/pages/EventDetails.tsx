import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockEvents } from "@/data/mockEvents";
import { Event, TicketCategory, Booking, BookingItem } from "@/types/event";
import { UserNavbar } from "@/components/UserNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
} from "lucide-react";
import { format, differenceInDays, isPast, isFuture } from "date-fns";
import { toast } from "sonner";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [showBooking, setShowBooking] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"bank-transfer" | "easypaisa">("easypaisa");

  // Load event from both mock events and localStorage
  useEffect(() => {
    const vendorEvents = JSON.parse(localStorage.getItem("vendorEvents") || "[]");
    const allEvents = [...mockEvents, ...vendorEvents];
    const foundEvent = allEvents.find((e) => e.id === id);
    setEvent(foundEvent || null);
  }, [id]);

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

  const hasCategories = event.ticketCategories && event.ticketCategories.length > 0;

  const updateTicketCount = (categoryId: string, change: number) => {
    setSelectedTickets(prev => {
      const current = prev[categoryId] || 0;
      const newValue = Math.max(0, current + change);
      
      // Find the category to check availability
      const category = event.ticketCategories?.find(c => c.id === categoryId);
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

  const handleContinueToBook = () => {
    if (!isLive) {
      toast.error("Tickets are not live yet!");
      return;
    }
    if (totalTicketsSelected === 0) {
      toast.error("Please select at least one ticket");
      return;
    }
    setShowBooking(true);
  };

  const handleConfirmBooking = () => {
    // Create booking items from selected tickets
    const bookingItems: BookingItem[] = [];
    
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

    // Create booking object
    const booking: Booking = {
      id: `BK${Date.now()}`,
      eventId: event.id,
      eventName: event.name,
      items: bookingItems,
      totalAmount: total,
      discountApplied: discount,
      paymentMethod,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      vendorId: event.vendorId,
    };

    // Save booking to localStorage
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    bookings.push(booking);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    // Update event ticket quantities
    const vendorEvents = JSON.parse(localStorage.getItem("vendorEvents") || "[]");
    const eventIndex = vendorEvents.findIndex((e: Event) => e.id === event.id);
    
    if (eventIndex !== -1) {
      bookingItems.forEach(item => {
        const categoryIndex = vendorEvents[eventIndex].ticketCategories?.findIndex(
          (c: TicketCategory) => c.id === item.categoryId
        );
        if (categoryIndex !== -1) {
          vendorEvents[eventIndex].ticketCategories[categoryIndex].sold += item.quantity;
        }
      });
      localStorage.setItem("vendorEvents", JSON.stringify(vendorEvents));
    }

    toast.success("Booking Confirmed!", {
      description: "Redirecting to confirmation page..."
    });
    
    setTimeout(() => navigate(`/booking-confirmation/${booking.id}`), 1000);
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
                {isLive ? (
                  <Badge className="bg-green-500 text-white border-0">Tickets are Live</Badge>
                ) : (
                  <Badge className="bg-yellow-500 text-white border-0">
                    Live in {daysUntilLive} days
                  </Badge>
                )}
                {hasFlashSale && (
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
                    <p className="text-sm text-muted-foreground">Starting from</p>
                    <p className="text-3xl font-bold text-primary">
                      Rs. {hasCategories ? Math.min(...event.ticketCategories!.map(c => c.price)) : event.ticketPrice}
                    </p>
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

                {(event.earlyBird || event.groupBooking) && (
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
                {!showBooking ? (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Book Tickets</h3>
                    
                    {/* Ticket Categories Selection with +/- buttons */}
                    {hasCategories && (
                      <div className="space-y-3">
                        <Label>Select Tickets</Label>
                        {event.ticketCategories!.map((category) => {
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
                                    <div className="flex items-center justify-between gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateTicketCount(category.id, -1)}
                                        disabled={selected === 0}
                                      >
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      <span className="font-semibold min-w-[2rem] text-center">
                                        {selected}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="sm"
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
                        })}
                      </div>
                    )}

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Tickets</span>
                        <span>{totalTicketsSelected}</span>
                      </div>
                      {Object.entries(selectedTickets).map(([categoryId, quantity]) => {
                        const category = event.ticketCategories!.find(c => c.id === categoryId);
                        if (!category || quantity === 0) return null;
                        return (
                          <div key={categoryId} className="flex justify-between text-sm text-muted-foreground">
                            <span>{category.name} × {quantity}</span>
                            <span>Rs. {(category.price * quantity).toFixed(0)}</span>
                          </div>
                        );
                      })}
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
                      disabled={!isLive || totalTicketsSelected === 0}
                    >
                      {!isLive 
                        ? `Live in ${daysUntilLive} days` 
                        : totalTicketsSelected === 0 
                        ? "Select Tickets"
                        : "Continue to Book"
                      }
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Payment Method</h3>
                    <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                      <div className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value="easypaisa" id="easypaisa" />
                        <Label htmlFor="easypaisa" className="cursor-pointer flex-1">
                          Easypaisa
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                        <Label htmlFor="bank-transfer" className="cursor-pointer flex-1">
                          Bank Transfer
                        </Label>
                      </div>
                    </RadioGroup>

                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Amount</span>
                        <span className="text-primary">Rs. {total.toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowBooking(false)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleConfirmBooking}
                        className="flex-1 bg-gradient-accent hover:opacity-90"
                      >
                        Confirm Booking
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
