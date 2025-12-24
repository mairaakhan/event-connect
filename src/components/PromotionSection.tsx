import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Star, Crown, Sparkles } from "lucide-react";

interface PromotionData {
  enablePromotion: boolean;
  promotionType: 'featured' | 'sponsored' | 'premium';
  budget: string;
  startDate: string;
  endDate: string;
}

interface PromotionSectionProps {
  promotionData: PromotionData;
  onChange: (data: PromotionData) => void;
}

const promotionTiers = [
  {
    type: 'featured' as const,
    name: 'Featured',
    description: 'Highlighted in event listings with a badge',
    icon: Star,
    minBudget: 500,
  },
  {
    type: 'sponsored' as const,
    name: 'Sponsored',
    description: 'Priority placement + homepage visibility',
    icon: Megaphone,
    minBudget: 1000,
  },
  {
    type: 'premium' as const,
    name: 'Premium',
    description: 'Top banner + maximum visibility',
    icon: Crown,
    minBudget: 2500,
  },
];

export const PromotionSection = ({ promotionData, onChange }: PromotionSectionProps) => {
  const handleChange = (field: keyof PromotionData, value: any) => {
    onChange({ ...promotionData, [field]: value });
  };

  const selectedTier = promotionTiers.find(t => t.type === promotionData.promotionType);

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
          <CardContent className="p-4 space-y-6">
            {/* Promotion Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Select Promotion Type</Label>
              <RadioGroup
                value={promotionData.promotionType}
                onValueChange={(value) => handleChange('promotionType', value as PromotionData['promotionType'])}
                className="grid gap-3"
              >
                {promotionTiers.map((tier) => {
                  const Icon = tier.icon;
                  return (
                    <div key={tier.type} className="relative">
                      <RadioGroupItem
                        value={tier.type}
                        id={tier.type}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={tier.type}
                        className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                          peer-checked:border-primary peer-checked:bg-primary/10
                          hover:bg-muted/50 border-border"
                      >
                        <Icon className="h-6 w-6 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{tier.name}</p>
                          <p className="text-sm text-muted-foreground">{tier.description}</p>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Min. Rs. {tier.minBudget}
                        </span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Budget & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="promotionBudget">Budget (Rs.)</Label>
                <Input
                  id="promotionBudget"
                  type="number"
                  min={selectedTier?.minBudget || 500}
                  placeholder={`Min. ${selectedTier?.minBudget || 500}`}
                  value={promotionData.budget}
                  onChange={(e) => handleChange('budget', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotionStart">Start Date</Label>
                <Input
                  id="promotionStart"
                  type="datetime-local"
                  value={promotionData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotionEnd">End Date</Label>
                <Input
                  id="promotionEnd"
                  type="datetime-local"
                  value={promotionData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Your event will be promoted during the selected period. You can view performance analytics in your dashboard.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};