# Inngest Background Jobs - Magnum Opus

This directory contains all background job orchestration for the Magnum Opus platform using [Inngest](https://www.inngest.com).

## Overview

Inngest provides:
- **Automatic retries** with exponential backoff
- **Concurrency control** to prevent overwhelming APIs
- **Scheduled jobs** (cron-based)
- **Step functions** for complex workflows
- **Real-time monitoring** via Inngest dashboard
- **Event-driven architecture** for decoupled systems

## Directory Structure

```
inngest/
├── client.ts                           # Inngest client configuration
├── functions/                          # All background job definitions
│   ├── index.ts                        # Central export of all functions
│   │
│   ├── Week 1 - Content Generation
│   ├── generate-articles-bulk.ts       # Bulk article generation (30 in 30min)
│   ├── run-quality-checks.ts           # Quality check pipeline (plagiarism, readability, facts)
│   ├── generate-citations.ts           # Citation finder and inserter
│   │
│   ├── Week 2 - Publishing
│   ├── publish-to-platforms.ts         # Multi-platform publishing
│   ├── schedule-publish.ts             # Scheduled publishing
│   ├── sync-platform-analytics.ts      # Analytics sync from platforms
│   │
│   ├── Week 3 - Tracking
│   ├── run-visibility-tracking.ts      # AI visibility tracking orchestrator
│   ├── process-prompt-variations.ts    # Process prompts across 4 AI platforms
│   ├── calculate-scores.ts             # Visibility score calculation
│   │
│   └── Week 5 - Optimization
│       ├── run-optimization-scan.ts    # Optimization opportunity scanner
│       ├── crawl-competitors.ts        # Competitor website crawler
│       ├── generate-llmtxt.ts          # llms.txt generation
│       └── send-daily-digest.ts        # Daily email digest
```

## Job Categories

### Week 1: Content Generation Jobs

**generateArticlesBulk** (T120)
- Processes 30 articles in under 30 minutes
- Concurrency: 5 articles at a time
- Auto-triggers quality checks and citation generation
- Event: `article/generate.bulk`

**qualityCheckPipeline** (T121)
- Sequential pipeline: Plagiarism → Readability → Fact Check
- Thresholds: <2% plagiarism, 70+ readability, 90%+ fact accuracy
- Event: `article/quality-check`

**generateCitations** (T122)
- Web search for credible sources
- Inserts minimum 3 citations per article
- Event: `article/generate-citations`

### Week 2: Publishing Jobs

**publishToPlatforms** (T123)
- Publishes to multiple platforms in parallel
- Handles partial failures gracefully
- Content adaptation per platform
- Event: `publish/to-platforms`

**schedulePublish** (T124)
- Schedule future publishing (date/time)
- Timezone-aware
- Event: `publish/schedule`

**syncPlatformAnalytics** (T125)
- Fetches views, likes, comments, shares
- Runs daily via cron (3 AM)
- Cron: `0 3 * * *`

### Week 3: Tracking Jobs

**runVisibilityTracking** (T126)
- Orchestrates tracking across ChatGPT, Claude, Perplexity, Gemini
- Processes 50-100 prompts per keyword
- Runs daily via cron (2 AM)
- Event: `tracking/run`
- Cron: `0 2 * * *`

**processPromptVariations** (T127)
- Sends prompts to all 4 AI platforms in parallel
- Extracts citations and brand mentions
- Concurrency: 10 prompts at a time
- Event: `tracking/process-prompts`

**calculateVisibilityScores** (T128)
- Calculates per-platform and overall scores
- Formula: (mentions / total prompts) × 100
- Trend detection (improving/declining/stable)
- Event: `tracking/calculate-scores`

### Week 5: Optimization Jobs

**runOptimizationScan** (T129)
- 5 detection rules: keywords, FAQs, metadata, LLMTXT, internal links
- Runs every 6 hours via cron
- Target: 8-15 opportunities per scan
- Event: `optimization/scan`
- Cron: `0 */6 * * *`

**crawlCompetitors** (T130)
- Playwright-based web crawler
- Respects robots.txt
- Max 100 pages per site
- Event: `optimization/crawl-competitor`

**generateLLMTXT** (T131)
- Creates llms.txt from all published content
- Uploads to user's site
- Runs daily for users with new content
- Event: `optimization/generate-llmtxt`
- Cron: `0 4 * * *`

**sendDailyDigest** (T132)
- Email at 9 AM with new opportunities
- Visibility score changes, publishing activity
- Personalized per user
- Event: `digest/daily`
- Cron: `0 9 * * *`

## Concurrency Limits

Configured in each function to prevent API rate limits:

- **Content Generation**: 5 concurrent articles
- **Publishing**: 10 concurrent platform publishes
- **Tracking**: 3 concurrent tracking runs, 10 prompts at a time
- **Optimization Scan**: 3 concurrent scans
- **Competitor Crawl**: 2 concurrent sites (be respectful)
- **Analytics Sync**: 5 concurrent platforms
- **Email Sending**: 20 concurrent users

## Retry Logic

All jobs use exponential backoff retry:
- **Attempt 1**: Immediate
- **Attempt 2**: 2 seconds delay
- **Attempt 3**: 4 seconds delay
- **Attempt 4**: 8 seconds delay
- **Attempt 5**: 16 seconds delay
- **Max Retries**: 5 (then fail)

Configured in `inngest/client.ts` with custom `retryFunction`.

## Scheduled Jobs (Cron)

| Job | Schedule | Time | Purpose |
|-----|----------|------|---------|
| Daily Tracking | `0 2 * * *` | 2 AM | Track visibility across AI platforms |
| Daily Analytics Sync | `0 3 * * *` | 3 AM | Sync engagement metrics from platforms |
| Daily LLMTXT Update | `0 4 * * *` | 4 AM | Update llms.txt for users with new content |
| Optimization Scan | `0 */6 * * *` | Every 6 hours | Detect optimization opportunities |
| Daily Digest | `0 9 * * *` | 9 AM | Send summary email to users |
| Hourly Tracking | `0 * * * *` | Every hour | Track high-priority keywords |
| Weekly Competitor Crawl | `0 0 * * 0` | Sunday midnight | Crawl competitor sites |
| Weekly Summary | `0 9 * * 1` | Monday 9 AM | Send weekly summary email |

## Event Schemas

All events are typed in `inngest/client.ts`. Examples:

```typescript
// Bulk article generation
inngest.send({
  name: "article/generate.bulk",
  data: {
    userId: "user_123",
    topics: ["AI Content", "SEO Tips"],
    template: "listicle",
    model: "gpt-4"
  }
});

// Publish to platforms
inngest.send({
  name: "publish/to-platforms",
  data: {
    articleId: "article_456",
    userId: "user_123",
    platformIds: ["wordpress_1", "medium_2"]
  }
});

// Run visibility tracking
inngest.send({
  name: "tracking/run",
  data: {
    brandId: "brand_789",
    userId: "user_123",
    keywordIds: ["kw_1", "kw_2"] // Optional - all keywords if omitted
  }
});
```

## Integration with Next.js

Jobs are served via API route at `app/api/inngest/route.ts`:

```typescript
import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import * as functions from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: Object.values(functions),
});
```

## Monitoring & Debugging

### Local Development

1. Start Inngest dev server:
   ```bash
   npx inngest-cli dev
   ```

2. Access dashboard at: `http://localhost:8288`

3. View logs, trigger test runs, inspect step execution

### Production

1. View logs in Inngest Cloud dashboard
2. Monitor execution times, retry counts, failure rates
3. Set up alerts for job failures

## Testing Jobs

### Manual Trigger (Development)

```typescript
// In any Convex mutation or Next.js API route
import { inngest } from "@/inngest/client";

await inngest.send({
  name: "article/generate.bulk",
  data: { /* ... */ }
});
```

### Test Mode

Use Inngest test utilities for integration tests:

```typescript
import { InngestTestEngine } from "@inngest/test";

const engine = new InngestTestEngine({ inngest });

await engine.execute(generateArticlesBulk, {
  event: {
    name: "article/generate.bulk",
    data: { /* test data */ }
  }
});
```

## Performance Targets

All jobs are designed to meet these targets:

- **Bulk Generation**: 30 articles in <30 minutes
- **Publishing**: 3+ platforms in <3 minutes
- **Tracking**: 1 keyword across 4 platforms in <15 minutes
- **Optimization Scan**: 20 articles + 3 competitors in <15 minutes
- **Scheduled Jobs**: Execute within ±5 minutes of target time

## Error Handling

All jobs follow these error handling patterns:

1. **Try-catch** around external API calls
2. **Log errors** with context (articleId, userId, etc.)
3. **Store failures** in database for user visibility
4. **Partial success** handling (some platforms succeed, some fail)
5. **User-friendly error messages** (never expose raw errors)

## Cost Optimization

Jobs include cost-saving measures:

- **Caching**: AI responses cached in Redis (24h TTL)
- **Rate limiting**: Respect platform API limits
- **Batching**: Group operations where possible
- **Strategic sampling**: For tracking, test subset then model full distribution
- **Concurrency limits**: Prevent overwhelming paid APIs

## Dependencies

These jobs depend on other system components:

- **Convex**: Database queries/mutations (`convex/`)
- **AI Services**: Models configuration (`lib/ai/models.ts`)
- **Publishers**: Platform adapters (`lib/publishers/`)
- **Quality Checks**: Plagiarism, readability, facts (`lib/quality-check/`)
- **Tracking**: Prompt generation, citation extraction (`lib/tracking/`)
- **Optimization**: Detectors, crawler (`lib/optimization/`, `lib/crawler/`)

## Contributing

When adding new jobs:

1. Create file in `inngest/functions/`
2. Define function with `inngest.createFunction()`
3. Add to `inngest/functions/index.ts`
4. Update this README with job description
5. Add event schema to `inngest/client.ts`
6. Test locally with Inngest dev server

## Learn More

- [Inngest Docs](https://www.inngest.com/docs)
- [Convex + Inngest Integration](https://docs.convex.dev/production/integrations/inngest)
- [Project Roadmap](../12weekroadmap.md)
- [Agent 8 Specification](../specs/roadmap-implementation/parallelagents/agent-08-background-jobs.md)

---

**Agent 8: Background Jobs & Workflow Orchestrator**
Part of the Magnum Opus MVP (Weeks 1-3, 5)
