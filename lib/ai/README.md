# AI Services Infrastructure

Complete AI services layer for multi-model content generation with built-in caching, cost tracking, and retry logic.

## Features

- **Multi-Model Support**: GPT-4, Claude, Perplexity, Gemini
- **Automatic Fallback**: Seamlessly switch between models on failure
- **Cost Optimization**: Token tracking, caching, and budget management
- **Retry Logic**: Exponential backoff for rate limits and transient errors
- **Template System**: Pre-built prompts for 10+ content types
- **Type Safety**: Full TypeScript support with strict types

## Quick Start

### 1. Environment Setup

```bash
# Required: At least one AI provider
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...
GOOGLE_GEMINI_API_KEY=...

# Optional but recommended: Redis for caching
UPSTASH_REDIS_URL=...
UPSTASH_REDIS_TOKEN=...

# Optional: Configuration
AI_CACHE_TTL=86400          # 24 hours default
AI_MAX_RETRIES=3            # Retry attempts
AI_ENABLE_FALLBACK=true     # Auto-fallback to other models
```

### 2. Basic Usage

```typescript
import { generateContent, buildPrompt } from "@/lib/ai";

// Simple generation
const response = await generateContent({
  model: "gpt-4",
  prompt: "Write a blog post about TypeScript",
  systemPrompt: "You are an expert technical writer",
  maxTokens: 2000,
});

console.log(response.content);
console.log(`Cost: $${response.cost}`);
console.log(`Tokens: ${response.tokensUsed.total}`);
```

### 3. Using Templates

```typescript
import { buildPrompt, generateContent } from "@/lib/ai";

// Build prompt from template
const { systemPrompt, userPrompt } = buildPrompt("blog-post", {
  topic: "Introduction to Next.js 14",
  targetLength: 1500,
  tone: "professional",
  audience: "web developers",
  keywords: ["Next.js", "React", "Server Components"],
  seoOptimized: true,
  geoOptimized: true,
});

// Generate content
const response = await generateContent({
  model: "claude-3.5-sonnet",
  prompt: userPrompt,
  systemPrompt,
});
```

### 4. Cost Optimization

```typescript
import {
  selectBestModel,
  estimateArticleCost,
  selectModelForBudget
} from "@/lib/ai";

// Select best model for task and budget
const model = selectBestModel({
  task: "complex",
  quality: "premium",
  maxCost: 0.10, // $0.10 max
});

// Estimate cost before generation
const estimate = estimateArticleCost("gpt-4", 2000);
console.log(`Estimated cost: $${estimate.totalCost}`);

// Select model within budget
const budgetModel = selectModelForBudget(
  0.05,    // Max $0.05 per article
  2000,    // 2000 words
  "balanced"
);
```

### 5. Bulk Generation

```typescript
import { generateBulk } from "@/lib/ai";

const topics = [
  "AI in Healthcare",
  "Blockchain Technology",
  "Quantum Computing"
];

const requests = topics.map(topic => ({
  model: "gpt-3.5-turbo",
  prompt: `Write a 500-word article about ${topic}`,
  maxTokens: 1000,
}));

const results = await generateBulk({
  requests,
  concurrency: 5,        // Process 5 at a time
  stopOnError: false,    // Continue on failures
});

console.log(`Generated ${results.successCount}/${topics.length} articles`);
console.log(`Total cost: $${results.totalCost}`);
```

### 6. With Caching

```typescript
import { generateContent } from "@/lib/ai";
import { getCachedAIResponse, cacheAIResponse } from "@/lib/cache/redis";

async function generateWithCache(prompt: string, model: string) {
  // Check cache first
  const cached = await getCachedAIResponse(prompt, model);
  if (cached) {
    console.log("Cache hit! Saved $$$");
    return {
      content: cached,
      cached: true,
      cost: 0,
    };
  }

  // Generate new content
  const response = await generateContent({ model, prompt });

  // Cache for future requests
  await cacheAIResponse(prompt, model, response.content);

  return response;
}
```

## Available Models

### OpenAI
- `gpt-4` - Premium quality, complex tasks
- `gpt-4-turbo` - Long context, faster, cheaper than GPT-4
- `gpt-3.5-turbo` - Economy option, simple tasks

### Anthropic Claude
- `claude-3.5-sonnet` - Best balance of quality/cost
- `claude-3-opus` - Highest quality, most expensive
- `claude-3-sonnet` - Balanced option
- `claude-3-haiku` - Fast and economical

### Perplexity
- `perplexity-sonar` - Research-backed content
- `perplexity-sonar-pro` - Deep research, citations

### Google Gemini
- `gemini-1.5-pro` - Massive context window (1M tokens)
- `gemini-1.5-flash` - Fast and cost-effective

## Content Templates

Available templates in `prompts.ts`:

1. **blog-post** - General-purpose blog articles
2. **listicle** - Numbered/bulleted lists
3. **how-to-guide** - Step-by-step instructions
4. **product-review** - Detailed product analysis
5. **comparison** - Side-by-side comparisons
6. **case-study** - Success stories and analysis
7. **news-article** - Journalistic news content
8. **tutorial** - Educational content with examples
9. **faq** - Frequently asked questions
10. **landing-page** - Conversion-focused copy

## Cost Management

```typescript
import {
  calculateCost,
  checkCostAlert,
  globalTokenTracker
} from "@/lib/ai";

// Track usage
globalTokenTracker.track({
  userId: "user_123",
  model: "gpt-4",
  inputTokens: 500,
  outputTokens: 2000,
  totalTokens: 2500,
  cost: 0.18,
  operation: "blog-generation",
});

// Check usage limits
const limit = globalTokenTracker.checkLimit(
  "user_123",
  100000,  // 100K tokens limit
  86400000 // 24 hours
);

if (!limit.withinLimit) {
  console.log("User exceeded token limit!");
}

// Cost alerts
const alert = checkCostAlert(0.75, "article");
if (alert.level === "warning") {
  console.warn(alert.message);
}
```

## Error Handling

```typescript
import { generateContent } from "@/lib/ai";

try {
  const response = await generateContent(
    {
      model: "gpt-4",
      prompt: "Generate content...",
    },
    {
      retryConfig: {
        maxRetries: 3,
        initialDelayMs: 1000,
      },
      enableFallback: true, // Auto-fallback to similar model
    }
  );
} catch (error) {
  if (error.retryable) {
    console.log("Temporary error, retry later");
  } else {
    console.error("Permanent error:", error.message);
  }
}
```

## Token Estimation

```typescript
import {
  estimateTokens,
  fitsInContextWindow,
  truncateToTokenLimit
} from "@/lib/ai";

const text = "Your content here...";

// Estimate tokens
const tokens = estimateTokens(text, "gpt-4");

// Check if fits in context
const { fits, availableForResponse } = fitsInContextWindow(
  text,
  "gpt-4",
  2000 // Reserve 2000 tokens for response
);

// Truncate if needed
const truncated = truncateToTokenLimit(text, 4000, "gpt-4");
```

## Configuration Validation

```typescript
import {
  validateEnvironment,
  printConfigSummary,
  assertValidConfig
} from "@/lib/ai";

// Validate configuration
const validation = validateEnvironment();

if (!validation.valid) {
  console.error("Configuration errors:", validation.errors);
}

// Print summary (development)
printConfigSummary();

// Assert valid config (throws if invalid)
assertValidConfig();
```

## Best Practices

### 1. Always Cache Duplicate Requests
Caching can reduce costs by 60-80% for duplicate prompts.

### 2. Use Economy Models for Simple Tasks
- Social media posts → `gpt-3.5-turbo` or `claude-3-haiku`
- Blog posts → `claude-3-sonnet` or `gpt-4-turbo`
- Research content → `perplexity-sonar-pro` or `claude-3.5-sonnet`

### 3. Enable Fallback in Production
Always enable automatic fallback to prevent service disruption.

### 4. Monitor Costs
Track token usage and set up alerts for budget thresholds.

### 5. Optimize Prompts
Use `optimizePrompt()` to reduce token usage without losing meaning.

## Architecture

```
lib/ai/
├── types.ts           # TypeScript types and interfaces
├── models.ts          # Model configurations and selection
├── prompts.ts         # Template system
├── generator.ts       # Core generation logic with retry
├── cost-calculator.ts # Cost tracking and optimization
├── token-counter.ts   # Token estimation utilities
├── config.ts          # Environment validation
└── index.ts           # Main exports

lib/cache/
└── redis.ts           # Caching layer (Upstash Redis)
```

## Integration Points

This AI services layer integrates with:

- **Convex**: Store generation history, costs, and metrics
- **Inngest**: Background jobs for bulk generation
- **Upstash Redis**: Response caching and rate limiting
- **Sentry**: Error tracking and monitoring

## Next Steps

1. Agent 3 (Content Generation Backend) will use these services for article generation
2. Agent 4 (Publishing) will use these for content adaptation
3. Agent 6 (Optimization) will use these for content analysis

## Support

For issues or questions, refer to:
- Model pricing: Check official provider docs for current rates
- API limits: Each provider has different rate limits
- Token counting: Estimates are approximate, actual usage may vary slightly
