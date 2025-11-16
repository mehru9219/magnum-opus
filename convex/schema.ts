import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Week 1: Content Generation
  articles: defineTable({
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    status: v.union(
      v.literal("queued"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    template: v.string(), // "listicle" | "how-to" | "comparison" | "problem-solver" | "ultimate-guide"
    generatedBy: v.string(), // AI model used
    tokensUsed: v.number(),
    costUsd: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"]),

  topics: defineTable({
    userId: v.string(),
    topic: v.string(),
    keywords: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  qualityChecks: defineTable({
    articleId: v.id("articles"),
    plagiarismScore: v.number(),
    readabilityScore: v.number(),
    factCheckScore: v.number(),
    passed: v.boolean(),
    createdAt: v.number(),
  }).index("by_article", ["articleId"]),

  citations: defineTable({
    articleId: v.id("articles"),
    url: v.string(),
    title: v.string(),
    quotedText: v.string(),
    position: v.number(),
    createdAt: v.number(),
  }).index("by_article", ["articleId"]),

  // Week 2: Publishing
  platformConnections: defineTable({
    userId: v.string(),
    platform: v.string(), // "wordpress" | "shopify" | "medium" | etc.
    credentials: v.string(), // Encrypted JSON
    isActive: v.boolean(),
    lastSyncedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_platform", ["userId", "platform"]),

  publishJobs: defineTable({
    userId: v.string(),
    articleId: v.id("articles"),
    platforms: v.array(v.string()),
    status: v.union(
      v.literal("queued"),
      v.literal("publishing"),
      v.literal("completed"),
      v.literal("partial"),
      v.literal("failed")
    ),
    scheduledFor: v.optional(v.number()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_scheduled", ["scheduledFor"]),

  publishResults: defineTable({
    publishJobId: v.id("publishJobs"),
    platform: v.string(),
    status: v.union(v.literal("success"), v.literal("failed")),
    platformUrl: v.optional(v.string()),
    platformId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_job", ["publishJobId"]),

  contentAdaptations: defineTable({
    articleId: v.id("articles"),
    platform: v.string(),
    adaptedContent: v.string(),
    adaptedTitle: v.string(),
    createdAt: v.number(),
  })
    .index("by_article", ["articleId"])
    .index("by_article_platform", ["articleId", "platform"]),

  // Week 3: AI Visibility Tracking
  trackedBrands: defineTable({
    userId: v.string(),
    brandName: v.string(),
    website: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  trackedKeywords: defineTable({
    brandId: v.id("trackedBrands"),
    keyword: v.string(),
    category: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_brand", ["brandId"]),

  competitorBrands: defineTable({
    brandId: v.id("trackedBrands"),
    competitorName: v.string(),
    competitorWebsite: v.string(),
    createdAt: v.number(),
  }).index("by_brand", ["brandId"]),

  trackingRuns: defineTable({
    brandId: v.id("trackedBrands"),
    keywordId: v.id("trackedKeywords"),
    platform: v.string(), // "chatgpt" | "claude" | "perplexity" | "gemini"
    totalPrompts: v.number(),
    completedPrompts: v.number(),
    status: v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_brand", ["brandId"])
    .index("by_keyword", ["keywordId"])
    .index("by_status", ["status"]),

  aiResponses: defineTable({
    trackingRunId: v.id("trackingRuns"),
    prompt: v.string(),
    response: v.string(),
    mentionedBrand: v.optional(v.boolean()),
    mentionPosition: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_run", ["trackingRunId"]),

  visibilityScores: defineTable({
    brandId: v.id("trackedBrands"),
    keywordId: v.id("trackedKeywords"),
    platform: v.string(),
    score: v.number(), // Percentage (0-100)
    mentions: v.number(),
    totalPrompts: v.number(),
    averagePosition: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .index("by_keyword", ["keywordId"])
    .index("by_platform", ["platform"])
    .index("by_brand_keyword", ["brandId", "keywordId"]),

  // Week 5: Smart Optimization
  opportunityScans: defineTable({
    userId: v.string(),
    status: v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    articlesScanned: v.number(),
    opportunitiesFound: v.number(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  opportunities: defineTable({
    scanId: v.id("opportunityScans"),
    articleId: v.id("articles"),
    type: v.string(), // "keyword" | "faq" | "metadata" | "llmtxt" | "internal-link"
    title: v.string(),
    description: v.string(),
    priority: v.union(
      v.literal("quick-win"),
      v.literal("moderate"),
      v.literal("complex")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("applied"),
      v.literal("dismissed")
    ),
    stagedChanges: v.optional(v.string()), // JSON of proposed changes
    createdAt: v.number(),
    appliedAt: v.optional(v.number()),
  })
    .index("by_scan", ["scanId"])
    .index("by_article", ["articleId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"]),

  competitorSites: defineTable({
    userId: v.string(),
    domain: v.string(),
    crawledAt: v.optional(v.number()),
    pagesCrawled: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  competitorPages: defineTable({
    siteId: v.id("competitorSites"),
    url: v.string(),
    title: v.string(),
    content: v.string(),
    h1Tags: v.array(v.string()),
    h2Tags: v.array(v.string()),
    metaDescription: v.optional(v.string()),
    crawledAt: v.number(),
  }).index("by_site", ["siteId"]),

  stagedChanges: defineTable({
    opportunityId: v.id("opportunities"),
    originalContent: v.string(),
    modifiedContent: v.string(),
    changeType: v.string(),
    createdAt: v.number(),
  }).index("by_opportunity", ["opportunityId"]),

  // Users
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    stripeCustomerId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),
});
