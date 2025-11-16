import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StagedPreview } from "@/components/optimization/StagedPreview";
import { PriorityBadge } from "@/components/optimization/PriorityBadge";
import { ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";

export default function OpportunityPreviewPage({ params }: { params: { id: string } }) {
  // This would fetch from Convex in Phase 3
  const mockOpportunity = {
    id: params.id,
    title: "Add Missing Keyword in H2",
    type: "keyword",
    description: "Add 'AI content generation' keyword to H2 heading",
    priority: "quick-win" as const,
    articleTitle: "Best AI Tools for Content Marketing",
    original: "Tools for Marketing Teams",
    modified: "AI Content Generation Tools for Marketing Teams",
  };

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" className="mb-2">
          <Link href="/dashboard/opportunities">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Opportunities
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-3xl font-bold tracking-tight">{mockOpportunity.title}</h2>
              <PriorityBadge priority={mockOpportunity.priority} />
            </div>
            <p className="text-muted-foreground">{mockOpportunity.articleTitle}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <X className="mr-2 h-4 w-4" />
              Dismiss
            </Button>
            <Button>
              <Check className="mr-2 h-4 w-4" />
              Apply Changes
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opportunity Details</CardTitle>
          <CardDescription>{mockOpportunity.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span>
              <span className="ml-2 font-medium capitalize">{mockOpportunity.type}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Estimated Impact:</span>
              <span className="ml-2 font-medium text-green-600">+15% visibility</span>
            </div>
            <div>
              <span className="text-muted-foreground">Effort:</span>
              <span className="ml-2 font-medium">Low (1-2 minutes)</span>
            </div>
            <div>
              <span className="text-muted-foreground">Detection Date:</span>
              <span className="ml-2 font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <StagedPreview
        original={mockOpportunity.original}
        modified={mockOpportunity.modified}
        changeType="Heading Optimization"
        highlights={[{ start: 0, end: 22 }]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Why This Matters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Adding this keyword to your H2 heading will improve your content&apos;s relevance
            for the tracked keyword &quot;AI content generation&quot;.
          </p>
          <p>
            This change was detected because the keyword appears in your tracking list
            but is missing from heading tags in this article.
          </p>
          <p className="text-green-600 font-medium">
            Expected improvement: Better ranking in AI platform responses for related queries
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
