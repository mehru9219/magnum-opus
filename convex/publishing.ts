/**
 * Publishing Convex Mutations and Queries
 * Agent 4: Multi-Platform Publishing Backend Developer
 *
 * Handles multi-platform publishing operations including:
 * - Platform connections management
 * - Publishing to multiple platforms
 * - Scheduled publishing
 * - Publish history and results
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Connect a new publishing platform
 * Stores OAuth tokens or API keys securely
 */
export const connectPlatform = mutation({
  args: {
    platform: v.string(), // "wordpress" | "shopify" | "medium" | etc.
    credentials: v.object({
      accessToken: v.optional(v.string()),
      refreshToken: v.optional(v.string()),
      apiKey: v.optional(v.string()),
      apiSecret: v.optional(v.string()),
      siteUrl: v.optional(v.string()),
      customConfig: v.optional(v.any()),
    }),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if platform already connected
    const existing = await ctx.db
      .query("platformConnections")
      .withIndex("by_user_platform", (q) =>
        q.eq("userId", identity.subject).eq("platform", args.platform)
      )
      .first();

    if (existing) {
      // Update existing connection
      await ctx.db.patch(existing._id, {
        credentials: args.credentials,
        displayName: args.displayName,
        status: "active",
        lastSynced: Date.now(),
      });
      return { success: true, connectionId: existing._id };
    }

    // Create new connection
    const connectionId = await ctx.db.insert("platformConnections", {
      userId: identity.subject,
      platform: args.platform,
      credentials: args.credentials,
      displayName: args.displayName,
      status: "active",
      connectedAt: Date.now(),
      lastSynced: Date.now(),
    });

    return { success: true, connectionId };
  },
});

/**
 * Publish content to multiple platforms simultaneously
 * Creates publish jobs for async processing via Inngest
 */
export const publishToMultiple = mutation({
  args: {
    articleId: v.id("articles"),
    platformIds: v.array(v.id("platformConnections")),
    scheduleAt: v.optional(v.number()), // Unix timestamp for scheduled publishing
    adaptations: v.optional(v.object({
      customTitles: v.optional(v.any()),
      customDescriptions: v.optional(v.any()),
      customTags: v.optional(v.any()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify article exists and belongs to user
    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new Error("Article not found");
    }
    if (article.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Verify all platforms belong to user
    const platforms = await Promise.all(
      args.platformIds.map((id) => ctx.db.get(id))
    );

    const invalidPlatforms = platforms.filter(
      (p) => !p || p.userId !== identity.subject
    );
    if (invalidPlatforms.length > 0) {
      throw new Error("One or more platform connections not found or unauthorized");
    }

    // Create publish jobs for each platform
    const publishJobIds: Id<"publishJobs">[] = [];

    for (const platformId of args.platformIds) {
      const platform = platforms.find((p) => p && p._id === platformId);
      if (!platform) continue;

      const jobId = await ctx.db.insert("publishJobs", {
        userId: identity.subject,
        articleId: args.articleId,
        platformId: platformId,
        platform: platform.platform,
        status: args.scheduleAt ? "scheduled" : "pending",
        scheduledAt: args.scheduleAt,
        createdAt: Date.now(),
        adaptations: args.adaptations,
      });

      publishJobIds.push(jobId);
    }

    return {
      success: true,
      jobCount: publishJobIds.length,
      publishJobIds,
      message: args.scheduleAt
        ? `Scheduled ${publishJobIds.length} publish jobs`
        : `Created ${publishJobIds.length} publish jobs`,
    };
  },
});

/**
 * Schedule content for future publishing
 */
export const schedulePublish = mutation({
  args: {
    articleId: v.id("articles"),
    platformIds: v.array(v.id("platformConnections")),
    publishAt: v.number(), // Unix timestamp
    adaptations: v.optional(v.object({
      customTitles: v.optional(v.any()),
      customDescriptions: v.optional(v.any()),
      customTags: v.optional(v.any()),
    })),
  },
  handler: async (ctx, args) => {
    // Reuse publishToMultiple with scheduleAt parameter
    return await publishToMultiple(ctx, {
      articleId: args.articleId,
      platformIds: args.platformIds,
      scheduleAt: args.publishAt,
      adaptations: args.adaptations,
    });
  },
});

/**
 * Update publish job status (called by Inngest jobs)
 */
export const updatePublishJobStatus = mutation({
  args: {
    jobId: v.id("publishJobs"),
    status: v.string(), // "pending" | "processing" | "completed" | "failed"
    result: v.optional(v.object({
      success: v.boolean(),
      publishedUrl: v.optional(v.string()),
      publishedId: v.optional(v.string()),
      error: v.optional(v.string()),
      publishedAt: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Publish job not found");
    }

    await ctx.db.patch(args.jobId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // If result provided, create publishResult record
    if (args.result) {
      await ctx.db.insert("publishResults", {
        publishJobId: args.jobId,
        userId: job.userId,
        articleId: job.articleId,
        platformId: job.platformId,
        platform: job.platform,
        success: args.result.success,
        publishedUrl: args.result.publishedUrl,
        publishedId: args.result.publishedId,
        error: args.result.error,
        publishedAt: args.result.publishedAt || Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Disconnect a platform
 */
export const disconnectPlatform = mutation({
  args: {
    connectionId: v.id("platformConnections"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const connection = await ctx.db.get(args.connectionId);
    if (!connection) {
      throw new Error("Connection not found");
    }

    if (connection.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.connectionId, {
      status: "disconnected",
      lastSynced: Date.now(),
    });

    return { success: true };
  },
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all platform connections for current user
 */
export const getPlatformConnections = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const connections = await ctx.db
      .query("platformConnections")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.neq(q.field("status"), "disconnected"))
      .collect();

    return connections;
  },
});

/**
 * Get platform connection by ID
 */
export const getPlatformConnection = query({
  args: {
    connectionId: v.id("platformConnections"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const connection = await ctx.db.get(args.connectionId);
    if (!connection || connection.userId !== identity.subject) {
      return null;
    }

    return connection;
  },
});

/**
 * Get publish history for user
 */
export const getPublishHistory = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    let query = ctx.db
      .query("publishJobs")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc");

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const jobs = await query.take(args.limit || 50);

    return jobs;
  },
});

/**
 * Get publish results for an article
 */
export const getPublishResults = query({
  args: {
    articleId: v.id("articles"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const results = await ctx.db
      .query("publishResults")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    return results;
  },
});

/**
 * Get publish jobs for an article
 */
export const getPublishJobsByArticle = query({
  args: {
    articleId: v.id("articles"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const jobs = await ctx.db
      .query("publishJobs")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    return jobs;
  },
});

/**
 * Get scheduled publish jobs
 */
export const getScheduledPublishJobs = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const jobs = await ctx.db
      .query("publishJobs")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("status"), "scheduled"))
      .order("asc")
      .collect();

    return jobs;
  },
});

/**
 * Get publish statistics for dashboard
 */
export const getPublishStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        total: 0,
        successful: 0,
        failed: 0,
        pending: 0,
        scheduled: 0,
      };
    }

    const results = await ctx.db
      .query("publishResults")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const jobs = await ctx.db
      .query("publishJobs")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const pending = jobs.filter((j) => j.status === "pending" || j.status === "processing").length;
    const scheduled = jobs.filter((j) => j.status === "scheduled").length;

    return {
      total: results.length,
      successful,
      failed,
      pending,
      scheduled,
    };
  },
});
