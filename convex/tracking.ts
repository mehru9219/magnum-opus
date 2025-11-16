/**
 * Convex Tracking Mutations & Queries (Week 3)
 *
 * Handles AI visibility tracking operations:
 * - Add tracked brands and keywords
 * - Run tracking jobs
 * - Add competitors
 * - Query tracking results
 *
 * Agent 5: AI Visibility Tracking Backend Developer
 * Tasks: T049 (Mutations), T050 (Queries)
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { Doc, Id } from './_generated/dataModel';

// ===== MUTATIONS (T049) =====

/**
 * Add a new tracked brand
 */
export const addTrackedBrand = mutation({
  args: {
    brandName: v.string(),
    brandVariations: v.array(v.string()),
    websiteUrl: v.string(),
    contextClues: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

    // Check if brand already exists for this user
    const existing = await ctx.db
      .query('trackedBrands')
      .withIndex('by_user', q => q.eq('userId', userId))
      .filter(q => q.eq(q.field('brandName'), args.brandName))
      .first();

    if (existing) {
      throw new Error(`Brand "${args.brandName}" is already tracked`);
    }

    const now = Date.now();

    const brandId = await ctx.db.insert('trackedBrands', {
      userId,
      brandName: args.brandName,
      brandVariations: args.brandVariations,
      websiteUrl: args.websiteUrl,
      contextClues: args.contextClues,
      createdAt: now,
      updatedAt: now
    });

    return {
      success: true,
      brandId,
      message: `Brand "${args.brandName}" added successfully`
    };
  }
});

/**
 * Add a tracked keyword for a brand
 */
export const addTrackedKeyword = mutation({
  args: {
    brandId: v.id('trackedBrands'),
    keywordText: v.string(),
    isVip: v.optional(v.boolean()),
    customPrompts: v.optional(v.array(v.string())),
    audiences: v.optional(v.array(v.string())),
    useCases: v.optional(v.array(v.string())),
    industries: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

    // Verify brand belongs to user
    const brand = await ctx.db.get(args.brandId);
    if (!brand || brand.userId !== userId) {
      throw new Error('Brand not found or access denied');
    }

    // Check if keyword already exists for this brand
    const existing = await ctx.db
      .query('trackedKeywords')
      .withIndex('by_brand', q => q.eq('brandId', args.brandId))
      .filter(q => q.eq(q.field('keywordText'), args.keywordText))
      .first();

    if (existing) {
      throw new Error(`Keyword "${args.keywordText}" is already tracked for this brand`);
    }

    const now = Date.now();
    const isVip = args.isVip || false;

    const keywordId = await ctx.db.insert('trackedKeywords', {
      brandId: args.brandId,
      userId,
      keywordText: args.keywordText,
      isVip,
      trackingFrequency: isVip ? 'hourly' : 'daily',
      customPrompts: args.customPrompts,
      audiences: args.audiences,
      useCases: args.useCases,
      industries: args.industries,
      createdAt: now,
      updatedAt: now
    });

    return {
      success: true,
      keywordId,
      message: `Keyword "${args.keywordText}" added successfully`
    };
  }
});

/**
 * Add a competitor for comparison tracking
 */
export const addCompetitor = mutation({
  args: {
    trackedBrandId: v.id('trackedBrands'),
    competitorName: v.string(),
    competitorWebsite: v.string(),
    competitorVariations: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

    // Verify brand belongs to user
    const brand = await ctx.db.get(args.trackedBrandId);
    if (!brand || brand.userId !== userId) {
      throw new Error('Brand not found or access denied');
    }

    // Check if competitor already exists
    const existing = await ctx.db
      .query('competitorBrands')
      .withIndex('by_tracked_brand', q => q.eq('trackedBrandId', args.trackedBrandId))
      .filter(q => q.eq(q.field('competitorName'), args.competitorName))
      .first();

    if (existing) {
      throw new Error(`Competitor "${args.competitorName}" is already tracked`);
    }

    // Limit to 5 competitors per brand
    const competitorCount = await ctx.db
      .query('competitorBrands')
      .withIndex('by_tracked_brand', q => q.eq('trackedBrandId', args.trackedBrandId))
      .collect()
      .then(comps => comps.length);

    if (competitorCount >= 5) {
      throw new Error('Maximum 5 competitors per brand. Remove a competitor to add a new one.');
    }

    const now = Date.now();

    const competitorId = await ctx.db.insert('competitorBrands', {
      trackedBrandId: args.trackedBrandId,
      userId,
      competitorName: args.competitorName,
      competitorWebsite: args.competitorWebsite,
      competitorVariations: args.competitorVariations,
      createdAt: now
    });

    return {
      success: true,
      competitorId,
      message: `Competitor "${args.competitorName}" added successfully`
    };
  }
});

/**
 * Schedule a tracking run (called by Inngest job scheduler)
 */
export const scheduleTrackingRun = mutation({
  args: {
    brandId: v.id('trackedBrands'),
    keywordId: v.id('trackedKeywords'),
    scheduledTime: v.number(),
    totalPrompts: v.number()
  },
  handler: async (ctx, args) => {
    const brand = await ctx.db.get(args.brandId);
    if (!brand) {
      throw new Error('Brand not found');
    }

    const trackingRunId = await ctx.db.insert('trackingRuns', {
      brandId: args.brandId,
      keywordId: args.keywordId,
      userId: brand.userId,
      scheduledTime: args.scheduledTime,
      status: 'scheduled',
      totalPrompts: args.totalPrompts,
      totalPlatforms: 4, // ChatGPT, Claude, Perplexity, Gemini
      completedPlatforms: 0,
      totalCost: 0,
      createdAt: Date.now()
    });

    return {
      success: true,
      trackingRunId,
      message: 'Tracking run scheduled'
    };
  }
});

/**
 * Update tracking run status
 */
export const updateTrackingRunStatus = mutation({
  args: {
    trackingRunId: v.id('trackingRuns'),
    status: v.union(
      v.literal('running'),
      v.literal('completed'),
      v.literal('failed'),
      v.literal('partial')
    ),
    completedPlatforms: v.optional(v.number()),
    totalCost: v.optional(v.number()),
    errorMessage: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const updates: Partial<Doc<'trackingRuns'>> = {
      status: args.status
    };

    if (args.status === 'running' && !args.completedPlatforms) {
      updates.startedAt = Date.now();
    }

    if (args.status === 'completed' || args.status === 'failed' || args.status === 'partial') {
      updates.completedAt = Date.now();
    }

    if (args.completedPlatforms !== undefined) {
      updates.completedPlatforms = args.completedPlatforms;
    }

    if (args.totalCost !== undefined) {
      updates.totalCost = args.totalCost;
    }

    if (args.errorMessage) {
      updates.errorMessage = args.errorMessage;
    }

    await ctx.db.patch(args.trackingRunId, updates);

    return { success: true };
  }
});

/**
 * Store AI response from tracking run
 */
export const storeAiResponse = mutation({
  args: {
    trackingRunId: v.id('trackingRuns'),
    brandId: v.id('trackedBrands'),
    keywordId: v.id('trackedKeywords'),
    promptText: v.string(),
    promptCategory: v.string(),
    platform: v.union(
      v.literal('chatgpt'),
      v.literal('claude'),
      v.literal('perplexity'),
      v.literal('gemini')
    ),
    responseText: v.string(),
    apiCost: v.number(),
    tokenCount: v.optional(v.number()),
    errorOccurred: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const responseId = await ctx.db.insert('aiResponses', {
      trackingRunId: args.trackingRunId,
      brandId: args.brandId,
      keywordId: args.keywordId,
      promptText: args.promptText,
      promptCategory: args.promptCategory,
      platform: args.platform,
      responseText: args.responseText,
      responseTimestamp: Date.now(),
      apiCost: args.apiCost,
      tokenCount: args.tokenCount,
      errorOccurred: args.errorOccurred || false
    });

    return { success: true, responseId };
  }
});

// ===== QUERIES (T050) =====

/**
 * Get all tracked brands for current user
 */
export const getTrackedBrands = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    const brands = await ctx.db
      .query('trackedBrands')
      .withIndex('by_user', q => q.eq('userId', userId))
      .collect();

    return brands;
  }
});

/**
 * Get tracked keywords for a brand
 */
export const getTrackedKeywords = query({
  args: {
    brandId: v.id('trackedBrands')
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const keywords = await ctx.db
      .query('trackedKeywords')
      .withIndex('by_brand', q => q.eq('brandId', args.brandId))
      .collect();

    return keywords;
  }
});

/**
 * Get competitors for a brand
 */
export const getCompetitors = query({
  args: {
    brandId: v.id('trackedBrands')
  },
  handler: async (ctx, args) => {
    const competitors = await ctx.db
      .query('competitorBrands')
      .withIndex('by_tracked_brand', q => q.eq('trackedBrandId', args.brandId))
      .collect();

    return competitors;
  }
});

/**
 * Get latest visibility scores for a brand
 */
export const getVisibilityScores = query({
  args: {
    brandId: v.id('trackedBrands'),
    keywordId: v.optional(v.id('trackedKeywords')),
    platform: v.optional(
      v.union(
        v.literal('chatgpt'),
        v.literal('claude'),
        v.literal('perplexity'),
        v.literal('gemini'),
        v.literal('aggregate')
      )
    )
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('visibilityScores')
      .withIndex('by_brand', q => q.eq('brandId', args.brandId));

    const scores = await query.collect();

    // Filter by keyword if provided
    let filtered = scores;
    if (args.keywordId) {
      filtered = filtered.filter(s => s.keywordId === args.keywordId);
    }

    // Filter by platform if provided
    if (args.platform) {
      filtered = filtered.filter(s => s.platform === args.platform);
    }

    // Sort by calculatedAt descending (newest first)
    filtered.sort((a, b) => b.calculatedAt - a.calculatedAt);

    return filtered;
  }
});

/**
 * Get latest tracking runs for a brand
 */
export const getTrackingRuns = query({
  args: {
    brandId: v.id('trackedBrands'),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const runs = await ctx.db
      .query('trackingRuns')
      .withIndex('by_brand', q => q.eq('brandId', args.brandId))
      .order('desc')
      .take(args.limit || 20);

    return runs;
  }
});

/**
 * Get competitor comparison data
 */
export const getCompetitorComparison = query({
  args: {
    brandId: v.id('trackedBrands'),
    keywordId: v.optional(v.id('trackedKeywords')),
    platform: v.optional(
      v.union(
        v.literal('chatgpt'),
        v.literal('claude'),
        v.literal('perplexity'),
        v.literal('gemini'),
        v.literal('aggregate')
      )
    )
  },
  handler: async (ctx, args) => {
    // Get user's brand
    const brand = await ctx.db.get(args.brandId);
    if (!brand) {
      return null;
    }

    // Get user's latest visibility score
    const userScores = await ctx.db
      .query('visibilityScores')
      .withIndex('by_brand', q => q.eq('brandId', args.brandId))
      .collect();

    let userScore = userScores;
    if (args.keywordId) {
      userScore = userScore.filter(s => s.keywordId === args.keywordId);
    }
    if (args.platform) {
      userScore = userScore.filter(s => s.platform === args.platform);
    } else {
      userScore = userScore.filter(s => s.platform === 'aggregate');
    }

    userScore.sort((a, b) => b.calculatedAt - a.calculatedAt);
    const latestUserScore = userScore[0];

    // Get competitors
    const competitors = await ctx.db
      .query('competitorBrands')
      .withIndex('by_tracked_brand', q => q.eq('trackedBrandId', args.brandId))
      .collect();

    // Note: Competitor scores would be tracked in separate tracking runs
    // This is a simplified implementation - full implementation would track competitors too

    return {
      userBrand: {
        name: brand.brandName,
        score: latestUserScore?.score || 0,
        totalMentions: latestUserScore?.totalMentions || 0
      },
      competitors: competitors.map(comp => ({
        name: comp.competitorName,
        website: comp.competitorWebsite,
        // Competitor scores would come from their own tracking runs
        score: 0, // Placeholder
        totalMentions: 0 // Placeholder
      }))
    };
  }
});

/**
 * Get historical trend data
 */
export const getHistoricalTrend = query({
  args: {
    brandId: v.id('trackedBrands'),
    keywordId: v.optional(v.id('trackedKeywords')),
    platform: v.optional(
      v.union(
        v.literal('chatgpt'),
        v.literal('claude'),
        v.literal('perplexity'),
        v.literal('gemini'),
        v.literal('aggregate')
      )
    ),
    days: v.optional(v.number()) // 7, 30, or 90
  },
  handler: async (ctx, args) => {
    const days = args.days || 7;
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;

    let query = ctx.db
      .query('historicalSnapshots')
      .withIndex('by_brand_date', q =>
        q.eq('brandId', args.brandId).gt('date', startDate)
      );

    const snapshots = await query.collect();

    // Filter by keyword and platform if provided
    let filtered = snapshots;
    if (args.keywordId) {
      filtered = filtered.filter(s => s.keywordId === args.keywordId);
    }
    if (args.platform) {
      filtered = filtered.filter(s => s.platform === args.platform);
    } else {
      filtered = filtered.filter(s => s.platform === 'aggregate' || !s.platform);
    }

    // Sort by date ascending
    filtered.sort((a, b) => a.date - b.date);

    return filtered.map(s => ({
      date: new Date(s.date),
      score: s.averageScore,
      mentions: s.totalMentions
    }));
  }
});

/**
 * Get tracking dashboard summary
 */
export const getTrackingDashboard = query({
  args: {
    brandId: v.id('trackedBrands')
  },
  handler: async (ctx, args) => {
    const brand = await ctx.db.get(args.brandId);
    if (!brand) {
      return null;
    }

    // Get latest aggregate score
    const scores = await ctx.db
      .query('visibilityScores')
      .withIndex('by_brand_platform', q =>
        q.eq('brandId', args.brandId).eq('platform', 'aggregate')
      )
      .order('desc')
      .take(1);

    const latestScore = scores[0];

    // Get keywords count
    const keywords = await ctx.db
      .query('trackedKeywords')
      .withIndex('by_brand', q => q.eq('brandId', args.brandId))
      .collect();

    // Get latest tracking run
    const runs = await ctx.db
      .query('trackingRuns')
      .withIndex('by_brand', q => q.eq('brandId', args.brandId))
      .order('desc')
      .take(1);

    const latestRun = runs[0];

    // Get competitors count
    const competitors = await ctx.db
      .query('competitorBrands')
      .withIndex('by_tracked_brand', q => q.eq('trackedBrandId', args.brandId))
      .collect();

    return {
      brand: {
        name: brand.brandName,
        website: brand.websiteUrl
      },
      currentScore: latestScore?.score || 0,
      scoreChange: latestScore?.changeFromPrevious || 0,
      trend: latestScore?.trend || 'stable',
      keywordsTracked: keywords.length,
      competitorsTracked: competitors.length,
      lastRunStatus: latestRun?.status || 'none',
      lastRunTime: latestRun?.completedAt || latestRun?.scheduledTime,
      totalMentions: latestScore?.totalMentions || 0
    };
  }
});
