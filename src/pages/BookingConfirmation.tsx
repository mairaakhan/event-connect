import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserNavbar } from "@/components/UserNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, Share2, CheckCircle2, Clock, CreditCard, AlertCircle, Loader2, Gift } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TicketDownloadCard } from "@/components/ui/ticket-confirmation-card";
import type { Booking } from "@/types/event";
import { supabase } from "@/integrations/supabase/client";

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [payerName, setPayerName] = useState("");
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) {
        navigate("/");
        return;
      }

      setLoading(true);
      try {
        // Fetch booking from Supabase
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('*, booking_items(*)')
          .eq('id', bookingId)
          .maybeSingle();

        if (bookingError) throw bookingError;

        if (!bookingData) {
          toast.error("Booking not found");
          navigate("/");
          return;
        }

        // Check if booking has expired
        const now = new Date();
        const expiresAt = new Date(bookingData.expires_at);
        
        if (now > expiresAt && bookingData.status === 'reserved') {
          // Auto-cancel expired booking
          await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId);
          bookingData.status = 'cancelled';
        }

        // Transform to frontend Booking type
        const transformedBooking: Booking = {
          id: bookingData.id,
          eventId: bookingData.event_id,
          eventName: bookingData.event_name,
          items: (bookingData.booking_items || []).map((item: any) => ({
            categoryId: item.category_id || 'general',
            categoryName: item.category_name,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: Number(bookingData.total_amount),
          discountApplied: Number(bookingData.discount_applied || 0),
          paymentMethod: (bookingData.payment_method as 'bank-transfer' | 'easypaisa' | 'jazzcash') || 'easypaisa',
          status: bookingData.status as 'reserved' | 'paid' | 'cancelled',
          createdAt: bookingData.created_at,
          expiresAt: bookingData.expires_at,
          vendorId: bookingData.vendor_id,
          platformCommission: Number(bookingData.platform_commission || 0),
          paidBy: bookingData.paid_by,
        };

        setBooking(transformedBooking);

        // Fetch event details
        const { data: eventData } = await supabase
          .from('events')
          .select('*')
          .eq('id', bookingData.event_id)
          .maybeSingle();

        if (eventData) {
          setEvent({
            ...eventData,
            startDate: eventData.start_date,
            venue: eventData.venue,
            city: eventData.city,
          });
        }
      } catch (error) {
        console.error('Error loading booking:', error);
        toast.error("Failed to load booking");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const isFreeEvent = booking.totalAmount === 0;

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
          link.download = `ticket-${booking?.id}.png`;
          link.click();
          URL.revokeObjectURL(url);
          
          toast.success("Ticket downloaded!", {
            description: "Your ticket has been saved."
          });
        }
      });
    } catch (error) {
      toast.error("Failed to download ticket");
      console.error(error);
    }
  };

  const handleShare = (platform: string) => {
    const message = isFreeEvent 
      ? `I'm registered for ${booking.eventName}! 🎟️` 
      : `Help me pay for ${booking.eventName}! 🎟️ Total: Rs. ${booking.totalAmount.toFixed(0)}`;
    const url = window.location.href;
    
    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(message + "\n\n" + url)}`);
        break;
      case "email":
        window.open(`mailto:?subject=${encodeURIComponent(isFreeEvent ? "Event Registration" : "Payment Request for Ticket")}&body=${encodeURIComponent(message + "\n\n" + url)}`);
        break;
      case "messenger":
        window.open(`fb-messenger://share?link=${encodeURIComponent(url)}`);
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success(isFreeEvent ? "Registration link copied!" : "Payment link copied!");
        break;
    }
  };

  const handlePayNow = () => {
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = async () => {
    if (!payerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      // Update booking in Supabase
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'paid',
          paid_by: payerName 
        })
        .eq('id', booking.id);

      if (error) throw error;

      const updatedBooking = {
        ...booking,
        status: 'paid' as const,
        paidBy: payerName,
      };
      
      setBooking(updatedBooking);
      setShowPaymentDialog(false);
      setPayerName("");
      
      toast.success("Payment confirmed!", {
        description: "You can now download your ticket."
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error("Failed to confirm payment");
    }
  };

  const getTimeRemaining = () => {
    if (!booking) return "";
    const now = new Date();
    const expires = new Date(booking.expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  const totalTickets = booking.items.reduce((sum, item) => sum + item.quantity, 0);
  const isPaid = booking.status === 'paid';
  const isReserved = booking.status === 'reserved';
  const isCancelled = booking.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gradient-hero">
      <UserNavbar />
      
      <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Status Card */}
          <Card>
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Status Header */}
              <div className="flex justify-center">
                <div className={`p-4 rounded-full ${
                  isPaid ? 'bg-green-100 dark:bg-green-900/20' : 
                  isCancelled ? 'bg-red-100 dark:bg-red-900/20' :
                  'bg-yellow-100 dark:bg-yellow-900/20'
                }`}>
                  {isPaid ? (
                    <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-green-600 dark:text-green-400" />
                  ) : isCancelled ? (
                    <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-600 dark:text-red-400" />
                  ) : (
                    <Clock className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-600 dark:text-yellow-400" />
                  )}
                </div>
              </div>

              <div className="text-center">
                <h1 className="text-xl sm:text-3xl font-bold mb-2">
                  {isPaid ? (isFreeEvent ? '✅ Registration Confirmed!' : '✅ Booking Confirmed & Paid!') :
                   isCancelled ? '❌ Booking Cancelled' :
                   '⏳ Booking Reserved - Awaiting Payment'}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {isPaid ? (isFreeEvent ? 'Your registration is confirmed! Download your pass below.' : 'Your ticket is ready! Download it below.') :
                   isCancelled ? 'This booking has expired and been cancelled.' :
                   'Complete payment within 24 hours to confirm your booking.'}
                </p>
                {isReserved && !isFreeEvent && (
                  <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mt-2">
                    {getTimeRemaining()}
                  </p>
                )}
              </div>

              {isFreeEvent && isPaid && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                    <Gift className="h-4 w-4" />
                    <span className="text-sm font-medium">Free Event</span>
                  </div>
                </div>
              )}

              <Separator />

              <div className="text-left space-y-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold mb-3">{booking.eventName}</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ticket ID:</span>
                      <span className="font-mono font-semibold text-xs sm:text-sm">{booking.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Booked On:</span>
                      <span>{format(new Date(booking.createdAt), "PPP")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-semibold capitalize ${
                        isPaid ? 'text-green-600' : 
                        isCancelled ? 'text-red-600' : 
                        'text-yellow-600'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    {isReserved && !isFreeEvent && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Expires At:</span>
                        <span className="text-red-600 font-semibold">
                          {format(new Date(booking.expiresAt), "PPP p")}
                        </span>
                      </div>
                    )}
                    {isPaid && booking.paidBy && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{isFreeEvent ? 'Registered By:' : 'Paid By:'}</span>
                        <span>{booking.paidBy}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">{isFreeEvent ? 'Registration Details' : 'Ticket Details'}</h3>
                  <div className="space-y-2">
                    {booking.items.length > 0 ? (
                      booking.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.categoryName} × {item.quantity}</span>
                          <span>{isFreeEvent ? 'Free' : `Rs. ${(item.price * item.quantity).toFixed(0)}`}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between text-sm">
                        <span>Registration × 1</span>
                        <span>Free</span>
                      </div>
                    )}
                    {!isFreeEvent && booking.discountApplied && booking.discountApplied > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>- Rs. {booking.discountApplied.toFixed(0)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className={isFreeEvent ? "text-emerald-600" : "text-primary"}>
                        {isFreeEvent ? 'Free' : `Rs. ${booking.totalAmount.toFixed(0)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleDownloadTicket}
                  disabled={!isPaid}
                  className={`w-full ${isFreeEvent ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gradient-accent hover:opacity-90'}`}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isPaid ? (isFreeEvent ? 'Download Pass' : 'Download Ticket') : '🔒 Download Ticket (Payment Required)'}
                </Button>

                <div className="flex flex-col sm:flex-row gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <Share2 className="mr-2 h-4 w-4" />
                        {isFreeEvent ? 'Share Event' : 'Share Payment Link'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
                        WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare("email")}>
                        Gmail / Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare("messenger")}>
                        Messenger
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare("copy")}>
                        Copy Link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {isReserved && !isFreeEvent && (
                    <Button 
                      onClick={handlePayNow}
                      className="flex-1"
                      variant="default"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>

              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="w-full"
              >
                Back to Events
              </Button>
            </CardContent>
          </Card>

          {/* Hidden Ticket for Download - Only rendered when paid */}
          {isPaid && (
            <div className="fixed left-[-9999px] top-0">
              <TicketDownloadCard
                ref={ticketRef}
                ticketId={booking.id}
                eventName={booking.eventName}
                eventDate={new Date(event?.startDate || booking.createdAt)}
                eventVenue={event?.venue || "Venue"}
                eventCity={event?.city || "City"}
                items={booking.items}
                totalAmount={booking.totalAmount}
                paidBy={booking.paidBy}
              />
            </div>
          )}
        </div>
      </div>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Please complete the payment using one of these methods and enter your name to confirm.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold">Payment Methods:</h4>
              <div className="text-sm space-y-1">
                <p>• Bank Transfer: [Account Details]</p>
                <p>• Easypaisa: [Number]</p>
                <p>• JazzCash: [Number]</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payerName">Your Name</Label>
              <Input
                id="payerName"
                placeholder="Enter your name"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmPayment}
                className="flex-1"
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingConfirmation;
