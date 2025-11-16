"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VisibilityScoreCard } from "@/components/tracking/VisibilityScoreCard";
import { TrendChart } from "@/components/tracking/TrendChart";
import { Plus, Settings } from "lucide-react";
import Link from "next/link";

const MOCK_SCORES = [
  { platform: "ChatGPT", score: 0, mentions: 0, trend: 0 },
  { platform: "Claude", score: 0, mentions: 0, trend: 0 },
  { platform: "Perplexity", score: 0, mentions: 0, trend: 0 },
  { platform: "Gemini", score: 0, mentions: 0, trend: 0 },
];

const MOCK_TREND_DATA = [
  { date: "Mon", chatgpt: 0, claude: 0, perplexity: 0, gemini: 0 },
  { date: "Tue", chatgpt: 0, claude: 0, perplexity: 0, gemini: 0 },
  { date: "Wed", chatgpt: 0, claude: 0, perplexity: 0, gemini: 0 },
  { date: "Thu", chatgpt: 0, claude: 0, perplexity: 0, gemini: 0 },
  { date: "Fri", chatgpt: 0, claude: 0, perplexity: 0, gemini: 0 },
  { date: "Sat", chatgpt: 0, claude: 0, perplexity: 0, gemini: 0 },
  { date: "Sun", chatgpt: 0, claude: 0, perplexity: 0, gemini: 0 },
];

export default function TrackingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Visibility Tracking</h2>
          <p className="text-muted-foreground">
            Monitor your brand visibility across 4 AI platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/tracking/setup">
              <Settings className="mr-2 h-4 w-4" />
              Setup
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/tracking/competitors">
              View Competitors
            </Link>
          </Button>
        </div>
      </div>

      {/* Visibility Scores */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {MOCK_SCORES.map((data) => (
          <VisibilityScoreCard key={data.platform} {...data} />
        ))}
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Visibility Trends (Last 7 Days)</CardTitle>
          <CardDescription>
            Track your visibility score changes over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrendChart data={MOCK_TREND_DATA} />
        </CardContent>
      </Card>

      {/* Setup CTA */}
      <Card>
        <CardHeader>
          <CardTitle>Get Started with AI Tracking</CardTitle>
          <CardDescription>
            Set up your brand and keywords to start tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <p className="text-center text-muted-foreground max-w-md">
              Configure your brand name, keywords, and competitors to monitor your visibility
              across ChatGPT, Claude, Perplexity, and Gemini in 100+ countries.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard/tracking/setup">
                <Plus className="mr-2 h-4 w-4" />
                Setup Tracking
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
