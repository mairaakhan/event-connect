import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export const PromotionSection = () => {
  return (
    <div className="border-t pt-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-muted-foreground">Promote Your Event</h3>
        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-200">
          Coming Soon
        </Badge>
      </div>
    </div>
  );
};