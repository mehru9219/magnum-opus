import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface PublishPreviewProps {
  article: {
    title: string;
    content: string;
  };
  platforms: string[];
  adaptations: Record<string, { title: string; content: string }>;
}

export function PublishPreview({ article, platforms, adaptations }: PublishPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Platform Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={platforms[0]}>
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${platforms.length}, 1fr)` }}>
            {platforms.map((platform) => (
              <TabsTrigger key={platform} value={platform} className="capitalize">
                {platform}
              </TabsTrigger>
            ))}
          </TabsList>

          {platforms.map((platform) => {
            const adapted = adaptations[platform] || article;
            return (
              <TabsContent key={platform} value={platform} className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{adapted.title}</h3>
                  <Badge variant="secondary">{platform}</Badge>
                </div>
                <div className="prose prose-sm max-w-none bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {adapted.content.substring(0, 500)}...
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Content adapted for {platform} format and best practices
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
