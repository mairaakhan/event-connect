import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserNavbar } from "@/components/UserNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useVendorAuth } from "@/hooks/useVendorAuth";
import { Loader2 } from "lucide-react";

const VendorSignIn = () => {
  const navigate = useNavigate();
  const { signIn } = useVendorAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      await signIn(formData.email, formData.password);
      toast.success("Sign in successful!");
      navigate("/vendor/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <UserNavbar />
      
      <div className="container py-20">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl text-center bg-gradient-primary bg-clip-text text-transparent">
              Vendor Sign In
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Welcome back to event.pk
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
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
                <Label htmlFor="password">Password</Label>
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

              <Button
                type="submit"
                className="w-full bg-gradient-accent hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/vendor/register" className="text-primary hover:underline">
                  Register Now
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorSignIn;
