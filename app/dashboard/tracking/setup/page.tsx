"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function TrackingSetupPage() {
  const [brandName, setBrandName] = useState("");
  const [website, setWebsite] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [competitorInput, setCompetitorInput] = useState("");

  const addKeyword = () => {
    if (keywordInput && !keywords.includes(keywordInput)) {
      setKeywords([...keywords, keywordInput]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const addCompetitor = () => {
    if (competitorInput && !competitors.includes(competitorInput)) {
      setCompetitors([...competitors, competitorInput]);
      setCompetitorInput("");
    }
  };

  const removeCompetitor = (competitor: string) => {
    setCompetitors(competitors.filter(c => c !== competitor));
  };

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" className="mb-2">
          <Link href="/dashboard/tracking">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tracking
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Tracking Setup</h2>
        <p className="text-muted-foreground">
          Configure your brand and keywords for AI visibility tracking
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brand Information</CardTitle>
          <CardDescription>
            Tell us about your brand to track mentions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brandName">Brand Name</Label>
            <Input
              id="brandName"
              placeholder="e.g., Acme Corp"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracked Keywords</CardTitle>
          <CardDescription>
            Add keywords to monitor across AI platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., project management software"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addKeyword()}
            />
            <Button onClick={addKeyword}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="px-3 py-1">
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Competitor Brands (Optional)</CardTitle>
          <CardDescription>
            Track competitors for comparison analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Competitor Inc."
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCompetitor()}
            />
            <Button onClick={addCompetitor}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {competitors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {competitors.map((competitor) => (
                <Badge key={competitor} variant="outline" className="px-3 py-1">
                  {competitor}
                  <button
                    onClick={() => removeCompetitor(competitor)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracking Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• 50-100 prompt variations will be generated per keyword</p>
          <p>• Tracking runs across 4 AI platforms (ChatGPT, Claude, Perplexity, Gemini)</p>
          <p>• Visibility scores updated daily</p>
          <p>• Estimated time: ~15 minutes per run</p>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          size="lg"
          className="flex-1"
          disabled={!brandName || !website || keywords.length === 0}
        >
          Start Tracking
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/dashboard/tracking">Cancel</Link>
        </Button>
      </div>
    </div>
  );
}
