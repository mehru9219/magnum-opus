"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Upload } from "lucide-react";
import Link from "next/link";

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [template, setTemplate] = useState("listicle");
  const [model, setModel] = useState("gpt-4");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");

  const handleGenerate = () => {
    // This will be connected to Convex mutation in Phase 2
    console.log("Generating article:", { topic, template, model, tone, length });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Generate Content</h2>
          <p className="text-muted-foreground">
            Create AI-powered, SEO-optimized articles in minutes
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/generate/bulk">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList>
          <TabsTrigger value="single">Single Article</TabsTrigger>
          <TabsTrigger value="results">Recent Articles</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Article Configuration</CardTitle>
              <CardDescription>
                Configure your article parameters and let AI do the rest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Best AI Tools for Content Marketing"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Content Template</Label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger id="template">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="listicle">Listicle</SelectItem>
                      <SelectItem value="how-to">How-To Guide</SelectItem>
                      <SelectItem value="comparison">Comparison</SelectItem>
                      <SelectItem value="problem-solver">Problem-Solver</SelectItem>
                      <SelectItem value="ultimate-guide">Ultimate Guide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 (Highest Quality)</SelectItem>
                      <SelectItem value="gpt-3.5">GPT-3.5 (Fastest)</SelectItem>
                      <SelectItem value="claude-3.5">Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="perplexity">Perplexity</SelectItem>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="length">Article Length</Label>
                  <Select value={length} onValueChange={setLength}>
                    <SelectTrigger id="length">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (500-800 words)</SelectItem>
                      <SelectItem value="medium">Medium (1000-1500 words)</SelectItem>
                      <SelectItem value="long">Long (2000-3000 words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Target Keywords (Optional)</Label>
                <Textarea
                  id="keywords"
                  placeholder="Enter keywords separated by commas"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleGenerate}
                className="w-full"
                size="lg"
                disabled={!topic}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Article
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estimated Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {model === "gpt-4" ? "~$0.15" : "~$0.05"} per article
                </span>
                <span className="text-sm text-muted-foreground">
                  Includes quality checks and citations
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Recent Articles</CardTitle>
              <CardDescription>
                View and manage your generated articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p>No articles generated yet. Create your first one!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
