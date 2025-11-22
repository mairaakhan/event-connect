import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserNavbar } from "@/components/UserNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, Share2, CheckCircle2 } from "lucide-react";
import { Booking } from "@/types/event";
import { format } from "date-fns";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    const foundBooking = bookings.find((b: Booking) => b.id === bookingId);
    
    if (!foundBooking) {
      navigate("/");
      return;
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
    const message = `I just booked tickets for ${booking.eventName}! 🎉`;
    const url = window.location.href;
    
    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(message + " " + url)}`);
        break;
      case "email":
        window.open(`mailto:?subject=${encodeURIComponent("Check out my ticket!")}&body=${encodeURIComponent(message + " " + url)}`);
        break;
      case "messenger":
        window.open(`fb-messenger://share?link=${encodeURIComponent(url)}`);
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        break;
    }
  };

  const totalTickets = booking.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <UserNavbar />
      
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center space-y-6" ref={ticketRef}>
            <div className="flex justify-center">
              <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full">
                <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-2">
                🎉 Thank You! Your Booking is Confirmed!
              </h1>
              <p className="text-muted-foreground">
                Your ticket has been successfully booked. You can now download or share your ticket.
              </p>
            </div>

            <Separator />

            <div className="text-left space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-3">{booking.eventName}</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Booking ID:</span>
                    <span className="font-mono">{booking.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{format(new Date(booking.createdAt), "PPP")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="capitalize">{booking.paymentMethod.replace("-", " ")}</span>
                  </div>
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

            {/* QR Code */}
            <div className="flex justify-center py-4">
              <div className="p-4 bg-white rounded-lg">
                <QRCodeSVG 
                  value={`${window.location.origin}/booking-confirmation/${booking.id}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Scan this QR code at the event entrance
            </p>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleDownloadTicket}
                className="flex-1 bg-gradient-accent hover:opacity-90"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Ticket
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Ticket
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
    </div>
  );
};

export default BookingConfirmation;
