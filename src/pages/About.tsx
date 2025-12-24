import { Calendar, Users, BarChart3, Ticket, Shield, CreditCard, Clock, Tag, Sparkles, Building2, UserCheck, Share2 } from "lucide-react";
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
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            About event.pk
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Pakistan's trusted platform for discovering events and managing ticket sales with complete transparency.
          </p>
        </section>

        {/* Platform Overview */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">What is event.pk?</h2>
          </div>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed mb-4">
                event.pk is an event discovery and ticketing platform built for Pakistan. We connect event-goers with concerts, 
                exhibitions, workshops, festivals, and community gatherings happening across the country.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For event organizers, we provide a complete dashboard to create events, manage ticket sales, 
                track bookings, and understand their audience through analytics.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our goal is simple: make it easy to find events you'll love and help organizers sell tickets without hassle.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Features for Users */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">For Event-Goers</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={<Calendar className="h-5 w-5" />}
              title="Browse Events"
              description="Filter by city, category, and date to find events that match your interests."
            />
            <FeatureCard
              icon={<Ticket className="h-5 w-5" />}
              title="Easy Booking"
              description="Select your tickets, choose quantities, and book in just a few clicks."
            />
            <FeatureCard
              icon={<Share2 className="h-5 w-5" />}
              title="Digital Tickets"
              description="Get your tickets with QR codes that you can save or share with friends."
            />
            <FeatureCard
              icon={<Tag className="h-5 w-5" />}
              title="Multiple Categories"
              description="Choose from different ticket types like VIP, General, or Student passes."
            />
            <FeatureCard
              icon={<Clock className="h-5 w-5" />}
              title="Multi-Day Support"
              description="Book tickets for specific days of multi-day events or festivals."
            />
            <FeatureCard
              icon={<CreditCard className="h-5 w-5" />}
              title="Flexible Payment"
              description="Pay through JazzCash, Easypaisa, bank transfer, or cash at venue."
            />
          </div>
        </section>

        {/* Features for Organizers */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">For Event Organizers</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={<Building2 className="h-5 w-5" />}
              title="Vendor Dashboard"
              description="A dedicated panel to create events, manage tickets, and track everything in one place."
            />
            <FeatureCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Sales Analytics"
              description="See how your tickets are selling with charts showing daily trends and revenue."
            />
            <FeatureCard
              icon={<Ticket className="h-5 w-5" />}
              title="Ticket Categories"
              description="Create multiple ticket types with different prices and quantities for each."
            />
            <FeatureCard
              icon={<Calendar className="h-5 w-5" />}
              title="Multi-Day Events"
              description="Set up events spanning multiple days with separate schedules and tickets."
            />
            <FeatureCard
              icon={<Tag className="h-5 w-5" />}
              title="Discount Options"
              description="Offer early bird discounts, group booking deals, or flash sales to boost sales."
            />
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title="Booking Management"
              description="View all bookings, check payment status, and manage attendee lists."
            />
          </div>
        </section>

        {/* Ticket Booking Flow */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">How Booking Works</h2>
          </div>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-6">
                <StepCard number={1} title="Select Event" description="Browse and choose an event you want to attend." />
                <StepCard number={2} title="Choose Tickets" description="Pick your ticket category and quantity." />
                <StepCard number={3} title="Make Payment" description="Pay via JazzCash, Easypaisa, bank transfer, or cash." />
                <StepCard number={4} title="Get Ticket" description="Receive your digital ticket with QR code for entry." />
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Payment Note:</strong> Currently, payments are processed offline (bank transfer, mobile wallets, or cash). 
                  Your booking is confirmed once the organizer verifies your payment. We're working on adding instant online payment options.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Event Types */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Event Types Supported</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Single-Day Events</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Concerts, workshops, seminars, and one-time gatherings with a single schedule.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• One date, one set of tickets</li>
                  <li>• Simple booking process</li>
                  <li>• Perfect for most events</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Multi-Day Events</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Festivals, exhibitions, and conferences spanning multiple days.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Separate schedules for each day</li>
                  <li>• Day-specific ticket categories</li>
                  <li>• Option for same tickets across all days</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Ticket Categories & Discounts */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Tickets & Discounts</h2>
          </div>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Ticket Categories</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Organizers can create different ticket types:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• <strong>General Admission</strong> – Standard entry tickets</li>
                    <li>• <strong>VIP / Premium</strong> – Better seats or perks</li>
                    <li>• <strong>Student</strong> – Discounted for students</li>
                    <li>• <strong>Family Pass</strong> – Group entry packages</li>
                    <li>• <strong>Free Registration</strong> – For free community events</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Discount Options</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Ways to save on tickets:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• <strong>Early Bird</strong> – Book before deadline for lower price</li>
                    <li>• <strong>Group Booking</strong> – Discount when booking multiple tickets</li>
                    <li>• <strong>Flash Sales</strong> – Limited-time price drops</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Transparency & Security */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Transparency & Security</h2>
          </div>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">What We Promise</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Clear pricing with no hidden fees</li>
                    <li>• Real-time ticket availability updates</li>
                    <li>• Verified event organizers</li>
                    <li>• Secure booking and payment handling</li>
                    <li>• Digital tickets that can't be duplicated</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Platform Commission</h3>
                  <p className="text-muted-foreground text-sm">
                    We charge a small commission on ticket sales to maintain the platform. 
                    This is clearly shown to organizers in their dashboard. 
                    There are no charges for free events.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Future Roadmap */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">What's Coming Next</h2>
          </div>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                We're continuously improving event.pk based on user feedback. Here's what we're working on:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <RoadmapItem title="Online Payments" description="Direct payment through JazzCash and Easypaisa APIs" />
                <RoadmapItem title="Mobile App" description="Native apps for Android and iOS" />
                <RoadmapItem title="Event Reviews" description="Let attendees rate and review events" />
                <RoadmapItem title="Saved Events" description="Bookmark events and get reminders" />
                <RoadmapItem title="Ticket Transfer" description="Send tickets to friends and family" />
                <RoadmapItem title="Organizer Verification" description="Badge system for trusted organizers" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact */}
        <section className="text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-3">Questions or Feedback?</h2>
              <p className="text-muted-foreground mb-4">
                We'd love to hear from you. Whether you're an event-goer or an organizer, your feedback helps us improve.
              </p>
              <p className="text-foreground">
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
  <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-colors">
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const StepCard = ({ number, title, description }: { number: number; title: string; description: string }) => (
  <div className="text-center">
    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mx-auto mb-3">
      {number}
    </div>
    <h3 className="font-medium text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

const RoadmapItem = ({ title, description }: { title: string; description: string }) => (
  <div className="flex items-start gap-2">
    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
    <div>
      <span className="font-medium text-foreground">{title}</span>
      <span className="text-muted-foreground"> – {description}</span>
    </div>
  </div>
);

export default About;
