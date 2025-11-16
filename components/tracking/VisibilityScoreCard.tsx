import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface VisibilityScoreCardProps {
  platform: string;
  score: number; // 0-100
  mentions: number;
  trend: number; // Positive or negative change
}

export function VisibilityScoreCard({
  platform,
  score,
  mentions,
  trend,
}: VisibilityScoreCardProps) {
  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const getScoreColor = () => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{platform}</CardTitle>
        <Badge variant="outline" className="text-xs">
          {mentions} mentions
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className={`text-3xl font-bold ${getScoreColor()}`}>
            {score.toFixed(1)}%
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {getTrendIcon()}
            <span className={getTrendColor()}>
              {trend > 0 ? "+" : ""}{trend.toFixed(1)}% from last week
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
