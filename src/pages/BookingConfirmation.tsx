import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserNavbar } from "@/components/UserNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, Share2, CheckCircle2, Clock, CreditCard, AlertCircle } from "lucide-react";
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
import type { Booking } from "@/types/event";

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [payerName, setPayerName] = useState("");
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    const foundBooking = bookings.find((b: Booking) => b.id === bookingId);
    
    if (!foundBooking) {
      navigate("/");
      return;
    }
    
    // Check if booking has expired
    const now = new Date();
    const expiresAt = new Date(foundBooking.expiresAt);
    
    if (now > expiresAt && foundBooking.status === 'reserved') {
      // Auto-cancel expired booking
      foundBooking.status = 'cancelled';
      const updatedBookings = bookings.map((b: Booking) => 
        b.id === foundBooking.id ? foundBooking : b
      );
      localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    }
    
    setBooking(foundBooking);
  }, [bookingId, navigate]);

  if (!booking) {
    return null;
  }

  const handleDownloadTicket = async () => {
    if (!ticketRef.current) return;
    
    try {
      // Use html2canvas to capture the ticket
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `ticket-${booking?.id}.png`;
          link.click();
          URL.revokeObjectURL(url);
          
          toast.success("Ticket downloaded!", {
            description: "Your ticket with QR code has been saved."
          });
        }
      });
    } catch (error) {
      toast.error("Failed to download ticket");
      console.error(error);
    }
  };

  const handleShare = (platform: string) => {
    const message = `Help me pay for ${booking.eventName}! 🎟️ Total: Rs. ${booking.totalAmount.toFixed(0)}`;
    const url = window.location.href;
    
    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(message + "\n\n" + url)}`);
        break;
      case "email":
        window.open(`mailto:?subject=${encodeURIComponent("Payment Request for Ticket")}&body=${encodeURIComponent(message + "\n\n" + url)}`);
        break;
      case "messenger":
        window.open(`fb-messenger://share?link=${encodeURIComponent(url)}`);
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("Payment link copied!");
        break;
    }
  };

  const handlePayNow = () => {
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = () => {
    if (!payerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    // Update booking status to paid
    const updatedBooking = {
      ...booking!,
      status: 'paid' as const,
      paidBy: payerName,
    };

    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    const updatedBookings = bookings.map((b: Booking) => 
      b.id === booking!.id ? updatedBooking : b
    );
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    
    setBooking(updatedBooking);
    setShowPaymentDialog(false);
    setPayerName("");
    
    toast.success("Payment confirmed!", {
      description: "You can now download your ticket."
    });
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
      
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 space-y-6" ref={ticketRef}>
            {/* Status Header */}
            <div className="flex justify-center">
              <div className={`p-4 rounded-full ${
                isPaid ? 'bg-green-100 dark:bg-green-900/20' : 
                isCancelled ? 'bg-red-100 dark:bg-red-900/20' :
                'bg-yellow-100 dark:bg-yellow-900/20'
              }`}>
                {isPaid ? (
                  <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
                ) : isCancelled ? (
                  <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
                ) : (
                  <Clock className="h-16 w-16 text-yellow-600 dark:text-yellow-400" />
                )}
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">
                {isPaid ? '✅ Booking Confirmed & Paid!' :
                 isCancelled ? '❌ Booking Cancelled' :
                 '⏳ Booking Reserved - Awaiting Payment'}
              </h1>
              <p className="text-muted-foreground">
                {isPaid ? 'Your ticket is ready! Download it below.' :
                 isCancelled ? 'This booking has expired and been cancelled.' :
                 'Complete payment within 24 hours to confirm your booking.'}
              </p>
              {isReserved && (
                <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mt-2">
                  {getTimeRemaining()}
                </p>
              )}
            </div>

            <Separator />

            <div className="text-left space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-3">{booking.eventName}</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ticket ID:</span>
                    <span className="font-mono font-semibold">{booking.id}</span>
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
                  {isReserved && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expires At:</span>
                      <span className="text-red-600 font-semibold">
                        {format(new Date(booking.expiresAt), "PPP p")}
                      </span>
                    </div>
                  )}
                  {isPaid && booking.paidBy && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paid By:</span>
                      <span>{booking.paidBy}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Ticket Details</h3>
                <div className="space-y-2">
                  {booking.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.categoryName} × {item.quantity}</span>
                      <span>Rs. {(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                  {booking.discountApplied && booking.discountApplied > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>- Rs. {booking.discountApplied.toFixed(0)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">Rs. {booking.totalAmount.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Download Button - Only enabled if paid */}
              <Button 
                onClick={handleDownloadTicket}
                disabled={!isPaid}
                className="w-full bg-gradient-accent hover:opacity-90"
              >
                <Download className="mr-2 h-4 w-4" />
                {isPaid ? 'Download Ticket' : '🔒 Download Ticket (Payment Required)'}
              </Button>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Share Button - Always enabled */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Payment Link
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

                {/* Pay Button - Only show if reserved */}
                {isReserved && (
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
