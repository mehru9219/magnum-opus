/**
 * Bulk Article Generation Job (Week 1)
 *
 * Processes bulk article generation requests with:
 * - Concurrency control (5 concurrent generations)
 * - Automatic retries on failures
 * - Progress tracking
 * - Quality checks and citation insertion
 *
 * Target: 30 articles in under 30 minutes
 */

import { inngest } from "../client";
import { api } from "../../convex/_generated/api";
import { ConvexClient } from "convex/browser";

// Initialize Convex client for mutations
const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Main bulk generation orchestrator
 *
 * @concurrency 5 - Process up to 5 articles simultaneously
 * @retries Auto-retry with exponential backoff (configured in client)
 */
export const generateArticlesBulk = inngest.createFunction(
  {
    id: "generate-articles-bulk",
    name: "Bulk Article Generation",
    concurrency: {
      limit: 5, // Process 5 articles at a time
      key: "event.data.userId", // Limit per user
    },
    retries: 3, // Retry failed generations up to 3 times
  },
  { event: "article/generate.bulk" },
  async ({ event, step, logger }) => {
    const { userId, topics, template, model, tone, length } = event.data;

    logger.info(`Starting bulk generation for ${topics.length} articles`, {
      userId,
      template,
      model,
      topicCount: topics.length,
    });

    // Step 1: Create article records in Convex
    const articleIds = await step.run("create-article-records", async () => {
      const ids: string[] = [];

      for (const topic of topics) {
        try {
          const articleId = await convex.mutation(api.articles.createArticle, {
            userId,
            topic,
            template,
            model,
            status: "queued",
            tone,
            length,
          });

          ids.push(articleId);
          logger.info(`Created article record: ${articleId}`, { topic });
        } catch (error) {
          logger.error(`Failed to create article record for topic: ${topic}`, {
            error: error instanceof Error ? error.message : "Unknown error",
          });
          // Continue with other topics even if one fails
        }
      }

      return ids;
    });

    logger.info(`Created ${articleIds.length} article records`, { articleIds });

    // Step 2: Process each article with individual retries
    const results = await Promise.allSettled(
      articleIds.map(async (articleId, index) => {
        return step.run(`generate-article-${articleId}`, async () => {
          try {
            logger.info(`Generating article ${index + 1}/${articleIds.length}`, {
              articleId,
            });

            // Update status to "generating"
            await convex.mutation(api.articles.updateStatus, {
              articleId,
              status: "generating",
            });

            // Trigger generation via Convex mutation
            const result = await convex.mutation(api.articles.generateArticle, {
              articleId,
              userId,
            });

            if (!result.success) {
              throw new Error(result.error || "Generation failed");
            }

            // Trigger quality checks
            await step.invoke("trigger-quality-checks", {
              function: qualityCheckPipeline,
              data: {
                articleId,
                userId,
              },
            });

            // Trigger citation generation
            await step.invoke("trigger-citation-generation", {
              function: generateCitations,
              data: {
                articleId,
                userId,
              },
            });

            logger.info(`Successfully generated article: ${articleId}`);

            return { articleId, success: true };
          } catch (error) {
            logger.error(`Failed to generate article: ${articleId}`, {
              error: error instanceof Error ? error.message : "Unknown error",
            });

            // Update status to "failed"
            await convex.mutation(api.articles.updateStatus, {
              articleId,
              status: "failed",
              error: error instanceof Error ? error.message : "Unknown error",
            });

            throw error; // Re-throw to trigger Inngest retry
          }
        });
      })
    );

    // Step 3: Aggregate results
    const summary = await step.run("aggregate-results", async () => {
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      logger.info("Bulk generation complete", {
        total: articleIds.length,
        successful,
        failed,
        successRate: `${((successful / articleIds.length) * 100).toFixed(1)}%`,
      });

      // Update user statistics
      await convex.mutation(api.users.updateStats, {
        userId,
        articlesGenerated: successful,
        articlesFailed: failed,
      });

      return {
        total: articleIds.length,
        successful,
        failed,
        articleIds: results
          .filter((r) => r.status === "fulfilled")
          .map((r: any) => r.value.articleId),
      };
    });

    return summary;
  }
);

/**
 * Import related functions (forward declarations)
 * These will be defined in separate files
 */
import { qualityCheckPipeline } from "./run-quality-checks";
import { generateCitations } from "./generate-citations";

/**
 * Helper: Single article generation (can be called independently)
 */
export const generateSingleArticle = inngest.createFunction(
  {
    id: "generate-single-article",
    name: "Generate Single Article",
    retries: 3,
  },
  { event: "article/generate.single" },
  async ({ event, step, logger }) => {
    const { articleId, userId } = event.data;

    logger.info(`Generating single article: ${articleId}`);

    await step.run("generate", async () => {
      await convex.mutation(api.articles.updateStatus, {
        articleId,
        status: "generating",
      });

      const result = await convex.mutation(api.articles.generateArticle, {
        articleId,
        userId,
      });

      if (!result.success) {
        throw new Error(result.error || "Generation failed");
      }
    });

    // Trigger quality checks
    await step.invoke("quality-checks", {
      function: qualityCheckPipeline,
      data: { articleId, userId },
    });

    // Trigger citation generation
    await step.invoke("citations", {
      function: generateCitations,
      data: { articleId, userId },
    });

    logger.info(`Article generation complete: ${articleId}`);

    return { articleId, success: true };
  }
);
