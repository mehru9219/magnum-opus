import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "./PriorityBadge";
import { Badge } from "@/components/ui/badge";
import { Eye, Check, X } from "lucide-react";
import Link from "next/link";

interface OpportunityCardProps {
  opportunity: {
    id: string;
    type: "keyword" | "faq" | "metadata" | "llmtxt" | "internal-link";
    title: string;
    description: string;
    priority: "quick-win" | "moderate" | "complex";
    articleTitle: string;
    status: "pending" | "approved" | "applied" | "dismissed";
  };
  onApprove?: () => void;
  onDismiss?: () => void;
}

const typeIcons = {
  keyword: "🔑",
  faq: "❓",
  metadata: "📋",
  llmtxt: "🤖",
  "internal-link": "🔗",
};

const typeLabels = {
  keyword: "Missing Keyword",
  faq: "FAQ Addition",
  metadata: "Metadata Issue",
  llmtxt: "LLMTXT Generation",
  "internal-link": "Internal Link",
};

export function OpportunityCard({
  opportunity,
  onApprove,
  onDismiss,
}: OpportunityCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{typeIcons[opportunity.type]}</span>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                <PriorityBadge priority={opportunity.priority} />
              </div>
              <CardDescription>
                {typeLabels[opportunity.type]} • {opportunity.articleTitle}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{opportunity.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/opportunities/preview/${opportunity.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button size="sm" onClick={onApprove}>
            <Check className="mr-2 h-4 w-4" />
            Approve
          </Button>
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
