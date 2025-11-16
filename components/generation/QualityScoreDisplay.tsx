import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface QualityScoreDisplayProps {
  scores: {
    plagiarism: number; // 0-100, lower is better
    readability: number; // 0-100, higher is better
    factCheck: number; // 0-100, higher is better
  };
}

export function QualityScoreDisplay({ scores }: QualityScoreDisplayProps) {
  const getScoreIcon = (score: number, inverse: boolean = false) => {
    const effectiveScore = inverse ? 100 - score : score;

    if (effectiveScore >= 70) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    } else if (effectiveScore >= 50) {
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getScoreColor = (score: number, inverse: boolean = false) => {
    const effectiveScore = inverse ? 100 - score : score;

    if (effectiveScore >= 70) return "text-green-600";
    if (effectiveScore >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getScoreIcon(scores.plagiarism, true)}
          <span className="text-sm font-medium">Plagiarism</span>
        </div>
        <Badge variant="outline" className={getScoreColor(scores.plagiarism, true)}>
          {scores.plagiarism.toFixed(1)}% {scores.plagiarism < 2 ? "✓" : ""}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getScoreIcon(scores.readability)}
          <span className="text-sm font-medium">Readability</span>
        </div>
        <Badge variant="outline" className={getScoreColor(scores.readability)}>
          {scores.readability.toFixed(0)}/100 {scores.readability >= 70 ? "✓" : ""}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getScoreIcon(scores.factCheck)}
          <span className="text-sm font-medium">Fact Check</span>
        </div>
        <Badge variant="outline" className={getScoreColor(scores.factCheck)}>
          {scores.factCheck.toFixed(0)}% {scores.factCheck >= 90 ? "✓" : ""}
        </Badge>
      </div>
    </div>
  );
}
