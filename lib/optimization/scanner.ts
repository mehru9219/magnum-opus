/**
 * Optimization Scanner Orchestration
 *
 * Coordinates all 5 detection rules and manages the scanning process.
 * Runs every 6 hours to detect optimization opportunities.
 *
 * Part of Week 5 - Smart Optimization Scanner
 */

import { detectKeywordOpportunities } from "./detectors/keyword-detector";
import { detectFAQOpportunities } from "./detectors/faq-detector";
import { detectMetadataOpportunities } from "./detectors/metadata-detector";
import { detectLLMTXTOpportunities } from "./detectors/llmtxt-generator";
import { detectInternalLinkOpportunities } from "./detectors/internal-link-detector";

/**
 * Scanner Configuration
 */
export interface ScannerConfig {
  userId: string;
  siteId?: string;
  scanType: "full" | "incremental";
  detectRules: {
    keywords: boolean;
    faq: boolean;
    metadata: boolean;
    llmtxt: boolean;
    internalLinks: boolean;
  };
  priorityThreshold?: number; // Only return opportunities above this score
}

/**
 * Scanner Result
 */
export interface ScannerResult {
  success: boolean;
  scanSessionId?: string;
  pagesAnalyzed: number;
  opportunitiesDetected: number;
  opportunities: OpportunityResult[];
  errors: string[];
  duration: number; // milliseconds
}

/**
 * Unified Opportunity Result
 */
export interface OpportunityResult {
  type: "UPDATE_HEADINGS_KEYWORDS" | "ADD_FAQ" | "REFRESH_METADATA" | "UPLOAD_LLMTXT" | "ADD_INTERNAL_LINKS";
  pageUrl: string;
  pageTitle: string;
  priorityScore: number;
  priorityLevel: "urgent" | "high" | "medium" | "low";
  estimatedImpact: "high" | "medium" | "low";
  detectionDetails: any;
}

/**
 * Priority Scoring Weights
 */
const PRIORITY_WEIGHTS = {
  baseScore: {
    UPDATE_HEADINGS_KEYWORDS: 50,
    ADD_FAQ: 60,
    REFRESH_METADATA: 40,
    UPLOAD_LLMTXT: 70,
    ADD_INTERNAL_LINKS: 50,
  },
  pageTrafficMultiplier: 1.2, // If page has high traffic
  topRankingMultiplier: 1.15, // If page ranks in top 10
  stalenessMultiplier: 1.1, // If page is stale (>6 months)
};

/**
 * Calculate Priority Level from Score
 */
export function calculatePriorityLevel(score: number): "urgent" | "high" | "medium" | "low" {
  if (score >= 90) return "urgent";
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

/**
 * Adjust Priority Score based on page metrics
 */
export function adjustPriorityScore(
  baseScore: number,
  pageMetrics: {
    hasHighTraffic?: boolean;
    isTopRanking?: boolean;
    isStale?: boolean;
  }
): number {
  let adjustedScore = baseScore;

  if (pageMetrics.hasHighTraffic) {
    adjustedScore *= PRIORITY_WEIGHTS.pageTrafficMultiplier;
  }

  if (pageMetrics.isTopRanking) {
    adjustedScore *= PRIORITY_WEIGHTS.topRankingMultiplier;
  }

  if (pageMetrics.isStale) {
    adjustedScore *= PRIORITY_WEIGHTS.stalenessMultiplier;
  }

  // Cap at 100
  return Math.min(Math.round(adjustedScore), 100);
}

/**
 * OpportunityScanner Class
 *
 * Main scanner that orchestrates all detection rules
 */
export class OpportunityScanner {
  private config: ScannerConfig;

  constructor(config: ScannerConfig) {
    this.config = config;
  }

  /**
   * Run the complete scan
   */
  public async scan(
    articles: any[],
    trackedKeywords: string[] = [],
    trackingPrompts: Map<string, string[]> = new Map(),
    siteInfo?: {
      name: string;
      description: string;
      url: string;
    }
  ): Promise<ScannerResult> {
    const startTime = Date.now();

    const result: ScannerResult = {
      success: false,
      pagesAnalyzed: 0,
      opportunitiesDetected: 0,
      opportunities: [],
      errors: [],
      duration: 0,
    };

    try {
      // Filter articles based on scan type
      let articlesToScan = articles;

      if (this.config.scanType === "incremental") {
        // Only scan articles updated in last 7 days
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        articlesToScan = articles.filter(
          (a) => (a.lastUpdatedAt || a.createdAt || 0) > sevenDaysAgo
        );
      }

      result.pagesAnalyzed = articlesToScan.length;

      // Run each detection rule in parallel
      const detectionPromises: Promise<OpportunityResult[]>[] = [];

      // 1. Keyword Detection
      if (this.config.detectRules.keywords) {
        detectionPromises.push(
          this.runKeywordDetection(articlesToScan, trackedKeywords)
        );
      }

      // 2. FAQ Detection
      if (this.config.detectRules.faq) {
        detectionPromises.push(
          this.runFAQDetection(articlesToScan, trackingPrompts)
        );
      }

      // 3. Metadata Detection
      if (this.config.detectRules.metadata) {
        detectionPromises.push(
          this.runMetadataDetection(articlesToScan, trackedKeywords)
        );
      }

      // 4. LLMTXT Detection
      if (this.config.detectRules.llmtxt && siteInfo) {
        detectionPromises.push(
          this.runLLMTXTDetection(articles, siteInfo)
        );
      }

      // 5. Internal Links Detection
      if (this.config.detectRules.internalLinks) {
        detectionPromises.push(
          this.runInternalLinksDetection(articlesToScan, articles)
        );
      }

      // Wait for all detections to complete
      const detectionResults = await Promise.all(detectionPromises);

      // Flatten results
      const allOpportunities = detectionResults.flat();

      // Apply priority threshold filter if specified
      const filteredOpportunities = this.config.priorityThreshold
        ? allOpportunities.filter(
            (opp) => opp.priorityScore >= this.config.priorityThreshold!
          )
        : allOpportunities;

      // Sort by priority score (highest first)
      filteredOpportunities.sort((a, b) => b.priorityScore - a.priorityScore);

      result.opportunities = filteredOpportunities;
      result.opportunitiesDetected = filteredOpportunities.length;
      result.success = true;
    } catch (error: any) {
      result.errors.push(`Scanner error: ${error.message}`);
    }

    result.duration = Date.now() - startTime;

    return result;
  }

  /**
   * Run Keyword Detection
   */
  private async runKeywordDetection(
    articles: any[],
    trackedKeywords: string[]
  ): Promise<OpportunityResult[]> {
    const opportunities: OpportunityResult[] = [];

    try {
      for (const article of articles) {
        const detected = await detectKeywordOpportunities(article, trackedKeywords);

        detected.forEach((opp) => {
          opportunities.push({
            ...opp,
            priorityLevel: calculatePriorityLevel(opp.priorityScore),
          });
        });
      }
    } catch (error: any) {
      console.error("Keyword detection error:", error);
    }

    return opportunities;
  }

  /**
   * Run FAQ Detection
   */
  private async runFAQDetection(
    articles: any[],
    trackingPrompts: Map<string, string[]>
  ): Promise<OpportunityResult[]> {
    const opportunities: OpportunityResult[] = [];

    try {
      for (const article of articles) {
        const prompts = trackingPrompts.get(article.publishedUrl || article._id) || [];

        if (prompts.length > 0) {
          const detected = await detectFAQOpportunities(article, prompts);

          detected.forEach((opp) => {
            opportunities.push({
              ...opp,
              priorityLevel: calculatePriorityLevel(opp.priorityScore),
            });
          });
        }
      }
    } catch (error: any) {
      console.error("FAQ detection error:", error);
    }

    return opportunities;
  }

  /**
   * Run Metadata Detection
   */
  private async runMetadataDetection(
    articles: any[],
    trendingKeywords: string[]
  ): Promise<OpportunityResult[]> {
    const opportunities: OpportunityResult[] = [];

    try {
      for (const article of articles) {
        const detected = await detectMetadataOpportunities(article, trendingKeywords);

        detected.forEach((opp) => {
          opportunities.push({
            ...opp,
            priorityLevel: calculatePriorityLevel(opp.priorityScore),
          });
        });
      }
    } catch (error: any) {
      console.error("Metadata detection error:", error);
    }

    return opportunities;
  }

  /**
   * Run LLMTXT Detection
   */
  private async runLLMTXTDetection(
    articles: any[],
    siteInfo: { name: string; description: string; url: string }
  ): Promise<OpportunityResult[]> {
    const opportunities: OpportunityResult[] = [];

    try {
      const detected = await detectLLMTXTOpportunities(
        siteInfo.url,
        siteInfo.name,
        siteInfo.description,
        articles
      );

      detected.forEach((opp) => {
        opportunities.push({
          ...opp,
          priorityLevel: calculatePriorityLevel(opp.priorityScore),
        });
      });
    } catch (error: any) {
      console.error("LLMTXT detection error:", error);
    }

    return opportunities;
  }

  /**
   * Run Internal Links Detection
   */
  private async runInternalLinksDetection(
    articlesToScan: any[],
    allArticles: any[]
  ): Promise<OpportunityResult[]> {
    const opportunities: OpportunityResult[] = [];

    try {
      for (const article of articlesToScan) {
        const detected = await detectInternalLinkOpportunities(article, allArticles);

        detected.forEach((opp) => {
          opportunities.push({
            ...opp,
            priorityLevel: calculatePriorityLevel(opp.priorityScore),
          });
        });
      }
    } catch (error: any) {
      console.error("Internal links detection error:", error);
    }

    return opportunities;
  }
}

/**
 * Helper: Run a quick scan with default settings
 */
export async function quickScan(
  userId: string,
  articles: any[],
  options: {
    trackedKeywords?: string[];
    trackingPrompts?: Map<string, string[]>;
    siteInfo?: { name: string; description: string; url: string };
  } = {}
): Promise<ScannerResult> {
  const scanner = new OpportunityScanner({
    userId,
    scanType: "incremental",
    detectRules: {
      keywords: true,
      faq: true,
      metadata: true,
      llmtxt: true,
      internalLinks: true,
    },
  });

  return await scanner.scan(
    articles,
    options.trackedKeywords,
    options.trackingPrompts,
    options.siteInfo
  );
}

/**
 * Helper: Run a full scan with all detection rules
 */
export async function fullScan(
  userId: string,
  articles: any[],
  options: {
    trackedKeywords?: string[];
    trackingPrompts?: Map<string, string[]>;
    siteInfo?: { name: string; description: string; url: string };
    priorityThreshold?: number;
  } = {}
): Promise<ScannerResult> {
  const scanner = new OpportunityScanner({
    userId,
    scanType: "full",
    detectRules: {
      keywords: true,
      faq: true,
      metadata: true,
      llmtxt: true,
      internalLinks: true,
    },
    priorityThreshold: options.priorityThreshold,
  });

  return await scanner.scan(
    articles,
    options.trackedKeywords,
    options.trackingPrompts,
    options.siteInfo
  );
}

/**
 * Estimate scan duration based on article count
 */
export function estimateScanDuration(articleCount: number, scanType: "full" | "incremental"): number {
  // Rough estimates in milliseconds
  const baseTimePerArticle = 100; // 100ms per article
  const overhead = 2000; // 2 seconds overhead

  let articlesToScan = articleCount;

  if (scanType === "incremental") {
    // Assume ~20% of articles are recent
    articlesToScan = Math.ceil(articleCount * 0.2);
  }

  return articlesToScan * baseTimePerArticle + overhead;
}

/**
 * Calculate expected opportunities based on article metrics
 */
export function estimateOpportunityCount(
  articles: any[]
): {
  total: number;
  byType: {
    keywords: number;
    faq: number;
    metadata: number;
    llmtxt: number;
    internalLinks: number;
  };
} {
  const publishedArticles = articles.filter((a) => a.status === "published");

  // Rough heuristics based on typical optimization gaps
  const keywords = Math.ceil(publishedArticles.length * 0.3); // ~30% missing keywords
  const faq = Math.ceil(publishedArticles.length * 0.5); // ~50% without FAQs
  const metadata = Math.ceil(publishedArticles.length * 0.2); // ~20% with stale metadata
  const llmtxt = 1; // Usually 1 site-wide opportunity
  const internalLinks = Math.ceil(publishedArticles.length * 0.4); // ~40% with low link density

  return {
    total: keywords + faq + metadata + llmtxt + internalLinks,
    byType: {
      keywords,
      faq,
      metadata,
      llmtxt,
      internalLinks,
    },
  };
}
