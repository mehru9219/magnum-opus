/**
 * Platform Analytics Sync Job (Week 2)
 *
 * Fetches engagement metrics from published platforms:
 * - Views, likes, comments, shares
 * - Click-through rates
 * - Time on page
 * - Social media engagement
 *
 * Runs daily to update analytics dashboard
 */

import { inngest } from "../client";
import { api } from "../../convex/_generated/api";
import { ConvexClient } from "convex/browser";

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Sync analytics for a single platform connection
 */
export const syncPlatformAnalytics = inngest.createFunction(
  {
    id: "sync-platform-analytics",
    name: "Sync Platform Analytics",
    retries: 2,
  },
  { event: "analytics/sync" },
  async ({ event, step, logger }) => {
    const { userId, platformConnectionId } = event.data;

    logger.info("Starting analytics sync", { platformConnectionId });

    // Step 1: Fetch platform connection
    const platform = await step.run("fetch-platform", async () => {
      const connection = await convex.query(
        api.publishing.getPlatformConnection,
        {
          platformConnectionId,
          userId,
        }
      );

      if (!connection) {
        throw new Error(`Platform connection not found: ${platformConnectionId}`);
      }

      return connection;
    });

    // Step 2: Fetch all published articles for this platform
    const publishedArticles = await step.run("fetch-published-articles", async () => {
      const results = await convex.query(
        api.publishing.getPublishedArticlesByPlatform,
        {
          platformConnectionId,
          userId,
        }
      );

      logger.info(`Found ${results.length} published articles`, {
        platformConnectionId,
        articleCount: results.length,
      });

      return results;
    });

    // Step 3: Fetch analytics for each article from platform
    const analyticsData = await step.run("fetch-analytics", async () => {
      const analytics = [];

      for (const article of publishedArticles) {
        try {
          logger.info("Fetching analytics for article", {
            articleId: article.articleId,
            platformPostId: article.platformPostId,
          });

          // Call platform adapter to fetch analytics
          const metrics = await convex.action(
            api.publishers.fetchAnalytics,
            {
              platformConnectionId,
              platformPostId: article.platformPostId,
              platform: platform.platform,
            }
          );

          analytics.push({
            articleId: article.articleId,
            platformPostId: article.platformPostId,
            metrics,
          });
        } catch (error) {
          logger.error("Failed to fetch analytics for article", {
            articleId: article.articleId,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          // Continue with other articles
        }
      }

      return analytics;
    });

    // Step 4: Store analytics data
    const stored = await step.run("store-analytics", async () => {
      const storedIds = [];

      for (const data of analyticsData) {
        try {
          const analyticsId = await convex.mutation(
            api.analytics.createAnalyticsRecord,
            {
              articleId: data.articleId,
              platformConnectionId,
              platform: platform.platform,
              platformPostId: data.platformPostId,
              views: data.metrics.views || 0,
              likes: data.metrics.likes || 0,
              comments: data.metrics.comments || 0,
              shares: data.metrics.shares || 0,
              clickThroughRate: data.metrics.clickThroughRate || 0,
              timeOnPage: data.metrics.timeOnPage || 0,
              engagementRate: data.metrics.engagementRate || 0,
              syncedAt: Date.now(),
            }
          );

          storedIds.push(analyticsId);
        } catch (error) {
          logger.error("Failed to store analytics", {
            articleId: data.articleId,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      logger.info(`Stored ${storedIds.length} analytics records`);
      return storedIds;
    });

    // Step 5: Update platform connection sync timestamp
    await step.run("update-sync-timestamp", async () => {
      await convex.mutation(api.publishing.updatePlatformConnection, {
        platformConnectionId,
        lastAnalyticsSyncAt: Date.now(),
      });
    });

    logger.info("Analytics sync complete", {
      platformConnectionId,
      articleCount: publishedArticles.length,
      analyticsRecords: stored.length,
    });

    return {
      success: true,
      platformConnectionId,
      articleCount: publishedArticles.length,
      analyticsRecords: stored.length,
    };
  }
);

/**
 * Sync analytics for all platforms (daily job)
 */
export const syncAllPlatformAnalytics = inngest.createFunction(
  {
    id: "sync-all-platform-analytics",
    name: "Sync All Platform Analytics",
    concurrency: {
      limit: 5, // Sync 5 platforms at a time
      key: "event.data.userId",
    },
  },
  { event: "analytics/sync-all" },
  async ({ event, step, logger }) => {
    const { userId } = event.data;

    logger.info("Starting sync for all platforms", { userId });

    // Fetch all connected platforms
    const platforms = await step.run("fetch-platforms", async () => {
      const connections = await convex.query(
        api.publishing.getAllPlatformConnections,
        { userId }
      );

      logger.info(`Found ${connections.length} platform connections`);
      return connections;
    });

    // Sync each platform in parallel (with concurrency limit)
    const results = await Promise.allSettled(
      platforms.map(async (platform: any, index: number) => {
        return step.run(`sync-${platform.platform}`, async () => {
          logger.info(
            `Syncing platform ${index + 1}/${platforms.length}: ${platform.platform}`
          );

          await step.invoke(`analytics-${platform._id}`, {
            function: syncPlatformAnalytics,
            data: {
              userId,
              platformConnectionId: platform._id,
            },
          });

          return { platformId: platform._id, success: true };
        });
      })
    );

    const summary = {
      total: platforms.length,
      successful: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    };

    logger.info("All platforms sync complete", summary);

    return summary;
  }
);

/**
 * Daily scheduled analytics sync (cron job)
 */
export const dailyAnalyticsSync = inngest.createFunction(
  {
    id: "daily-analytics-sync",
    name: "Daily Analytics Sync",
    concurrency: {
      limit: 10, // Process 10 users at a time
    },
  },
  { cron: "0 3 * * *" }, // Run at 3 AM daily
  async ({ step, logger }) => {
    logger.info("Starting daily analytics sync for all users");

    // Get all active users with platform connections
    const users = await step.run("fetch-users", async () => {
      const activeUsers = await convex.query(
        api.users.getUsersWithPlatformConnections,
        {}
      );

      logger.info(`Found ${activeUsers.length} users with platform connections`);
      return activeUsers;
    });

    // Sync analytics for each user
    const results = await Promise.allSettled(
      users.map(async (user: any, index: number) => {
        return step.run(`sync-user-${user._id}`, async () => {
          logger.info(
            `Syncing user ${index + 1}/${users.length}: ${user._id}`
          );

          await step.invoke(`user-analytics-${user._id}`, {
            function: syncAllPlatformAnalytics,
            data: { userId: user._id },
          });

          return { userId: user._id, success: true };
        });
      })
    );

    const summary = {
      total: users.length,
      successful: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    };

    logger.info("Daily analytics sync complete", summary);

    return summary;
  }
);

/**
 * Get analytics summary for dashboard
 */
export const calculateAnalyticsSummary = inngest.createFunction(
  {
    id: "calculate-analytics-summary",
    name: "Calculate Analytics Summary",
  },
  { event: "analytics/calculate-summary" },
  async ({ event, step, logger }) => {
    const { userId, articleId, timeRange } = event.data;

    logger.info("Calculating analytics summary", {
      userId,
      articleId,
      timeRange,
    });

    const summary = await step.run("calculate", async () => {
      // Fetch all analytics records for the article
      const records = await convex.query(api.analytics.getAnalyticsForArticle, {
        articleId,
        userId,
        timeRange,
      });

      // Aggregate metrics
      const totalViews = records.reduce((sum: number, r: any) => sum + r.views, 0);
      const totalLikes = records.reduce((sum: number, r: any) => sum + r.likes, 0);
      const totalComments = records.reduce(
        (sum: number, r: any) => sum + r.comments,
        0
      );
      const totalShares = records.reduce((sum: number, r: any) => sum + r.shares, 0);
      const avgEngagementRate =
        records.reduce((sum: number, r: any) => sum + r.engagementRate, 0) /
        records.length;

      return {
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        avgEngagementRate,
        platformCount: records.length,
      };
    });

    logger.info("Analytics summary calculated", summary);

    return summary;
  }
);
