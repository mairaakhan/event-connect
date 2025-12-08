import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserNavbar } from "@/components/UserNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle, Gift, Calendar, MapPin, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { TicketDownloadCard } from "@/components/ui/ticket-confirmation-card";
import type { Event } from "@/types/event";

const FreeEventRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data: eventData, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        
        if (eventData) {
          setEvent({
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
          });
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!event) return;

    setIsSubmitting(true);

    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

      // Create booking/registration
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          event_id: event.id,
          event_name: event.name,
          total_amount: 0,
          discount_applied: 0,
          payment_method: null,
          status: "paid",
          expires_at: expiresAt.toISOString(),
          vendor_id: event.vendorId || null,
          platform_commission: 0,
          paid_by: fullName.trim(),
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create a booking item for free registration
      const { error: itemsError } = await supabase
        .from('booking_items')
        .insert({
          booking_id: bookingData.id,
          category_id: null,
          category_name: 'Free Registration',
          quantity: 1,
          price: 0,
        });

      if (itemsError) throw itemsError;

      // Update event registration count
      await supabase
        .from('events')
        .update({ sold_tickets: event.soldTickets + 1 })
        .eq('id', event.id);

      setBookingId(bookingData.id);
      setRegistrationComplete(true);
      toast.success("Registration successful!");
    } catch (error) {
      console.error('Error creating registration:', error);
      toast.error("Failed to complete registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Event Not Found</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleDownloadTicket = async () => {
    if (!ticketRef.current) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `registration-${bookingId}.png`;
          link.click();
          URL.revokeObjectURL(url);
          
          toast.success("Pass downloaded!", {
            description: "Your registration pass has been saved."
          });
        }
      });
    } catch (error) {
      toast.error("Failed to download pass");
      console.error(error);
    }
  };

  const handleShareEvent = async () => {
    const shareData = {
      title: `Registration for ${event?.name}`,
      text: `I just registered for ${event?.name}!`,
      url: window.location.origin + `/event/${event?.id}`,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Event link copied to clipboard!");
      }
    } catch (error) {
      // User cancelled share or error occurred, copy to clipboard as fallback
      await navigator.clipboard.writeText(shareData.url);
      toast.success("Event link copied to clipboard!");
    }
  };

  if (registrationComplete && bookingId && event) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <UserNavbar />
        <div className="container py-6 sm:py-8 px-4 sm:px-6">
          <Card className="max-w-lg mx-auto">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-500" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Registration Confirmed!</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                You have successfully registered for <span className="font-semibold">{event.name}</span>
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left space-y-2">
                <p className="text-sm"><strong>Name:</strong> {fullName}</p>
                <p className="text-sm"><strong>Event:</strong> {event.name}</p>
                <p className="text-sm"><strong>Date:</strong> {format(new Date(event.startDate), "PPP 'at' p")}</p>
                <p className="text-sm"><strong>Venue:</strong> {event.venue}, {event.city}</p>
                <p className="text-sm"><strong>Registration ID:</strong> {bookingId.slice(0, 8).toUpperCase()}</p>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleDownloadTicket}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Pass
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleShareEvent}
                  className="w-full"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Event
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  Back to Events
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hidden Ticket for Download */}
          <div className="fixed left-[-9999px] top-0">
            <TicketDownloadCard
              ref={ticketRef}
              ticketId={bookingId}
              eventName={event.name}
              eventDate={new Date(event.startDate)}
              eventVenue={event.venue}
              eventCity={event.city}
              items={[{ categoryName: 'Free Registration', quantity: 1, price: 0 }]}
              totalAmount={0}
              paidBy={fullName}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <UserNavbar />
      
      <div className="container py-6 sm:py-8 px-4 sm:px-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/event/${id}`)}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {/* Event Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-500">Free Event</span>
              </div>
              <CardTitle className="text-xl sm:text-2xl">{event.name}</CardTitle>
              <CardDescription>{event.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm sm:text-base">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{format(new Date(event.startDate), "PPP 'at' p")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm sm:text-base">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{event.venue}, {event.city}</span>
              </div>
              {event.image && (
                <img 
                  src={event.image} 
                  alt={event.name}
                  className="w-full h-40 sm:h-48 object-cover rounded-lg mt-4"
                />
              )}
            </CardContent>
          </Card>

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Register for Event</CardTitle>
              <CardDescription>
                Enter your details to complete your free registration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="text-base"
                  />
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    This is a free event. No payment is required. Your registration will be confirmed immediately.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full text-base py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FreeEventRegistration;
