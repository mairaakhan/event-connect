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
    registrationDetails: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    iban: "",
    mobileWallet: "",
    paymentMethodType: "bank" as 'bank' | 'mobile-wallet' | 'both',
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
      organizationName: formData.organizationName,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
      city: formData.city,
      registrationDetails: formData.registrationDetails,
      paymentDetails: {
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        iban: formData.iban,
        mobileWallet: formData.mobileWallet,
        paymentMethodType: formData.paymentMethodType,
      },
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

              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Payment Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                    <Input
                      id="accountHolderName"
                      required
                      value={formData.accountHolderName}
                      onChange={(e) =>
                        setFormData({ ...formData, accountHolderName: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      required
                      value={formData.bankName}
                      onChange={(e) =>
                        setFormData({ ...formData, bankName: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      required
                      value={formData.accountNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, accountNumber: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iban">IBAN (Optional)</Label>
                    <Input
                      id="iban"
                      value={formData.iban}
                      onChange={(e) =>
                        setFormData({ ...formData, iban: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="mobileWallet">Mobile Wallet (Easypaisa / JazzCash)</Label>
                    <Input
                      id="mobileWallet"
                      placeholder="03xxxxxxxxx"
                      value={formData.mobileWallet}
                      onChange={(e) =>
                        setFormData({ ...formData, mobileWallet: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-6">
                <div className="bg-accent/10 p-4 rounded-lg mb-4">
                  <p className="text-sm font-semibold">Platform Commission: 8% of each ticket sale</p>
                  <p className="text-xs text-muted-foreground mt-1">92% of ticket price goes to your registered payment account</p>
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
