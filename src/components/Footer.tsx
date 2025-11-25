import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  return (
    <footer className="bg-card/95 backdrop-blur-sm border-t border-border mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              event.pk
            </h3>
            <p className="text-sm text-muted-foreground">
              Discover, book, create, and manage events with ease across Pakistan.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-muted-foreground hover:text-primary transition-colors">
                  Explore Events
                </Link>
              </li>
              <li>
                <Link to="/vendor/register" className="text-muted-foreground hover:text-primary transition-colors">
                  List Your Event
                </Link>
              </li>
              <li>
                <Link to="/vendor/signin" className="text-muted-foreground hover:text-primary transition-colors">
                  Vendor Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Event Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                Music Concerts
              </li>
              <li className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                Festivals
              </li>
              <li className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                Standup Comedy
              </li>
              <li className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                Book Fairs
              </li>
              <li className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                Food & Carnivals
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail size={16} className="text-primary" />
                <a href="mailto:info@event.pk" className="hover:text-primary transition-colors">
                  info@event.pk
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone size={16} className="text-primary" />
                <a href="tel:+923001234567" className="hover:text-primary transition-colors">
                  +92 300 1234567
                </a>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span>Karachi, Lahore, Islamabad, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} event.pk. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
