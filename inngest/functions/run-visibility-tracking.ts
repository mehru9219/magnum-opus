/**
 * Visibility Tracking Job (Week 3)
 *
 * Tracks brand visibility across AI platforms:
 * - ChatGPT, Claude, Perplexity, Gemini
 * - 50-100 prompt variations per keyword
 * - Citation extraction and position tracking
 * - Competitor comparison
 * - Trend analysis
 *
 * Target: Complete tracking for 1 keyword in under 15 minutes
 * Runs daily or on-demand
 */

import { inngest } from "../client";
import { api } from "../../convex/_generated/api";
import { ConvexClient } from "convex/browser";
import { processPromptVariations } from "./process-prompt-variations";
import { calculateVisibilityScores } from "./calculate-scores";

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Main visibility tracking orchestrator
 */
export const runVisibilityTracking = inngest.createFunction(
  {
    id: "run-visibility-tracking",
    name: "Run Visibility Tracking",
    concurrency: {
      limit: 3, // Run 3 tracking jobs simultaneously
      key: "event.data.userId",
    },
    retries: 2,
  },
  { event: "tracking/run" },
  async ({ event, step, logger }) => {
    const { brandId, userId, keywordIds } = event.data;

    logger.info("Starting visibility tracking", {
      brandId,
      keywordIds: keywordIds?.length || "all",
    });

    // Step 1: Fetch brand details
    const brand = await step.run("fetch-brand", async () => {
      const result = await convex.query(api.tracking.getTrackedBrand, {
        brandId,
        userId,
      });

      if (!result) {
        throw new Error(`Brand not found: ${brandId}`);
      }

      return result;
    });

    // Step 2: Fetch keywords to track
    const keywords = await step.run("fetch-keywords", async () => {
      if (keywordIds && keywordIds.length > 0) {
        // Track specific keywords
        return convex.query(api.tracking.getKeywordsByIds, {
          keywordIds,
          userId,
        });
      } else {
        // Track all keywords for this brand
        return convex.query(api.tracking.getKeywordsByBrand, {
          brandId,
          userId,
        });
      }
    });

    logger.info(`Tracking ${keywords.length} keywords`, {
      brandId,
      keywordCount: keywords.length,
    });

    // Step 3: Create tracking run record
    const trackingRunId = await step.run("create-tracking-run", async () => {
      const runId = await convex.mutation(api.tracking.createTrackingRun, {
        brandId,
        userId,
        keywordIds: keywords.map((k: any) => k._id),
        status: "running",
        platforms: ["chatgpt", "claude", "perplexity", "gemini"],
        startedAt: Date.now(),
      });

      logger.info("Tracking run created", { trackingRunId: runId });
      return runId;
    });

    // Step 4: Process each keyword
    const keywordResults = await Promise.allSettled(
      keywords.map(async (keyword: any, index: number) => {
        return step.run(`track-keyword-${keyword._id}`, async () => {
          logger.info(
            `Processing keyword ${index + 1}/${keywords.length}: "${keyword.keyword}"`,
            {
              keywordId: keyword._id,
            }
          );

          // Generate prompt variations for this keyword
          const prompts = await convex.action(
            api.tracking.generatePromptVariations,
            {
              keyword: keyword.keyword,
              brandName: brand.name,
              variationCount: 50, // Generate 50 variations per keyword
            }
          );

          logger.info(`Generated ${prompts.length} prompt variations`, {
            keywordId: keyword._id,
          });

          // Trigger prompt processing job
          await step.invoke(`process-prompts-${keyword._id}`, {
            function: processPromptVariations,
            data: {
              trackingRunId,
              keywordId: keyword._id,
              prompts,
              userId,
            },
          });

          return {
            keywordId: keyword._id,
            keyword: keyword.keyword,
            promptCount: prompts.length,
            success: true,
          };
        });
      })
    );

    // Step 5: Wait for all prompt processing to complete
    const processedKeywords = keywordResults.filter(
      (r) => r.status === "fulfilled"
    );

    logger.info("All keywords processed", {
      total: keywords.length,
      successful: processedKeywords.length,
      failed: keywordResults.length - processedKeywords.length,
    });

    // Step 6: Calculate visibility scores
    const scores = await step.invoke("calculate-scores", {
      function: calculateVisibilityScores,
      data: {
        trackingRunId,
        userId,
      },
    });

    // Step 7: Update tracking run status
    await step.run("complete-tracking-run", async () => {
      await convex.mutation(api.tracking.updateTrackingRun, {
        trackingRunId,
        status: "completed",
        completedAt: Date.now(),
        totalPrompts: processedKeywords.reduce(
          (sum: number, r: any) => sum + r.value.promptCount,
          0
        ),
        totalResponses: scores.totalResponses,
      });
    });

    logger.info("Visibility tracking complete", {
      trackingRunId,
      keywordCount: processedKeywords.length,
      visibilityScores: scores,
    });

    return {
      success: true,
      trackingRunId,
      keywordCount: processedKeywords.length,
      scores,
    };
  }
);

/**
 * Daily scheduled tracking (cron job)
 */
export const dailyVisibilityTracking = inngest.createFunction(
  {
    id: "daily-visibility-tracking",
    name: "Daily Visibility Tracking",
    concurrency: {
      limit: 5, // Process 5 brands at a time
    },
  },
  { cron: "0 2 * * *" }, // Run at 2 AM daily
  async ({ step, logger }) => {
    logger.info("Starting daily visibility tracking for all active brands");

    // Get all active tracked brands
    const brands = await step.run("fetch-brands", async () => {
      const activeBrands = await convex.query(
        api.tracking.getActiveTrackedBrands,
        {}
      );

      logger.info(`Found ${activeBrands.length} active tracked brands`);
      return activeBrands;
    });

    // Run tracking for each brand
    const results = await Promise.allSettled(
      brands.map(async (brand: any, index: number) => {
        return step.run(`track-brand-${brand._id}`, async () => {
          logger.info(
            `Tracking brand ${index + 1}/${brands.length}: ${brand.name}`
          );

          await step.invoke(`tracking-${brand._id}`, {
            function: runVisibilityTracking,
            data: {
              brandId: brand._id,
              userId: brand.userId,
            },
          });

          return { brandId: brand._id, success: true };
        });
      })
    );

    const summary = {
      total: brands.length,
      successful: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    };

    logger.info("Daily visibility tracking complete", summary);

    return summary;
  }
);

/**
 * Hourly tracking for high-priority keywords
 */
export const hourlyVisibilityTracking = inngest.createFunction(
  {
    id: "hourly-visibility-tracking",
    name: "Hourly Visibility Tracking",
    concurrency: {
      limit: 10,
    },
  },
  { cron: "0 * * * *" }, // Run every hour
  async ({ step, logger }) => {
    logger.info("Starting hourly visibility tracking for high-priority keywords");

    // Get high-priority keywords
    const keywords = await step.run("fetch-priority-keywords", async () => {
      const priorityKeywords = await convex.query(
        api.tracking.getHighPriorityKeywords,
        {}
      );

      logger.info(`Found ${priorityKeywords.length} high-priority keywords`);
      return priorityKeywords;
    });

    // Group keywords by brand
    const keywordsByBrand = keywords.reduce((acc: any, keyword: any) => {
      if (!acc[keyword.brandId]) {
        acc[keyword.brandId] = [];
      }
      acc[keyword.brandId].push(keyword._id);
      return acc;
    }, {});

    // Run tracking for each brand with specific keywords
    const results = await Promise.allSettled(
      Object.entries(keywordsByBrand).map(
        async ([brandId, keywordIds]: [string, any]) => {
          return step.run(`track-brand-${brandId}`, async () => {
            const brand = await convex.query(api.tracking.getTrackedBrand, {
              brandId,
              userId: keywords.find((k: any) => k.brandId === brandId).userId,
            });

            await step.invoke(`tracking-${brandId}`, {
              function: runVisibilityTracking,
              data: {
                brandId,
                userId: brand.userId,
                keywordIds,
              },
            });

            return { brandId, keywordCount: keywordIds.length, success: true };
          });
        }
      )
    );

    const summary = {
      total: Object.keys(keywordsByBrand).length,
      successful: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    };

    logger.info("Hourly visibility tracking complete", summary);

    return summary;
  }
);

/**
 * On-demand tracking for single keyword
 */
export const trackSingleKeyword = inngest.createFunction(
  {
    id: "track-single-keyword",
    name: "Track Single Keyword",
    retries: 2,
  },
  { event: "tracking/single-keyword" },
  async ({ event, step, logger }) => {
    const { keywordId, userId } = event.data;

    logger.info("Starting single keyword tracking", { keywordId });

    // Fetch keyword details
    const keyword = await step.run("fetch-keyword", async () => {
      return convex.query(api.tracking.getKeyword, { keywordId, userId });
    });

    // Run tracking for just this keyword
    const result = await step.invoke("run-tracking", {
      function: runVisibilityTracking,
      data: {
        brandId: keyword.brandId,
        userId,
        keywordIds: [keywordId],
      },
    });

    logger.info("Single keyword tracking complete", { keywordId, result });

    return result;
  }
);
