/**
 * Prompt Processing Job (Week 3)
 *
 * Sends 50-100 prompt variations to 4 AI platforms in parallel:
 * - ChatGPT (OpenAI API)
 * - Claude (Anthropic API)
 * - Perplexity (Perplexity API)
 * - Gemini (Google Gemini API)
 *
 * Extracts citations and brand mentions from responses
 * Target: Process 50-100 prompts across 4 platforms in parallel
 */

import { inngest } from "../client";
import { api } from "../../convex/_generated/api";
import { ConvexClient } from "convex/browser";

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// AI platforms to test
const AI_PLATFORMS = ["chatgpt", "claude", "perplexity", "gemini"] as const;
type AIPlatform = (typeof AI_PLATFORMS)[number];

/**
 * Process prompt variations across all AI platforms
 */
export const processPromptVariations = inngest.createFunction(
  {
    id: "process-prompt-variations",
    name: "Process Prompt Variations",
    concurrency: {
      limit: 10, // Process 10 prompts at a time
      key: "event.data.trackingRunId",
    },
    retries: 2,
  },
  { event: "tracking/process-prompts" },
  async ({ event, step, logger }) => {
    const { trackingRunId, keywordId, prompts, userId } = event.data;

    logger.info("Starting prompt processing", {
      trackingRunId,
      keywordId,
      promptCount: prompts.length,
    });

    // Process each prompt across all platforms
    const results = await Promise.allSettled(
      prompts.map(async (prompt: string, index: number) => {
        return step.run(`process-prompt-${index}`, async () => {
          logger.info(
            `Processing prompt ${index + 1}/${prompts.length}`,
            {
              promptPreview: prompt.substring(0, 50) + "...",
            }
          );

          // Send prompt to all 4 AI platforms in parallel
          const platformResponses = await Promise.allSettled(
            AI_PLATFORMS.map(async (platform) => {
              return step.run(`${platform}-${index}`, async () => {
                try {
                  logger.info(`Querying ${platform}`, {
                    promptIndex: index,
                    platform,
                  });

                  // Call AI platform via Convex action
                  const response = await convex.action(
                    api.tracking.queryAIPlatform,
                    {
                      platform,
                      prompt,
                      trackingRunId,
                      keywordId,
                    }
                  );

                  // Extract citations and brand mentions
                  const citations = await convex.action(
                    api.tracking.extractCitations,
                    {
                      response: response.text,
                      brandName: response.brandName,
                      trackingRunId,
                    }
                  );

                  // Store AI response
                  const responseId = await convex.mutation(
                    api.tracking.createAIResponse,
                    {
                      trackingRunId,
                      keywordId,
                      platform,
                      prompt,
                      response: response.text,
                      containsBrandMention: citations.brandMentioned,
                      citationPosition: citations.position,
                      citationUrl: citations.url || null,
                      responseTime: response.responseTime,
                      createdAt: Date.now(),
                    }
                  );

                  logger.info(`Stored ${platform} response`, {
                    responseId,
                    brandMentioned: citations.brandMentioned,
                  });

                  return {
                    platform,
                    success: true,
                    brandMentioned: citations.brandMentioned,
                    position: citations.position,
                  };
                } catch (error) {
                  logger.error(`Failed to query ${platform}`, {
                    promptIndex: index,
                    platform,
                    error: error instanceof Error ? error.message : "Unknown error",
                  });

                  // Store failed response
                  await convex.mutation(api.tracking.createAIResponse, {
                    trackingRunId,
                    keywordId,
                    platform,
                    prompt,
                    response: null,
                    containsBrandMention: false,
                    citationPosition: null,
                    citationUrl: null,
                    responseTime: 0,
                    error: error instanceof Error ? error.message : "Unknown error",
                    createdAt: Date.now(),
                  });

                  return {
                    platform,
                    success: false,
                    error: error instanceof Error ? error.message : "Unknown error",
                  };
                }
              });
            })
          );

          return {
            promptIndex: index,
            platformResponses: platformResponses.map((r: any) =>
              r.status === "fulfilled" ? r.value : null
            ),
          };
        });
      })
    );

    // Aggregate results
    const summary = await step.run("aggregate-results", async () => {
      const totalPrompts = prompts.length;
      const totalQueries = totalPrompts * AI_PLATFORMS.length;
      const successfulPrompts = results.filter(
        (r) => r.status === "fulfilled"
      ).length;

      logger.info("Prompt processing complete", {
        trackingRunId,
        keywordId,
        totalPrompts,
        totalQueries,
        successfulPrompts,
      });

      return {
        totalPrompts,
        totalQueries,
        successfulPrompts,
        failedPrompts: totalPrompts - successfulPrompts,
      };
    });

    return summary;
  }
);

/**
 * Query single AI platform (helper function)
 */
export const querySinglePlatform = inngest.createFunction(
  {
    id: "query-single-platform",
    name: "Query Single AI Platform",
    retries: 3,
  },
  { event: "tracking/query-platform" },
  async ({ event, step, logger }) => {
    const { platform, prompt, trackingRunId, keywordId } = event.data;

    logger.info(`Querying ${platform}`, { prompt: prompt.substring(0, 50) });

    const response = await step.run("query", async () => {
      return convex.action(api.tracking.queryAIPlatform, {
        platform,
        prompt,
        trackingRunId,
        keywordId,
      });
    });

    const citations = await step.run("extract-citations", async () => {
      return convex.action(api.tracking.extractCitations, {
        response: response.text,
        brandName: response.brandName,
        trackingRunId,
      });
    });

    const responseId = await step.run("store-response", async () => {
      return convex.mutation(api.tracking.createAIResponse, {
        trackingRunId,
        keywordId,
        platform,
        prompt,
        response: response.text,
        containsBrandMention: citations.brandMentioned,
        citationPosition: citations.position,
        citationUrl: citations.url || null,
        responseTime: response.responseTime,
        createdAt: Date.now(),
      });
    });

    return {
      responseId,
      brandMentioned: citations.brandMentioned,
      position: citations.position,
    };
  }
);

/**
 * Batch process prompts with rate limiting
 */
export const batchProcessPrompts = inngest.createFunction(
  {
    id: "batch-process-prompts",
    name: "Batch Process Prompts",
    concurrency: {
      limit: 5,
      key: "event.data.trackingRunId",
    },
  },
  { event: "tracking/batch-prompts" },
  async ({ event, step, logger }) => {
    const { trackingRunId, keywordId, prompts, userId, batchSize } = event.data;

    logger.info("Starting batch prompt processing", {
      totalPrompts: prompts.length,
      batchSize: batchSize || 10,
    });

    const batches = [];
    const size = batchSize || 10;

    // Split prompts into batches
    for (let i = 0; i < prompts.length; i += size) {
      batches.push(prompts.slice(i, i + size));
    }

    logger.info(`Split into ${batches.length} batches`);

    // Process each batch sequentially (to respect rate limits)
    const results = [];
    for (let i = 0; i < batches.length; i++) {
      const batchResult = await step.run(`batch-${i}`, async () => {
        logger.info(`Processing batch ${i + 1}/${batches.length}`);

        await step.invoke(`process-batch-${i}`, {
          function: processPromptVariations,
          data: {
            trackingRunId,
            keywordId,
            prompts: batches[i],
            userId,
          },
        });

        // Add delay between batches to respect rate limits
        if (i < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
        }

        return { batchIndex: i, promptCount: batches[i].length };
      });

      results.push(batchResult);
    }

    logger.info("Batch processing complete", {
      totalBatches: batches.length,
      totalPrompts: prompts.length,
    });

    return {
      totalBatches: batches.length,
      totalPrompts: prompts.length,
      results,
    };
  }
);
