/**
 * Metadata Detector
 *
 * Detects opportunities to refresh stale metadata (title, description) for top pages.
 * Identifies outdated dates, missing trending keywords, and character limit issues.
 *
 * Part of Week 5 - Smart Optimization Scanner
 */

/**
 * Metadata Opportunity
 */
export interface MetadataOpportunity {
  type: "REFRESH_METADATA";
  pageUrl: string;
  pageTitle: string;
  priorityScore: number;
  estimatedImpact: "high" | "medium" | "low";
  detectionDetails: {
    rule: "stale_metadata";
    findings: {
      currentTitle: string;
      currentDescription?: string;
      titleLength: number;
      descriptionLength: number;
      lastUpdated?: number; // timestamp
      monthsSinceUpdate?: number;
      hasCurrentYear: boolean;
      titleOptimal: boolean; // 50-60 chars
      descriptionOptimal: boolean; // 150-160 chars
      trendingKeywordsMissing: string[];
    };
    suggestedFix: {
      newTitle?: string;
      newDescription?: string;
      addCurrentYear: boolean;
      addTrendingKeywords: string[];
    };
  };
}

const OPTIMAL_TITLE_LENGTH = { min: 50, max: 60 };
const OPTIMAL_DESCRIPTION_LENGTH = { min: 150, max: 160 };
const STALE_THRESHOLD_MONTHS = 6;

/**
 * Check if metadata contains current year
 */
function hasCurrentYear(text: string): boolean {
  const currentYear = new Date().getFullYear();
  return text.includes(currentYear.toString());
}

/**
 * Calculate months since last update
 */
function getMonthsSinceUpdate(lastUpdatedTimestamp?: number): number | undefined {
  if (!lastUpdatedTimestamp) {
    return undefined;
  }

  const now = Date.now();
  const diffMs = now - lastUpdatedTimestamp;
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30);

  return Math.floor(diffMonths);
}

/**
 * Check if title length is optimal
 */
function isTitleOptimal(title: string): boolean {
  const length = title.length;
  return length >= OPTIMAL_TITLE_LENGTH.min && length <= OPTIMAL_TITLE_LENGTH.max;
}

/**
 * Check if description length is optimal
 */
function isDescriptionOptimal(description: string): boolean {
  const length = description.length;
  return length >= OPTIMAL_DESCRIPTION_LENGTH.min && length <= OPTIMAL_DESCRIPTION_LENGTH.max;
}

/**
 * Find trending keywords missing from metadata
 */
function findMissingTrendingKeywords(
  metadata: string,
  trendingKeywords: string[]
): string[] {
  const missing: string[] = [];

  trendingKeywords.forEach((keyword) => {
    if (!metadata.toLowerCase().includes(keyword.toLowerCase())) {
      missing.push(keyword);
    }
  });

  return missing;
}

/**
 * Generate optimized title with current year and keywords
 */
function suggestOptimizedTitle(
  currentTitle: string,
  trendingKeywords: string[]
): string {
  const currentYear = new Date().getFullYear();

  // If title is already optimal and has current year, return as-is
  if (isTitleOptimal(currentTitle) && hasCurrentYear(currentTitle)) {
    return currentTitle;
  }

  // Build new title
  let newTitle = currentTitle;

  // Add current year if missing
  if (!hasCurrentYear(currentTitle)) {
    // Try to replace old year
    const yearPattern = /\b(20\d{2})\b/;
    if (yearPattern.test(currentTitle)) {
      newTitle = currentTitle.replace(yearPattern, currentYear.toString());
    } else {
      // Prepend or append year
      newTitle = `${currentTitle} (${currentYear})`;
    }
  }

  // Add top trending keyword if missing and space allows
  if (trendingKeywords.length > 0 && newTitle.length < OPTIMAL_TITLE_LENGTH.max) {
    const topKeyword = trendingKeywords[0];
    if (!newTitle.toLowerCase().includes(topKeyword.toLowerCase())) {
      // Simple prepend strategy
      newTitle = `${topKeyword}: ${newTitle}`;
    }
  }

  // Truncate if too long
  if (newTitle.length > OPTIMAL_TITLE_LENGTH.max) {
    newTitle = newTitle.substring(0, OPTIMAL_TITLE_LENGTH.max - 3) + "...";
  }

  return newTitle;
}

/**
 * Generate optimized meta description
 */
function suggestOptimizedDescription(
  currentDescription: string,
  trendingKeywords: string[]
): string {
  // If optimal and has trending keywords, return as-is
  const hasTrending = trendingKeywords.some((kw) =>
    currentDescription.toLowerCase().includes(kw.toLowerCase())
  );

  if (isDescriptionOptimal(currentDescription) && hasTrending) {
    return currentDescription;
  }

  // Build new description
  let newDescription = currentDescription;

  // Add trending keywords naturally
  const missingKeywords = findMissingTrendingKeywords(currentDescription, trendingKeywords);
  if (missingKeywords.length > 0 && newDescription.length < OPTIMAL_DESCRIPTION_LENGTH.max - 20) {
    // Append first missing keyword
    newDescription += ` Learn about ${missingKeywords[0]}.`;
  }

  // Adjust length
  if (newDescription.length < OPTIMAL_DESCRIPTION_LENGTH.min) {
    // Pad with generic content
    newDescription += " Complete guide with examples and best practices.";
  }

  if (newDescription.length > OPTIMAL_DESCRIPTION_LENGTH.max) {
    newDescription = newDescription.substring(0, OPTIMAL_DESCRIPTION_LENGTH.max - 3) + "...";
  }

  return newDescription;
}

/**
 * Detect metadata refresh opportunities
 *
 * @param article - Published article to analyze
 * @param trendingKeywords - Current trending keywords in the industry
 * @param isTopPage - Is this a top-performing page?
 * @returns Array of metadata opportunities detected
 */
export async function detectMetadataOpportunities(
  article: any, // Doc<"articles">
  trendingKeywords: string[] = [],
  isTopPage: boolean = false
): Promise<MetadataOpportunity[]> {
  const opportunities: MetadataOpportunity[] = [];

  if (!article.publishedUrl) {
    return opportunities;
  }

  // Extract metadata
  const currentTitle = article.metaTitle || article.title || "";
  const currentDescription = article.metaDescription || "";

  // Calculate staleness
  const monthsSinceUpdate = getMonthsSinceUpdate(article.lastUpdatedAt || article.createdAt);
  const isStale = monthsSinceUpdate !== undefined && monthsSinceUpdate >= STALE_THRESHOLD_MONTHS;

  // Check optimization flags
  const titleOptimal = isTitleOptimal(currentTitle);
  const descriptionOptimal = isDescriptionOptimal(currentDescription);
  const yearPresent = hasCurrentYear(currentTitle + " " + currentDescription);

  // Find missing trending keywords
  const trendingKeywordsMissing = findMissingTrendingKeywords(
    currentTitle + " " + currentDescription,
    trendingKeywords
  );

  // Determine if there's an opportunity
  const needsRefresh =
    isStale ||
    !titleOptimal ||
    !descriptionOptimal ||
    !yearPresent ||
    trendingKeywordsMissing.length > 0;

  if (!needsRefresh) {
    return opportunities;
  }

  // Calculate priority score
  let priorityScore = 40; // Base score

  // Top page = higher priority
  if (isTopPage) {
    priorityScore += 30;
  }

  // Staleness increases priority
  if (monthsSinceUpdate !== undefined) {
    if (monthsSinceUpdate >= 12) {
      priorityScore += 20;
    } else if (monthsSinceUpdate >= 6) {
      priorityScore += 10;
    }
  }

  // Missing current year = higher priority
  if (!yearPresent) {
    priorityScore += 10;
  }

  // Not optimal length = moderate priority
  if (!titleOptimal || !descriptionOptimal) {
    priorityScore += 5;
  }

  // Cap at 100
  priorityScore = Math.min(priorityScore, 100);

  // Determine estimated impact
  let estimatedImpact: "high" | "medium" | "low" = "medium";
  if (isTopPage && isStale) {
    estimatedImpact = "high";
  } else if (!isTopPage && monthsSinceUpdate && monthsSinceUpdate < 6) {
    estimatedImpact = "low";
  }

  // Generate suggested fixes
  const newTitle = suggestOptimizedTitle(currentTitle, trendingKeywords);
  const newDescription = suggestOptimizedDescription(currentDescription, trendingKeywords);

  // Create opportunity
  opportunities.push({
    type: "REFRESH_METADATA",
    pageUrl: article.publishedUrl,
    pageTitle: article.title || "Untitled",
    priorityScore,
    estimatedImpact,
    detectionDetails: {
      rule: "stale_metadata",
      findings: {
        currentTitle,
        currentDescription,
        titleLength: currentTitle.length,
        descriptionLength: currentDescription.length,
        lastUpdated: article.lastUpdatedAt || article.createdAt,
        monthsSinceUpdate,
        hasCurrentYear: yearPresent,
        titleOptimal,
        descriptionOptimal,
        trendingKeywordsMissing,
      },
      suggestedFix: {
        newTitle: newTitle !== currentTitle ? newTitle : undefined,
        newDescription: newDescription !== currentDescription ? newDescription : undefined,
        addCurrentYear: !yearPresent,
        addTrendingKeywords: trendingKeywordsMissing.slice(0, 3), // Top 3
      },
    },
  });

  return opportunities;
}

/**
 * Batch detect metadata opportunities for multiple articles
 */
export async function batchDetectMetadataOpportunities(
  articles: any[],
  trendingKeywords: string[],
  topPageUrls: Set<string>
): Promise<MetadataOpportunity[]> {
  const allOpportunities: MetadataOpportunity[] = [];

  for (const article of articles) {
    const isTopPage = topPageUrls.has(article.publishedUrl || article._id);
    const opportunities = await detectMetadataOpportunities(article, trendingKeywords, isTopPage);
    allOpportunities.push(...opportunities);
  }

  return allOpportunities;
}
