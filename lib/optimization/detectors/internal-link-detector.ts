/**
 * Internal Link Detector
 *
 * Detects opportunities to add internal links to improve site structure and SEO.
 * Identifies pages with low internal link density and suggests relevant links.
 *
 * Part of Week 5 - Smart Optimization Scanner
 */

/**
 * Internal Link Opportunity
 */
export interface InternalLinkOpportunity {
  type: "ADD_INTERNAL_LINKS";
  pageUrl: string;
  pageTitle: string;
  priorityScore: number;
  estimatedImpact: "high" | "medium" | "low";
  detectionDetails: {
    rule: "low_internal_link_density";
    findings: {
      currentInternalLinks: number;
      wordCount: number;
      linkDensity: number; // links per 1000 words
      targetLinkDensity: number; // 3-5 per 1000 words
      relatedArticles: Array<{
        title: string;
        url: string;
        relevanceScore: number;
      }>;
    };
    suggestedFix: {
      linksToAdd: Array<{
        targetUrl: string;
        targetTitle: string;
        suggestedAnchorText: string;
        relevanceScore: number;
        insertionContext?: string; // Where to insert (paragraph snippet)
      }>;
      targetLinkCount: number;
    };
  };
}

const TARGET_LINK_DENSITY = { min: 3, max: 5 }; // per 1000 words

/**
 * Calculate internal link density
 */
function calculateLinkDensity(internalLinksCount: number, wordCount: number): number {
  if (wordCount === 0) return 0;
  return (internalLinksCount / wordCount) * 1000;
}

/**
 * Calculate relevance score between two articles
 * Based on shared keywords, similar topics, etc.
 */
function calculateRelevance(sourceArticle: any, targetArticle: any): number {
  let relevanceScore = 0;

  // Check keyword overlap
  const sourceKeywords = new Set(
    (Array.isArray(sourceArticle.keywords) ? sourceArticle.keywords : []).map((k: string) =>
      k.toLowerCase()
    )
  );
  const targetKeywords = new Set(
    (Array.isArray(targetArticle.keywords) ? targetArticle.keywords : []).map((k: string) =>
      k.toLowerCase()
    )
  );

  // Count shared keywords
  let sharedKeywords = 0;
  sourceKeywords.forEach((kw) => {
    if (targetKeywords.has(kw)) {
      sharedKeywords++;
    }
  });

  relevanceScore += sharedKeywords * 10; // 10 points per shared keyword

  // Check topic similarity (simplified - check if topics are similar)
  const sourceTopic = (sourceArticle.topic || "").toLowerCase();
  const targetTopic = (targetArticle.topic || "").toLowerCase();

  if (sourceTopic && targetTopic && sourceTopic === targetTopic) {
    relevanceScore += 20;
  }

  // Check title word overlap
  const sourceTitleWords = new Set<string>(
    (sourceArticle.title || "").toLowerCase().split(/\s+/)
  );
  const targetTitleWords = new Set<string>(
    (targetArticle.title || "").toLowerCase().split(/\s+/)
  );

  let titleOverlap = 0;
  for (const word of sourceTitleWords) {
    if (targetTitleWords.has(word) && word.length > 3) {
      // Ignore short words
      titleOverlap++;
    }
  }

  relevanceScore += titleOverlap * 5; // 5 points per shared title word

  // Check template similarity (same content type)
  if (sourceArticle.template === targetArticle.template) {
    relevanceScore += 10;
  }

  // Cap at 100
  return Math.min(relevanceScore, 100);
}

/**
 * Find related articles for internal linking
 */
function findRelatedArticles(
  sourceArticle: any,
  allArticles: any[],
  maxResults: number = 10
): Array<{
  title: string;
  url: string;
  relevanceScore: number;
}> {
  const relatedArticles: Array<{
    title: string;
    url: string;
    relevanceScore: number;
  }> = [];

  // Filter out source article and unpublished articles
  const candidates = allArticles.filter(
    (article) =>
      article._id !== sourceArticle._id &&
      article.status === "published" &&
      article.publishedUrl
  );

  // Calculate relevance for each candidate
  candidates.forEach((candidate) => {
    const relevanceScore = calculateRelevance(sourceArticle, candidate);

    if (relevanceScore > 20) {
      // Minimum threshold
      relatedArticles.push({
        title: candidate.title || "Untitled",
        url: candidate.publishedUrl,
        relevanceScore,
      });
    }
  });

  // Sort by relevance (highest first)
  relatedArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Return top N
  return relatedArticles.slice(0, maxResults);
}

/**
 * Generate anchor text for internal link
 */
function generateAnchorText(targetArticle: any, sourceContext?: string): string {
  // Use title as default anchor text
  let anchorText = targetArticle.title || "this article";

  // Simplify long titles
  if (anchorText.length > 60) {
    // Extract main topic from title
    const words = anchorText.split(/\s+/);
    anchorText = words.slice(0, 6).join(" ");
    if (words.length > 6) {
      anchorText += "...";
    }
  }

  // Convert to natural anchor text
  // e.g., "The Ultimate Guide to SEO" -> "ultimate guide to SEO"
  anchorText = anchorText.replace(/^(The|A|An)\s+/i, "").toLowerCase();

  return anchorText;
}

/**
 * Detect internal link opportunities
 *
 * @param article - Article to analyze
 * @param allArticles - All published articles for finding related content
 * @returns Array of internal link opportunities detected
 */
export async function detectInternalLinkOpportunities(
  article: any,
  allArticles: any[]
): Promise<InternalLinkOpportunity[]> {
  const opportunities: InternalLinkOpportunity[] = [];

  if (!article.publishedUrl || article.status !== "published") {
    return opportunities;
  }

  // Get current internal links count
  const currentInternalLinks = Array.isArray(article.internalLinks)
    ? article.internalLinks.length
    : 0;

  // Get word count
  const wordCount = article.wordCount || 0;

  if (wordCount === 0) {
    return opportunities;
  }

  // Calculate link density
  const linkDensity = calculateLinkDensity(currentInternalLinks, wordCount);

  // Check if link density is below target
  if (linkDensity >= TARGET_LINK_DENSITY.min) {
    return opportunities; // Already has enough links
  }

  // Find related articles
  const relatedArticles = findRelatedArticles(article, allArticles);

  if (relatedArticles.length === 0) {
    return opportunities; // No related articles to link to
  }

  // Calculate how many links to add
  const targetLinksPerThousand = TARGET_LINK_DENSITY.min;
  const targetTotalLinks = Math.ceil((wordCount / 1000) * targetLinksPerThousand);
  const linksToAdd = Math.max(0, targetTotalLinks - currentInternalLinks);

  if (linksToAdd === 0) {
    return opportunities;
  }

  // Select top related articles to link to
  const selectedArticles = relatedArticles.slice(0, linksToAdd);

  // Generate link suggestions
  const linksToAddDetails = selectedArticles.map((related) => ({
    targetUrl: related.url,
    targetTitle: related.title,
    suggestedAnchorText: generateAnchorText({ title: related.title }),
    relevanceScore: related.relevanceScore,
    insertionContext: undefined, // Would need content analysis to determine best placement
  }));

  // Calculate priority score
  let priorityScore = 50; // Base score

  // Lower link density = higher priority
  const densityGap = TARGET_LINK_DENSITY.min - linkDensity;
  priorityScore += Math.min(densityGap * 5, 30);

  // More related articles available = higher priority
  if (relatedArticles.length >= 5) {
    priorityScore += 10;
  }

  // Longer article = higher priority (more impact)
  if (wordCount > 2000) {
    priorityScore += 10;
  }

  // Cap at 100
  priorityScore = Math.min(priorityScore, 100);

  // Determine estimated impact
  let estimatedImpact: "high" | "medium" | "low" = "medium";
  if (linkDensity < 1 && wordCount > 1500) {
    estimatedImpact = "high";
  } else if (linkDensity >= 2) {
    estimatedImpact = "low";
  }

  // Create opportunity
  opportunities.push({
    type: "ADD_INTERNAL_LINKS",
    pageUrl: article.publishedUrl,
    pageTitle: article.title || "Untitled",
    priorityScore,
    estimatedImpact,
    detectionDetails: {
      rule: "low_internal_link_density",
      findings: {
        currentInternalLinks,
        wordCount,
        linkDensity,
        targetLinkDensity: TARGET_LINK_DENSITY.min,
        relatedArticles,
      },
      suggestedFix: {
        linksToAdd: linksToAddDetails,
        targetLinkCount: targetTotalLinks,
      },
    },
  });

  return opportunities;
}

/**
 * Batch detect internal link opportunities for multiple articles
 */
export async function batchDetectInternalLinkOpportunities(
  articles: any[]
): Promise<InternalLinkOpportunity[]> {
  const allOpportunities: InternalLinkOpportunity[] = [];

  // Filter published articles
  const publishedArticles = articles.filter((a) => a.status === "published" && a.publishedUrl);

  for (const article of publishedArticles) {
    const opportunities = await detectInternalLinkOpportunities(article, publishedArticles);
    allOpportunities.push(...opportunities);
  }

  return allOpportunities;
}
