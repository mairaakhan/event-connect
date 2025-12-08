import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { VendorNavbar } from "@/components/VendorNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Upload, X, Trash2, Plus, Loader2, Calendar, Clock, ArrowLeft } from "lucide-react";
import { TicketCategory } from "@/types/event";
import { createEvent, updateEvent } from "@/hooks/useEvents";
import { supabase } from "@/integrations/supabase/client";

const categories = ["music", "festival", "standup", "bookfair", "carnival", "food", "technology", "other"];

const VendorEventForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [vendor, setVendor] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basic Details
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "music",
    city: "",
    venue: "",
    ticketsLiveFrom: "",
    totalTickets: "",
    enableEarlyBird: false,
    earlyBirdDiscount: "",
    earlyBirdDeadline: "",
    enableFlashSale: false,
    flashSaleStartDate: "",
    flashSaleEndDate: "",
    flashSaleDiscount: "",
    enableGroupBooking: false,
    groupDiscount: "",
    groupMinTickets: "",
  });

  // Step 2: Event Duration Type
  const [eventDurationType, setEventDurationType] = useState<"single" | "multi">("single");
  
  // Single-day event
  const [singleDayData, setSingleDayData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  // Multi-day event
  const [multiDayDateMode, setMultiDayDateMode] = useState<"range" | "specific">("range");
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [commonTiming, setCommonTiming] = useState({ startTime: "", endTime: "" });
  const [eventSchedules, setEventSchedules] = useState<Array<{
    id: string;
    dayDate: string;
    startTime: string;
    endTime: string;
  }>>([]);
  const [currentSchedule, setCurrentSchedule] = useState({
    dayDate: "",
    startTime: "",
    endTime: "",
  });

  // Step 3: Event Type (Paid/Free)
  const [isFreeEvent, setIsFreeEvent] = useState(false);
  const [requiresRegistration, setRequiresRegistration] = useState(true);

  // Ticket category input
  const [currentCategory, setCurrentCategory] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
  });

  useEffect(() => {
    const auth = localStorage.getItem("vendorAuth");
    if (!auth) {
      navigate("/vendor/signin");
      return;
    }
    setVendor(JSON.parse(auth));

    const loadEvent = async () => {
      if (isEdit && id) {
        const { data: event, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !event) {
          toast.error("Event not found");
          navigate("/vendor/events");
          return;
        }

        setFormData({
          name: event.name,
          description: event.description || "",
          category: event.category,
          city: event.city,
          venue: event.venue,
          ticketsLiveFrom: event.tickets_live_from?.slice(0, 16) || "",
          totalTickets: event.total_tickets?.toString() || "",
          enableEarlyBird: !!event.early_bird_discount,
          earlyBirdDiscount: event.early_bird_discount?.toString() || "",
          earlyBirdDeadline: event.early_bird_deadline?.slice(0, 16) || "",
          enableFlashSale: !!event.flash_sale_start,
          flashSaleStartDate: event.flash_sale_start?.slice(0, 16) || "",
          flashSaleEndDate: event.flash_sale_end?.slice(0, 16) || "",
          flashSaleDiscount: event.flash_sale_discount?.toString() || "",
          enableGroupBooking: !!event.group_booking_discount,
          groupDiscount: event.group_booking_discount?.toString() || "",
          groupMinTickets: event.group_booking_min_tickets?.toString() || "",
        });
        setImagePreview(event.image || "");
        setIsFreeEvent(Number(event.ticket_price) === 0);
        setRequiresRegistration((event as any).requires_registration || false);

        // Fetch schedules
        const { data: schedules } = await supabase
          .from('event_schedules')
          .select('*')
          .eq('event_id', id);

        if (schedules && schedules.length > 0) {
          setEventDurationType("multi");
          setEventSchedules(schedules.map(s => ({
            id: s.id,
            dayDate: s.day_date,
            startTime: s.start_time,
            endTime: s.end_time,
          })));
        } else {
          setEventDurationType("single");
          setSingleDayData({
            date: event.start_date?.slice(0, 10) || "",
            startTime: event.start_date?.slice(11, 16) || "",
            endTime: event.end_date?.slice(11, 16) || "",
          });
        }

        // Fetch ticket categories
        const { data: cats } = await supabase
          .from('ticket_categories')
          .select('*')
          .eq('event_id', id);

        if (cats) {
          setTicketCategories(cats.map(cat => ({
            id: cat.id,
            name: cat.name,
            price: Number(cat.price),
            quantity: cat.quantity,
            sold: cat.sold,
            description: cat.description || "",
          })));
        }
      }
    };

    loadEvent();
  }, [navigate, isEdit, id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = () => {
    if (!currentCategory.name || !currentCategory.price || !currentCategory.quantity) {
      toast.error("Please fill in all required fields for the ticket category");
      return;
    }

    const newCategory: TicketCategory = {
      id: Date.now().toString(),
      name: currentCategory.name,
      price: parseFloat(currentCategory.price),
      quantity: parseInt(currentCategory.quantity),
      sold: 0,
      description: currentCategory.description,
    };

    setTicketCategories([...ticketCategories, newCategory]);
    setCurrentCategory({ name: "", price: "", quantity: "", description: "" });
    toast.success("Ticket category added!");
  };

  const handleDeleteCategory = (categoryId: string) => {
    setTicketCategories(ticketCategories.filter(cat => cat.id !== categoryId));
    toast.success("Ticket category removed");
  };

  const handleAddSchedule = () => {
    if (!currentSchedule.dayDate || !currentSchedule.startTime || !currentSchedule.endTime) {
      toast.error("Please fill in all schedule fields");
      return;
    }
    setEventSchedules([...eventSchedules, { id: Date.now().toString(), ...currentSchedule }]);
    setCurrentSchedule({ dayDate: "", startTime: "", endTime: "" });
    toast.success("Day schedule added!");
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setEventSchedules(eventSchedules.filter(s => s.id !== scheduleId));
  };

  // Generate schedules from date range
  const generateSchedulesFromRange = () => {
    if (!dateRangeStart || !dateRangeEnd || !commonTiming.startTime || !commonTiming.endTime) return;

    const start = new Date(dateRangeStart);
    const end = new Date(dateRangeEnd);
    const schedules: typeof eventSchedules = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      schedules.push({
        id: Date.now().toString() + dateStr,
        dayDate: dateStr,
        startTime: commonTiming.startTime,
        endTime: commonTiming.endTime,
      });
    }
    
    setEventSchedules(schedules);
    toast.success(`Generated ${schedules.length} day schedules`);
  };

  const updateScheduleTiming = (scheduleId: string, field: "startTime" | "endTime", value: string) => {
    setEventSchedules(eventSchedules.map(s => 
      s.id === scheduleId ? { ...s, [field]: value } : s
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendor) return;

    // Validation
    if (!formData.name || !formData.category || !formData.city || !formData.venue) {
      toast.error("Please fill in all required event details");
      return;
    }

    if (eventDurationType === "single") {
      if (!singleDayData.date || !singleDayData.startTime || !singleDayData.endTime) {
        toast.error("Please fill in the event date and timings");
        return;
      }
    } else {
      if (eventSchedules.length === 0) {
        toast.error("Please add at least one day schedule for multi-day events");
        return;
      }
      // Check all schedules have timings
      const missingTimings = eventSchedules.some(s => !s.startTime || !s.endTime);
      if (missingTimings) {
        toast.error("Please set timings for all days");
        return;
      }
    }

    if (!isFreeEvent && ticketCategories.length === 0) {
      toast.error("Please add at least one ticket category");
      return;
    }

    if (!formData.ticketsLiveFrom) {
      toast.error("Please set when tickets go live");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate dates
      let startDate: string;
      let endDate: string | undefined;

      if (eventDurationType === "single") {
        startDate = new Date(`${singleDayData.date}T${singleDayData.startTime}`).toISOString();
        endDate = new Date(`${singleDayData.date}T${singleDayData.endTime}`).toISOString();
      } else {
        const sortedSchedules = [...eventSchedules].sort((a, b) => 
          new Date(a.dayDate).getTime() - new Date(b.dayDate).getTime()
        );
        startDate = new Date(`${sortedSchedules[0].dayDate}T${sortedSchedules[0].startTime}`).toISOString();
        const lastSchedule = sortedSchedules[sortedSchedules.length - 1];
        endDate = new Date(`${lastSchedule.dayDate}T${lastSchedule.endTime}`).toISOString();
      }

      const totalTickets = isFreeEvent 
        ? parseInt(formData.totalTickets || "0") 
        : ticketCategories.reduce((sum, cat) => sum + cat.quantity, 0);
      const basePrice = isFreeEvent ? 0 : Math.min(...ticketCategories.map(cat => cat.price));

      const eventData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        city: formData.city,
        venue: formData.venue,
        ticketPrice: basePrice,
        totalTickets: totalTickets,
        image: imagePreview || "",
        status: new Date(formData.ticketsLiveFrom) > new Date() ? "scheduled" : "live",
        startDate,
        endDate,
        ticketsLiveFrom: new Date(formData.ticketsLiveFrom).toISOString(),
        requiresRegistration: isFreeEvent ? requiresRegistration : false,
        sameTicketsAllDays: true,
        earlyBird: !isFreeEvent && formData.enableEarlyBird
          ? {
              discount: parseFloat(formData.earlyBirdDiscount),
              deadline: new Date(formData.earlyBirdDeadline).toISOString(),
            }
          : undefined,
        flashSale: !isFreeEvent && formData.enableFlashSale
          ? {
              startDate: new Date(formData.flashSaleStartDate).toISOString(),
              endDate: new Date(formData.flashSaleEndDate).toISOString(),
              discount: parseFloat(formData.flashSaleDiscount),
            }
          : undefined,
        groupBooking: !isFreeEvent && formData.enableGroupBooking
          ? {
              discount: parseFloat(formData.groupDiscount),
              minTickets: parseInt(formData.groupMinTickets),
            }
          : undefined,
      };

      let savedEvent;
      if (isEdit && id) {
        savedEvent = await updateEvent(id, eventData);
        await supabase.from('ticket_categories').delete().eq('event_id', id);
        await supabase.from('event_schedules').delete().eq('event_id', id);
      } else {
        savedEvent = await createEvent(eventData, vendor.id, vendor.organization_name);
      }

      // Save event schedules for multi-day events
      if (eventDurationType === "multi" && eventSchedules.length > 0 && savedEvent) {
        for (const s of eventSchedules) {
          await supabase.from('event_schedules').insert({
            event_id: savedEvent.id,
            day_date: s.dayDate,
            start_time: s.startTime,
            end_time: s.endTime,
          });
        }
      }

      // Save ticket categories for paid events
      if (!isFreeEvent && ticketCategories.length > 0 && savedEvent) {
        const categoriesToInsert = ticketCategories.map(cat => ({
          event_id: savedEvent.id,
          name: cat.name,
          price: cat.price,
          quantity: cat.quantity,
          description: cat.description || null,
          sold: 0,
        }));

        const { error: catError } = await supabase
          .from('ticket_categories')
          .insert(categoriesToInsert);

        if (catError) {
          console.error('Error saving ticket categories:', catError);
          toast.error("Event saved but ticket categories failed to save");
        }
      }

      toast.success(isEdit ? "Event updated successfully!" : "Event created successfully!");
      navigate("/vendor/events");
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast.error(error.message || "Failed to save event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <VendorNavbar />
      
      <div className="container py-8">
        {isEdit && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/vendor/events")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        )}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isEdit ? "Edit Event" : "List New Event"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* STEP 1: Basic Event Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Event Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Event Title *</Label>
                  <Input
                    id="name"
                    required
                    placeholder="Enter event name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder="Describe your event"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
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
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      required
                      placeholder="e.g., Karachi"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue *</Label>
                    <Input
                      id="venue"
                      required
                      placeholder="e.g., Expo Center"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* STEP 2: Date & Time */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Date & Time</h3>

                <div className="space-y-4">
                  <Label className="text-base">Is this a single-day or multi-day event?</Label>
                  <RadioGroup 
                    value={eventDurationType} 
                    onValueChange={(v) => setEventDurationType(v as "single" | "multi")}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single-day" />
                      <Label htmlFor="single-day" className="cursor-pointer">Single-Day Event</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multi" id="multi-day" />
                      <Label htmlFor="multi-day" className="cursor-pointer">Multi-Day Event</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Single-Day Event */}
                {eventDurationType === "single" && (
                  <Card className="border-dashed">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Date *
                          </Label>
                          <Input
                            type="date"
                            value={singleDayData.date}
                            onChange={(e) => setSingleDayData({ ...singleDayData, date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Start Time *
                          </Label>
                          <Input
                            type="time"
                            value={singleDayData.startTime}
                            onChange={(e) => setSingleDayData({ ...singleDayData, startTime: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Clock className="h-4 w-4" /> End Time *
                          </Label>
                          <Input
                            type="time"
                            value={singleDayData.endTime}
                            onChange={(e) => setSingleDayData({ ...singleDayData, endTime: e.target.value })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Multi-Day Event */}
                {eventDurationType === "multi" && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-base">How would you like to select dates?</Label>
                      <RadioGroup 
                        value={multiDayDateMode} 
                        onValueChange={(v) => {
                          setMultiDayDateMode(v as "range" | "specific");
                          setEventSchedules([]);
                        }}
                        className="flex flex-col gap-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="range" id="date-range" />
                          <Label htmlFor="date-range" className="cursor-pointer">Date range with same timings for all days</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="specific" id="specific-dates" />
                          <Label htmlFor="specific-dates" className="cursor-pointer">Days with different timings</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Date Range Mode */}
                    {multiDayDateMode === "range" && (
                      <Card className="border-dashed">
                        <CardContent className="p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Start Date</Label>
                              <Input
                                type="date"
                                value={dateRangeStart}
                                onChange={(e) => setDateRangeStart(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>End Date</Label>
                              <Input
                                type="date"
                                value={dateRangeEnd}
                                onChange={(e) => setDateRangeEnd(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Start Time (All Days)</Label>
                              <Input
                                type="time"
                                value={commonTiming.startTime}
                                onChange={(e) => setCommonTiming({ ...commonTiming, startTime: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>End Time (All Days)</Label>
                              <Input
                                type="time"
                                value={commonTiming.endTime}
                                onChange={(e) => setCommonTiming({ ...commonTiming, endTime: e.target.value })}
                              />
                            </div>
                          </div>

                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={generateSchedulesFromRange}
                            disabled={!dateRangeStart || !dateRangeEnd || !commonTiming.startTime || !commonTiming.endTime}
                            className="w-full"
                          >
                            Generate Schedules
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {/* Specific Dates Mode */}
                    {multiDayDateMode === "specific" && (
                      <Card className="border-dashed">
                        <CardContent className="p-4 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <Label>Date</Label>
                              <Input 
                                type="date" 
                                value={currentSchedule.dayDate} 
                                onChange={(e) => setCurrentSchedule({...currentSchedule, dayDate: e.target.value})} 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Start Time</Label>
                              <Input 
                                type="time" 
                                value={currentSchedule.startTime} 
                                onChange={(e) => setCurrentSchedule({...currentSchedule, startTime: e.target.value})} 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>End Time</Label>
                              <Input 
                                type="time" 
                                value={currentSchedule.endTime} 
                                onChange={(e) => setCurrentSchedule({...currentSchedule, endTime: e.target.value})} 
                              />
                            </div>
                          </div>
                          <Button type="button" variant="outline" onClick={handleAddSchedule} className="w-full">
                            <Plus className="h-4 w-4 mr-2" /> Add Day
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {/* Display added schedules */}
                    {eventSchedules.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Event Schedule ({eventSchedules.length} days)</Label>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {eventSchedules.map((schedule) => (
                            <Card key={schedule.id}>
                              <CardContent className="p-3 flex items-center justify-between">
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                                  <span className="font-medium">{schedule.dayDate}</span>
                                  <span className="text-muted-foreground col-span-2">
                                    {schedule.startTime} - {schedule.endTime}
                                  </span>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteSchedule(schedule.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* STEP 3: Event Type (Paid/Free) */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Event Type</h3>

                <div className="space-y-4">
                  <Label className="text-base">Is this a paid or free event?</Label>
                  <RadioGroup 
                    value={isFreeEvent ? "free" : "paid"} 
                    onValueChange={(v) => {
                      setIsFreeEvent(v === "free");
                      if (v === "free") setTicketCategories([]);
                    }}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paid" id="paid-event" />
                      <Label htmlFor="paid-event" className="cursor-pointer">Paid Event</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="free" id="free-event" />
                      <Label htmlFor="free-event" className="cursor-pointer">Free Event</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Paid Event - Ticket Categories */}
                {!isFreeEvent && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Set up your ticket categories. The same tickets will be available for all event days.
                    </p>

                    {/* Saved Categories */}
                    {ticketCategories.length > 0 && (
                      <div className="space-y-3">
                        {ticketCategories.map((category) => (
                          <Card key={category.id} className="relative">
                            <CardContent className="p-4">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pr-10">
                                <div>
                                  <p className="text-xs text-muted-foreground">Type</p>
                                  <p className="font-semibold">{category.name}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Price</p>
                                  <p className="font-semibold">Rs. {category.price}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Quantity</p>
                                  <p className="font-semibold">{category.quantity}</p>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                  <p className="text-xs text-muted-foreground">Description</p>
                                  <p className="text-sm">{category.description || "N/A"}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Add New Category */}
                    <Card className="border-dashed">
                      <CardContent className="p-4 space-y-4">
                        <h4 className="font-medium">Add Ticket Category</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="catName">Ticket Type Name *</Label>
                            <Input
                              id="catName"
                              placeholder="e.g., VIP, General, Premium"
                              value={currentCategory.name}
                              onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="catPrice">Price (Rs.) *</Label>
                            <Input
                              id="catPrice"
                              type="number"
                              min="0"
                              value={currentCategory.price}
                              onChange={(e) => setCurrentCategory({ ...currentCategory, price: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="catQuantity">Quantity *</Label>
                            <Input
                              id="catQuantity"
                              type="number"
                              min="1"
                              value={currentCategory.quantity}
                              onChange={(e) => setCurrentCategory({ ...currentCategory, quantity: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="catDesc">Description</Label>
                            <Input
                              id="catDesc"
                              placeholder="Optional description"
                              value={currentCategory.description}
                              onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddCategory}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add This Category
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Promotional Options */}
                    <div className="space-y-4 pt-4">
                      <h4 className="font-medium">Promotional Options</h4>
                      
                      {/* Early Bird */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="enableEarlyBird"
                            checked={formData.enableEarlyBird}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, enableEarlyBird: checked as boolean })
                            }
                          />
                          <Label htmlFor="enableEarlyBird" className="cursor-pointer">
                            Enable Early Bird Pricing
                          </Label>
                        </div>

                        {formData.enableEarlyBird && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                            <div className="space-y-2">
                              <Label htmlFor="earlyBirdDiscount">Discount (%)</Label>
                              <Input
                                id="earlyBirdDiscount"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.earlyBirdDiscount}
                                onChange={(e) =>
                                  setFormData({ ...formData, earlyBirdDiscount: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="earlyBirdDeadline">Deadline</Label>
                              <Input
                                id="earlyBirdDeadline"
                                type="datetime-local"
                                value={formData.earlyBirdDeadline}
                                onChange={(e) =>
                                  setFormData({ ...formData, earlyBirdDeadline: e.target.value })
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Flash Sale */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="enableFlashSale"
                            checked={formData.enableFlashSale}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, enableFlashSale: checked as boolean })
                            }
                          />
                          <Label htmlFor="enableFlashSale" className="cursor-pointer">
                            Enable Flash Sale
                          </Label>
                        </div>

                        {formData.enableFlashSale && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-6">
                            <div className="space-y-2">
                              <Label htmlFor="flashSaleStartDate">Start Date</Label>
                              <Input
                                id="flashSaleStartDate"
                                type="datetime-local"
                                value={formData.flashSaleStartDate}
                                onChange={(e) =>
                                  setFormData({ ...formData, flashSaleStartDate: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="flashSaleEndDate">End Date</Label>
                              <Input
                                id="flashSaleEndDate"
                                type="datetime-local"
                                value={formData.flashSaleEndDate}
                                onChange={(e) =>
                                  setFormData({ ...formData, flashSaleEndDate: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="flashSaleDiscount">Discount (%)</Label>
                              <Input
                                id="flashSaleDiscount"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.flashSaleDiscount}
                                onChange={(e) =>
                                  setFormData({ ...formData, flashSaleDiscount: e.target.value })
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Group Booking */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="enableGroupBooking"
                            checked={formData.enableGroupBooking}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, enableGroupBooking: checked as boolean })
                            }
                          />
                          <Label htmlFor="enableGroupBooking" className="cursor-pointer">
                            Enable Group Booking Discount
                          </Label>
                        </div>

                        {formData.enableGroupBooking && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                            <div className="space-y-2">
                              <Label htmlFor="groupDiscount">Discount (%)</Label>
                              <Input
                                id="groupDiscount"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.groupDiscount}
                                onChange={(e) =>
                                  setFormData({ ...formData, groupDiscount: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="groupMinTickets">Minimum Tickets</Label>
                              <Input
                                id="groupMinTickets"
                                type="number"
                                min="2"
                                value={formData.groupMinTickets}
                                onChange={(e) =>
                                  setFormData({ ...formData, groupMinTickets: e.target.value })
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Free Event Options */}
                {isFreeEvent && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalTickets">Total Capacity (Optional)</Label>
                      <Input
                        id="totalTickets"
                        type="number"
                        min="0"
                        placeholder="Enter max attendees (leave empty for unlimited)"
                        value={formData.totalTickets}
                        onChange={(e) => setFormData({ ...formData, totalTickets: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <Label className="text-sm font-medium">Require User Registration?</Label>
                        <p className="text-xs text-muted-foreground">
                          {requiresRegistration 
                            ? "Users must register with their name to get a ticket" 
                            : "Event is publicly visible, no registration needed"
                          }
                        </p>
                      </div>
                      <Switch 
                        checked={requiresRegistration} 
                        onCheckedChange={setRequiresRegistration} 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 4: Tickets Live From */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Publication Settings</h3>

                <div className="space-y-2">
                  <Label htmlFor="ticketsLiveFrom">Tickets Live From *</Label>
                  <Input
                    id="ticketsLiveFrom"
                    type="datetime-local"
                    required
                    value={formData.ticketsLiveFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, ticketsLiveFrom: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    If set to a future date, the event will be scheduled and not visible to users until then
                  </p>
                </div>
              </div>

              {/* STEP 5: Event Image */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Event Image (Optional)</h3>

                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setImagePreview("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag & drop or click to upload
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        className="max-w-xs mx-auto"
                        onChange={handleImageUpload}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t pt-6">
                <Button
                  type="submit"
                  className="w-full py-6 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isEdit ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    isEdit ? "Update Event" : "Create Event"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorEventForm;