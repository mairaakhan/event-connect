import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VendorNavbar } from "@/components/VendorNavbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, User, Phone, Mail, MapPin, Lock, LogOut, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const VendorSettings = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    contactPerson: "",
    phone: "",
    email: "",
    city: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const auth = localStorage.getItem("vendorAuth");
    if (!auth) {
      navigate("/vendor/signin");
      return;
    }

    const vendorData = JSON.parse(auth);
    setVendor(vendorData);
    setFormData({
      organizationName: vendorData.organizationName,
      contactPerson: vendorData.contactPerson,
      phone: vendorData.phone,
      email: vendorData.email,
      city: vendorData.city,
    });
  }, [navigate]);

  const handleUpdateProfile = () => {
    if (!vendor) return;

    const updatedVendor = {
      ...vendor,
      ...formData,
    };

    localStorage.setItem("vendorAuth", JSON.stringify(updatedVendor));
    setVendor(updatedVendor);
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  const handleChangePassword = () => {
    if (!vendor) return;

    if (passwordData.currentPassword !== vendor.password) {
      toast.error("Current password is incorrect");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const updatedVendor = {
      ...vendor,
      password: passwordData.newPassword,
    };

    localStorage.setItem("vendorAuth", JSON.stringify(updatedVendor));
    setVendor(updatedVendor);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    toast.success("Password changed successfully");
  };

  const handleLogoutAllDevices = () => {
    localStorage.removeItem("vendorAuth");
    toast.success("Logged out from all devices");
    navigate("/vendor/signin");
  };

  const getLoginActivity = () => {
    const loginLogs = JSON.parse(localStorage.getItem(`loginLogs_${vendor?.id}`) || "[]");
    return loginLogs.slice(0, 5);
  };

  if (!vendor) return null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <VendorNavbar />
      
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization information and account security
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Organization Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization Information
              </CardTitle>
              <CardDescription>
                Update your business details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person Name</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleUpdateProfile}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Information
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Security
              </CardTitle>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleChangePassword}>
                    Update Password
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Recent Login Activity</h3>
                <div className="space-y-2">
                  {getLoginActivity().length > 0 ? (
                    getLoginActivity().map((log: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Login from {log.device || "Unknown Device"}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent login activity</p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Session Management
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign out from all devices and sessions
                </p>
                <Button variant="destructive" onClick={handleLogoutAllDevices}>
                  Logout From All Devices
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VendorSettings;
