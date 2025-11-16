import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";

// Import all Inngest functions
// These will be created by Agent 8 (Background Jobs & Workflow Orchestrator)
const functions: any[] = [
  // Week 1 Jobs (Content Generation)
  // generateArticlesBulk,
  // runQualityChecks,
  // generateCitations,

  // Week 2 Jobs (Publishing)
  // publishToPlatforms,
  // schedulePublish,
  // syncPlatformAnalytics,

  // Week 3 Jobs (Tracking)
  // runVisibilityTracking,
  // processPromptVariations,
  // calculateScores,

  // Week 5 Jobs (Optimization)
  // runOptimizationScan,
  // crawlCompetitors,
  // generateLLMTXT,
  // sendDailyDigest,
];

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
