import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VendorNavbar } from "@/components/VendorNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Edit,
  Trash2,
  BarChart3,
  Ticket,
  DollarSign,
} from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const VendorEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [vendor, setVendor] = useState<any>(null);

  useEffect(() => {
    const auth = localStorage.getItem("vendorAuth");
    if (!auth) {
      navigate("/vendor/signin");
      return;
    }

    const vendorData = JSON.parse(auth);
    setVendor(vendorData);

    loadEvents(vendorData.id);
  }, [navigate]);

  const loadEvents = (vendorId: string) => {
    const allEvents = JSON.parse(localStorage.getItem("vendorEvents") || "[]");
    const vendorEvents = allEvents.filter((e: any) => e.vendorId === vendorId);
    setEvents(vendorEvents);
  };

  const handleDelete = (eventId: string) => {
    const allEvents = JSON.parse(localStorage.getItem("vendorEvents") || "[]");
    const updatedEvents = allEvents.filter((e: any) => e.id !== eventId);
    localStorage.setItem("vendorEvents", JSON.stringify(updatedEvents));
    loadEvents(vendor.id);
    toast.success("Event deleted successfully");
  };

  const getEventStatus = (event: any) => {
    const ticketsLiveDate = new Date(event.ticketsLiveFrom);
    const daysUntilLive = differenceInDays(ticketsLiveDate, new Date());
    
    if (isPast(ticketsLiveDate)) {
      return { label: "Tickets are Live", variant: "default" as const };
    } else {
      return { label: `Will go live in ${daysUntilLive} days`, variant: "secondary" as const };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <VendorNavbar />
      
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Events</h1>
            <p className="text-muted-foreground">
              Manage your listed events
            </p>
          </div>
          <Button
            onClick={() => navigate("/vendor/events/new")}
            className="bg-gradient-accent hover:opacity-90"
          >
            List New Event
          </Button>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by listing your first event
              </p>
              <Button
                onClick={() => navigate("/vendor/events/new")}
                className="bg-gradient-accent hover:opacity-90"
              >
                List New Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const status = getEventStatus(event);
              const soldTickets = event.soldTickets || 0;
              const revenue = soldTickets * event.ticketPrice * 0.92;

              return (
                <Card key={event.id} className="overflow-hidden">
                  <div className="relative h-40">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge
                      variant={status.variant}
                      className="absolute top-3 left-3"
                    >
                      {status.label}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                      {event.name}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(event.startDate), "PPP")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.city}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Ticket className="w-3 h-3" />
                          Sold
                        </div>
                        <div className="font-bold">{soldTickets}/{event.totalTickets}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <DollarSign className="w-3 h-3" />
                          Revenue
                        </div>
                        <div className="font-bold text-primary">Rs. {revenue.toFixed(0)}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/vendor/events/edit/${event.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/vendor/events/analytics/${event.id}`)}
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this event? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(event.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorEvents;
