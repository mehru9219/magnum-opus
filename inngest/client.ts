/**
 * Inngest Client Configuration
 *
 * Centralized client for all background jobs and workflow orchestration.
 * This client is used across all Inngest functions and API routes.
 */

import { Inngest, EventSchemas } from "inngest";

/**
 * Event schema definitions for type-safe event handling
 * Define all events that can trigger Inngest functions
 */
type Events = {
  // Week 1: Content Generation Events
  "article/generate.bulk": {
    data: {
      userId: string;
      topics: string[];
      template: "comparison" | "how-to" | "listicle" | "problem-solver" | "ultimate-guide";
      model: "gpt-4" | "gpt-3.5-turbo" | "claude-3.5-sonnet" | "perplexity" | "gemini-pro";
      tone?: string;
      length?: number;
    };
  };
  "article/quality-check": {
    data: {
      articleId: string;
      userId: string;
    };
  };
  "article/generate-citations": {
    data: {
      articleId: string;
      userId: string;
    };
  };

  // Week 2: Publishing Events
  "publish/to-platforms": {
    data: {
      articleId: string;
      userId: string;
      platformIds: string[];
      scheduledFor?: number;
    };
  };
  "publish/scheduled": {
    data: {
      publishJobId: string;
      userId: string;
    };
  };
  "analytics/sync": {
    data: {
      userId: string;
      platformConnectionId: string;
    };
  };

  // Week 3: Tracking Events
  "tracking/run": {
    data: {
      brandId: string;
      userId: string;
      keywordIds?: string[];
    };
  };
  "tracking/process-prompts": {
    data: {
      trackingRunId: string;
      keywordId: string;
      prompts: string[];
      userId: string;
    };
  };
  "tracking/calculate-scores": {
    data: {
      trackingRunId: string;
      userId: string;
    };
  };

  // Week 5: Optimization Events
  "optimization/scan": {
    data: {
      userId: string;
      scanType?: "full" | "incremental";
    };
  };
  "optimization/crawl-competitor": {
    data: {
      competitorSiteId: string;
      userId: string;
      maxPages?: number;
    };
  };
  "optimization/generate-llmtxt": {
    data: {
      userId: string;
    };
  };
  "digest/daily": {
    data: {
      userId: string;
    };
  };

  // Scheduled events (triggered by cron)
  "cron/daily-tracking": {
    data: {
      scheduledTime: string;
    };
  };
  "cron/optimization-scan": {
    data: {
      scheduledTime: string;
    };
  };
  "cron/daily-digest": {
    data: {
      scheduledTime: string;
    };
  };
};

/**
 * Initialize Inngest client
 *
 * @important This client is used by both:
 * 1. Functions (inngest/functions/*.ts) - Define and execute background jobs
 * 2. API route (app/api/inngest/route.ts) - Serve the functions to Inngest
 */
export const inngest = new Inngest({
  id: "magnum-opus",
  name: "Magnum Opus - AI Content Platform",
  schemas: new EventSchemas().fromRecord<Events>(),

  // Configure retry behavior globally
  retryFunction: async (attempt: number) => {
    // Exponential backoff: 2^attempt seconds
    // Max 5 retries: 2s, 4s, 8s, 16s, 32s
    if (attempt >= 5) {
      return undefined; // Stop retrying after 5 attempts
    }

    const delayMs = Math.pow(2, attempt) * 1000;
    return delayMs;
  },
});

/**
 * Export event types for use in functions
 */
export type InngestEvents = Events;

/**
 * Helper to send events with type safety
 *
 * @example
 * await sendEvent("article/generate.bulk", {
 *   userId: "user_123",
 *   topics: ["AI Content", "SEO Tips"],
 *   template: "listicle",
 *   model: "gpt-4"
 * });
 */
export async function sendEvent<K extends keyof Events>(
  name: K,
  payload: Events[K]
) {
  return inngest.send({
    name,
    data: payload.data,
  });
}
