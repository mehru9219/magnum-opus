"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformConnectionCard } from "@/components/publishing/PlatformConnectionCard";
import { Plus } from "lucide-react";
import Link from "next/link";

const PLATFORMS = [
  { id: "wordpress", name: "WordPress", description: "Blog CMS", icon: "📝", connected: false },
  { id: "shopify", name: "Shopify", description: "E-commerce", icon: "🛍️", connected: false },
  { id: "medium", name: "Medium", description: "Publishing Platform", icon: "M", connected: false },
  { id: "linkedin", name: "LinkedIn", description: "Professional Network", icon: "💼", connected: false },
  { id: "webflow", name: "Webflow", description: "Website Builder", icon: "W", connected: false },
  { id: "devto", name: "Dev.to", description: "Developer Community", icon: "👨‍💻", connected: false },
  { id: "ghost", name: "Ghost", description: "Publishing CMS", icon: "👻", connected: false },
  { id: "wix", name: "Wix", description: "Website Builder", icon: "W", connected: false },
  { id: "squarespace", name: "Squarespace", description: "Website Builder", icon: "▪️", connected: false },
  { id: "custom", name: "Custom CMS", description: "Webhook Integration", icon: "🔗", connected: false },
];

export default function PublishPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Publishing</h2>
          <p className="text-muted-foreground">
            Connect platforms and manage your publishing workflows
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/publish/history">
            View History
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Platforms</CardTitle>
          <CardDescription>
            Connect your platforms to publish content with one click
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PLATFORMS.map((platform) => (
              <PlatformConnectionCard
                key={platform.id}
                platform={platform}
                onConnect={() => console.log(`Connecting ${platform.id}`)}
                onDisconnect={() => console.log(`Disconnecting ${platform.id}`)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Publish</CardTitle>
          <CardDescription>
            Select articles and platforms to publish
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No articles ready to publish. Generate some content first!</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/generate">
                Generate Content
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
