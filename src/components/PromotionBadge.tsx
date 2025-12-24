import { Badge } from "@/components/ui/badge";
import { Star, Megaphone, Crown } from "lucide-react";

interface PromotionBadgeProps {
  type: 'featured' | 'sponsored' | 'premium';
  size?: 'sm' | 'md';
}

export const PromotionBadge = ({ type, size = 'sm' }: PromotionBadgeProps) => {
  const config = {
    featured: {
      label: 'Featured',
      icon: Star,
      className: 'bg-amber-500 text-white border-0',
    },
    sponsored: {
      label: 'Sponsored',
      icon: Megaphone,
      className: 'bg-blue-500 text-white border-0',
    },
    premium: {
      label: 'Premium',
      icon: Crown,
      className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0',
    },
  };

  const { label, icon: Icon, className } = config[type];
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <Badge className={`${className} ${textSize}`}>
      <Icon className={`${iconSize} mr-1`} />
      {label}
    </Badge>
  );
};