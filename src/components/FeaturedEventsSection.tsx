import { Event } from "@/types/event";
import { EventCard } from "./EventCard";
import { Sparkles } from "lucide-react";

interface FeaturedEventsSectionProps {
  events: Event[];
}

export const FeaturedEventsSection = ({ events }: FeaturedEventsSectionProps) => {
  // Filter events with active promotions
  const promotedEvents = events.filter(e => e.promotion && e.promotion.isActive);

  if (promotedEvents.length === 0) {
    return null;
  }

  // Sort by promotion type priority: premium > sponsored > featured
  const sortedEvents = [...promotedEvents].sort((a, b) => {
    const priority = { premium: 3, sponsored: 2, featured: 1 };
    const aPriority = priority[a.promotion!.promotionType] || 0;
    const bPriority = priority[b.promotion!.promotionType] || 0;
    return bPriority - aPriority;
  });

  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Sparkles className="h-5 w-5 text-amber-400" />
        <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">
          Featured Events
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sortedEvents.slice(0, 6).map((event) => (
          <EventCard key={event.id} event={event} showPromotionBadge />
        ))}
      </div>
    </div>
  );
};