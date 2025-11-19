import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserHome from "./pages/UserHome";
import EventDetails from "./pages/EventDetails";
import VendorRegister from "./pages/VendorRegister";
import VendorSignIn from "./pages/VendorSignIn";
import VendorDashboard from "./pages/VendorDashboard";
import VendorEvents from "./pages/VendorEvents";
import VendorEventForm from "./pages/VendorEventForm";
import VendorEventAnalytics from "./pages/VendorEventAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserHome />} />
          <Route path="/explore" element={<UserHome />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/vendor/register" element={<VendorRegister />} />
          <Route path="/vendor/signin" element={<VendorSignIn />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/events" element={<VendorEvents />} />
          <Route path="/vendor/events/new" element={<VendorEventForm />} />
          <Route path="/vendor/events/edit/:id" element={<VendorEventForm />} />
          <Route path="/vendor/events/analytics/:id" element={<VendorEventAnalytics />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
