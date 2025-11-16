/**
 * Convex Visibility Scoring Logic (Week 3)
 *
 * Calculates and stores visibility scores from tracking run results.
 * Integrates with lib/tracking/scoring.ts for score calculations.
 *
 * Agent 5: AI Visibility Tracking Backend Developer
 * Task: T058 - Create visibility scoring logic
 */

import { v } from 'convex/values';
import { mutation, action, internalMutation } from './_generated/server';
import { internal } from './_generated/api';
import { Id } from './_generated/dataModel';

/**
 * Calculate and store visibility scores for a tracking run
 *
 * This should be called after all AI responses are collected
 */
export const calculateVisibilityScores = action({
  args: {
    trackingRunId: v.id('trackingRuns')
  },
  handler: async (ctx, args) => {
    // Get tracking run details
    const trackingRun = await ctx.runQuery(internal.visibility.getTrackingRunData, {
      trackingRunId: args.trackingRunId
    });

    if (!trackingRun) {
      throw new Error('Tracking run not found');
    }

    // Get all AI responses for this tracking run
    const responses = await ctx.runQuery(internal.visibility.getTrackingRunResponses, {
      trackingRunId: args.trackingRunId
    });

    // Group responses by platform
    const responsesByPlatform: Record<string, typeof responses> = {
      chatgpt: [],
      claude: [],
      perplexity: [],
      gemini: []
    };

    responses.forEach(response => {
      if (responsesByPlatform[response.platform]) {
        responsesByPlatform[response.platform].push(response);
      }
    });

    // Calculate scores for each platform
    const platformScores: Array<{
      platform: string;
      score: number;
      totalPrompts: number;
      promptsWithMentions: number;
      totalMentions: number;
      averagePosition: number;
      contextBreakdown: Record<string, number>;
    }> = [];

    for (const [platform, platformResponses] of Object.entries(responsesByPlatform)) {
      if (platformResponses.length === 0) continue;

      // Get citations for this platform's responses
      const citations = await ctx.runQuery(internal.visibility.getCitationsForResponses, {
        responseIds: platformResponses.map(r => r._id)
      });

      // Calculate metrics
      const totalPrompts = platformResponses.length;
      const responseIdsWithCitations = new Set(citations.map(c => c.responseId));
      const promptsWithMentions = responseIdsWithCitations.size;
      const totalMentions = citations.length;

      // Calculate average position
      const positions = citations.map(c => c.position);
      const averagePosition =
        positions.length > 0
          ? positions.reduce((sum, pos) => sum + pos, 0) / positions.length
          : 0;

      // Context breakdown
      const contextBreakdown: Record<string, number> = {
        recommendation: 0,
        comparison: 0,
        case_study: 0,
        data_source: 0,
        alternative: 0,
        unknown: 0
      };

      citations.forEach(citation => {
        contextBreakdown[citation.mentionContext]++;
      });

      // Calculate visibility score: (prompts with mentions / total prompts) × 100
      const score = totalPrompts > 0 ? (promptsWithMentions / totalPrompts) * 100 : 0;

      platformScores.push({
        platform,
        score: Math.round(score * 10) / 10,
        totalPrompts,
        promptsWithMentions,
        totalMentions,
        averagePosition: Math.round(averagePosition * 10) / 10,
        contextBreakdown
      });
    }

    // Calculate aggregate score (average across all platforms)
    const aggregateScore =
      platformScores.length > 0
        ? platformScores.reduce((sum, ps) => sum + ps.score, 0) / platformScores.length
        : 0;

    const aggregateTotalPrompts = platformScores.reduce((sum, ps) => sum + ps.totalPrompts, 0);
    const aggregatePromptsWithMentions = platformScores.reduce(
      (sum, ps) => sum + ps.promptsWithMentions,
      0
    );
    const aggregateTotalMentions = platformScores.reduce((sum, ps) => sum + ps.totalMentions, 0);

    const aggregateAveragePosition =
      platformScores.length > 0
        ? platformScores.reduce((sum, ps) => sum + ps.averagePosition, 0) / platformScores.length
        : 0;

    // Aggregate context breakdown
    const aggregateContextBreakdown: Record<string, number> = {
      recommendation: 0,
      comparison: 0,
      case_study: 0,
      data_source: 0,
      alternative: 0,
      unknown: 0
    };

    platformScores.forEach(ps => {
      Object.entries(ps.contextBreakdown).forEach(([context, count]) => {
        aggregateContextBreakdown[context] += count;
      });
    });

    // Get previous scores for trend calculation
    const previousScores = await ctx.runQuery(internal.visibility.getPreviousScores, {
      brandId: trackingRun.brandId,
      keywordId: trackingRun.keywordId
    });

    // Store platform-specific scores
    for (const platformScore of platformScores) {
      const previousPlatformScore = previousScores.find(
        ps => ps.platform === platformScore.platform
      );

      const changeFromPrevious = previousPlatformScore
        ? platformScore.score - previousPlatformScore.score
        : 0;

      const changePercentage =
        previousPlatformScore && previousPlatformScore.score > 0
          ? ((changeFromPrevious / previousPlatformScore.score) * 100)
          : 0;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (Math.abs(changeFromPrevious) >= 0.5) {
        trend = changeFromPrevious > 0 ? 'up' : 'down';
      }

      await ctx.runMutation(internal.visibility.storeVisibilityScore, {
        trackingRunId: args.trackingRunId,
        brandId: trackingRun.brandId,
        keywordId: trackingRun.keywordId,
        platform: platformScore.platform as any,
        score: platformScore.score,
        totalPrompts: platformScore.totalPrompts,
        promptsWithMentions: platformScore.promptsWithMentions,
        totalMentions: platformScore.totalMentions,
        averagePosition: platformScore.averagePosition,
        changeFromPrevious: Math.round(changeFromPrevious * 10) / 10,
        changePercentage: Math.round(changePercentage * 10) / 10,
        trend,
        contextBreakdown: platformScore.contextBreakdown
      });
    }

    // Store aggregate score
    const previousAggregateScore = previousScores.find(ps => ps.platform === 'aggregate');

    const aggregateChange = previousAggregateScore
      ? aggregateScore - previousAggregateScore.score
      : 0;

    const aggregateChangePercentage =
      previousAggregateScore && previousAggregateScore.score > 0
        ? ((aggregateChange / previousAggregateScore.score) * 100)
        : 0;

    let aggregateTrend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(aggregateChange) >= 0.5) {
      aggregateTrend = aggregateChange > 0 ? 'up' : 'down';
    }

    await ctx.runMutation(internal.visibility.storeVisibilityScore, {
      trackingRunId: args.trackingRunId,
      brandId: trackingRun.brandId,
      keywordId: trackingRun.keywordId,
      platform: 'aggregate',
      score: Math.round(aggregateScore * 10) / 10,
      totalPrompts: aggregateTotalPrompts,
      promptsWithMentions: aggregatePromptsWithMentions,
      totalMentions: aggregateTotalMentions,
      averagePosition: Math.round(aggregateAveragePosition * 10) / 10,
      changeFromPrevious: Math.round(aggregateChange * 10) / 10,
      changePercentage: Math.round(aggregateChangePercentage * 10) / 10,
      trend: aggregateTrend,
      contextBreakdown: aggregateContextBreakdown
    });

    return {
      success: true,
      aggregateScore: Math.round(aggregateScore * 10) / 10,
      platformScores: platformScores.map(ps => ({
        platform: ps.platform,
        score: ps.score
      })),
      message: 'Visibility scores calculated and stored successfully'
    };
  }
});

/**
 * Internal mutation to store a visibility score
 */
export const storeVisibilityScore = internalMutation({
  args: {
    trackingRunId: v.id('trackingRuns'),
    brandId: v.id('trackedBrands'),
    keywordId: v.id('trackedKeywords'),
    platform: v.union(
      v.literal('chatgpt'),
      v.literal('claude'),
      v.literal('perplexity'),
      v.literal('gemini'),
      v.literal('aggregate')
    ),
    score: v.number(),
    totalPrompts: v.number(),
    promptsWithMentions: v.number(),
    totalMentions: v.number(),
    averagePosition: v.number(),
    changeFromPrevious: v.number(),
    changePercentage: v.number(),
    trend: v.union(v.literal('up'), v.literal('down'), v.literal('stable')),
    contextBreakdown: v.object({
      recommendation: v.number(),
      comparison: v.number(),
      case_study: v.number(),
      data_source: v.number(),
      alternative: v.number(),
      unknown: v.number()
    })
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert('visibilityScores', {
      trackingRunId: args.trackingRunId,
      brandId: args.brandId,
      keywordId: args.keywordId,
      platform: args.platform,
      score: args.score,
      totalPrompts: args.totalPrompts,
      promptsWithMentions: args.promptsWithMentions,
      totalMentions: args.totalMentions,
      averagePosition: args.averagePosition,
      changeFromPrevious: args.changeFromPrevious,
      changePercentage: args.changePercentage,
      trend: args.trend,
      contextBreakdown: args.contextBreakdown,
      calculatedAt: now,
      createdAt: now
    });
  }
});

/**
 * Internal query to get tracking run data
 */
export const getTrackingRunData = internalMutation({
  args: {
    trackingRunId: v.id('trackingRuns')
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.trackingRunId);
  }
});

/**
 * Internal query to get responses for a tracking run
 */
export const getTrackingRunResponses = internalMutation({
  args: {
    trackingRunId: v.id('trackingRuns')
  },
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query('aiResponses')
      .withIndex('by_tracking_run', q => q.eq('trackingRunId', args.trackingRunId))
      .collect();

    return responses;
  }
});

/**
 * Internal query to get citations for specific responses
 */
export const getCitationsForResponses = internalMutation({
  args: {
    responseIds: v.array(v.id('aiResponses'))
  },
  handler: async (ctx, args) => {
    const citations = [];

    for (const responseId of args.responseIds) {
      const responseCitations = await ctx.db
        .query('citations')
        .withIndex('by_response', q => q.eq('responseId', responseId))
        .collect();

      citations.push(...responseCitations);
    }

    return citations;
  }
});

/**
 * Internal query to get previous scores for trend calculation
 */
export const getPreviousScores = internalMutation({
  args: {
    brandId: v.id('trackedBrands'),
    keywordId: v.id('trackedKeywords')
  },
  handler: async (ctx, args) => {
    // Get the most recent scores before the current one
    const scores = await ctx.db
      .query('visibilityScores')
      .withIndex('by_brand', q => q.eq('brandId', args.brandId))
      .filter(q => q.eq(q.field('keywordId'), args.keywordId))
      .order('desc')
      .take(10); // Get last 10 scores

    // Group by platform and return the most recent for each
    const latestByPlatform: Record<string, typeof scores[0]> = {};

    scores.forEach(score => {
      if (!latestByPlatform[score.platform]) {
        latestByPlatform[score.platform] = score;
      }
    });

    return Object.values(latestByPlatform);
  }
});

/**
 * Create historical snapshot from visibility scores
 * (Should be run daily via Inngest background job)
 */
export const createHistoricalSnapshot = mutation({
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
    date: v.number(), // Start of day timestamp
    aggregationType: v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly'))
  },
  handler: async (ctx, args) => {
    // Get all scores for this day
    const startOfDay = args.date;
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

    let query = ctx.db
      .query('visibilityScores')
      .withIndex('by_brand', q => q.eq('brandId', args.brandId))
      .filter(q =>
        q.and(
          q.gte(q.field('calculatedAt'), startOfDay),
          q.lt(q.field('calculatedAt'), endOfDay)
        )
      );

    const scores = await query.collect();

    // Filter by keyword and platform if provided
    let filtered = scores;
    if (args.keywordId) {
      filtered = filtered.filter(s => s.keywordId === args.keywordId);
    }
    if (args.platform) {
      filtered = filtered.filter(s => s.platform === args.platform);
    }

    if (filtered.length === 0) {
      return { success: false, message: 'No scores found for this period' };
    }

    // Calculate aggregates
    const scoreValues = filtered.map(s => s.score);
    const averageScore = scoreValues.reduce((sum, s) => sum + s, 0) / scoreValues.length;
    const highestScore = Math.max(...scoreValues);
    const lowestScore = Math.min(...scoreValues);
    const totalMentions = filtered.reduce((sum, s) => sum + s.totalMentions, 0);
    const totalPrompts = filtered.reduce((sum, s) => sum + s.totalPrompts, 0);

    // Create snapshot
    await ctx.db.insert('historicalSnapshots', {
      brandId: args.brandId,
      keywordId: args.keywordId,
      platform: args.platform,
      date: startOfDay,
      aggregationType: args.aggregationType,
      averageScore: Math.round(averageScore * 10) / 10,
      highestScore: Math.round(highestScore * 10) / 10,
      lowestScore: Math.round(lowestScore * 10) / 10,
      totalMentions,
      totalPrompts,
      dataPointCount: filtered.length,
      createdAt: Date.now()
    });

    return {
      success: true,
      message: `Historical snapshot created for ${new Date(startOfDay).toISOString()}`
    };
  }
});
