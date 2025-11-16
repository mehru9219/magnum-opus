/**
 * Optimization Scanner Job (Week 5)
 *
 * Runs every 6 hours to detect GEO optimization opportunities:
 * 1. Missing keywords (compare H1/H2 to tracking keywords)
 * 2. Missing FAQ sections (extract questions from tracking prompts)
 * 3. Metadata issues (title/description problems)
 * 4. LLMTXT generation (create llms.txt from content)
 * 5. Internal linking opportunities (related content)
 *
 * Target: Detect 8-15 opportunities per scan in under 15 minutes
 */

import { inngest } from "../client";
import { api } from "../../convex/_generated/api";
import { ConvexClient } from "convex/browser";
import { crawlCompetitors } from "./crawl-competitors";
import { generateLLMTXT } from "./generate-llmtxt";

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Main optimization scanner orchestrator
 */
export const runOptimizationScan = inngest.createFunction(
  {
    id: "run-optimization-scan",
    name: "Run Optimization Scan",
    concurrency: {
      limit: 3, // Run 3 scans simultaneously
      key: "event.data.userId",
    },
    retries: 2,
  },
  { event: "optimization/scan" },
  async ({ event, step, logger }) => {
    const { userId, scanType } = event.data;

    logger.info("Starting optimization scan", {
      userId,
      scanType: scanType || "full",
    });

    // Step 1: Create scan record
    const scanId = await step.run("create-scan-record", async () => {
      const id = await convex.mutation(api.optimization.createOpportunityScan, {
        userId,
        scanType: scanType || "full",
        status: "running",
        startedAt: Date.now(),
      });

      logger.info("Scan record created", { scanId: id });
      return id;
    });

    // Step 2: Fetch all published articles
    const articles = await step.run("fetch-articles", async () => {
      const publishedArticles = await convex.query(
        api.articles.getPublishedArticles,
        { userId }
      );

      logger.info(`Found ${publishedArticles.length} published articles`);
      return publishedArticles;
    });

    // Step 3: Fetch tracking keywords
    const trackingKeywords = await step.run("fetch-keywords", async () => {
      const keywords = await convex.query(api.tracking.getAllKeywords, {
        userId,
      });

      logger.info(`Found ${keywords.length} tracking keywords`);
      return keywords;
    });

    // Step 4: Run all 5 detection rules in parallel
    const [
      keywordOpportunities,
      faqOpportunities,
      metadataOpportunities,
      internalLinkOpportunities,
    ] = await Promise.all([
      // Rule 1: Missing Keywords Detector
      step.run("detect-missing-keywords", async () => {
        logger.info("Running missing keywords detector");

        try {
          const opportunities = [];

          for (const article of articles) {
            const result = await convex.action(
              api.optimization.detectMissingKeywords,
              {
                articleId: article._id,
                content: article.content,
                trackingKeywords: trackingKeywords.map((k: any) => k.keyword),
              }
            );

            if (result.missingKeywords.length > 0) {
              // Create opportunity for each missing keyword
              for (const keyword of result.missingKeywords) {
                const oppId = await convex.mutation(
                  api.optimization.createOpportunity,
                  {
                    scanId,
                    userId,
                    articleId: article._id,
                    type: "missing-keyword",
                    priority: result.priority || "moderate",
                    title: `Add keyword: "${keyword}"`,
                    description: `Article is missing tracked keyword "${keyword}" in H1/H2 headings`,
                    estimatedImpact: "medium",
                    metadata: {
                      keyword,
                      currentHeadings: result.currentHeadings,
                    },
                  }
                );

                opportunities.push(oppId);
              }
            }
          }

          logger.info(`Found ${opportunities.length} keyword opportunities`);
          return opportunities;
        } catch (error) {
          logger.error("Missing keywords detector failed", {
            error: error instanceof Error ? error.message : "Unknown error",
          });
          return [];
        }
      }),

      // Rule 2: Missing FAQ Detector
      step.run("detect-missing-faqs", async () => {
        logger.info("Running missing FAQs detector");

        try {
          const opportunities = [];

          // Get all tracking prompts (questions)
          const trackingPrompts = await convex.query(
            api.tracking.getAllTrackingPrompts,
            { userId }
          );

          // Extract questions and cluster
          const faqClusters = await convex.action(
            api.optimization.clusterFAQs,
            {
              prompts: trackingPrompts,
            }
          );

          for (const article of articles) {
            // Check if article has FAQ section
            const hasFAQ = article.content.toLowerCase().includes("faq") ||
              article.content.toLowerCase().includes("frequently asked");

            if (!hasFAQ && faqClusters.length > 0) {
              const oppId = await convex.mutation(
                api.optimization.createOpportunity,
                {
                  scanId,
                  userId,
                  articleId: article._id,
                  type: "missing-faq",
                  priority: "quick-win",
                  title: "Add FAQ section",
                  description: `Add FAQ section with ${faqClusters.length} common questions`,
                  estimatedImpact: "high",
                  metadata: {
                    suggestedQuestions: faqClusters.slice(0, 5),
                  },
                }
              );

              opportunities.push(oppId);
            }
          }

          logger.info(`Found ${opportunities.length} FAQ opportunities`);
          return opportunities;
        } catch (error) {
          logger.error("FAQ detector failed", {
            error: error instanceof Error ? error.message : "Unknown error",
          });
          return [];
        }
      }),

      // Rule 3: Metadata Issues Detector
      step.run("detect-metadata-issues", async () => {
        logger.info("Running metadata issues detector");

        try {
          const opportunities = [];

          for (const article of articles) {
            const issues = await convex.action(
              api.optimization.analyzeMetadata,
              {
                articleId: article._id,
                title: article.title,
                description: article.description || "",
                content: article.content,
              }
            );

            if (issues.length > 0) {
              for (const issue of issues) {
                const oppId = await convex.mutation(
                  api.optimization.createOpportunity,
                  {
                    scanId,
                    userId,
                    articleId: article._id,
                    type: "metadata-issue",
                    priority: issue.severity === "high" ? "quick-win" : "moderate",
                    title: issue.title,
                    description: issue.description,
                    estimatedImpact: issue.severity,
                    metadata: {
                      issueType: issue.type,
                      currentValue: issue.currentValue,
                      suggestedValue: issue.suggestedValue,
                    },
                  }
                );

                opportunities.push(oppId);
              }
            }
          }

          logger.info(`Found ${opportunities.length} metadata opportunities`);
          return opportunities;
        } catch (error) {
          logger.error("Metadata detector failed", {
            error: error instanceof Error ? error.message : "Unknown error",
          });
          return [];
        }
      }),

      // Rule 5: Internal Linking Detector
      step.run("detect-internal-links", async () => {
        logger.info("Running internal linking detector");

        try {
          const opportunities = [];

          for (const article of articles) {
            // Find related articles
            const relatedArticles = await convex.action(
              api.optimization.findRelatedArticles,
              {
                articleId: article._id,
                content: article.content,
                allArticles: articles,
              }
            );

            if (relatedArticles.length > 0) {
              const oppId = await convex.mutation(
                api.optimization.createOpportunity,
                {
                  scanId,
                  userId,
                  articleId: article._id,
                  type: "internal-link",
                  priority: "moderate",
                  title: `Add ${relatedArticles.length} internal links`,
                  description: `Link to related articles to improve site structure`,
                  estimatedImpact: "medium",
                  metadata: {
                    relatedArticles: relatedArticles.slice(0, 5),
                  },
                }
              );

              opportunities.push(oppId);
            }
          }

          logger.info(`Found ${opportunities.length} internal link opportunities`);
          return opportunities;
        } catch (error) {
          logger.error("Internal linking detector failed", {
            error: error instanceof Error ? error.message : "Unknown error",
          });
          return [];
        }
      }),
    ]);

    // Step 5: Generate LLMTXT (Rule 4)
    const llmtxtResult = await step.invoke("generate-llmtxt", {
      function: generateLLMTXT,
      data: { userId },
    });

    // Create LLMTXT opportunity if needed
    const llmtxtOpportunity = await step.run(
      "create-llmtxt-opportunity",
      async () => {
        if (llmtxtResult.updated) {
          const oppId = await convex.mutation(
            api.optimization.createOpportunity,
            {
              scanId,
              userId,
              articleId: null, // Site-wide opportunity
              type: "llmtxt",
              priority: "quick-win",
              title: "Update llms.txt file",
              description: `Generate/update llms.txt with ${llmtxtResult.entryCount} entries`,
              estimatedImpact: "high",
              metadata: {
                entryCount: llmtxtResult.entryCount,
                llmtxtUrl: llmtxtResult.url,
              },
            }
          );

          return [oppId];
        }
        return [];
      }
    );

    // Step 6: Aggregate all opportunities
    const allOpportunities = [
      ...keywordOpportunities,
      ...faqOpportunities,
      ...metadataOpportunities,
      ...internalLinkOpportunities,
      ...llmtxtOpportunity,
    ];

    // Step 7: Prioritize opportunities
    const prioritized = await step.run("prioritize-opportunities", async () => {
      // Group by priority
      const byPriority = {
        "quick-win": [] as string[],
        moderate: [] as string[],
        complex: [] as string[],
      };

      for (const oppId of allOpportunities) {
        const opp = await convex.query(api.optimization.getOpportunity, {
          opportunityId: oppId,
          userId,
        });

        byPriority[opp.priority as keyof typeof byPriority].push(oppId);
      }

      logger.info("Opportunities prioritized", {
        quickWin: byPriority["quick-win"].length,
        moderate: byPriority.moderate.length,
        complex: byPriority.complex.length,
      });

      return byPriority;
    });

    // Step 8: Update scan record
    await step.run("complete-scan", async () => {
      await convex.mutation(api.optimization.updateOpportunityScan, {
        scanId,
        status: "completed",
        completedAt: Date.now(),
        opportunitiesFound: allOpportunities.length,
        quickWinCount: prioritized["quick-win"].length,
        moderateCount: prioritized.moderate.length,
        complexCount: prioritized.complex.length,
      });
    });

    logger.info("Optimization scan complete", {
      scanId,
      totalOpportunities: allOpportunities.length,
      byPriority: {
        quickWin: prioritized["quick-win"].length,
        moderate: prioritized.moderate.length,
        complex: prioritized.complex.length,
      },
    });

    return {
      scanId,
      totalOpportunities: allOpportunities.length,
      byPriority: prioritized,
      llmtxtResult,
    };
  }
);

/**
 * Scheduled optimization scan (every 6 hours)
 */
export const scheduledOptimizationScan = inngest.createFunction(
  {
    id: "scheduled-optimization-scan",
    name: "Scheduled Optimization Scan",
    concurrency: {
      limit: 5, // Process 5 users at a time
    },
  },
  { cron: "0 */6 * * *" }, // Every 6 hours
  async ({ step, logger }) => {
    logger.info("Starting scheduled optimization scan for all users");

    // Get all active users
    const users = await step.run("fetch-users", async () => {
      const activeUsers = await convex.query(
        api.users.getActiveUsers,
        {}
      );

      logger.info(`Found ${activeUsers.length} active users`);
      return activeUsers;
    });

    // Run scan for each user
    const results = await Promise.allSettled(
      users.map(async (user: any, index: number) => {
        return step.run(`scan-user-${user._id}`, async () => {
          logger.info(
            `Scanning user ${index + 1}/${users.length}: ${user._id}`
          );

          await step.invoke(`scan-${user._id}`, {
            function: runOptimizationScan,
            data: { userId: user._id, scanType: "full" },
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

    logger.info("Scheduled optimization scan complete", summary);

    return summary;
  }
);
