import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompetitorComparison } from "@/components/tracking/CompetitorComparison";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const MOCK_COMPARISON_DATA = [
  { platform: "ChatGPT", yourBrand: 0, competitor1: 0, competitor2: 0 },
  { platform: "Claude", yourBrand: 0, competitor1: 0, competitor2: 0 },
  { platform: "Perplexity", yourBrand: 0, competitor1: 0, competitor2: 0 },
  { platform: "Gemini", yourBrand: 0, competitor1: 0, competitor2: 0 },
];

export default function CompetitorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" className="mb-2">
          <Link href="/dashboard/tracking">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tracking
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Competitor Comparison</h2>
        <p className="text-muted-foreground">
          See how your visibility stacks up against competitors
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visibility Comparison by Platform</CardTitle>
          <CardDescription>
            Compare your brand&apos;s visibility score against competitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompetitorComparison data={MOCK_COMPARISON_DATA} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Configure tracking to see competitor comparisons</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/tracking/setup">
                Setup Tracking
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
