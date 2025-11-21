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
import { toast } from "sonner";
import { Upload, X, Trash2, Plus } from "lucide-react";
import { TicketCategory } from "@/types/event";

const categories = ["music", "festival", "standup", "bookfair", "carnival", "food", "technology", "other"];

const VendorEventForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [vendor, setVendor] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);
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

    if (isEdit) {
      const events = JSON.parse(localStorage.getItem("vendorEvents") || "[]");
      const event = events.find((e: any) => e.id === id);
      if (event) {
        setFormData({
          name: event.name,
          description: event.description,
          startDate: event.startDate.slice(0, 16),
          endDate: event.endDate?.slice(0, 16) || "",
          category: event.category,
          city: event.city,
          venue: event.venue,
          ticketsLiveFrom: event.ticketsLiveFrom.slice(0, 16),
          enableEarlyBird: !!event.earlyBird,
          earlyBirdDiscount: event.earlyBird?.discount?.toString() || "",
          earlyBirdDeadline: event.earlyBird?.deadline?.slice(0, 16) || "",
          enableFlashSale: !!event.flashSale,
          flashSaleStartDate: event.flashSale?.startDate?.slice(0, 16) || "",
          flashSaleEndDate: event.flashSale?.endDate?.slice(0, 16) || "",
          flashSaleDiscount: event.flashSale?.discount?.toString() || "",
          enableGroupBooking: !!event.groupBooking,
          groupDiscount: event.groupBooking?.discount?.toString() || "",
          groupMinTickets: event.groupBooking?.minTickets?.toString() || "",
        });
        setImagePreview(event.image || "");
        setTicketCategories(event.ticketCategories || []);
      }
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendor) return;

    if (ticketCategories.length === 0) {
      toast.error("Please add at least one ticket category");
      return;
    }

    // Calculate total tickets and base price from categories
    const totalTickets = ticketCategories.reduce((sum, cat) => sum + cat.quantity, 0);
    const basePrice = Math.min(...ticketCategories.map(cat => cat.price));

    const event = {
      id: isEdit ? id : Date.now().toString(),
      ...formData,
      ticketPrice: basePrice,
      totalTickets: totalTickets,
      soldTickets: 0,
      ticketCategories: ticketCategories,
      vendorId: vendor.id,
      vendorName: vendor.organizationName,
      image: imagePreview || "",
      status: new Date(formData.ticketsLiveFrom) > new Date() ? "scheduled" : "live",
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      ticketsLiveFrom: new Date(formData.ticketsLiveFrom).toISOString(),
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

    const events = JSON.parse(localStorage.getItem("vendorEvents") || "[]");
    
    if (isEdit) {
      const index = events.findIndex((e: any) => e.id === id);
      events[index] = event;
    } else {
      events.push(event);
    }

    localStorage.setItem("vendorEvents", JSON.stringify(events));
    toast.success(isEdit ? "Event updated successfully!" : "Event created successfully!");
    navigate("/vendor/events");
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

              {/* Ticket Categories */}
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
                >
                  {isEdit ? "Update Event" : "Create Event"}
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
