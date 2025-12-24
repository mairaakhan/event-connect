import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Star, Megaphone, Crown, Sparkles } from "lucide-react";

interface PromotionData {
  enablePromotion: boolean;
  promotionType: 'featured' | 'sponsored' | 'premium';
}

interface PromotionSectionProps {
  promotionData: PromotionData;
  onChange: (data: PromotionData) => void;
}

const promotionTiers = [
  {
    type: 'featured' as const,
    name: 'Featured',
    description: 'Highlighted with a badge in event listings',
    icon: Star,
    color: 'text-amber-500',
  },
  {
    type: 'sponsored' as const,
    name: 'Sponsored',
    description: 'Priority placement + homepage visibility',
    icon: Megaphone,
    color: 'text-blue-500',
  },
  {
    type: 'premium' as const,
    name: 'Premium',
    description: 'Top banner + maximum visibility',
    icon: Crown,
    color: 'text-purple-500',
  },
];

export const PromotionSection = ({ promotionData, onChange }: PromotionSectionProps) => {
  const handleChange = (field: keyof PromotionData, value: any) => {
    onChange({ ...promotionData, [field]: value });
  };

  return (
    <div className="space-y-4 border-t pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Promote Your Event</h3>
          <Badge variant="secondary" className="text-xs">Optional</Badge>
        </div>
        <Switch
          checked={promotionData.enablePromotion}
          onCheckedChange={(checked) => handleChange('enablePromotion', checked)}
        />
      </div>

      {promotionData.enablePromotion && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <Label className="text-base font-medium mb-3 block">Select Promotion Type</Label>
            <RadioGroup
              value={promotionData.promotionType}
              onValueChange={(value) => handleChange('promotionType', value as PromotionData['promotionType'])}
              className="grid gap-3"
            >
              {promotionTiers.map((tier) => {
                const Icon = tier.icon;
                const isSelected = promotionData.promotionType === tier.type;
                return (
                  <div key={tier.type} className="relative">
                    <RadioGroupItem
                      value={tier.type}
                      id={tier.type}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={tier.type}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${isSelected ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`}
                    >
                      <Icon className={`h-6 w-6 ${tier.color}`} />
                      <div className="flex-1">
                        <p className="font-medium">{tier.name}</p>
                        <p className="text-sm text-muted-foreground">{tier.description}</p>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>
      )}
    </div>
  );
};