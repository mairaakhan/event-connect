import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, MousePointer, TrendingUp, Calendar } from "lucide-react";
import { EventPromotion } from "@/types/event";
import { format, isPast, isFuture } from "date-fns";
import { PromotionBadge } from "./PromotionBadge";

interface PromotionAnalyticsProps {
  promotions: (EventPromotion & { eventName: string })[];
}

export const PromotionAnalytics = ({ promotions }: PromotionAnalyticsProps) => {
  if (promotions.length === 0) {
    return null;
  }

  const activePromotions = promotions.filter(p => p.isActive && !isPast(new Date(p.endDate)));
  const totalViews = promotions.reduce((sum, p) => sum + p.views, 0);
  const totalClicks = promotions.reduce((sum, p) => sum + p.clicks, 0);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0';

  return (
    <Card className="mb-6 sm:mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Promotion Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Active Promotions</p>
              <p className="text-2xl font-bold">{activePromotions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MousePointer className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Clicks</p>
              <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Avg. CTR</p>
              <p className="text-2xl font-bold">{ctr}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Individual Promotions */}
        <div className="space-y-3">
          {promotions.map((promo) => {
            const isEnded = isPast(new Date(promo.endDate));
            const isUpcoming = isFuture(new Date(promo.startDate));
            const promoCtr = promo.views > 0 ? ((promo.clicks / promo.views) * 100).toFixed(1) : '0';

            return (
              <Card key={promo.id} className={isEnded ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <PromotionBadge type={promo.promotionType} />
                      <div>
                        <p className="font-medium">{promo.eventName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(promo.startDate), 'MMM d')} - {format(new Date(promo.endDate), 'MMM d, yyyy')}
                          {isEnded && <Badge variant="secondary" className="text-xs">Ended</Badge>}
                          {isUpcoming && <Badge variant="outline" className="text-xs">Upcoming</Badge>}
                          {!isEnded && !isUpcoming && promo.isActive && (
                            <Badge className="bg-green-500 text-white border-0 text-xs">Active</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-medium">Rs. {promo.budget}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Views</p>
                        <p className="font-medium">{promo.views}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Clicks</p>
                        <p className="font-medium">{promo.clicks}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">CTR</p>
                        <p className="font-medium">{promoCtr}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};