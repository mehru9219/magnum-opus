import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Copy, Trash2 } from "lucide-react";
import { QualityScoreDisplay } from "./QualityScoreDisplay";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    template: string;
    status: "queued" | "generating" | "completed" | "failed";
    generatedBy: string;
    createdAt: number;
    qualityScores?: {
      plagiarism: number;
      readability: number;
      factCheck: number;
    };
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  const statusColors = {
    queued: "secondary",
    generating: "default",
    completed: "default",
    failed: "destructive",
  } as const;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">{article.title}</CardTitle>
              <CardDescription>
                {article.template} • {article.generatedBy}
              </CardDescription>
            </div>
          </div>
          <Badge variant={statusColors[article.status]}>
            {article.status}
          </Badge>
        </div>
      </CardHeader>

      {article.qualityScores && article.status === "completed" && (
        <CardContent>
          <QualityScoreDisplay scores={article.qualityScores} />
        </CardContent>
      )}

      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {new Date(article.createdAt).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
