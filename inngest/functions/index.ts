/**
 * Inngest Functions Index
 *
 * Central export for all background jobs and workflows.
 * Import this in app/api/inngest/route.ts to serve all functions.
 */

// Week 1: Content Generation Jobs
export {
  generateArticlesBulk,
  generateSingleArticle,
} from "./generate-articles-bulk";

export {
  qualityCheckPipeline,
  runPlagiarismCheck,
  runReadabilityCheck,
  runFactCheck,
} from "./run-quality-checks";

export {
  generateCitations,
  refreshCitations,
  generateCitationsBulk,
} from "./generate-citations";

// Week 2: Publishing Jobs
export {
  publishToPlatforms,
  publishToSinglePlatform,
  publishBulk,
} from "./publish-to-platforms";

export {
  executeScheduledPublish,
  schedulePublish,
  cancelScheduledPublish,
  reschedulePublish,
  setupRecurringPublish,
} from "./schedule-publish";

export {
  syncPlatformAnalytics,
  syncAllPlatformAnalytics,
  dailyAnalyticsSync,
  calculateAnalyticsSummary,
} from "./sync-platform-analytics";

// Week 3: Tracking Jobs
export {
  runVisibilityTracking,
  dailyVisibilityTracking,
  hourlyVisibilityTracking,
  trackSingleKeyword,
} from "./run-visibility-tracking";

export {
  processPromptVariations,
  querySinglePlatform,
  batchProcessPrompts,
} from "./process-prompt-variations";

export {
  calculateVisibilityScores,
  recalculateScores,
  generateScoreReport,
} from "./calculate-scores";

// Week 5: Optimization Jobs
export {
  runOptimizationScan,
  scheduledOptimizationScan,
} from "./run-optimization-scan";

export {
  crawlCompetitors,
  crawlAllCompetitors,
  weeklyCompetitorCrawl,
} from "./crawl-competitors";

export {
  generateLLMTXT,
  regenerateLLMTXT,
  dailyLLMTXTUpdate,
  validateLLMTXT,
} from "./generate-llmtxt";

export {
  sendDailyDigest,
  scheduledDailyDigest,
  sendInstantNotification,
  sendWeeklySummary,
} from "./send-daily-digest";
