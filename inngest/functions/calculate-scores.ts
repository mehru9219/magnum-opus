/**
 * Visibility Score Calculation Job (Week 3)
 *
 * Aggregates AI responses and calculates visibility scores:
 * - Per-platform scores (ChatGPT, Claude, Perplexity, Gemini)
 * - Overall visibility score across all platforms
 * - Trend detection (improving, declining, stable)
 * - Competitor comparison
 *
 * Formula: (brand mentions / total prompts) × 100
 */

import { inngest } from "../client";
import { api } from "../../convex/_generated/api";
import { ConvexClient } from "convex/browser";

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const AI_PLATFORMS = ["chatgpt", "claude", "perplexity", "gemini"] as const;

/**
 * Calculate visibility scores for a tracking run
 */
export const calculateVisibilityScores = inngest.createFunction(
  {
    id: "calculate-visibility-scores",
    name: "Calculate Visibility Scores",
    retries: 2,
  },
  { event: "tracking/calculate-scores" },
  async ({ event, step, logger }) => {
    const { trackingRunId, userId } = event.data;

    logger.info("Starting visibility score calculation", { trackingRunId });

    // Step 1: Fetch tracking run details
    const trackingRun = await step.run("fetch-tracking-run", async () => {
      const run = await convex.query(api.tracking.getTrackingRun, {
        trackingRunId,
        userId,
      });

      if (!run) {
        throw new Error(`Tracking run not found: ${trackingRunId}`);
      }

      return run;
    });

    // Step 2: Fetch all AI responses for this tracking run
    const responses = await step.run("fetch-responses", async () => {
      const allResponses = await convex.query(api.tracking.getAIResponses, {
        trackingRunId,
        userId,
      });

      logger.info(`Found ${allResponses.length} AI responses`, {
        trackingRunId,
        responseCount: allResponses.length,
      });

      return allResponses;
    });

    // Step 3: Calculate per-platform scores
    const platformScores = await step.run("calculate-platform-scores", async () => {
      const scores: Record<string, any> = {};

      for (const platform of AI_PLATFORMS) {
        const platformResponses = responses.filter(
          (r: any) => r.platform === platform
        );

        const totalPrompts = platformResponses.length;
        const mentionedCount = platformResponses.filter(
          (r: any) => r.containsBrandMention
        ).length;

        const visibilityScore =
          totalPrompts > 0 ? (mentionedCount / totalPrompts) * 100 : 0;

        // Calculate average citation position (when mentioned)
        const mentionedResponses = platformResponses.filter(
          (r: any) => r.containsBrandMention && r.citationPosition !== null
        );
        const avgPosition =
          mentionedResponses.length > 0
            ? mentionedResponses.reduce(
                (sum: number, r: any) => sum + (r.citationPosition || 0),
                0
              ) / mentionedResponses.length
            : null;

        scores[platform] = {
          platform,
          totalPrompts,
          mentionedCount,
          visibilityScore: Math.round(visibilityScore * 10) / 10, // Round to 1 decimal
          avgPosition: avgPosition ? Math.round(avgPosition * 10) / 10 : null,
          responseRate:
            totalPrompts > 0
              ? Math.round(
                  (platformResponses.filter((r: any) => r.response !== null)
                    .length /
                    totalPrompts) *
                    100
                )
              : 0,
        };

        logger.info(`${platform} score calculated`, scores[platform]);
      }

      return scores;
    });

    // Step 4: Calculate overall visibility score
    const overallScore = await step.run("calculate-overall-score", async () => {
      const totalPrompts = responses.length;
      const totalMentioned = responses.filter(
        (r: any) => r.containsBrandMention
      ).length;

      const overallVisibility =
        totalPrompts > 0 ? (totalMentioned / totalPrompts) * 100 : 0;

      // Calculate platform distribution
      const platformDistribution = AI_PLATFORMS.map((platform) => ({
        platform,
        score: platformScores[platform].visibilityScore,
      }));

      const overall = {
        visibilityScore: Math.round(overallVisibility * 10) / 10,
        totalPrompts,
        totalMentioned,
        platformDistribution,
        topPlatform: platformDistribution.reduce((top, curr) =>
          curr.score > top.score ? curr : top
        ),
        lowestPlatform: platformDistribution.reduce((low, curr) =>
          curr.score < low.score ? curr : low
        ),
      };

      logger.info("Overall score calculated", overall);
      return overall;
    });

    // Step 5: Fetch historical scores for trend analysis
    const trend = await step.run("calculate-trend", async () => {
      const historicalScores = await convex.query(
        api.tracking.getHistoricalScores,
        {
          brandId: trackingRun.brandId,
          userId,
          limit: 10, // Last 10 tracking runs
        }
      );

      if (historicalScores.length < 2) {
        return { direction: "stable", change: 0, isNew: true };
      }

      // Compare with previous run
      const previousScore = historicalScores[0]?.overallScore || 0;
      const currentScore = overallScore.visibilityScore;
      const change = currentScore - previousScore;

      let direction: "improving" | "declining" | "stable";
      if (Math.abs(change) < 2) {
        direction = "stable";
      } else if (change > 0) {
        direction = "improving";
      } else {
        direction = "declining";
      }

      logger.info("Trend calculated", {
        previousScore,
        currentScore,
        change,
        direction,
      });

      return {
        direction,
        change: Math.round(change * 10) / 10,
        isNew: false,
        previousScore,
      };
    });

    // Step 6: Store visibility scores
    const scoreRecords = await step.run("store-scores", async () => {
      const records = [];

      // Store per-platform scores
      for (const platform of AI_PLATFORMS) {
        const scoreId = await convex.mutation(api.tracking.createVisibilityScore, {
          trackingRunId,
          brandId: trackingRun.brandId,
          platform,
          visibilityScore: platformScores[platform].visibilityScore,
          totalPrompts: platformScores[platform].totalPrompts,
          mentionedCount: platformScores[platform].mentionedCount,
          avgCitationPosition: platformScores[platform].avgPosition,
          responseRate: platformScores[platform].responseRate,
          createdAt: Date.now(),
        });

        records.push(scoreId);
      }

      // Store overall score
      const overallScoreId = await convex.mutation(
        api.tracking.createVisibilityScore,
        {
          trackingRunId,
          brandId: trackingRun.brandId,
          platform: "overall",
          visibilityScore: overallScore.visibilityScore,
          totalPrompts: overallScore.totalPrompts,
          mentionedCount: overallScore.totalMentioned,
          avgCitationPosition: null,
          responseRate: 100,
          trend: trend.direction,
          trendChange: trend.change,
          createdAt: Date.now(),
        }
      );

      records.push(overallScoreId);

      logger.info(`Stored ${records.length} visibility score records`);
      return records;
    });

    // Step 7: Calculate competitor comparison (if competitors exist)
    const competitorComparison = await step.run(
      "compare-competitors",
      async () => {
        const competitors = await convex.query(
          api.tracking.getCompetitorBrands,
          {
            brandId: trackingRun.brandId,
            userId,
          }
        );

        if (competitors.length === 0) {
          return null;
        }

        const comparisons = [];

        for (const competitor of competitors) {
          // Get latest score for competitor
          const competitorScore = await convex.query(
            api.tracking.getLatestVisibilityScore,
            {
              brandId: competitor._id,
              userId,
            }
          );

          if (competitorScore) {
            const difference =
              overallScore.visibilityScore - competitorScore.visibilityScore;

            comparisons.push({
              competitorId: competitor._id,
              competitorName: competitor.name,
              competitorScore: competitorScore.visibilityScore,
              ourScore: overallScore.visibilityScore,
              difference: Math.round(difference * 10) / 10,
              status: difference > 0 ? "ahead" : difference < 0 ? "behind" : "tied",
            });
          }
        }

        logger.info(`Compared with ${comparisons.length} competitors`);
        return comparisons;
      }
    );

    logger.info("Visibility score calculation complete", {
      trackingRunId,
      overallScore: overallScore.visibilityScore,
      trend: trend.direction,
      competitorCount: competitorComparison?.length || 0,
    });

    return {
      trackingRunId,
      platformScores,
      overallScore,
      trend,
      competitorComparison,
      totalResponses: responses.length,
      scoreRecords,
    };
  }
);

/**
 * Recalculate scores for historical tracking run
 */
export const recalculateScores = inngest.createFunction(
  {
    id: "recalculate-scores",
    name: "Recalculate Visibility Scores",
  },
  { event: "tracking/recalculate-scores" },
  async ({ event, step, logger }) => {
    const { trackingRunId, userId } = event.data;

    logger.info("Recalculating scores", { trackingRunId });

    // Delete existing scores
    await step.run("delete-old-scores", async () => {
      await convex.mutation(api.tracking.deleteScoresByRun, { trackingRunId });
    });

    // Recalculate
    const result = await step.invoke("calculate", {
      function: calculateVisibilityScores,
      data: { trackingRunId, userId },
    });

    logger.info("Recalculation complete", { trackingRunId });

    return result;
  }
);

/**
 * Generate visibility score report
 */
export const generateScoreReport = inngest.createFunction(
  {
    id: "generate-score-report",
    name: "Generate Visibility Score Report",
  },
  { event: "tracking/generate-report" },
  async ({ event, step, logger }) => {
    const { brandId, userId, timeRange } = event.data;

    logger.info("Generating visibility score report", { brandId, timeRange });

    const report = await step.run("generate-report", async () => {
      // Fetch all scores for time range
      const scores = await convex.query(api.tracking.getScoresForBrand, {
        brandId,
        userId,
        timeRange, // "7d", "30d", "90d"
      });

      // Calculate statistics
      const avgScore =
        scores.reduce((sum: number, s: any) => sum + s.visibilityScore, 0) /
        scores.length;
      const maxScore = Math.max(...scores.map((s: any) => s.visibilityScore));
      const minScore = Math.min(...scores.map((s: any) => s.visibilityScore));

      // Group by platform
      const byPlatform: Record<string, any> = {};
      scores.forEach((score: any) => {
        if (!byPlatform[score.platform]) {
          byPlatform[score.platform] = [];
        }
        byPlatform[score.platform].push(score.visibilityScore);
      });

      return {
        brandId,
        timeRange,
        totalDataPoints: scores.length,
        avgScore: Math.round(avgScore * 10) / 10,
        maxScore,
        minScore,
        platformAverages: Object.entries(byPlatform).map(([platform, scores]) => ({
          platform,
          avgScore:
            Math.round(
              ((scores as number[]).reduce((a, b) => a + b, 0) /
                (scores as number[]).length) *
                10
            ) / 10,
        })),
      };
    });

    logger.info("Report generated", report);

    return report;
  }
);
