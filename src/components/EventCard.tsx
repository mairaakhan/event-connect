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
  const eventEndDate = new Date(event.endDate || event.startDate);
  const daysUntilLive = differenceInDays(ticketsLiveDate, new Date());
  const isExpired = isPast(eventEndDate);
  const isLive = isPast(ticketsLiveDate) && !isExpired;
  const hasFlashSale =
    event.flashSale &&
    isFuture(new Date(event.flashSale.endDate)) &&
    isPast(new Date(event.flashSale.startDate)) &&
    !isExpired;

  const availability = ((event.totalTickets - event.soldTickets) / event.totalTickets) * 100;

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group"
      onClick={() => navigate(`/event/${event.id}`)}
    >
      <div className="relative h-36 sm:h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1 sm:gap-2 flex-wrap">
          {isExpired ? (
            <Badge className="bg-destructive text-destructive-foreground border-0 text-xs">Tickets Expired</Badge>
          ) : isLive ? (
            <Badge className="bg-green-500 text-white border-0 text-xs">Tickets are Live</Badge>
          ) : (
            <Badge className="bg-yellow-500 text-white border-0 text-xs">
              Live in {daysUntilLive} days
            </Badge>
          )}
          {hasFlashSale && (
            <Badge className="bg-gradient-accent text-white border-0 animate-pulse text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Flash Sale
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-3 sm:p-4">
        <div className="mb-2">
          <Badge variant="secondary" className="mb-2 text-xs">
            {event.category}
          </Badge>
          <h3 className="font-bold text-sm sm:text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {event.name}
          </h3>
        </div>
        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{format(new Date(event.startDate), "PPP")}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">
              {event.venue}, {event.city}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1 sm:gap-2">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs">
                {availability > 20 ? "Available" : "Limited"} ({event.totalTickets - event.soldTickets} left)
              </span>
            </div>
            <span className="font-bold text-primary text-sm sm:text-lg">Rs. {event.ticketPrice}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
