"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OpportunityCard } from "@/components/optimization/OpportunityCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, History } from "lucide-react";
import Link from "next/link";

export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Optimization Opportunities</h2>
          <p className="text-muted-foreground">
            AI-detected improvements for your content
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/opportunities/history">
              <History className="mr-2 h-4 w-4" />
              History
            </Link>
          </Button>
          <Button>
            <Play className="mr-2 h-4 w-4" />
            Run Scan
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quick Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Scan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">Never</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="quick-win">Quick Wins</TabsTrigger>
          <TabsTrigger value="moderate">Moderate</TabsTrigger>
          <TabsTrigger value="complex">Complex</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detected Opportunities</CardTitle>
              <CardDescription>
                Review and apply AI-suggested optimizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p>No opportunities detected yet.</p>
                <p className="text-sm mt-2">Run a scan to find optimization opportunities.</p>
                <Button className="mt-4">
                  <Play className="mr-2 h-4 w-4" />
                  Run First Scan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick-win">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <p>No quick win opportunities found.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderate">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <p>No moderate opportunities found.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complex">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <p>No complex opportunities found.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>How Optimization Scanner Works</CardTitle>
          <CardDescription>
            Automated detection runs every 6 hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>5 Detection Rules:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Missing Keywords:</strong> Detect H1/H2 opportunities from tracked keywords</li>
            <li><strong>FAQ Additions:</strong> Generate FAQ sections from tracking prompts</li>
            <li><strong>Metadata Issues:</strong> Fix title/description problems</li>
            <li><strong>LLMTXT Generation:</strong> Create llms.txt for AI platforms</li>
            <li><strong>Internal Links:</strong> Find related content linking opportunities</li>
          </ul>
          <p className="mt-4 text-muted-foreground">
            Expected: 8-15 opportunities per scan for 20 articles
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
