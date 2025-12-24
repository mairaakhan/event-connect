import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, Megaphone, Crown, Sparkles } from "lucide-react";

const promotionTiers = [
  {
    type: 'featured' as const,
    name: 'Featured',
    description: 'Highlighted with a badge in event listings',
    icon: Star,
    color: 'text-amber-500',
    price: 500,
  },
  {
    type: 'sponsored' as const,
    name: 'Sponsored',
    description: 'Priority placement + homepage visibility',
    icon: Megaphone,
    color: 'text-blue-500',
    price: 1000,
  },
  {
    type: 'premium' as const,
    name: 'Premium',
    description: 'Top banner + maximum visibility',
    icon: Crown,
    color: 'text-purple-500',
    price: 2500,
  },
];

export const PromotionSection = () => {
  return (
    <div className="space-y-4 border-t pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-muted-foreground">Promote Your Event</h3>
          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-200">
            Coming Soon
          </Badge>
        </div>
      </div>

      <Card className="border-muted bg-muted/30 opacity-60">
        <CardContent className="p-4">
          <Label className="text-base font-medium mb-3 block text-muted-foreground">Promotion Tiers</Label>
          <div className="grid gap-3">
            {promotionTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.type}
                  className="flex items-center gap-4 p-4 rounded-lg border-2 border-border bg-background/50 cursor-not-allowed"
                >
                  <Icon className={`h-6 w-6 ${tier.color} opacity-50`} />
                  <div className="flex-1">
                    <p className="font-medium text-muted-foreground">{tier.name}</p>
                    <p className="text-sm text-muted-foreground/70">{tier.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">
                    Rs. {tier.price}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Event promotion will be available soon with online payment integration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};