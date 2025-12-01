import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachWeekOfInterval, eachDayOfInterval, isWithinInterval, subMonths } from "date-fns";
import { Event, Booking } from "@/types/event";

interface SalesAnalyticsChartProps {
  events: Event[];
  bookings: Booking[];
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export const SalesAnalyticsChart = ({ events, bookings }: SalesAnalyticsChartProps) => {
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("month");
  const [statusFilter, setStatusFilter] = useState<string>("paid");

  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    
    // Filter by event
    if (selectedEventId !== "all") {
      filtered = filtered.filter(b => b.eventId === selectedEventId);
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    // Filter by date range
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case "week":
        startDate = startOfWeek(now);
        break;
      case "month":
        startDate = startOfMonth(now);
        break;
      case "3months":
        startDate = subMonths(now, 3);
        break;
      default:
        startDate = subMonths(now, 1);
    }
    
    filtered = filtered.filter(b => new Date(b.createdAt) >= startDate);
    
    return filtered;
  }, [bookings, selectedEventId, statusFilter, dateRange]);

  // Calculate weekly data
  const weeklyData = useMemo(() => {
    const now = new Date();
    const startDate = dateRange === "3months" ? subMonths(now, 3) : subMonths(now, 1);
    const weeks = eachWeekOfInterval({ start: startDate, end: now });
    
    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart);
      const weekBookings = filteredBookings.filter(b => {
        const bookingDate = new Date(b.createdAt);
        return isWithinInterval(bookingDate, { start: weekStart, end: weekEnd });
      });
      
      const ticketsSold = weekBookings.reduce((sum, b) => 
        sum + b.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      );
      
      return {
        week: format(weekStart, "MMM d"),
        tickets: ticketsSold,
        revenue: weekBookings.reduce((sum, b) => sum + b.totalAmount, 0),
      };
    });
  }, [filteredBookings, dateRange]);

  // Calculate category breakdown
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    filteredBookings.forEach(booking => {
      booking.items.forEach(item => {
        const current = categoryMap.get(item.categoryName) || 0;
        categoryMap.set(item.categoryName, current + item.quantity);
      });
    });
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredBookings]);

  // Stats summary
  const totalTickets = filteredBookings.reduce((sum, b) => 
    sum + b.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Sales Analytics</CardTitle>
        
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map(event => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid Only</SelectItem>
              <SelectItem value="reserved">Reserved Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Tickets</p>
            <p className="text-2xl font-bold">{totalTickets}</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-primary">Rs. {totalRevenue.toFixed(0)}</p>
          </div>
        </div>
        
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly Trend</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="mt-4">
            <div className="h-[300px] w-full">
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number, name: string) => [
                        name === "tickets" ? value : `Rs. ${value.toFixed(0)}`,
                        name === "tickets" ? "Tickets Sold" : "Revenue"
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="tickets" name="Tickets Sold" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available for the selected filters
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="categories" className="mt-4">
            <div className="h-[300px] w-full">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`${value} tickets`, "Sold"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No category data available
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
