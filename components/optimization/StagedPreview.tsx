import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface StagedPreviewProps {
  original: string;
  modified: string;
  changeType: string;
  highlights?: { start: number; end: number }[];
}

export function StagedPreview({
  original,
  modified,
  changeType,
  highlights = [],
}: StagedPreviewProps) {
  const highlightText = (text: string, highlights: { start: number; end: number }[]) => {
    if (highlights.length === 0) return text;

    let result: React.ReactNode[] = [];
    let lastIndex = 0;

    highlights.forEach(({ start, end }, index) => {
      // Add text before highlight
      if (start > lastIndex) {
        result.push(text.substring(lastIndex, start));
      }
      // Add highlighted text
      result.push(
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-900">
          {text.substring(start, end)}
        </mark>
      );
      lastIndex = end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }

    return result;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Staged Changes Preview</CardTitle>
          <Badge>{changeType}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="diff" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="diff">Side by Side</TabsTrigger>
            <TabsTrigger value="original">Original</TabsTrigger>
            <TabsTrigger value="modified">Modified</TabsTrigger>
          </TabsList>

          <TabsContent value="diff">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Original</h4>
                <div className="rounded-lg bg-muted/30 p-4 text-sm">
                  {original}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-green-600">Modified</h4>
                <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-sm">
                  {highlightText(modified, highlights)}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="original">
            <div className="rounded-lg bg-muted/30 p-4 text-sm">
              {original}
            </div>
          </TabsContent>

          <TabsContent value="modified">
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-sm">
              {highlightText(modified, highlights)}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
