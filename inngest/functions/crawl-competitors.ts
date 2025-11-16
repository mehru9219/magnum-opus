/**
 * Competitor Crawler Job (Week 5)
 *
 * Crawls competitor websites to analyze their content:
 * - Uses Playwright for browser automation
 * - Respects robots.txt
 * - Maximum 100 pages per site
 * - Extracts content, keywords, structure
 * - Identifies content gaps
 *
 * Target: Crawl up to 100 pages in under 15 minutes
 */

import { inngest } from "../client";
import { api } from "../../convex/_generated/api";
import { ConvexClient } from "convex/browser";

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Crawl a single competitor site
 */
export const crawlCompetitors = inngest.createFunction(
  {
    id: "crawl-competitor",
    name: "Crawl Competitor Site",
    concurrency: {
      limit: 2, // Crawl 2 sites at a time (be respectful)
      key: "event.data.userId",
    },
    retries: 2,
  },
  { event: "optimization/crawl-competitor" },
  async ({ event, step, logger }) => {
    const { competitorSiteId, userId, maxPages } = event.data;

    logger.info("Starting competitor crawl", {
      competitorSiteId,
      maxPages: maxPages || 100,
    });

    // Step 1: Fetch competitor site details
    const site = await step.run("fetch-competitor-site", async () => {
      const competitorSite = await convex.query(
        api.optimization.getCompetitorSite,
        {
          competitorSiteId,
          userId,
        }
      );

      if (!competitorSite) {
        throw new Error(`Competitor site not found: ${competitorSiteId}`);
      }

      return competitorSite;
    });

    // Step 2: Check robots.txt
    const robotsAllowed = await step.run("check-robots", async () => {
      logger.info("Checking robots.txt", { url: site.url });

      try {
        const allowed = await convex.action(api.crawler.checkRobotsTxt, {
          url: site.url,
        });

        if (!allowed) {
          logger.warn("Crawling not allowed by robots.txt", { url: site.url });
        }

        return allowed;
      } catch (error) {
        logger.error("Failed to check robots.txt", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return false;
      }
    });

    if (!robotsAllowed) {
      logger.warn("Skipping crawl - robots.txt disallows", {
        competitorSiteId,
      });
      return { success: false, reason: "robots.txt disallows crawling" };
    }

    // Step 3: Discover pages to crawl
    const pages = await step.run("discover-pages", async () => {
      logger.info("Discovering pages", { url: site.url });

      try {
        const discoveredPages = await convex.action(
          api.crawler.discoverPages,
          {
            startUrl: site.url,
            maxPages: maxPages || 100,
          }
        );

        logger.info(`Discovered ${discoveredPages.length} pages`);
        return discoveredPages;
      } catch (error) {
        logger.error("Page discovery failed", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    });

    // Step 4: Crawl each page
    const crawlResults = await Promise.allSettled(
      pages.map(async (pageUrl: string, index: number) => {
        return step.run(`crawl-page-${index}`, async () => {
          logger.info(
            `Crawling page ${index + 1}/${pages.length}`,
            { url: pageUrl }
          );

          try {
            // Use Playwright to crawl page
            const pageData = await convex.action(api.crawler.crawlPage, {
              url: pageUrl,
              competitorSiteId,
            });

            // Store page data
            const pageId = await convex.mutation(
              api.optimization.createCompetitorPage,
              {
                competitorSiteId,
                userId,
                url: pageUrl,
                title: pageData.title,
                content: pageData.content,
                headings: pageData.headings,
                wordCount: pageData.wordCount,
                keywords: pageData.keywords,
                metadata: pageData.metadata,
                crawledAt: Date.now(),
              }
            );

            logger.info(`Stored page data`, { pageId, url: pageUrl });

            return {
              pageUrl,
              pageId,
              success: true,
            };
          } catch (error) {
            logger.error(`Failed to crawl page`, {
              url: pageUrl,
              error: error instanceof Error ? error.message : "Unknown error",
            });

            return {
              pageUrl,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        });
      })
    );

    // Step 5: Analyze crawl results
    const analysis = await step.run("analyze-results", async () => {
      const successful = crawlResults.filter(
        (r) => r.status === "fulfilled" && (r.value as any).success
      );
      const failed = crawlResults.filter(
        (r) => r.status === "rejected" || !(r.value as any).success
      );

      // Get all crawled pages
      const crawledPages = await convex.query(
        api.optimization.getCompetitorPages,
        {
          competitorSiteId,
          userId,
        }
      );

      // Analyze content gaps
      const gaps = await convex.action(api.optimization.analyzeContentGaps, {
        competitorPages: crawledPages,
        userId,
      });

      logger.info("Crawl analysis complete", {
        totalPages: pages.length,
        successful: successful.length,
        failed: failed.length,
        contentGaps: gaps.length,
      });

      return {
        totalPages: pages.length,
        successful: successful.length,
        failed: failed.length,
        contentGaps: gaps,
      };
    });

    // Step 6: Update competitor site record
    await step.run("update-site-record", async () => {
      await convex.mutation(api.optimization.updateCompetitorSite, {
        competitorSiteId,
        lastCrawledAt: Date.now(),
        pageCount: analysis.successful,
        status: "crawled",
      });
    });

    logger.info("Competitor crawl complete", {
      competitorSiteId,
      analysis,
    });

    return {
      success: true,
      competitorSiteId,
      analysis,
    };
  }
);

/**
 * Crawl all competitors for a user
 */
export const crawlAllCompetitors = inngest.createFunction(
  {
    id: "crawl-all-competitors",
    name: "Crawl All Competitors",
    concurrency: {
      limit: 3,
      key: "event.data.userId",
    },
  },
  { event: "optimization/crawl-all" },
  async ({ event, step, logger }) => {
    const { userId } = event.data;

    logger.info("Starting crawl for all competitors", { userId });

    // Fetch all competitor sites
    const sites = await step.run("fetch-competitors", async () => {
      const competitorSites = await convex.query(
        api.optimization.getAllCompetitorSites,
        { userId }
      );

      logger.info(`Found ${competitorSites.length} competitor sites`);
      return competitorSites;
    });

    // Crawl each site
    const results = await Promise.allSettled(
      sites.map(async (site: any, index: number) => {
        return step.run(`crawl-site-${site._id}`, async () => {
          logger.info(
            `Crawling site ${index + 1}/${sites.length}: ${site.name}`
          );

          await step.invoke(`crawl-${site._id}`, {
            function: crawlCompetitors,
            data: {
              competitorSiteId: site._id,
              userId,
              maxPages: 100,
            },
          });

          return { siteId: site._id, success: true };
        });
      })
    );

    const summary = {
      total: sites.length,
      successful: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    };

    logger.info("All competitors crawled", summary);

    return summary;
  }
);

/**
 * Weekly competitor crawl (scheduled)
 */
export const weeklyCompetitorCrawl = inngest.createFunction(
  {
    id: "weekly-competitor-crawl",
    name: "Weekly Competitor Crawl",
    concurrency: {
      limit: 3,
    },
  },
  { cron: "0 0 * * 0" }, // Every Sunday at midnight
  async ({ step, logger }) => {
    logger.info("Starting weekly competitor crawl for all users");

    // Get all users with competitor sites
    const users = await step.run("fetch-users", async () => {
      const usersWithCompetitors = await convex.query(
        api.users.getUsersWithCompetitors,
        {}
      );

      logger.info(`Found ${usersWithCompetitors.length} users with competitors`);
      return usersWithCompetitors;
    });

    // Crawl competitors for each user
    const results = await Promise.allSettled(
      users.map(async (user: any, index: number) => {
        return step.run(`crawl-user-${user._id}`, async () => {
          logger.info(
            `Crawling competitors for user ${index + 1}/${users.length}`
          );

          await step.invoke(`user-crawl-${user._id}`, {
            function: crawlAllCompetitors,
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

    logger.info("Weekly competitor crawl complete", summary);

    return summary;
  }
);
