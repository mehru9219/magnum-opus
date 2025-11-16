/**
 * Convex Database Schema - Magnum Opus MVP
 *
 * Week 3: AI Visibility Tracking Tables
 * Agent 5: Tracking Backend Developer
 *
 * References: phase-1-spec.md (Week 3 Key Entities)
 */

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // ===== WEEK 3: AI VISIBILITY TRACKING =====

  /**
   * Tracked Brands
   * User's brand configuration for visibility tracking
   */
  trackedBrands: defineTable({
    userId: v.string(), // Clerk user ID
    brandName: v.string(),
    brandVariations: v.array(v.string()), // e.g., ["ProjectHub", "Project Hub"]
    websiteUrl: v.string(),
    contextClues: v.optional(v.array(v.string())), // For false positive filtering
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_brand_name', ['brandName']),

  /**
   * Tracked Keywords
   * Keywords being monitored for visibility
   */
  trackedKeywords: defineTable({
    brandId: v.id('trackedBrands'),
    userId: v.string(), // Denormalized for faster queries
    keywordText: v.string(),
    isVip: v.boolean(), // VIP keywords tracked hourly, others daily
    trackingFrequency: v.union(
      v.literal('hourly'),
      v.literal('daily'),
      v.literal('weekly')
    ),
    customPrompts: v.optional(v.array(v.string())),
    audiences: v.optional(v.array(v.string())),
    useCases: v.optional(v.array(v.string())),
    industries: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_brand', ['brandId'])
    .index('by_user', ['userId'])
    .index('by_vip_status', ['isVip'])
    .index('by_frequency', ['trackingFrequency']),

  /**
   * Competitor Brands
   * Competitors for comparison tracking
   */
  competitorBrands: defineTable({
    trackedBrandId: v.id('trackedBrands'),
    userId: v.string(), // Denormalized
    competitorName: v.string(),
    competitorWebsite: v.string(),
    competitorVariations: v.optional(v.array(v.string())),
    createdAt: v.number()
  })
    .index('by_tracked_brand', ['trackedBrandId'])
    .index('by_user', ['userId']),

  /**
   * Tracking Runs
   * Execution of tracking jobs
   */
  trackingRuns: defineTable({
    brandId: v.id('trackedBrands'),
    keywordId: v.id('trackedKeywords'),
    userId: v.string(), // Denormalized
    scheduledTime: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    status: v.union(
      v.literal('scheduled'),
      v.literal('running'),
      v.literal('completed'),
      v.literal('failed'),
      v.literal('partial') // Some platforms succeeded, some failed
    ),
    totalPrompts: v.number(),
    totalPlatforms: v.number(), // 4 for full run (ChatGPT, Claude, Perplexity, Gemini)
    completedPlatforms: v.number(),
    totalCost: v.number(), // API cost in USD
    errorMessage: v.optional(v.string()),
    createdAt: v.number()
  })
    .index('by_brand', ['brandId'])
    .index('by_keyword', ['keywordId'])
    .index('by_user', ['userId'])
    .index('by_status', ['status'])
    .index('by_scheduled_time', ['scheduledTime']),

  /**
   * AI Responses
   * Responses from AI platforms for each prompt
   */
  aiResponses: defineTable({
    trackingRunId: v.id('trackingRuns'),
    brandId: v.id('trackedBrands'),
    keywordId: v.id('trackedKeywords'),
    promptText: v.string(),
    promptCategory: v.string(), // question, comparison, use_case, etc.
    platform: v.union(
      v.literal('chatgpt'),
      v.literal('claude'),
      v.literal('perplexity'),
      v.literal('gemini')
    ),
    responseText: v.string(),
    responseTimestamp: v.number(),
    apiCost: v.number(), // Cost for this single API call
    tokenCount: v.optional(v.number()),
    errorOccurred: v.boolean(),
    errorMessage: v.optional(v.string())
  })
    .index('by_tracking_run', ['trackingRunId'])
    .index('by_brand', ['brandId'])
    .index('by_keyword', ['keywordId'])
    .index('by_platform', ['platform'])
    .index('by_error', ['errorOccurred']),

  /**
   * Citations
   * Detected brand mentions in AI responses
   */
  citations: defineTable({
    responseId: v.id('aiResponses'),
    trackingRunId: v.id('trackingRuns'),
    brandId: v.id('trackedBrands'),
    mentionType: v.union(v.literal('direct'), v.literal('url'), v.literal('both')),
    mentionedText: v.string(), // Exact text found (e.g., "ProjectHub" or URL)
    position: v.number(), // 1st, 2nd, 3rd mention in response
    quoteExcerpt: v.string(), // ±50 words around mention
    fullContext: v.string(), // Full sentence/paragraph
    mentionContext: v.union(
      v.literal('recommendation'),
      v.literal('comparison'),
      v.literal('case_study'),
      v.literal('data_source'),
      v.literal('alternative'),
      v.literal('unknown')
    ),
    possibleFalsePositive: v.boolean(),
    characterOffset: v.number(),
    createdAt: v.number()
  })
    .index('by_response', ['responseId'])
    .index('by_tracking_run', ['trackingRunId'])
    .index('by_brand', ['brandId'])
    .index('by_mention_type', ['mentionType'])
    .index('by_context', ['mentionContext'])
    .index('by_false_positive', ['possibleFalsePositive']),

  /**
   * Visibility Scores
   * Calculated visibility scores per platform per tracking run
   */
  visibilityScores: defineTable({
    trackingRunId: v.id('trackingRuns'),
    brandId: v.id('trackedBrands'),
    keywordId: v.id('trackedKeywords'),
    platform: v.union(
      v.literal('chatgpt'),
      v.literal('claude'),
      v.literal('perplexity'),
      v.literal('gemini'),
      v.literal('aggregate') // Overall score across platforms
    ),
    score: v.number(), // Percentage (0-100)
    weightedScore: v.optional(v.number()), // Weighted by position & context
    totalPrompts: v.number(),
    promptsWithMentions: v.number(),
    totalMentions: v.number(),
    averagePosition: v.number(),
    changeFromPrevious: v.optional(v.number()), // +5.0, -12.5
    changePercentage: v.optional(v.number()), // +50%, -25%
    trend: v.optional(v.union(v.literal('up'), v.literal('down'), v.literal('stable'))),
    contextBreakdown: v.object({
      recommendation: v.number(),
      comparison: v.number(),
      case_study: v.number(),
      data_source: v.number(),
      alternative: v.number(),
      unknown: v.number()
    }),
    calculatedAt: v.number(),
    createdAt: v.number()
  })
    .index('by_tracking_run', ['trackingRunId'])
    .index('by_brand', ['brandId'])
    .index('by_keyword', ['keywordId'])
    .index('by_platform', ['platform'])
    .index('by_brand_platform', ['brandId', 'platform'])
    .index('by_calculated_at', ['calculatedAt']),

  /**
   * Historical Snapshots
   * Aggregated historical data for trend analysis
   */
  historicalSnapshots: defineTable({
    brandId: v.id('trackedBrands'),
    keywordId: v.optional(v.id('trackedKeywords')), // Optional: null for brand-level
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
    aggregationType: v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly')),
    averageScore: v.number(),
    highestScore: v.number(),
    lowestScore: v.number(),
    totalMentions: v.number(),
    totalPrompts: v.number(),
    dataPointCount: v.number(), // Number of tracking runs aggregated
    createdAt: v.number()
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_date', ['brandId', 'date'])
    .index('by_date', ['date'])
    .index('by_platform', ['platform'])
    .index('by_aggregation_type', ['aggregationType'])
});
