import { Calendar, Users, Ticket, Shield, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UserNavbar } from "@/components/UserNavbar";
import { Footer } from "@/components/Footer";
import { GradientBackground } from "@/components/GradientBackground";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <GradientBackground />
      <UserNavbar />
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            About event.pk
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pakistan's platform for discovering events and selling tickets with transparency.
          </p>
        </section>

        {/* What We Do */}
        <section className="mb-12">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed">
                event.pk connects event-goers with concerts, exhibitions, workshops, and community gatherings 
                across Pakistan. For organizers, we provide tools to create events, manage tickets, and track sales.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard icon={<Calendar />} title="Browse Events" description="Filter by city, category, and date" />
            <FeatureCard icon={<Ticket />} title="Easy Booking" description="Multiple ticket types and discounts" />
            <FeatureCard icon={<Users />} title="Vendor Dashboard" description="Create and manage your events" />
            <FeatureCard icon={<BarChart3 />} title="Analytics" description="Track sales and revenue" />
            <FeatureCard icon={<Shield />} title="Secure" description="Digital tickets with QR codes" />
          </div>
        </section>

        {/* Contact */}
        <section className="text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">Questions?</h2>
              <p className="text-muted-foreground">
                Email us at <a href="mailto:hello@event.pk" className="text-primary hover:underline">hello@event.pk</a>
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>
        <div>
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default About;
