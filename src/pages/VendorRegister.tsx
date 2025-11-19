import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserNavbar } from "@/components/UserNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const VendorRegister = () => {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    contactPerson: "",
    phone: "",
    email: "",
    password: "",
    city: "",
    country: "",
    registrationDetails: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accepted) {
      toast.error("Please accept the platform commission terms");
      return;
    }

    // Check if vendor already exists
    const existingVendors = JSON.parse(localStorage.getItem("vendors") || "[]");
    const vendorExists = existingVendors.some((v: any) => v.email === formData.email);

    if (vendorExists) {
      toast.error("Account already exists. Please sign in.");
      return;
    }

    // Save vendor
    const newVendor = {
      id: Date.now().toString(),
      ...formData,
    };
    
    existingVendors.push(newVendor);
    localStorage.setItem("vendors", JSON.stringify(existingVendors));
    localStorage.setItem("vendorAuth", JSON.stringify(newVendor));

    toast.success("Registration successful!");
    navigate("/vendor/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <UserNavbar />
      
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl text-center bg-gradient-primary bg-clip-text text-transparent">
              Vendor Registration
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Start listing your events on event.pk
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <Input
                    id="organizationName"
                    required
                    value={formData.organizationName}
                    onChange={(e) =>
                      setFormData({ ...formData, organizationName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person Name *</Label>
                  <Input
                    id="contactPerson"
                    required
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPerson: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    required
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    required
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="registrationDetails">
                    Valid ID / Tax / Registration Details (Optional)
                  </Label>
                  <Input
                    id="registrationDetails"
                    value={formData.registrationDetails}
                    onChange={(e) =>
                      setFormData({ ...formData, registrationDetails: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-6">
                <div className="bg-accent/10 p-4 rounded-lg mb-4">
                  <p className="text-sm font-semibold">Platform Commission: 8% of each ticket sale</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accept"
                    checked={accepted}
                    onCheckedChange={(checked) => setAccepted(checked as boolean)}
                  />
                  <Label
                    htmlFor="accept"
                    className="text-sm cursor-pointer"
                  >
                    I accept the platform commission terms
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-accent hover:opacity-90"
              >
                Confirm Registration
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/vendor/signin" className="text-primary hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorRegister;
