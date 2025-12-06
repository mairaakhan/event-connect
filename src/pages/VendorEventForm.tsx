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
import { toast } from "sonner";
import { Upload, X, Trash2, Plus, Loader2 } from "lucide-react";
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
  const [ticketCategories, setTicketCategories] = useState<Array<TicketCategory & { scheduleId?: string }>>([]);
  const [isFreeEvent, setIsFreeEvent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [sameTicketsAllDays, setSameTicketsAllDays] = useState(true);
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
  const [selectedScheduleForCategory, setSelectedScheduleForCategory] = useState<string>("");
  const [currentCategory, setCurrentCategory] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    category: "music",
    city: "",
    venue: "",
    ticketsLiveFrom: "",
    totalTickets: "",
    requiresRegistration: false,
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

  useEffect(() => {
    const auth = localStorage.getItem("vendorAuth");
    if (!auth) {
      navigate("/vendor/signin");
      return;
    }
    setVendor(JSON.parse(auth));

    const loadEvent = async () => {
      if (isEdit && id) {
        // Fetch event from Supabase
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
          startDate: event.start_date?.slice(0, 16) || "",
          endDate: event.end_date?.slice(0, 16) || "",
          category: event.category,
          city: event.city,
          venue: event.venue,
          ticketsLiveFrom: event.tickets_live_from?.slice(0, 16) || "",
          totalTickets: event.total_tickets?.toString() || "",
          requiresRegistration: (event as any).requires_registration || false,
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
        setSameTicketsAllDays((event as any).same_tickets_all_days !== false);

        // Fetch ticket categories
        const { data: categories } = await supabase
          .from('ticket_categories')
          .select('*')
          .eq('event_id', id);

        if (categories) {
          setTicketCategories(categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            price: Number(cat.price),
            quantity: cat.quantity,
            sold: cat.sold,
            description: cat.description || "",
          })));
        }

        // Fetch event schedules
        const { data: schedules } = await supabase
          .from('event_schedules')
          .select('*')
          .eq('event_id', id);

        if (schedules && schedules.length > 0) {
          setIsMultiDay(true);
          setEventSchedules(schedules.map(s => ({
            id: s.id,
            dayDate: s.day_date,
            startTime: s.start_time,
            endTime: s.end_time,
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

    // For day-wise tickets, require schedule selection
    if (isMultiDay && !sameTicketsAllDays && !selectedScheduleForCategory) {
      toast.error("Please select a day for this ticket category");
      return;
    }

    const newCategory: TicketCategory & { scheduleId?: string } = {
      id: Date.now().toString(),
      name: currentCategory.name,
      price: parseFloat(currentCategory.price),
      quantity: parseInt(currentCategory.quantity),
      sold: 0,
      description: currentCategory.description,
      scheduleId: isMultiDay && !sameTicketsAllDays ? selectedScheduleForCategory : undefined,
    };

    setTicketCategories([...ticketCategories, newCategory]);
    setCurrentCategory({ name: "", price: "", quantity: "", description: "" });
    setSelectedScheduleForCategory("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendor) return;

    if (!isFreeEvent && ticketCategories.length === 0) {
      toast.error("Please add at least one ticket category or mark as free event");
      return;
    }

    if (isMultiDay && eventSchedules.length === 0) {
      toast.error("Please add at least one day schedule for multi-day events");
      return;
    }

    setIsSubmitting(true);

    try {
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
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        ticketsLiveFrom: new Date(formData.ticketsLiveFrom).toISOString(),
        requiresRegistration: formData.requiresRegistration,
        sameTicketsAllDays: sameTicketsAllDays,
        earlyBird: formData.enableEarlyBird
          ? {
              discount: parseFloat(formData.earlyBirdDiscount),
              deadline: new Date(formData.earlyBirdDeadline).toISOString(),
            }
          : undefined,
        flashSale: formData.enableFlashSale
          ? {
              startDate: new Date(formData.flashSaleStartDate).toISOString(),
              endDate: new Date(formData.flashSaleEndDate).toISOString(),
              discount: parseFloat(formData.flashSaleDiscount),
            }
          : undefined,
        groupBooking: formData.enableGroupBooking
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

      // Save event schedules first (to get their IDs for category linking)
      let savedScheduleIds: Record<string, string> = {};
      if (isMultiDay && eventSchedules.length > 0 && savedEvent) {
        for (const s of eventSchedules) {
          const { data: schedData, error: schedError } = await supabase
            .from('event_schedules')
            .insert({
              event_id: savedEvent.id,
              day_date: s.dayDate,
              start_time: s.startTime,
              end_time: s.endTime,
            })
            .select()
            .single();

          if (schedError) {
            console.error('Error saving schedule:', schedError);
          } else if (schedData) {
            savedScheduleIds[s.id] = schedData.id;
          }
        }
      }

      if (!isFreeEvent && ticketCategories.length > 0 && savedEvent) {
        const categoriesToInsert = ticketCategories.map(cat => ({
          event_id: savedEvent.id,
          name: cat.name,
          price: cat.price,
          quantity: cat.quantity,
          description: cat.description || null,
          sold: 0,
          schedule_id: cat.scheduleId ? (savedScheduleIds[cat.scheduleId] || null) : null,
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
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isEdit ? "Edit Event" : "List New Event"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Event Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Event Start Date *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">Event End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>

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
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="venue">Venue *</Label>
                    <Input
                      id="venue"
                      required
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
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
                      If set to future date, event will be scheduled
                    </p>
                  </div>
                </div>
              </div>

              {/* Multi-Day Scheduling */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base sm:text-lg font-semibold">Multi-Day Event</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Enable to set different timings for each day
                    </p>
                  </div>
                  <Switch checked={isMultiDay} onCheckedChange={setIsMultiDay} />
                </div>

                {isMultiDay && (
                  <div className="space-y-4">
                    {eventSchedules.length > 0 && (
                      <div className="space-y-2">
                        {eventSchedules.map((schedule) => (
                          <Card key={schedule.id}>
                            <CardContent className="p-3 flex items-center justify-between">
                              <div className="text-sm">
                                <span className="font-medium">{schedule.dayDate}</span>
                                <span className="text-muted-foreground ml-2">
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
                    )}
                    <Card className="border-dashed">
                      <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={currentSchedule.dayDate} onChange={(e) => setCurrentSchedule({...currentSchedule, dayDate: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input type="time" value={currentSchedule.startTime} onChange={(e) => setCurrentSchedule({...currentSchedule, startTime: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input type="time" value={currentSchedule.endTime} onChange={(e) => setCurrentSchedule({...currentSchedule, endTime: e.target.value})} />
                          </div>
                        </div>
                        <Button type="button" variant="outline" onClick={handleAddSchedule} className="w-full">
                          <Plus className="h-4 w-4 mr-2" /> Add Day Schedule
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Ticket Type Toggle - Same for all days or separate per day */}
                    {!isFreeEvent && eventSchedules.length > 0 && (
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-semibold">Ticket Type</Label>
                          <p className="text-xs text-muted-foreground">
                            {sameTicketsAllDays 
                              ? "Same tickets available for all days" 
                              : "Different tickets for each day"
                            }
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${sameTicketsAllDays ? 'text-primary font-medium' : 'text-muted-foreground'}`}>Same</span>
                          <Switch 
                            checked={!sameTicketsAllDays} 
                            onCheckedChange={(checked) => setSameTicketsAllDays(!checked)} 
                          />
                          <span className={`text-xs ${!sameTicketsAllDays ? 'text-primary font-medium' : 'text-muted-foreground'}`}>Per Day</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Event Image (Optional)</Label>
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

              {/* Free Event Toggle */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="freeEvent" className="text-lg font-semibold">Free Event</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle on if this event has no ticket system (free entry)
                    </p>
                  </div>
                  <Switch
                    id="freeEvent"
                    checked={isFreeEvent}
                    onCheckedChange={(checked) => {
                      setIsFreeEvent(checked);
                      if (checked) {
                        setTicketCategories([]);
                      }
                    }}
                  />
                </div>

                {/* Free Event - Total Capacity */}
                {isFreeEvent && (
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
                    <p className="text-xs text-muted-foreground">
                      Set the maximum number of attendees, or leave empty for unlimited
                    </p>
                  </div>
                )}
              </div>

              {/* Ticket Categories - Only for paid events */}
              {!isFreeEvent && (
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Ticket Categories *</h3>
                
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
                      {/* Day Selection for day-wise tickets */}
                      {isMultiDay && !sameTicketsAllDays && eventSchedules.length > 0 && (
                        <div className="space-y-2 md:col-span-2">
                          <Label>For Day *</Label>
                          <Select value={selectedScheduleForCategory} onValueChange={setSelectedScheduleForCategory}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              {eventSchedules.map((schedule) => (
                                <SelectItem key={schedule.id} value={schedule.id}>
                                  {schedule.dayDate} ({schedule.startTime} - {schedule.endTime})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
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
              </div>
              )}

              {/* Promotional Options - Only for paid events */}
              {!isFreeEvent && (
              <>
              {/* Early Bird */}
              <div className="space-y-4 border-t pt-6">
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
              <div className="space-y-4">
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
              <div className="space-y-4">
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
              </>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/vendor/events")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-accent hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
