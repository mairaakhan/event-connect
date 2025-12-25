import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/logo.png";

export const Footer = () => {
  return (
    <footer className="bg-card/95 backdrop-blur-sm border-t border-border mt-12 sm:mt-20">
      <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="space-y-4 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <img src={logo} alt="event.pk" className="h-8 w-auto" />
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                event.pk
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
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
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-foreground text-sm sm:text-base">Quick Links</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
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
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-foreground text-sm sm:text-base">Categories</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
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
          <div className="space-y-3 sm:space-y-4 col-span-2 sm:col-span-1">
            <h4 className="font-semibold text-foreground text-sm sm:text-base">Contact Us</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail size={14} className="text-primary sm:w-4 sm:h-4" />
                <a href="mailto:info@event.pk" className="hover:text-primary transition-colors">
                  info@event.pk
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone size={14} className="text-primary sm:w-4 sm:h-4" />
                <a href="tel:+923001234567" className="hover:text-primary transition-colors">
                  +92 300 1234567
                </a>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0 sm:w-4 sm:h-4" />
                <span>Karachi, Lahore, Islamabad</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6 sm:my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} <span className="font-oughter">event.pk</span>. All rights reserved.</p>
          <div className="flex gap-4 sm:gap-6">
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
