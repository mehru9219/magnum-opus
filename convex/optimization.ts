/**
 * Convex Backend: Optimization Opportunities
 *
 * Handles detection, tracking, and auto-fix of SEO/GEO optimization opportunities
 * Part of Week 5 - Smart Optimization Scanner
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Opportunity Types (5 detection rules)
 */
export const OpportunityType = v.union(
  v.literal("UPDATE_HEADINGS_KEYWORDS"),
  v.literal("ADD_FAQ"),
  v.literal("REFRESH_METADATA"),
  v.literal("UPLOAD_LLMTXT"),
  v.literal("ADD_INTERNAL_LINKS")
);

/**
 * Opportunity Status Lifecycle
 */
export const OpportunityStatus = v.union(
  v.literal("pending"),
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("dismissed"),
  v.literal("verified")
);

/**
 * Priority Levels (calculated from 0-100 score)
 */
export const PriorityLevel = v.union(
  v.literal("urgent"),    // score >= 90
  v.literal("high"),      // score >= 70
  v.literal("medium"),    // score >= 40
  v.literal("low")        // score < 40
);

/**
 * MUTATION: Run Opportunity Scan
 *
 * Triggers a full scan of the user's published content to detect optimization opportunities.
 * Called by Inngest scheduler every 6 hours or manually by user.
 */
export const runOpportunityScan = mutation({
  args: {
    userId: v.id("users"),
    siteId: v.optional(v.string()), // If multi-brand, specify which site
    scanType: v.optional(v.union(
      v.literal("full"),        // Scan all pages
      v.literal("incremental")  // Only scan changed pages
    )),
  },
  handler: async (ctx, args) => {
    const { userId, siteId, scanType = "incremental" } = args;

    // Create scan session record
    const scanSessionId = await ctx.db.insert("opportunityScans", {
      userId,
      siteId: siteId || "default",
      scanType,
      status: "running",
      startedAt: Date.now(),
      pagesAnalyzed: 0,
      opportunitiesDetected: 0,
      errors: [],
    });

    // Return session ID for status tracking
    // Actual scanning will be done by Inngest background job
    return {
      success: true,
      scanSessionId,
      message: "Opportunity scan initiated. Check status for progress.",
    };
  },
});

/**
 * MUTATION: Create Opportunity
 *
 * Called by scanner detectors to record a detected opportunity
 */
export const createOpportunity = mutation({
  args: {
    userId: v.id("users"),
    scanSessionId: v.id("opportunityScans"),
    type: OpportunityType,
    pageUrl: v.string(),
    pageTitle: v.string(),
    priorityScore: v.number(), // 0-100
    estimatedImpact: v.string(), // "high", "medium", "low"
    detectionDetails: v.object({
      rule: v.string(),
      findings: v.any(), // JSON with specific findings
      suggestedFix: v.any(), // JSON with fix details
    }),
  },
  handler: async (ctx, args) => {
    // Determine priority level from score
    let priorityLevel: "urgent" | "high" | "medium" | "low" = "low";
    if (args.priorityScore >= 90) priorityLevel = "urgent";
    else if (args.priorityScore >= 70) priorityLevel = "high";
    else if (args.priorityScore >= 40) priorityLevel = "medium";

    const opportunityId = await ctx.db.insert("opportunities", {
      userId: args.userId,
      scanSessionId: args.scanSessionId,
      type: args.type,
      pageUrl: args.pageUrl,
      pageTitle: args.pageTitle,
      status: "pending",
      priorityScore: args.priorityScore,
      priorityLevel,
      estimatedImpact: args.estimatedImpact,
      detectionDetails: args.detectionDetails,
      detectedAt: Date.now(),
      appliedAt: undefined,
      verifiedAt: undefined,
      aiModelUsed: undefined,
      tokensUsed: undefined,
    });

    // Update scan session opportunity count
    const scanSession = await ctx.db.get(args.scanSessionId);
    if (scanSession) {
      await ctx.db.patch(args.scanSessionId, {
        opportunitiesDetected: (scanSession.opportunitiesDetected || 0) + 1,
      });
    }

    return {
      success: true,
      opportunityId,
    };
  },
});

/**
 * MUTATION: Approve and Apply Opportunity Fix
 *
 * One-click auto-fix functionality. Applies the suggested optimization.
 */
export const approveOpportunity = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    userId: v.id("users"),
    autoApply: v.optional(v.boolean()), // If true, immediately apply fix
  },
  handler: async (ctx, args) => {
    const opportunity = await ctx.db.get(args.opportunityId);

    if (!opportunity) {
      return {
        success: false,
        error: "Opportunity not found",
      };
    }

    // Verify user owns this opportunity
    if (opportunity.userId !== args.userId) {
      return {
        success: false,
        error: "Unauthorized: You don't own this opportunity",
      };
    }

    // Update status to in_progress
    await ctx.db.patch(args.opportunityId, {
      status: "in_progress",
      appliedAt: Date.now(),
    });

    // If autoApply is true, trigger Inngest job to execute fix
    // For now, return success and let background job handle it
    return {
      success: true,
      opportunityId: args.opportunityId,
      message: args.autoApply
        ? "Fix is being applied. You'll be notified when complete."
        : "Opportunity approved. Apply fix when ready.",
    };
  },
});

/**
 * MUTATION: Publish Staged Opportunity Fix
 *
 * After reviewing staged preview, user confirms to publish changes
 */
export const publishOpportunity = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const opportunity = await ctx.db.get(args.opportunityId);

    if (!opportunity) {
      return {
        success: false,
        error: "Opportunity not found",
      };
    }

    if (opportunity.userId !== args.userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if there's a staged change
    const stagedChange = await ctx.db
      .query("stagedChanges")
      .withIndex("by_opportunity", (q) => q.eq("opportunityId", args.opportunityId))
      .first();

    if (!stagedChange) {
      return {
        success: false,
        error: "No staged changes found for this opportunity",
      };
    }

    // Mark opportunity as completed
    await ctx.db.patch(args.opportunityId, {
      status: "completed",
      appliedAt: Date.now(),
    });

    // Trigger Inngest job to publish staged change to CMS
    return {
      success: true,
      message: "Changes published successfully",
      stagedChangeId: stagedChange._id,
    };
  },
});

/**
 * MUTATION: Dismiss Opportunity
 *
 * User explicitly dismisses an opportunity (won't fix)
 */
export const dismissOpportunity = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    userId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const opportunity = await ctx.db.get(args.opportunityId);

    if (!opportunity) {
      return { success: false, error: "Opportunity not found" };
    }

    if (opportunity.userId !== args.userId) {
      return { success: false, error: "Unauthorized" };
    }

    await ctx.db.patch(args.opportunityId, {
      status: "dismissed",
    });

    return {
      success: true,
      message: "Opportunity dismissed",
    };
  },
});

/**
 * MUTATION: Batch Approve Opportunities
 *
 * Apply multiple fixes simultaneously
 */
export const batchApproveOpportunities = mutation({
  args: {
    opportunityIds: v.array(v.id("opportunities")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const results: Array<{ id: Id<"opportunities">, success: boolean, error?: string }> = [];

    for (const opportunityId of args.opportunityIds) {
      const opportunity = await ctx.db.get(opportunityId);

      if (!opportunity || opportunity.userId !== args.userId) {
        results.push({
          id: opportunityId,
          success: false,
          error: "Not found or unauthorized",
        });
        continue;
      }

      await ctx.db.patch(opportunityId, {
        status: "in_progress",
        appliedAt: Date.now(),
      });

      results.push({
        id: opportunityId,
        success: true,
      });
    }

    return {
      success: true,
      processed: results.length,
      results,
    };
  },
});

/**
 * QUERY: Get Priority Opportunities
 *
 * Retrieve opportunities sorted by priority score (highest first)
 */
export const getPriorityOpportunities = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    status: v.optional(OpportunityStatus),
    type: v.optional(OpportunityType),
  },
  handler: async (ctx, args) => {
    const { userId, limit = 50, status, type } = args;

    // Query opportunities by user
    let opportunities = await ctx.db
      .query("opportunities")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Apply filters
    if (status) {
      opportunities = opportunities.filter((opp) => opp.status === status);
    }

    if (type) {
      opportunities = opportunities.filter((opp) => opp.type === type);
    }

    // Sort by priority score (highest first)
    opportunities.sort((a, b) => b.priorityScore - a.priorityScore);

    // Limit results
    opportunities = opportunities.slice(0, limit);

    return opportunities;
  },
});

/**
 * QUERY: Get Opportunity Scan History
 *
 * Retrieve past scan sessions with statistics
 */
export const getOpportunityScanHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, limit = 10 } = args;

    const scans = await ctx.db
      .query("opportunityScans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return scans;
  },
});

/**
 * QUERY: Get Opportunity Details
 *
 * Retrieve single opportunity with full details
 */
export const getOpportunityDetails = query({
  args: {
    opportunityId: v.id("opportunities"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const opportunity = await ctx.db.get(args.opportunityId);

    if (!opportunity) {
      return null;
    }

    if (opportunity.userId !== args.userId) {
      return null;
    }

    // Get associated staged changes if any
    const stagedChanges = await ctx.db
      .query("stagedChanges")
      .withIndex("by_opportunity", (q) => q.eq("opportunityId", args.opportunityId))
      .collect();

    return {
      ...opportunity,
      stagedChanges,
    };
  },
});

/**
 * QUERY: Get Opportunity Statistics
 *
 * Dashboard summary: total opportunities, completion rate, etc.
 */
export const getOpportunityStatistics = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const opportunities = await ctx.db
      .query("opportunities")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const total = opportunities.length;
    const pending = opportunities.filter((o) => o.status === "pending").length;
    const inProgress = opportunities.filter((o) => o.status === "in_progress").length;
    const completed = opportunities.filter((o) => o.status === "completed").length;
    const failed = opportunities.filter((o) => o.status === "failed").length;
    const dismissed = opportunities.filter((o) => o.status === "dismissed").length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Count by type
    const byType = {
      headings: opportunities.filter((o) => o.type === "UPDATE_HEADINGS_KEYWORDS").length,
      faq: opportunities.filter((o) => o.type === "ADD_FAQ").length,
      metadata: opportunities.filter((o) => o.type === "REFRESH_METADATA").length,
      llmtxt: opportunities.filter((o) => o.type === "UPLOAD_LLMTXT").length,
      links: opportunities.filter((o) => o.type === "ADD_INTERNAL_LINKS").length,
    };

    // Count by priority
    const byPriority = {
      urgent: opportunities.filter((o) => o.priorityLevel === "urgent").length,
      high: opportunities.filter((o) => o.priorityLevel === "high").length,
      medium: opportunities.filter((o) => o.priorityLevel === "medium").length,
      low: opportunities.filter((o) => o.priorityLevel === "low").length,
    };

    return {
      total,
      pending,
      inProgress,
      completed,
      failed,
      dismissed,
      completionRate,
      byType,
      byPriority,
    };
  },
});

/**
 * QUERY: Get Opportunities by Page
 *
 * Retrieve all opportunities for a specific page URL
 */
export const getOpportunitiesByPage = query({
  args: {
    userId: v.id("users"),
    pageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const opportunities = await ctx.db
      .query("opportunities")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("pageUrl"), args.pageUrl))
      .collect();

    // Sort by priority
    opportunities.sort((a, b) => b.priorityScore - a.priorityScore);

    return opportunities;
  },
});

/**
 * MUTATION: Update Scan Session Status
 *
 * Called by scanner to update progress
 */
export const updateScanSession = mutation({
  args: {
    scanSessionId: v.id("opportunityScans"),
    pagesAnalyzed: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    )),
    errors: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { scanSessionId, ...updates } = args;

    const updateData: any = {};

    if (updates.pagesAnalyzed !== undefined) {
      updateData.pagesAnalyzed = updates.pagesAnalyzed;
    }

    if (updates.status !== undefined) {
      updateData.status = updates.status;
      if (updates.status === "completed" || updates.status === "failed") {
        updateData.completedAt = Date.now();
      }
    }

    if (updates.errors !== undefined) {
      updateData.errors = updates.errors;
    }

    await ctx.db.patch(scanSessionId, updateData);

    return { success: true };
  },
});
