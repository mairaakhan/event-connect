import { useState, useMemo, useEffect } from "react";
import { UserNavbar } from "@/components/UserNavbar";
import { EventCard } from "@/components/EventCard";
import { FeaturedEventsSection } from "@/components/FeaturedEventsSection";
import { Footer } from "@/components/Footer";
import { useEvents } from "@/hooks/useEvents";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, isPast, isFuture } from "date-fns";
import { cn } from "@/lib/utils";
import { GradientBackground } from "@/components/GradientBackground";
import { supabase } from "@/integrations/supabase/client";
import { Event, EventPromotion } from "@/types/event";

const categories = ["all", "free", "music", "festival", "standup", "bookfair", "carnival", "food", "technology", "other"];
const cities = ["all", "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Multan", "Faisalabad"];

const UserHome = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("all");
  const [promotions, setPromotions] = useState<EventPromotion[]>([]);
  
  const { events, loading, error } = useEvents();

  // Fetch active promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      const { data } = await supabase
        .from('event_promotions')
        .select('*')
        .eq('is_active', true);

      if (data) {
        const now = new Date();
        const activePromos = data.filter(p => 
          !isPast(new Date(p.end_date)) && !isFuture(new Date(p.start_date))
        ).map(p => ({
          id: p.id,
          eventId: p.event_id,
          vendorId: p.vendor_id,
          promotionType: p.promotion_type as 'featured' | 'sponsored' | 'premium',
          budget: Number(p.budget),
          startDate: p.start_date,
          endDate: p.end_date,
          isActive: p.is_active,
          views: p.views,
          clicks: p.clicks,
          createdAt: p.created_at,
        }));
        setPromotions(activePromos);
      }
    };
    fetchPromotions();
  }, []);

  // Merge promotions with events
  const eventsWithPromotions = useMemo(() => {
    return events.map(event => {
      const promo = promotions.find(p => p.eventId === event.id);
      return promo ? { ...event, promotion: promo } : event;
    });
  }, [events, promotions]);

  // Filter out past events and apply filters
  const filteredEvents = useMemo(() => {
    const now = new Date();
    return eventsWithPromotions.filter((event) => {
      const eventEndDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
      const isPastEvent = eventEndDate < now;
      if (isPastEvent) return false;
      
      const eventStartDate = new Date(event.startDate);
      const matchesStartDate = !startDate || eventStartDate >= startDate;
      const matchesEndDate = !endDate || eventStartDate <= endDate;
      const matchesCategory = category === "all" || 
        (category === "free" ? event.ticketPrice === 0 : event.category === category);
      const matchesCity = city === "all" || event.city === city;

      return matchesStartDate && matchesEndDate && matchesCategory && matchesCity;
    });
  }, [eventsWithPromotions, startDate, endDate, category, city]);

  // Separate promoted and regular events
  const promotedEvents = filteredEvents.filter(e => e.promotion && e.promotion.isActive);
  const regularEvents = filteredEvents.filter(e => !e.promotion || !e.promotion.isActive);

  return (
    <div className="min-h-screen relative">
      <GradientBackground />
      
      <div className="relative z-10">
        <UserNavbar />
        
        {/* Hero Section */}
        <section className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-20">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 sm:mb-4 text-white drop-shadow-lg font-oughter">
              event.pk
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 font-medium px-4">
              Discover, book, create, and manage events with ease.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-8 sm:mb-12 border border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">City</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          </div>

          {/* Featured Events Section */}
          {!loading && promotedEvents.length > 0 && (
            <FeaturedEventsSection events={promotedEvents} />
          )}

          {/* Events Grid */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white drop-shadow-md">
              {loading ? "Loading Events..." : regularEvents.length > 0 ? "Upcoming Events" : "No events found"}
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-white">
                <p>Error loading events. Please try again.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {regularEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </section>
        
        <Footer />
      </div>
    </div>
  );
};

export default UserHome;