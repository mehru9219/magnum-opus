/**
 * Quality Check Pipeline Job (Week 1)
 *
 * Sequential quality check pipeline:
 * 1. Plagiarism check (< 2% threshold)
 * 2. Readability scoring (Flesch Reading Ease 70+ required)
 * 3. AI-based fact verification (90%+ accuracy)
 *
 * Runs automatically after article generation
 */

import { inngest } from "../client";
import { api } from "../../convex/_generated/api";
import { ConvexClient } from "convex/browser";

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Quality check pipeline - runs all checks sequentially
 */
export const qualityCheckPipeline = inngest.createFunction(
  {
    id: "quality-check-pipeline",
    name: "Run Quality Checks",
    retries: 2,
  },
  { event: "article/quality-check" },
  async ({ event, step, logger }) => {
    const { articleId, userId } = event.data;

    logger.info(`Starting quality checks for article: ${articleId}`);

    // Get article content
    const article = await step.run("fetch-article", async () => {
      const result = await convex.query(api.articles.getArticle, { articleId });
      if (!result) {
        throw new Error(`Article not found: ${articleId}`);
      }
      return result;
    });

    // Step 1: Plagiarism Check
    const plagiarismResult = await step.run("plagiarism-check", async () => {
      logger.info("Running plagiarism check", { articleId });

      try {
        // Call plagiarism check service
        const result = await convex.action(api.quality.checkPlagiarism, {
          content: article.content,
          articleId,
        });

        // Store result in database
        await convex.mutation(api.qualityChecks.createCheck, {
          articleId,
          checkType: "plagiarism",
          score: result.score,
          passed: result.score < 2.0, // Must be < 2% to pass
          details: result.details,
        });

        logger.info("Plagiarism check complete", {
          articleId,
          score: result.score,
          passed: result.score < 2.0,
        });

        return result;
      } catch (error) {
        logger.error("Plagiarism check failed", {
          articleId,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        // Store failed check
        await convex.mutation(api.qualityChecks.createCheck, {
          articleId,
          checkType: "plagiarism",
          score: 0,
          passed: false,
          details: { error: error instanceof Error ? error.message : "Check failed" },
        });

        throw error;
      }
    });

    // Step 2: Readability Check
    const readabilityResult = await step.run("readability-check", async () => {
      logger.info("Running readability check", { articleId });

      try {
        // Calculate Flesch Reading Ease score
        const result = await convex.action(api.quality.checkReadability, {
          content: article.content,
          articleId,
        });

        // Store result
        await convex.mutation(api.qualityChecks.createCheck, {
          articleId,
          checkType: "readability",
          score: result.score,
          passed: result.score >= 70, // Must be 70+ to pass
          details: result.details,
        });

        logger.info("Readability check complete", {
          articleId,
          score: result.score,
          passed: result.score >= 70,
        });

        return result;
      } catch (error) {
        logger.error("Readability check failed", {
          articleId,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        await convex.mutation(api.qualityChecks.createCheck, {
          articleId,
          checkType: "readability",
          score: 0,
          passed: false,
          details: { error: error instanceof Error ? error.message : "Check failed" },
        });

        throw error;
      }
    });

    // Step 3: Fact Check
    const factCheckResult = await step.run("fact-check", async () => {
      logger.info("Running fact check", { articleId });

      try {
        // AI-based fact verification
        const result = await convex.action(api.quality.checkFacts, {
          content: article.content,
          articleId,
        });

        // Store result
        await convex.mutation(api.qualityChecks.createCheck, {
          articleId,
          checkType: "fact-check",
          score: result.accuracy,
          passed: result.accuracy >= 90, // Must be 90%+ accuracy
          details: result.details,
        });

        logger.info("Fact check complete", {
          articleId,
          accuracy: result.accuracy,
          passed: result.accuracy >= 90,
        });

        return result;
      } catch (error) {
        logger.error("Fact check failed", {
          articleId,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        await convex.mutation(api.qualityChecks.createCheck, {
          articleId,
          checkType: "fact-check",
          score: 0,
          passed: false,
          details: { error: error instanceof Error ? error.message : "Check failed" },
        });

        throw error;
      }
    });

    // Step 4: Calculate overall quality score
    const overallScore = await step.run("calculate-overall-score", async () => {
      const allPassed =
        plagiarismResult.score < 2.0 &&
        readabilityResult.score >= 70 &&
        factCheckResult.accuracy >= 90;

      // Calculate weighted quality score (0-100)
      const qualityScore =
        (plagiarismResult.score < 2.0 ? 33.3 : 0) +
        (readabilityResult.score >= 70 ? 33.3 : 0) +
        (factCheckResult.accuracy >= 90 ? 33.3 : 0);

      // Update article with quality score
      await convex.mutation(api.articles.updateQualityScore, {
        articleId,
        qualityScore: Math.round(qualityScore),
        qualityPassed: allPassed,
      });

      logger.info("Quality checks complete", {
        articleId,
        qualityScore: Math.round(qualityScore),
        allPassed,
      });

      return {
        qualityScore: Math.round(qualityScore),
        allPassed,
        checks: {
          plagiarism: plagiarismResult,
          readability: readabilityResult,
          factCheck: factCheckResult,
        },
      };
    });

    return overallScore;
  }
);

/**
 * Individual plagiarism check (can be called independently)
 */
export const runPlagiarismCheck = inngest.createFunction(
  {
    id: "run-plagiarism-check",
    name: "Run Plagiarism Check",
    retries: 2,
  },
  { event: "quality/plagiarism-check" },
  async ({ event, step, logger }) => {
    const { articleId, content } = event.data;

    logger.info(`Running plagiarism check: ${articleId}`);

    const result = await step.run("check", async () => {
      return convex.action(api.quality.checkPlagiarism, {
        content,
        articleId,
      });
    });

    await step.run("save-result", async () => {
      await convex.mutation(api.qualityChecks.createCheck, {
        articleId,
        checkType: "plagiarism",
        score: result.score,
        passed: result.score < 2.0,
        details: result.details,
      });
    });

    return result;
  }
);

/**
 * Individual readability check (can be called independently)
 */
export const runReadabilityCheck = inngest.createFunction(
  {
    id: "run-readability-check",
    name: "Run Readability Check",
    retries: 2,
  },
  { event: "quality/readability-check" },
  async ({ event, step, logger }) => {
    const { articleId, content } = event.data;

    logger.info(`Running readability check: ${articleId}`);

    const result = await step.run("check", async () => {
      return convex.action(api.quality.checkReadability, {
        content,
        articleId,
      });
    });

    await step.run("save-result", async () => {
      await convex.mutation(api.qualityChecks.createCheck, {
        articleId,
        checkType: "readability",
        score: result.score,
        passed: result.score >= 70,
        details: result.details,
      });
    });

    return result;
  }
);

/**
 * Individual fact check (can be called independently)
 */
export const runFactCheck = inngest.createFunction(
  {
    id: "run-fact-check",
    name: "Run Fact Check",
    retries: 2,
  },
  { event: "quality/fact-check" },
  async ({ event, step, logger }) => {
    const { articleId, content } = event.data;

    logger.info(`Running fact check: ${articleId}`);

    const result = await step.run("check", async () => {
      return convex.action(api.quality.checkFacts, {
        content,
        articleId,
      });
    });

    await step.run("save-result", async () => {
      await convex.mutation(api.qualityChecks.createCheck, {
        articleId,
        checkType: "fact-check",
        score: result.accuracy,
        passed: result.accuracy >= 90,
        details: result.details,
      });
    });

    return result;
  }
);
