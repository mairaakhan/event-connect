import { Calendar, Users, Ticket, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UserNavbar } from "@/components/UserNavbar";
import { Footer } from "@/components/Footer";
import { GradientBackground } from "@/components/GradientBackground";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <GradientBackground />
      <UserNavbar />
      
      <main className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About event.pk
          </h1>
        </section>

        {/* What We Do */}
        <section className="mb-16 max-w-3xl mx-auto">
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">What We Do</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                event.pk connects event-goers with concerts, exhibitions, workshops, and community gatherings 
                across Pakistan. For organizers, we provide tools to create events, manage tickets, and track sales.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Key Features */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <FeatureCard 
              icon={<Calendar className="w-6 h-6" />} 
              title="Browse Events" 
              description="Discover events by city, category, and date with our easy-to-use filters" 
            />
            <FeatureCard 
              icon={<Ticket className="w-6 h-6" />} 
              title="Easy Booking" 
              description="Multiple ticket types, early bird pricing, and group discounts available" 
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6" />} 
              title="Vendor Dashboard" 
              description="Create and manage your events with a simple, powerful interface" 
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6" />} 
              title="Analytics" 
              description="Track your ticket sales, revenue, and audience insights in real-time" 
            />
          </div>
        </section>

        {/* Contact */}
        <section className="text-center max-w-2xl mx-auto">
          <Card className="bg-primary/5 border-primary/20 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-foreground mb-3">Have Questions?</h2>
              <p className="text-muted-foreground text-lg">
                Reach out to us at <a href="mailto:hello@event.pk" className="text-primary hover:underline font-medium">hello@event.pk</a>
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
  <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-md hover:shadow-lg transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">{icon}</div>
        <div>
          <h3 className="font-semibold text-foreground text-lg mb-1">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default About;
