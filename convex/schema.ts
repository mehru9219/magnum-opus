import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================================
  // WEEK 1: CONTENT GENERATION
  // ============================================================

  // Stores generated content with quality scores and metadata
  articles: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(), // Full article HTML/Markdown
    template: v.union(
      v.literal("comparison"),
      v.literal("how-to"),
      v.literal("listicle"),
      v.literal("problem-solver"),
      v.literal("ultimate-guide")
    ),
    aiModel: v.string(), // "gpt-4", "claude-3.5-sonnet", "perplexity", "gemini"
    status: v.union(
      v.literal("queued"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    tokensUsed: v.number(),
    costUsd: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_created_at", ["createdAt"]),

  // Stores input topics for bulk generation
  topics: defineTable({
    userId: v.id("users"),
    topicText: v.string(),
    keywords: v.array(v.string()),
    template: v.optional(v.string()),
    tone: v.optional(v.string()), // "professional", "casual", "technical"
    length: v.optional(v.string()), // "short", "medium", "long"
    targetAudience: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("processed"),
      v.literal("failed")
    ),
    articleId: v.optional(v.id("articles")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Stores quality control results for each article
  qualityChecks: defineTable({
    articleId: v.id("articles"),
    plagiarismScore: v.number(), // Percentage (0-100)
    readabilityScore: v.number(), // Flesch Reading Ease (0-100)
    factCheckAccuracy: v.number(), // Percentage (0-100)
    passed: v.boolean(), // true if all thresholds met
    failureReasons: v.array(v.string()),
    checkedAt: v.number(),
  })
    .index("by_article", ["articleId"]),

  // Stores auto-inserted citations (quotes, stats, sources)
  citations: defineTable({
    articleId: v.id("articles"),
    type: v.union(
      v.literal("quote"),
      v.literal("statistic"),
      v.literal("case-study"),
      v.literal("research")
    ),
    text: v.string(), // The quote or stat
    sourceName: v.string(), // "Harvard Business Review", "Gartner", etc.
    sourceUrl: v.string(),
    publicationYear: v.optional(v.number()),
    position: v.number(), // Where in article (paragraph number)
    createdAt: v.number(),
  })
    .index("by_article", ["articleId"]),

  // ============================================================
  // WEEK 2: MULTI-PLATFORM PUBLISHING
  // ============================================================

  // Stores user's connected publishing platforms
  platformConnections: defineTable({
    userId: v.id("users"),
    platform: v.union(
      v.literal("wordpress"),
      v.literal("shopify"),
      v.literal("webflow"),
      v.literal("wix"),
      v.literal("squarespace"),
      v.literal("ghost"),
      v.literal("medium"),
      v.literal("linkedin"),
      v.literal("devto"),
      v.literal("custom")
    ),
    authMethod: v.union(v.literal("oauth"), v.literal("api-key")),
    credentials: v.string(), // Encrypted JSON: { accessToken, refreshToken } or { apiKey }
    accountMetadata: v.object({
      accountName: v.optional(v.string()),
      siteUrl: v.optional(v.string()),
      userId: v.optional(v.string()),
    }),
    status: v.union(
      v.literal("connected"),
      v.literal("disconnected"),
      v.literal("expired")
    ),
    lastSyncAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_platform", ["userId", "platform"])
    .index("by_status", ["status"]),

  // Stores multi-platform publish operations
  publishJobs: defineTable({
    userId: v.id("users"),
    articleId: v.id("articles"),
    targetPlatforms: v.array(v.string()), // Platform IDs
    scheduledAt: v.optional(v.number()), // null = publish immediately
    status: v.union(
      v.literal("scheduled"),
      v.literal("publishing"),
      v.literal("completed"),
      v.literal("partial"), // Some platforms succeeded, some failed
      v.literal("failed")
    ),
    retryCount: v.number(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_scheduled_at", ["scheduledAt"]),

  // Stores outcome of publishing to each platform
  publishResults: defineTable({
    publishJobId: v.id("publishJobs"),
    platformConnectionId: v.id("platformConnections"),
    platform: v.string(),
    status: v.union(v.literal("success"), v.literal("failed")),
    publishedUrl: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    publishedAt: v.number(),
    engagementMetrics: v.optional(v.object({
      views: v.optional(v.number()),
      likes: v.optional(v.number()),
      shares: v.optional(v.number()),
      comments: v.optional(v.number()),
    })),
  })
    .index("by_job", ["publishJobId"])
    .index("by_platform", ["platform"])
    .index("by_status", ["status"]),

  // Stores platform-specific content versions
  contentAdaptations: defineTable({
    articleId: v.id("articles"),
    platform: v.string(),
    adaptedContent: v.string(), // Platform-specific formatted content
    adaptedTitle: v.string(),
    adaptedImages: v.array(v.string()), // Resized image URLs
    metaDescription: v.optional(v.string()),
    customEdits: v.optional(v.string()), // User manual edits
    approvalStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
  })
    .index("by_article", ["articleId"])
    .index("by_article_and_platform", ["articleId", "platform"]),

  // ============================================================
  // WEEK 3: AI VISIBILITY TRACKING
  // ============================================================

  // Stores brands being monitored for AI visibility
  trackedBrands: defineTable({
    userId: v.id("users"),
    brandName: v.string(),
    brandVariations: v.array(v.string()), // "ProjectHub", "Project Hub", "projecthub.com"
    websiteUrl: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Stores keywords for visibility tracking
  trackedKeywords: defineTable({
    brandId: v.id("trackedBrands"),
    keywordText: v.string(),
    isVIP: v.boolean(), // true = hourly tracking, false = daily
    trackingFrequency: v.union(v.literal("hourly"), v.literal("daily")),
    customPrompts: v.array(v.string()), // User-added custom prompts
    createdAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .index("by_vip", ["isVIP"]),

  // Stores competitors for comparison tracking
  competitorBrands: defineTable({
    trackedBrandId: v.id("trackedBrands"),
    competitorName: v.string(),
    competitorWebsite: v.string(),
    createdAt: v.number(),
  })
    .index("by_tracked_brand", ["trackedBrandId"]),

  // Stores execution of tracking jobs
  trackingRuns: defineTable({
    keywordId: v.id("trackedKeywords"),
    brandId: v.id("trackedBrands"),
    scheduledTime: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    status: v.union(
      v.literal("scheduled"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    totalPrompts: v.number(),
    totalCostUsd: v.number(),
    errorMessage: v.optional(v.string()),
  })
    .index("by_keyword", ["keywordId"])
    .index("by_brand", ["brandId"])
    .index("by_status", ["status"])
    .index("by_scheduled_time", ["scheduledTime"]),

  // Stores AI platform responses for analysis
  aiResponses: defineTable({
    trackingRunId: v.id("trackingRuns"),
    promptText: v.string(),
    platform: v.union(
      v.literal("chatgpt"),
      v.literal("claude"),
      v.literal("perplexity"),
      v.literal("gemini")
    ),
    responseText: v.string(),
    tokensUsed: v.number(),
    costUsd: v.number(),
    responseAt: v.number(),
  })
    .index("by_run", ["trackingRunId"])
    .index("by_platform", ["platform"]),

  // Stores calculated visibility scores
  visibilityScores: defineTable({
    trackingRunId: v.id("trackingRuns"),
    brandId: v.id("trackedBrands"),
    platform: v.string(),
    scorePercentage: v.number(), // 0-100
    totalPrompts: v.number(),
    promptsWithMentions: v.number(),
    changeFromPrevious: v.optional(v.number()), // +5, -3, etc.
    calculatedAt: v.number(),
  })
    .index("by_run", ["trackingRunId"])
    .index("by_brand", ["brandId"])
    .index("by_brand_and_platform", ["brandId", "platform"])
    .index("by_calculated_at", ["calculatedAt"]),

  // ============================================================
  // WEEK 5: SMART OPTIMIZATION
  // ============================================================

  // Stores execution of optimization scanner
  opportunityScans: defineTable({
    userId: v.id("users"),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    status: v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    opportunitiesDetected: v.number(),
    errorMessage: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_started_at", ["startedAt"]),

  // Stores detected optimization opportunities
  opportunities: defineTable({
    scanId: v.id("opportunityScans"),
    userId: v.id("users"),
    type: v.union(
      v.literal("keyword-update"),
      v.literal("faq-addition"),
      v.literal("metadata-refresh"),
      v.literal("llmtxt-update"),
      v.literal("internal-link")
    ),
    title: v.string(),
    description: v.string(),
    affectedContentId: v.optional(v.id("articles")),
    affectedUrl: v.optional(v.string()),
    recommendation: v.string(), // Generic suggestion text
    priorityScore: v.number(), // 1-10
    effortLevel: v.union(
      v.literal("quick-win"), // 1-5 min
      v.literal("moderate"), // 10-30 min
      v.literal("complex") // 1+ hour
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("staged"),
      v.literal("published"),
      v.literal("rejected")
    ),
    detectedAt: v.number(),
  })
    .index("by_scan", ["scanId"])
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_priority", ["priorityScore"]),

  // Stores competitor sites for analysis
  competitorSites: defineTable({
    userId: v.id("users"),
    competitorUrl: v.string(),
    siteName: v.string(),
    lastCrawledAt: v.number(),
    pagesCrawled: v.number(),
    crawlStatus: v.union(
      v.literal("pending"),
      v.literal("crawling"),
      v.literal("completed"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_url", ["competitorUrl"]),

  // Stores crawled competitor content
  competitorPages: defineTable({
    competitorSiteId: v.id("competitorSites"),
    pageUrl: v.string(),
    pageTitle: v.string(),
    headings: v.array(v.string()), // H1, H2 extracted
    keywords: v.array(v.string()),
    topics: v.array(v.string()),
    metaDescription: v.optional(v.string()),
    crawledAt: v.number(),
  })
    .index("by_competitor", ["competitorSiteId"]),

  // Stores approved opportunities in staging preview
  stagedChanges: defineTable({
    opportunityId: v.id("opportunities"),
    userId: v.id("users"),
    previewContent: v.string(), // Updated content HTML
    previewUrl: v.string(), // staging.magnumopus.com/preview/xxx
    authToken: v.string(), // For secured preview access
    expiresAt: v.number(), // 7 days from creation
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_opportunity", ["opportunityId"])
    .index("by_expires_at", ["expiresAt"]),

  // ============================================================
  // USER MANAGEMENT (Clerk Integration)
  // ============================================================

  // Stores user data synchronized with Clerk
  users: defineTable({
    clerkId: v.string(), // Clerk user ID
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    plan: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("growth"),
      v.literal("enterprise")
    ),
    subscriptionStatus: v.optional(v.string()), // Stripe subscription status
    createdAt: v.number(),
    lastLoginAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),
});
