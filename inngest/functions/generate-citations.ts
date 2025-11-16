/**
 * Citation Generation Job (Week 1)
 *
 * Automatically finds and inserts citations into articles for GEO optimization:
 * - Web search for relevant sources
 * - Extract credible citations (quotes, stats, research)
 * - Insert minimum 3 citations per article
 * - Track citation sources
 *
 * Improves AI platform visibility through authoritative references
 */

import { inngest } from "../client";
import { api } from "../../convex/_generated/api";
import { ConvexClient } from "convex/browser";

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Main citation generation workflow
 */
export const generateCitations = inngest.createFunction(
  {
    id: "generate-citations",
    name: "Generate Article Citations",
    retries: 2,
  },
  { event: "article/generate-citations" },
  async ({ event, step, logger }) => {
    const { articleId, userId } = event.data;

    logger.info(`Starting citation generation for article: ${articleId}`);

    // Step 1: Fetch article content
    const article = await step.run("fetch-article", async () => {
      const result = await convex.query(api.articles.getArticle, { articleId });
      if (!result) {
        throw new Error(`Article not found: ${articleId}`);
      }
      return result;
    });

    // Step 2: Find relevant citations using web search
    const citationCandidates = await step.run("find-citations", async () => {
      logger.info("Searching for citation sources", { articleId });

      try {
        // Call citation finder service
        const result = await convex.action(api.geoOptimization.findCitations, {
          articleId,
          content: article.content,
          topic: article.topic,
          minCitations: 3,
        });

        logger.info(`Found ${result.citations.length} citation candidates`, {
          articleId,
          citationCount: result.citations.length,
        });

        return result.citations;
      } catch (error) {
        logger.error("Citation finding failed", {
          articleId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    });

    // Step 3: Validate and rank citations
    const validatedCitations = await step.run("validate-citations", async () => {
      logger.info("Validating citation sources", {
        articleId,
        candidateCount: citationCandidates.length,
      });

      // Filter for credible sources and relevant content
      const validated = citationCandidates.filter((citation: any) => {
        // Check domain credibility (gov, edu, established publications)
        const credibleDomains = [".gov", ".edu", ".org"];
        const isCredible = credibleDomains.some((domain) =>
          citation.url.includes(domain)
        );

        // Check relevance score (minimum threshold)
        const isRelevant = citation.relevanceScore >= 0.7;

        return isCredible || isRelevant;
      });

      // Rank by relevance and credibility
      validated.sort((a: any, b: any) => {
        return b.relevanceScore - a.relevanceScore;
      });

      // Take top 5 citations
      const topCitations = validated.slice(0, 5);

      logger.info(`Validated ${topCitations.length} citations`, {
        articleId,
        validatedCount: topCitations.length,
      });

      return topCitations;
    });

    // Step 4: Insert citations into article content
    const updatedArticle = await step.run("insert-citations", async () => {
      logger.info("Inserting citations into article", {
        articleId,
        citationCount: validatedCitations.length,
      });

      try {
        // Call citation inserter service
        const result = await convex.action(api.geoOptimization.insertCitations, {
          articleId,
          content: article.content,
          citations: validatedCitations,
        });

        // Update article with citations
        await convex.mutation(api.articles.updateContent, {
          articleId,
          content: result.updatedContent,
        });

        logger.info("Citations inserted successfully", {
          articleId,
          insertedCount: result.insertedCount,
        });

        return result;
      } catch (error) {
        logger.error("Citation insertion failed", {
          articleId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    });

    // Step 5: Store citation records
    const citationRecords = await step.run("store-citations", async () => {
      logger.info("Storing citation records", { articleId });

      const records = [];

      for (const citation of validatedCitations) {
        try {
          const citationId = await convex.mutation(api.citations.createCitation, {
            articleId,
            url: citation.url,
            title: citation.title,
            quote: citation.quote || null,
            author: citation.author || null,
            publishedDate: citation.publishedDate || null,
            relevanceScore: citation.relevanceScore,
          });

          records.push(citationId);
        } catch (error) {
          logger.error("Failed to store citation", {
            articleId,
            citationUrl: citation.url,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          // Continue with other citations even if one fails
        }
      }

      logger.info(`Stored ${records.length} citation records`, {
        articleId,
        citationIds: records,
      });

      return records;
    });

    // Step 6: Update article metadata
    await step.run("update-metadata", async () => {
      await convex.mutation(api.articles.updateMetadata, {
        articleId,
        citationCount: citationRecords.length,
        citationQuality: validatedCitations.length >= 3 ? "excellent" : "good",
        lastCitationUpdate: Date.now(),
      });
    });

    logger.info("Citation generation complete", {
      articleId,
      totalCitations: citationRecords.length,
      insertedIntoContent: updatedArticle.insertedCount,
    });

    return {
      success: true,
      articleId,
      citationCount: citationRecords.length,
      citationIds: citationRecords,
      insertedCount: updatedArticle.insertedCount,
    };
  }
);

/**
 * Refresh citations for existing article
 */
export const refreshCitations = inngest.createFunction(
  {
    id: "refresh-citations",
    name: "Refresh Article Citations",
    retries: 2,
  },
  { event: "citations/refresh" },
  async ({ event, step, logger }) => {
    const { articleId, userId } = event.data;

    logger.info(`Refreshing citations for article: ${articleId}`);

    // Remove old citations
    await step.run("remove-old-citations", async () => {
      await convex.mutation(api.citations.deleteByArticle, { articleId });
    });

    // Trigger new citation generation
    await step.invoke("generate-new-citations", {
      function: generateCitations,
      data: { articleId, userId },
    });

    logger.info("Citation refresh complete", { articleId });

    return { success: true, articleId };
  }
);

/**
 * Bulk citation generation for multiple articles
 */
export const generateCitationsBulk = inngest.createFunction(
  {
    id: "generate-citations-bulk",
    name: "Bulk Citation Generation",
    concurrency: {
      limit: 10, // Process 10 articles at a time
      key: "event.data.userId",
    },
    retries: 2,
  },
  { event: "citations/generate-bulk" },
  async ({ event, step, logger }) => {
    const { articleIds, userId } = event.data;

    logger.info(`Starting bulk citation generation for ${articleIds.length} articles`);

    const results = await Promise.allSettled(
      articleIds.map(async (articleId: string, index: number) => {
        return step.run(`generate-citations-${articleId}`, async () => {
          logger.info(
            `Generating citations ${index + 1}/${articleIds.length}`,
            { articleId }
          );

          await step.invoke(`citations-${articleId}`, {
            function: generateCitations,
            data: { articleId, userId },
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

    logger.info("Bulk citation generation complete", summary);

    return summary;
  }
);
