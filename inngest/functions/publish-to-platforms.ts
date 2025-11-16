/**
 * Parallel Publishing Job (Week 2)
 *
 * Publishes articles to multiple platforms simultaneously:
 * - WordPress, Shopify, Medium, LinkedIn, Webflow, Dev.to, Ghost, Wix, Squarespace, Custom CMS
 * - Content adaptation per platform (HTML, Markdown, rich text)
 * - Handles partial failures (some platforms succeed, some fail)
 * - Tracks publish status and URLs
 *
 * Target: Publish to 3+ platforms in under 3 minutes
 */

import { inngest } from "../client";
import { api } from "../../convex/_generated/api";
import { ConvexClient } from "convex/browser";

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Main parallel publishing orchestrator
 */
export const publishToPlatforms = inngest.createFunction(
  {
    id: "publish-to-platforms",
    name: "Publish to Multiple Platforms",
    concurrency: {
      limit: 10, // Allow 10 concurrent publishing jobs
      key: "event.data.userId",
    },
    retries: 2,
  },
  { event: "publish/to-platforms" },
  async ({ event, step, logger }) => {
    const { articleId, userId, platformIds, scheduledFor } = event.data;

    logger.info(`Starting publishing for article: ${articleId}`, {
      platformCount: platformIds.length,
      platforms: platformIds,
      scheduledFor,
    });

    // Step 1: Fetch article content
    const article = await step.run("fetch-article", async () => {
      const result = await convex.query(api.articles.getArticle, { articleId });
      if (!result) {
        throw new Error(`Article not found: ${articleId}`);
      }
      return result;
    });

    // Step 2: Create publish job record
    const publishJobId = await step.run("create-publish-job", async () => {
      const jobId = await convex.mutation(api.publishing.createPublishJob, {
        articleId,
        userId,
        platformIds,
        status: "pending",
        scheduledFor: scheduledFor || Date.now(),
      });

      logger.info("Publish job created", { publishJobId: jobId });
      return jobId;
    });

    // Step 3: Fetch platform connections
    const platformConnections = await step.run("fetch-platforms", async () => {
      const connections = await convex.query(
        api.publishing.getPlatformConnections,
        {
          userId,
          platformIds,
        }
      );

      if (connections.length === 0) {
        throw new Error("No platform connections found");
      }

      logger.info(`Found ${connections.length} platform connections`);
      return connections;
    });

    // Step 4: Update job status to "publishing"
    await step.run("update-job-status", async () => {
      await convex.mutation(api.publishing.updatePublishJob, {
        publishJobId,
        status: "publishing",
        startedAt: Date.now(),
      });
    });

    // Step 5: Publish to all platforms in parallel
    const publishResults = await Promise.allSettled(
      platformConnections.map(async (platform: any, index: number) => {
        return step.run(`publish-to-${platform.platform}`, async () => {
          logger.info(
            `Publishing to ${platform.platform} (${index + 1}/${
              platformConnections.length
            })`,
            {
              platformId: platform._id,
              platformType: platform.platform,
            }
          );

          try {
            // Adapt content for specific platform
            const adaptedContent = await convex.action(
              api.contentAdapter.adaptContent,
              {
                content: article.content,
                platform: platform.platform,
                title: article.title,
              }
            );

            // Publish to platform via adapter
            const result = await convex.action(api.publishers.publish, {
              platformConnectionId: platform._id,
              articleId,
              content: adaptedContent.content,
              title: adaptedContent.title,
              excerpt: adaptedContent.excerpt,
              tags: article.tags || [],
              featuredImage: article.featuredImage || null,
            });

            // Store publish result
            await convex.mutation(api.publishing.createPublishResult, {
              publishJobId,
              platformConnectionId: platform._id,
              platform: platform.platform,
              status: "success",
              publishedUrl: result.url,
              platformPostId: result.postId,
              publishedAt: Date.now(),
            });

            logger.info(`Successfully published to ${platform.platform}`, {
              url: result.url,
              postId: result.postId,
            });

            return {
              platform: platform.platform,
              success: true,
              url: result.url,
              postId: result.postId,
            };
          } catch (error) {
            logger.error(`Failed to publish to ${platform.platform}`, {
              error: error instanceof Error ? error.message : "Unknown error",
            });

            // Store failed result
            await convex.mutation(api.publishing.createPublishResult, {
              publishJobId,
              platformConnectionId: platform._id,
              platform: platform.platform,
              status: "failed",
              error: error instanceof Error ? error.message : "Unknown error",
              publishedAt: Date.now(),
            });

            return {
              platform: platform.platform,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        });
      })
    );

    // Step 6: Aggregate results
    const summary = await step.run("aggregate-results", async () => {
      const successful = publishResults.filter((r) => r.status === "fulfilled");
      const failed = publishResults.filter((r) => r.status === "rejected");

      const successCount = successful.length;
      const failCount = failed.length;
      const totalCount = platformConnections.length;

      // Determine overall job status
      let jobStatus: "completed" | "partial" | "failed";
      if (successCount === totalCount) {
        jobStatus = "completed";
      } else if (successCount > 0) {
        jobStatus = "partial";
      } else {
        jobStatus = "failed";
      }

      // Update publish job with final status
      await convex.mutation(api.publishing.updatePublishJob, {
        publishJobId,
        status: jobStatus,
        completedAt: Date.now(),
        successCount,
        failCount,
      });

      // Update article publish status
      await convex.mutation(api.articles.updatePublishStatus, {
        articleId,
        publishedToCount: successCount,
        lastPublishedAt: Date.now(),
      });

      logger.info("Publishing complete", {
        publishJobId,
        status: jobStatus,
        successful: successCount,
        failed: failCount,
        total: totalCount,
      });

      return {
        publishJobId,
        status: jobStatus,
        successful: successCount,
        failed: failCount,
        total: totalCount,
        results: publishResults.map((r: any) =>
          r.status === "fulfilled" ? r.value : null
        ),
      };
    });

    return summary;
  }
);

/**
 * Publish single article to single platform
 */
export const publishToSinglePlatform = inngest.createFunction(
  {
    id: "publish-to-single-platform",
    name: "Publish to Single Platform",
    retries: 2,
  },
  { event: "publish/single-platform" },
  async ({ event, step, logger }) => {
    const { articleId, userId, platformConnectionId } = event.data;

    logger.info("Publishing to single platform", {
      articleId,
      platformConnectionId,
    });

    // Fetch article
    const article = await step.run("fetch-article", async () => {
      return convex.query(api.articles.getArticle, { articleId });
    });

    // Fetch platform connection
    const platform = await step.run("fetch-platform", async () => {
      return convex.query(api.publishing.getPlatformConnection, {
        platformConnectionId,
        userId,
      });
    });

    // Adapt content
    const adaptedContent = await step.run("adapt-content", async () => {
      return convex.action(api.contentAdapter.adaptContent, {
        content: article.content,
        platform: platform.platform,
        title: article.title,
      });
    });

    // Publish
    const result = await step.run("publish", async () => {
      return convex.action(api.publishers.publish, {
        platformConnectionId,
        articleId,
        content: adaptedContent.content,
        title: adaptedContent.title,
        excerpt: adaptedContent.excerpt,
        tags: article.tags || [],
        featuredImage: article.featuredImage || null,
      });
    });

    logger.info("Successfully published", {
      url: result.url,
      postId: result.postId,
    });

    return {
      success: true,
      url: result.url,
      postId: result.postId,
    };
  }
);

/**
 * Bulk publish multiple articles to multiple platforms
 */
export const publishBulk = inngest.createFunction(
  {
    id: "publish-bulk",
    name: "Bulk Publishing",
    concurrency: {
      limit: 5, // Process 5 articles at a time
      key: "event.data.userId",
    },
    retries: 2,
  },
  { event: "publish/bulk" },
  async ({ event, step, logger }) => {
    const { articleIds, userId, platformIds } = event.data;

    logger.info(`Starting bulk publishing for ${articleIds.length} articles`);

    const results = await Promise.allSettled(
      articleIds.map(async (articleId: string, index: number) => {
        return step.run(`publish-article-${articleId}`, async () => {
          logger.info(
            `Publishing article ${index + 1}/${articleIds.length}`,
            { articleId }
          );

          await step.invoke(`publish-${articleId}`, {
            function: publishToPlatforms,
            data: { articleId, userId, platformIds },
          });

          return { articleId, success: true };
        });
      })
    );

    const summary = {
      total: articleIds.length,
      successful: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    };

    logger.info("Bulk publishing complete", summary);

    return summary;
  }
);
