/**
 * Keyword Detector
 *
 * Detects opportunities to update headings and intro keywords based on tracking data.
 * Compares H1/H2 tags and first paragraph against tracked keywords to identify missing keywords.
 *
 * Part of Week 5 - Smart Optimization Scanner
 */

import { Doc } from "../../../convex/_generated/dataModel";

/**
 * Keyword Opportunity
 */
export interface KeywordOpportunity {
  type: "UPDATE_HEADINGS_KEYWORDS";
  pageUrl: string;
  pageTitle: string;
  priorityScore: number;
  estimatedImpact: "high" | "medium" | "low";
  detectionDetails: {
    rule: "keyword_missing_in_headings";
    findings: {
      currentH1?: string;
      currentH2s: string[];
      firstParagraph: string;
      missingKeywords: string[];
      trackedKeywords: string[];
      keywordDensity: number; // percentage
    };
    suggestedFix: {
      newH1?: string;
      newH2s?: string[];
      newFirstParagraph?: string;
      keywordsToAdd: string[];
    };
  };
}

/**
 * Extract headings from article content
 */
function extractHeadings(contentMarkdown: string): { h1?: string; h2s: string[] } {
  const h1Match = contentMarkdown.match(/^#\s+(.+)$/m);
  const h2Matches = Array.from(contentMarkdown.matchAll(/^##\s+(.+)$/gm));

  return {
    h1: h1Match?.[1],
    h2s: h2Matches.map((m) => m[1]),
  };
}

/**
 * Extract first paragraph
 */
function extractFirstParagraph(contentMarkdown: string): string {
  // Remove headings and get first non-empty paragraph
  const withoutHeadings = contentMarkdown.replace(/^#+\s+.+$/gm, "");
  const paragraphs = withoutHeadings.split("\n\n").filter((p) => p.trim().length > 0);
  return paragraphs[0] || "";
}

/**
 * Calculate keyword density (percentage)
 */
function calculateKeywordDensity(text: string, keywords: string[]): number {
  const words = text.toLowerCase().split(/\s+/);
  const totalWords = words.length;

  if (totalWords === 0) return 0;

  let keywordCount = 0;
  keywords.forEach((keyword) => {
    const keywordWords = keyword.toLowerCase().split(/\s+/);
    for (let i = 0; i <= words.length - keywordWords.length; i++) {
      const slice = words.slice(i, i + keywordWords.length).join(" ");
      if (slice === keywordWords.join(" ")) {
        keywordCount++;
      }
    }
  });

  return (keywordCount / totalWords) * 100;
}

/**
 * Check if text contains keyword
 */
function containsKeyword(text: string, keyword: string): boolean {
  return text.toLowerCase().includes(keyword.toLowerCase());
}

/**
 * Generate suggested H1 with keyword
 */
function suggestH1WithKeyword(currentH1: string, keyword: string): string {
  // If keyword already present, return current
  if (containsKeyword(currentH1, keyword)) {
    return currentH1;
  }

  // Simple strategy: prepend or append keyword naturally
  // This is a simplified version - in production, use AI to rewrite naturally
  return `${keyword}: ${currentH1}`;
}

/**
 * Detect keyword optimization opportunities
 *
 * @param article - Published article to analyze
 * @param trackedKeywords - Keywords being tracked for AI visibility
 * @returns Array of keyword opportunities detected
 */
export async function detectKeywordOpportunities(
  article: any, // Doc<"articles"> - using any to avoid circular dependency
  trackedKeywords: string[]
): Promise<KeywordOpportunity[]> {
  const opportunities: KeywordOpportunity[] = [];

  if (!article.content || !article.publishedUrl) {
    return opportunities;
  }

  // Extract content structure
  const { h1, h2s } = extractHeadings(article.content);
  const firstParagraph = extractFirstParagraph(article.content);

  // Find missing keywords (not in H1, H2, or first paragraph)
  const missingKeywords: string[] = [];

  trackedKeywords.forEach((keyword) => {
    const inH1 = h1 ? containsKeyword(h1, keyword) : false;
    const inH2 = h2s.some((h2) => containsKeyword(h2, keyword));
    const inFirstPara = containsKeyword(firstParagraph, keyword);

    if (!inH1 && !inH2 && !inFirstPara) {
      missingKeywords.push(keyword);
    }
  });

  // If no missing keywords, no opportunity
  if (missingKeywords.length === 0) {
    return opportunities;
  }

  // Calculate current keyword density
  const keywordDensity = calculateKeywordDensity(article.content, trackedKeywords);

  // Calculate priority score
  // Higher score if:
  // - More keywords missing
  // - Article has high traffic (if we have analytics)
  // - Keyword density is low
  let priorityScore = 50; // Base score

  // More missing keywords = higher priority
  priorityScore += Math.min(missingKeywords.length * 10, 30);

  // Low keyword density = higher priority
  if (keywordDensity < 0.5) {
    priorityScore += 20;
  } else if (keywordDensity < 1.0) {
    priorityScore += 10;
  }

  // Cap at 100
  priorityScore = Math.min(priorityScore, 100);

  // Determine estimated impact
  let estimatedImpact: "high" | "medium" | "low" = "medium";
  if (missingKeywords.length >= 3) {
    estimatedImpact = "high";
  } else if (missingKeywords.length === 1) {
    estimatedImpact = "low";
  }

  // Generate suggested fixes
  const suggestedFix: any = {
    keywordsToAdd: missingKeywords,
  };

  // Suggest new H1 with first missing keyword
  if (h1 && missingKeywords.length > 0) {
    suggestedFix.newH1 = suggestH1WithKeyword(h1, missingKeywords[0]);
  }

  // Create opportunity
  opportunities.push({
    type: "UPDATE_HEADINGS_KEYWORDS",
    pageUrl: article.publishedUrl,
    pageTitle: article.title || "Untitled",
    priorityScore,
    estimatedImpact,
    detectionDetails: {
      rule: "keyword_missing_in_headings",
      findings: {
        currentH1: h1,
        currentH2s: h2s,
        firstParagraph,
        missingKeywords,
        trackedKeywords,
        keywordDensity,
      },
      suggestedFix,
    },
  });

  return opportunities;
}

/**
 * Batch detect keyword opportunities for multiple articles
 */
export async function batchDetectKeywordOpportunities(
  articles: any[],
  trackedKeywords: string[]
): Promise<KeywordOpportunity[]> {
  const allOpportunities: KeywordOpportunity[] = [];

  for (const article of articles) {
    const opportunities = await detectKeywordOpportunities(article, trackedKeywords);
    allOpportunities.push(...opportunities);
  }

  return allOpportunities;
}
