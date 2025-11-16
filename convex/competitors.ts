/**
 * Convex Backend: Competitor Analysis
 *
 * Handles competitor crawling, content extraction, and gap analysis
 * Part of Week 5 - Smart Optimization Scanner
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

/**
 * MUTATION: Add Competitor Site
 *
 * Register a competitor site for tracking and analysis
 */
export const addCompetitorSite = mutation({
  args: {
    userId: v.id("users"),
    brandId: v.id("trackedBrands"),
    competitorUrl: v.string(),
    competitorName: v.string(),
    industry: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if competitor already exists for this brand
    const existing = await ctx.db
      .query("competitorSites")
      .withIndex("by_brand", (q: any) => q.eq("brandId", args.brandId))
      .filter((q: any) => q.eq(q.field("competitorUrl"), args.competitorUrl))
      .first();

    if (existing) {
      return {
        success: false,
        error: "Competitor site already exists for this brand",
        competitorId: existing._id,
      };
    }

    const competitorId = await ctx.db.insert("competitorSites", {
      userId: args.userId,
      brandId: args.brandId,
      competitorUrl: args.competitorUrl,
      competitorName: args.competitorName,
      industry: args.industry,
      status: "active",
      lastCrawledAt: undefined,
      pagesCrawled: 0,
      contentGapsDetected: 0,
      addedAt: Date.now(),
    });

    return {
      success: true,
      competitorId,
    };
  },
});

/**
 * MUTATION: Remove Competitor Site
 */
export const removeCompetitorSite = mutation({
  args: {
    competitorId: v.id("competitorSites"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const competitor = await ctx.db.get(args.competitorId);

    if (!competitor || competitor.userId !== args.userId) {
      return { success: false, error: "Competitor not found or unauthorized" };
    }

    // Delete competitor and all associated pages
    await ctx.db.delete(args.competitorId);

    // Delete all competitor pages
    const pages = await ctx.db
      .query("competitorPages")
      .withIndex("by_brand", (q: any) => q.eq("competitorSiteId", args.competitorId))
      .collect();

    for (const page of pages) {
      await ctx.db.delete(page._id);
    }

    return {
      success: true,
      deletedPages: pages.length,
    };
  },
});

/**
 * MUTATION: Start Competitor Crawl
 *
 * Initiates a web crawl of competitor site (triggers Inngest job)
 */
export const startCompetitorCrawl = mutation({
  args: {
    competitorId: v.id("competitorSites"),
    userId: v.id("users"),
    maxPages: v.optional(v.number()), // Default: 100
  },
  handler: async (ctx, args) => {
    const { competitorId, userId, maxPages = 100 } = args;

    const competitor = await ctx.db.get(competitorId);

    if (!competitor || competitor.userId !== userId) {
      return { success: false, error: "Competitor not found or unauthorized" };
    }

    // Update status to crawling
    await ctx.db.patch(competitorId, {
      status: "crawling",
    });

    // Inngest job will be triggered to perform actual crawl
    // For now, return crawl session info
    return {
      success: true,
      message: `Crawl initiated for ${competitor.competitorName}. Max pages: ${maxPages}`,
      competitorId,
    };
  },
});

/**
 * MUTATION: Save Crawled Competitor Page
 *
 * Called by crawler to save extracted page data
 */
export const saveCompetitorPage = mutation({
  args: {
    competitorSiteId: v.id("competitorSites"),
    pageUrl: v.string(),
    pageTitle: v.string(),
    metaDescription: v.optional(v.string()),
    contentMarkdown: v.string(),
    wordCount: v.number(),
    headings: v.array(v.object({
      level: v.number(), // 1-6 (H1-H6)
      text: v.string(),
    })),
    keywords: v.array(v.string()),
    internalLinks: v.array(v.string()),
    externalLinks: v.array(v.string()),
    hasFAQ: v.boolean(),
    hasSchema: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if page already exists
    const existing = await ctx.db
      .query("competitorPages")
      .withIndex("by_brand", (q: any) => q.eq("competitorSiteId", args.competitorSiteId))
      .filter((q: any) => q.eq(q.field("pageUrl"), args.pageUrl))
      .first();

    if (existing) {
      // Update existing page
      await ctx.db.patch(existing._id, {
        pageTitle: args.pageTitle,
        metaDescription: args.metaDescription,
        contentMarkdown: args.contentMarkdown,
        wordCount: args.wordCount,
        headings: args.headings,
        keywords: args.keywords,
        internalLinks: args.internalLinks,
        externalLinks: args.externalLinks,
        hasFAQ: args.hasFAQ,
        hasSchema: args.hasSchema,
        lastUpdated: Date.now(),
      });

      return {
        success: true,
        pageId: existing._id,
        updated: true,
      };
    }

    // Create new page
    const { competitorSiteId, ...pageData } = args;
    const pageId = await ctx.db.insert("competitorPages", {
      competitorSiteId,
      ...pageData,
      crawledAt: Date.now(),
      lastUpdated: Date.now(),
    });

    // Update competitor site stats
    const competitor = await ctx.db.get(competitorSiteId);
    if (competitor) {
      await ctx.db.patch(competitorSiteId, {
        pagesCrawled: (competitor.pagesCrawled || 0) + 1,
        lastCrawledAt: Date.now(),
      });
    }

    return {
      success: true,
      pageId,
      updated: false,
    };
  },
});

/**
 * MUTATION: Complete Competitor Crawl
 *
 * Called when crawl finishes
 */
export const completeCompetitorCrawl = mutation({
  args: {
    competitorId: v.id("competitorSites"),
    pagesCrawled: v.number(),
    errors: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.competitorId, {
      status: "active",
      lastCrawledAt: Date.now(),
      pagesCrawled: args.pagesCrawled,
    });

    return { success: true };
  },
});

/**
 * QUERY: Get Competitor Sites
 *
 * Retrieve all competitor sites for a user/brand
 */
export const getCompetitorSites = query({
  args: {
    userId: v.id("users"),
    brandId: v.optional(v.id("trackedBrands")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("competitorSites")
      .withIndex("by_brand", (q: any) => q.eq("userId", args.userId));

    const competitors = await query.collect();

    if (args.brandId) {
      return competitors.filter((c: any) => c.brandId === args.brandId);
    }

    return competitors;
  },
});

/**
 * QUERY: Get Competitor Content
 *
 * Retrieve crawled pages for a competitor
 */
export const getCompetitorContent = query({
  args: {
    competitorId: v.id("competitorSites"),
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { competitorId, userId, limit = 100 } = args;

    // Verify ownership
    const competitor = await ctx.db.get(competitorId);
    if (!competitor || competitor.userId !== userId) {
      return [];
    }

    const pages = await ctx.db
      .query("competitorPages")
      .withIndex("by_brand", (q: any) => q.eq("competitorSiteId", competitorId))
      .take(limit);

    return pages;
  },
});

/**
 * QUERY: Analyze Content Gaps
 *
 * Compare competitor content to user's content and identify gaps
 */
export const analyzeContentGaps = query({
  args: {
    userId: v.id("users"),
    brandId: v.id("trackedBrands"),
    competitorId: v.id("competitorSites"),
  },
  handler: async (ctx, args) => {
    const { userId, brandId, competitorId } = args;

    // Get user's published articles
    const userArticles = await ctx.db
      .query("articles")
      .withIndex("by_brand", (q: any) => q.eq("userId", userId))
      .filter((q: any) => q.eq(q.field("status"), "published"))
      .collect();

    // Get competitor pages
    const competitorPages = await ctx.db
      .query("competitorPages")
      .withIndex("by_brand", (q: any) => q.eq("competitorSiteId", competitorId))
      .collect();

    // Extract user's topics/keywords
    const userTopics = new Set<string>();
    const userKeywords = new Set<string>();

    userArticles.forEach((article: any) => {
      if (article.topic) {
        userTopics.add(article.topic.toLowerCase());
      }
      // Parse keywords from content (simplified)
      if (article.keywords) {
        article.keywords.forEach((kw: string) => userKeywords.add(kw.toLowerCase()));
      }
    });

    // Extract competitor topics/keywords
    const competitorTopics = new Map<string, number>(); // topic -> page count

    competitorPages.forEach((page: any) => {
      // Extract topics from titles and headings
      const topics: string[] = [];

      // Title
      if (page.pageTitle) {
        topics.push(...page.pageTitle.toLowerCase().split(/\s+/));
      }

      // Keywords
      if (page.keywords) {
        page.keywords.forEach((kw: any) => {
          const normalized = kw.toLowerCase();
          const count = competitorTopics.get(normalized) || 0;
          competitorTopics.set(normalized, count + 1);
        });
      }
    });

    // Identify gaps: topics competitors cover that user doesn't
    const gaps: Array<{
      keyword: string;
      competitorPageCount: number;
      priority: string;
    }> = [];

    competitorTopics.forEach((count, keyword) => {
      if (!userKeywords.has(keyword) && count >= 2) {
        // Competitor has 2+ pages on this topic, but user has none
        let priority = "low";
        if (count >= 10) priority = "high";
        else if (count >= 5) priority = "medium";

        gaps.push({
          keyword,
          competitorPageCount: count,
          priority,
        });
      }
    });

    // Sort by competitor page count (highest first)
    gaps.sort((a: any, b: any) => b.competitorPageCount - a.competitorPageCount);

    return {
      totalUserArticles: userArticles.length,
      totalCompetitorPages: competitorPages.length,
      contentGaps: gaps.slice(0, 50), // Top 50 gaps
      summary: {
        highPriority: gaps.filter((g) => g.priority === "high").length,
        mediumPriority: gaps.filter((g) => g.priority === "medium").length,
        lowPriority: gaps.filter((g) => g.priority === "low").length,
      },
    };
  },
});

/**
 * QUERY: Get Competitor Comparison
 *
 * Compare user's content metrics to competitor's
 */
export const getCompetitorComparison = query({
  args: {
    userId: v.id("users"),
    competitorId: v.id("competitorSites"),
  },
  handler: async (ctx, args) => {
    const { userId, competitorId } = args;

    // Get user's articles
    const userArticles = await ctx.db
      .query("articles")
      .withIndex("by_brand", (q: any) => q.eq("userId", userId))
      .filter((q: any) => q.eq(q.field("status"), "published"))
      .collect();

    // Get competitor pages
    const competitorPages = await ctx.db
      .query("competitorPages")
      .withIndex("by_brand", (q: any) => q.eq("competitorSiteId", competitorId))
      .collect();

    // Calculate metrics
    const userMetrics = {
      totalPages: userArticles.length,
      avgWordCount: userArticles.reduce((sum: any, a: any) => sum + (a.wordCount || 0), 0) / (userArticles.length || 1),
      pagesWithFAQ: userArticles.filter((a: any) => a.hasFAQ).length,
      avgInternalLinks: userArticles.reduce((sum: any, a: any) => sum + (a.internalLinks?.length || 0), 0) / (userArticles.length || 1),
    };

    const competitorMetrics = {
      totalPages: competitorPages.length,
      avgWordCount: competitorPages.reduce((sum: any, p: any) => sum + (p.wordCount || 0), 0) / (competitorPages.length || 1),
      pagesWithFAQ: competitorPages.filter((p: any) => p.hasFAQ).length,
      avgInternalLinks: competitorPages.reduce((sum: any, p: any) => sum + (p.internalLinks?.length || 0), 0) / (competitorPages.length || 1),
    };

    return {
      user: userMetrics,
      competitor: competitorMetrics,
      comparison: {
        contentVolume: userMetrics.totalPages - competitorMetrics.totalPages,
        wordCountDiff: userMetrics.avgWordCount - competitorMetrics.avgWordCount,
        faqCoverageDiff: (userMetrics.pagesWithFAQ / (userMetrics.totalPages || 1)) - (competitorMetrics.pagesWithFAQ / (competitorMetrics.totalPages || 1)),
        internalLinksDiff: userMetrics.avgInternalLinks - competitorMetrics.avgInternalLinks,
      },
    };
  },
});
