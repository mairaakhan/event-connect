import * as React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// --- SVG Icons ---
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// --- Helper Components ---
const DashedLine = () => (
  <div
    className="w-full border-t-2 border-dashed border-border"
    aria-hidden="true"
  />
);

const Barcode = ({ value }: { value: string }) => {
  const hashCode = (s: string) =>
    s.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
  const seed = hashCode(value);
  const random = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const bars = Array.from({ length: 60 }).map((_, index) => {
    const rand = random(seed + index);
    const width = rand > 0.7 ? 2.5 : 1.5;
    return { width };
  });

  const spacing = 1.5;
  const totalWidth = bars.reduce((acc, bar) => acc + bar.width + spacing, 0) - spacing;
  const svgWidth = 250;
  const svgHeight = 70;
  let currentX = (svgWidth - totalWidth) / 2;

  return (
    <div className="flex flex-col items-center py-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        aria-label={`Barcode for value ${value}`}
        className="fill-current text-foreground"
      >
        {bars.map((bar, index) => {
          const x = currentX;
          currentX += bar.width + spacing;
          return <rect key={index} x={x} y="10" width={bar.width} height="50" />;
        })}
      </svg>
      <p className="text-sm text-muted-foreground tracking-[0.3em] mt-2">{value}</p>
    </div>
  );
};

// --- Main Ticket Component ---
export interface TicketDownloadProps {
  ticketId: string;
  eventName: string;
  eventDate: Date;
  eventVenue: string;
  eventCity: string;
  items: Array<{
    categoryName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  bookedBy?: string;
  paidBy?: string;
}

const TicketDownloadCard = React.forwardRef<HTMLDivElement, TicketDownloadProps>(
  (
    {
      ticketId,
      eventName,
      eventDate,
      eventVenue,
      eventCity,
      items,
      totalAmount,
      bookedBy,
      paidBy,
    },
    ref
  ) => {
    const formattedDate = format(eventDate, "EEEE, MMMM d, yyyy");
    const formattedTime = format(eventDate, "h:mm a");
    const totalTickets = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div
        ref={ref}
        className={cn(
          "w-full max-w-md bg-card text-card-foreground rounded-2xl shadow-2xl font-sans overflow-hidden"
        )}
        style={{ backgroundColor: "#ffffff", color: "#000000" }}
      >
        {/* Header */}
        <div
          className="p-6 text-center"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)",
          }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3">
            <CheckCircleIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Ticket Confirmed</h1>
          <p className="text-white/90 text-sm mt-1">Present this ticket at the venue</p>
        </div>

        {/* Ticket Cut-out Effect */}
        <div className="relative">
          <div
            className="absolute -left-4 top-0 w-8 h-8 rounded-full"
            style={{ backgroundColor: "#f3f4f6" }}
          />
          <div
            className="absolute -right-4 top-0 w-8 h-8 rounded-full"
            style={{ backgroundColor: "#f3f4f6" }}
          />
          <div className="border-t-2 border-dashed border-gray-300 mx-6" />
        </div>

        {/* Event Details */}
        <div className="p-6 space-y-4" style={{ backgroundColor: "#ffffff" }}>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">{eventName}</h2>
            <p className="text-gray-600 mt-1">
              {eventVenue}, {eventCity}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
              <p className="font-semibold text-gray-900">{formattedDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Time</p>
              <p className="font-semibold text-gray-900">{formattedTime}</p>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Tickets</p>
            {items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.categoryName} × {item.quantity}
                </span>
                <span className="font-medium text-gray-900">
                  Rs. {(item.price * item.quantity).toFixed(0)}
                </span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-gray-200 font-bold">
              <span className="text-gray-900">Total ({totalTickets} tickets)</span>
              <span style={{ color: "#f97316" }}>Rs. {totalAmount.toFixed(0)}</span>
            </div>
          </div>

          {/* Attendee Info */}
          {(bookedBy || paidBy) && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: "#f9fafb" }}>
              {bookedBy && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Booked By:</span>
                  <span className="font-medium text-gray-900">{bookedBy}</span>
                </div>
              )}
              {paidBy && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Paid By:</span>
                  <span className="font-medium text-gray-900">{paidBy}</span>
                </div>
              )}
            </div>
          )}

          <DashedLine />

          {/* Barcode */}
          <div className="pt-2">
            <Barcode value={ticketId.toUpperCase()} />
          </div>

          {/* Footer */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              Powered by <span className="font-semibold" style={{ fontFamily: "Outfit, sans-serif" }}>event.pk</span>
            </p>
          </div>
        </div>
      </div>
    );
  }
);

TicketDownloadCard.displayName = "TicketDownloadCard";

export { TicketDownloadCard };
