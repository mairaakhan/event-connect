import { Event } from "@/types/event";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, MapPin, Users, Zap } from "lucide-react";
import { format, differenceInDays, isPast, isFuture } from "date-fns";
import { useNavigate } from "react-router-dom";

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const navigate = useNavigate();
  const ticketsLiveDate = new Date(event.ticketsLiveFrom);
  const daysUntilLive = differenceInDays(ticketsLiveDate, new Date());
  const isLive = isPast(ticketsLiveDate);
  const hasFlashSale =
    event.flashSale &&
    isFuture(new Date(event.flashSale.endDate)) &&
    isPast(new Date(event.flashSale.startDate));

  const availability = ((event.totalTickets - event.soldTickets) / event.totalTickets) * 100;

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group"
      onClick={() => navigate(`/event/${event.id}`)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {isLive ? (
            <Badge className="bg-green-500 text-white border-0">Tickets are Live</Badge>
          ) : (
            <Badge className="bg-yellow-500 text-white border-0">
              Live in {daysUntilLive} days
            </Badge>
          )}
          {hasFlashSale && (
            <Badge className="bg-gradient-accent text-white border-0 animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              Flash Sale
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <Badge variant="secondary" className="mb-2">
            {event.category}
          </Badge>
          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {event.name}
          </h3>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(event.startDate), "PPP")}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>
              {event.venue}, {event.city}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-xs">
                {availability > 20 ? "Available" : "Limited"} ({event.totalTickets - event.soldTickets} left)
              </span>
            </div>
            <span className="font-bold text-primary text-lg">Rs. {event.ticketPrice}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
