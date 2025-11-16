import { Badge } from "@/components/ui/badge";
import { Zap, Clock, AlertCircle } from "lucide-react";

interface PriorityBadgeProps {
  priority: "quick-win" | "moderate" | "complex";
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = {
    "quick-win": {
      label: "Quick Win",
      icon: <Zap className="h-3 w-3" />,
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    moderate: {
      label: "Moderate",
      icon: <Clock className="h-3 w-3" />,
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    complex: {
      label: "Complex",
      icon: <AlertCircle className="h-3 w-3" />,
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
  };

  const { label, icon, className } = config[priority];

  return (
    <Badge variant="outline" className={className}>
      <span className="mr-1">{icon}</span>
      {label}
    </Badge>
  );
}
