/**
 * LLMTXT Generation Job (Week 5)
 *
 * Generates llms.txt file for AI platform optimization:
 * - Aggregates all published content
 * - Creates structured sitemap for AI platforms
 * - Includes metadata, summaries, keywords
 * - Updates automatically when content changes
 *
 * llms.txt helps AI platforms understand and cite site content
 */

import { inngest } from "../client";
import { api } from "../../convex/_generated/api";
import { ConvexClient } from "convex/browser";

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Generate llms.txt file for user's site
 */
export const generateLLMTXT = inngest.createFunction(
  {
    id: "generate-llmtxt",
    name: "Generate llms.txt File",
    retries: 2,
  },
  { event: "optimization/generate-llmtxt" },
  async ({ event, step, logger }) => {
    const { userId } = event.data;

    logger.info("Starting llms.txt generation", { userId });

    // Step 1: Fetch all published articles
    const articles = await step.run("fetch-articles", async () => {
      const published = await convex.query(
        api.articles.getPublishedArticles,
        { userId }
      );

      logger.info(`Found ${published.length} published articles`);
      return published;
    });

    if (articles.length === 0) {
      logger.warn("No published articles - skipping llms.txt generation");
      return { success: true, updated: false, reason: "No content" };
    }

    // Step 2: Generate llms.txt content
    const llmtxtContent = await step.run("generate-content", async () => {
      logger.info("Generating llms.txt content");

      try {
        // Build llms.txt structure
        const content = await convex.action(api.optimization.buildLLMTXT, {
          articles,
          userId,
        });

        logger.info("llms.txt content generated", {
          entryCount: articles.length,
          sizeBytes: content.length,
        });

        return content;
      } catch (error) {
        logger.error("Failed to generate llms.txt content", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    });

    // Step 3: Get user's site configuration
    const siteConfig = await step.run("fetch-site-config", async () => {
      const config = await convex.query(api.users.getSiteConfiguration, {
        userId,
      });

      if (!config) {
        throw new Error("Site configuration not found");
      }

      return config;
    });

    // Step 4: Upload llms.txt to user's site
    const uploadResult = await step.run("upload-llmtxt", async () => {
      logger.info("Uploading llms.txt", {
        domain: siteConfig.domain,
      });

      try {
        // Upload via platform adapter (WordPress, Shopify, etc.)
        const result = await convex.action(api.optimization.uploadLLMTXT, {
          content: llmtxtContent,
          userId,
          siteConfig,
        });

        logger.info("llms.txt uploaded successfully", {
          url: result.url,
        });

        return result;
      } catch (error) {
        logger.error("Failed to upload llms.txt", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    });

    // Step 5: Store llms.txt metadata
    await step.run("store-metadata", async () => {
      await convex.mutation(api.optimization.storeLLMTXTMetadata, {
        userId,
        url: uploadResult.url,
        entryCount: articles.length,
        content: llmtxtContent,
        generatedAt: Date.now(),
      });
    });

    logger.info("llms.txt generation complete", {
      url: uploadResult.url,
      entryCount: articles.length,
    });

    return {
      success: true,
      updated: true,
      url: uploadResult.url,
      entryCount: articles.length,
    };
  }
);

/**
 * Regenerate llms.txt when content changes
 */
export const regenerateLLMTXT = inngest.createFunction(
  {
    id: "regenerate-llmtxt",
    name: "Regenerate llms.txt",
  },
  { event: "optimization/regenerate-llmtxt" },
  async ({ event, step, logger }) => {
    const { userId, reason } = event.data;

    logger.info("Regenerating llms.txt", { userId, reason });

    // Delete old llms.txt metadata
    await step.run("delete-old-metadata", async () => {
      await convex.mutation(api.optimization.deleteLLMTXTMetadata, { userId });
    });

    // Generate new llms.txt
    const result = await step.invoke("generate-new", {
      function: generateLLMTXT,
      data: { userId },
    });

    logger.info("llms.txt regenerated", result);

    return result;
  }
);

/**
 * Daily llms.txt update (for active users)
 */
export const dailyLLMTXTUpdate = inngest.createFunction(
  {
    id: "daily-llmtxt-update",
    name: "Daily llms.txt Update",
    concurrency: {
      limit: 10,
    },
  },
  { cron: "0 4 * * *" }, // 4 AM daily
  async ({ step, logger }) => {
    logger.info("Starting daily llms.txt update for all users");

    // Get users who published content in last 24 hours
    const users = await step.run("fetch-users", async () => {
      const activeUsers = await convex.query(
        api.users.getUsersWithRecentPublishes,
        { hoursAgo: 24 }
      );

      logger.info(`Found ${activeUsers.length} users with recent publishes`);
      return activeUsers;
    });

    // Update llms.txt for each user
    const results = await Promise.allSettled(
      users.map(async (user: any, index: number) => {
        return step.run(`update-user-${user._id}`, async () => {
          logger.info(
            `Updating llms.txt ${index + 1}/${users.length}: ${user._id}`
          );

          await step.invoke(`llmtxt-${user._id}`, {
            function: generateLLMTXT,
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

    logger.info("Daily llms.txt update complete", summary);

    return summary;
  }
);

/**
 * Validate llms.txt format and accessibility
 */
export const validateLLMTXT = inngest.createFunction(
  {
    id: "validate-llmtxt",
    name: "Validate llms.txt",
  },
  { event: "optimization/validate-llmtxt" },
  async ({ event, step, logger }) => {
    const { userId } = event.data;

    logger.info("Validating llms.txt", { userId });

    // Fetch llms.txt metadata
    const metadata = await step.run("fetch-metadata", async () => {
      return convex.query(api.optimization.getLLMTXTMetadata, { userId });
    });

    if (!metadata) {
      return { valid: false, reason: "llms.txt not found" };
    }

    // Check accessibility
    const accessible = await step.run("check-accessibility", async () => {
      try {
        const result = await convex.action(api.optimization.checkLLMTXTAccess, {
          url: metadata.url,
        });

        return result.accessible;
      } catch (error) {
        logger.error("Accessibility check failed", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return false;
      }
    });

    // Validate format
    const validFormat = await step.run("validate-format", async () => {
      try {
        const result = await convex.action(api.optimization.validateLLMTXTFormat, {
          content: metadata.content,
        });

        return result.valid;
      } catch (error) {
        logger.error("Format validation failed", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return false;
      }
    });

    const isValid = accessible && validFormat;

    logger.info("llms.txt validation complete", {
      accessible,
      validFormat,
      overall: isValid,
    });

    return {
      valid: isValid,
      accessible,
      validFormat,
      url: metadata.url,
    };
  }
);
