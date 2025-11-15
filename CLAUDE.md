# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Magnum Opus** is an AI-powered SaaS platform for content generation, multi-platform publishing, and AI visibility tracking (GEO - Generative Engine Optimization). The platform generates SEO/GEO-optimized content using multiple AI models (GPT-4, Claude, Perplexity, Gemini), publishes to 10+ platforms with one click, and tracks visibility across ChatGPT, Claude, Perplexity, and Gemini in 100+ countries.

**Timeline**: 12-week development roadmap targeting $50K MRR
**Current Phase**: Planning/early development (Week 1-3 focus on core engine)

## Tech Stack

### Core Framework
- **Next.js 14/15** (App Router) - Server Components, Server Actions, edge runtime
- **TypeScript** - Strict mode enabled throughout
- **Convex** - Real-time database + serverless backend (replaces traditional DB + API)
- **Inngest** - Background jobs and workflow orchestration
- **Clerk** - Authentication with organization/team support
- **Stripe** - Subscriptions, usage-based billing

### AI Layer
- **Vercel AI SDK** - Unified interface for AI models
- **OpenAI API** (GPT-4/GPT-3.5)
- **Anthropic Claude API** (Claude 3.5 Sonnet)
- **Perplexity API**
- **Google Gemini API**

### Frontend
- **TailwindCSS** + **Shadcn/ui** - Component library (copy-paste, not npm dependency)
- **React Query (TanStack Query)** - Server state management
- **React Hook Form** + **Zod** - Form validation
- **Recharts** - Analytics dashboards

### Infrastructure
- **Vercel** - Deployment and CDN
- **Upstash Redis** - Caching and rate limiting
- **Playwright** - Browser automation for AI tracking
- **Bright Data** - Proxy network for global tracking

### Monitoring & Dev Tools
- **PostHog** - Product analytics
- **Sentry** - Error tracking
- **Axiom** - Log management
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Turborepo** - Monorepo management (if applicable)

## Development Commands

### Local Development
```bash
# Install dependencies
npm install

# Run Convex backend locally
npx convex dev

# Run Next.js frontend
npm run dev

# Run both concurrently (if configured)
npm run dev:all
```

### Testing
```bash
# Run unit tests
npm run test
# or
npx vitest

# Run unit tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
# or
npx playwright test

# Run type checking
npm run typecheck
# or
npx tsc --noEmit
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
# or
npx prettier --write .

# Lint and format together
npm run lint:fix
```

### Database (Convex)
```bash
# Deploy schema changes
npx convex deploy

# Open Convex dashboard
npx convex dashboard

# View logs
npx convex logs

# Run a Convex function manually
npx convex run [functionName] --arg '{"key": "value"}'
```

### Background Jobs (Inngest)
```bash
# Run Inngest dev server (for local testing)
npx inngest-cli dev

# View Inngest dashboard
# Access at http://localhost:8288 when dev server running
```

### Deployment
```bash
# Deploy to Vercel (production)
vercel --prod

# Deploy to Vercel (preview)
vercel

# Deploy Convex backend
npx convex deploy --prod
```

## High-Level Architecture

### Data Flow Patterns

**Content Generation Flow**:
```
User Request → Next.js Server Action → Convex Mutation
  → Inngest Background Job → AI API (GPT-4/Claude/Perplexity)
  → Content Processing → Convex Storage
  → Queue Publishing Job → Platform APIs (WordPress/Shopify/etc.)
  → Update Status in Convex → Real-time UI Update
```

**AI Visibility Tracking Flow**:
```
Inngest Scheduled Job → Playwright Browser Automation
  → Proxy (for country-specific testing)
  → AI Platform (ChatGPT/Claude/Perplexity/Gemini)
  → Extract Citations/Rankings → Convex Storage
  → Calculate Visibility Score → Dashboard Update
```

**Optimization Detection Flow**:
```
Inngest Scanner (every 6h) → Analyze Site Content (Convex queries)
  → AI Analysis (GPT-4) → Detect Opportunities
  → Priority Scoring → Convex Storage
  → Trigger Notifications (Email/Slack/In-app)
  → User Applies Fixes (one-click or manual)
```

### Real-Time Updates with Convex

Convex provides automatic real-time updates via WebSocket subscriptions. When data changes in the database, UI components automatically re-render:

```typescript
// Frontend automatically updates when articles change
const articles = useQuery(api.articles.listByUser, { status: "published" });
```

### Background Job Orchestration with Inngest

Long-running operations (bulk generation, scheduled tracking, publishing workflows) run in Inngest functions with automatic retries and observability:

```typescript
export const generateArticlesBulk = inngest.createFunction(
  { id: "generate-articles-bulk", concurrency: 5 },
  { event: "article.generate.bulk" },
  async ({ event, step }) => {
    // Process each article with automatic retry logic
    for (const articleId of event.data.articleIds) {
      await step.run(`generate-${articleId}`, async () => {
        // Generation logic here
      });
    }
  }
);
```

## Project Structure Conventions

```
magnum-opus/
├── app/                          # Next.js App Router pages
│   ├── dashboard/                # Protected dashboard routes
│   │   ├── generate/             # Content generation UI
│   │   ├── publish/              # Publishing management
│   │   └── tracking/             # AI visibility tracking
│   ├── api/                      # API routes (Stripe webhooks, etc.)
│   └── (auth)/                   # Auth pages (sign-in, sign-up)
├── convex/                       # Convex backend
│   ├── schema.ts                 # Database schema definitions
│   ├── articles.ts               # Article queries/mutations
│   ├── tracking.ts               # Tracking queries/mutations
│   └── _generated/               # Auto-generated types
├── inngest/                      # Background jobs
│   ├── client.ts                 # Inngest client setup
│   └── functions/                # Job definitions
│       ├── generate-articles.ts
│       └── track-visibility.ts
├── lib/                          # Shared utilities
│   ├── ai/                       # AI-related utilities
│   │   ├── prompts.ts            # Prompt templates
│   │   ├── models.ts             # Model configurations
│   │   └── cost-calculator.ts
│   ├── publishers/               # Platform adapters
│   │   ├── wordpress.ts
│   │   ├── shopify.ts
│   │   └── base.ts               # Adapter interface
│   └── utils.ts                  # General utilities
├── components/                   # React components
│   ├── ui/                       # Shadcn/ui components
│   └── [feature]/                # Feature-specific components
├── __tests__/                    # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── .specify/                     # Specification system
    ├── memory/
    │   └── constitution.md       # Project principles
    └── templates/                # Spec templates
```

## Constitutional Principles

This project follows 7 core principles defined in [.specify/memory/constitution.md](.specify/memory/constitution.md):

1. **AI-First Multi-Model Content Generation** - Support GPT-4, Claude, Perplexity with automatic fallback; bulk generation (30 articles in 30 minutes)
2. **Universal Multi-Platform Distribution** - One-click publishing to 10+ platforms with content adaptation
3. **Comprehensive AI Visibility Tracking** - Monitor ChatGPT, Claude, Perplexity, Gemini across 100+ countries
4. **Intelligent Automation** - Automated opportunity detection every 6 hours with one-click fixes
5. **Quality & GEO Optimization** - Built-in plagiarism checks, readability scores, automatic quote/stat/citation insertion
6. **Scalability & Performance** - Target: <200ms API response (p95), 30 articles in <30 minutes, support 1000+ users
7. **Enterprise-Ready Architecture** - Multi-brand management, team collaboration, white-label, API access

All new features MUST comply with these principles. If a feature conflicts with constitutional requirements, escalate before implementation.

## Development Workflow (SpecKit)

This project uses a **specification-driven development workflow** with custom slash commands:

### Core Workflow Commands

1. **`/speckit.constitution`** - Establish principles before starting a phase/feature
2. **`/speckit.specify`** - Create detailed specification with requirements, data model, UI, API
3. **`/speckit.plan`** - Break specification into implementation phases with timeline
4. **`/speckit.tasks`** - Generate actionable GitHub-style tasks from the plan
5. **`/speckit.implement`** - Code specific tasks following the specification

### Enhancement Commands

- **`/speckit.clarify`** - Resolve ambiguities before planning (use when requirements unclear)
- **`/speckit.analyze`** - Check consistency across constitution/spec/plan/tasks
- **`/speckit.checklist`** - Validate readiness before implementation or deployment

### Workflow Example

```
Feature: Bulk Article Generation
1. /speckit.constitution  → Define AI content generation principles
2. /speckit.specify      → Detail form, data model, AI integration, background jobs
3. /speckit.plan         → 5-day plan (database → backend → frontend → testing)
4. /speckit.tasks        → Break into 28 individual tasks with estimates
5. /speckit.implement    → Code Task #1: Set up Convex schema
```

**Key Rule**: Always write specifications before coding. The project emphasizes "specifying clarity" - code quality follows from clear specifications.

## Key Patterns & Conventions

### Convex Data Model Pattern

```typescript
// convex/schema.ts - Define schema first
export default defineSchema({
  articles: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    status: v.union(v.literal("queued"), v.literal("generating"), v.literal("completed")),
    generatedBy: v.string(), // "gpt-4" | "claude-3.5-sonnet"
    tokensUsed: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
});

// convex/articles.ts - Implement queries/mutations
export const generateBulk = mutation({
  args: { topics: v.array(v.string()), model: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    // Create articles, trigger Inngest job
  },
});
```

### AI Model Abstraction Pattern

The platform supports multiple AI models. Use the abstraction layer in `lib/ai/models.ts`:

```typescript
// Don't hardcode model-specific code
// Instead, use the model configuration system:
const modelConfig = getModelConfig(args.model);
const result = await generateText({ model: modelConfig, prompt });
```

Cost optimization: Use cheaper models (GPT-3.5) for simple tasks, premium models (GPT-4, Claude) for complex generation.

### Platform Adapter Pattern

Publishing to multiple platforms uses the Adapter pattern (see `lib/publishers/`):

```typescript
interface PublishingAdapter {
  authenticate(credentials): Promise<boolean>;
  publish(article): Promise<PublishResult>;
  update(articleId, article): Promise<PublishResult>;
  delete(articleId): Promise<void>;
}

// Each platform implements this interface
// WordPress, Shopify, Webflow, Medium, LinkedIn, Dev.to
```

### Error Handling & Retry Logic

**AI API calls**: Always implement retry with exponential backoff (use Inngest's built-in retry)
**External APIs**: Wrap in try-catch with meaningful error messages
**User-facing errors**: Use toast notifications, never raw error objects

```typescript
try {
  const result = await generateText({ model, prompt });
} catch (error) {
  // Log to Sentry
  await sentry.captureException(error);
  // Show user-friendly message
  throw new Error("Failed to generate content. Please try again.");
}
```

### Performance Optimization

- **Caching**: Use Upstash Redis to cache AI responses for duplicate requests (24h TTL)
- **Parallel Processing**: Use `Promise.all()` for independent operations
- **Background Jobs**: Never block user requests - queue heavy operations in Inngest
- **Database Queries**: Always use Convex indexes for filtering (never `.filter()` in queries)
- **Code Splitting**: Use dynamic imports for large components: `const Component = dynamic(() => import('./Component'))`

### Cost Management

AI API costs are a major concern. Follow these practices:

1. **Cache duplicate prompts** (Redis, 24h TTL) - reduces costs 60-80%
2. **Strategic sampling** for tracking (test subset, model full distribution)
3. **Model selection**: GPT-3.5 for simple tasks, GPT-4 for complex
4. **Token counting**: Track tokens per user, enforce limits per plan
5. **Batch processing**: Generate multiple articles in one job (reduces overhead)

Target: <$3 for 30 articles generated

## Testing Strategy

### Unit Tests (Vitest)
- All utility functions in `lib/` must have unit tests
- Prompt generation (`buildPrompt()`)
- Cost calculations (`calculateCost()`)
- Content formatters, validators

### Integration Tests (Vitest)
- All Convex mutations and queries
- Mock external APIs (OpenAI, Stripe)
- Test database operations in isolation

### E2E Tests (Playwright)
- Critical user flows: Generate articles → View dashboard
- Authentication flows: Sign up → Subscribe → Use platform
- Publishing flows: Generate → Publish to WordPress

### Performance Tests
- Load test: 10 concurrent users generating 30 articles each
- Stress test: 100 articles generation, verify no timeouts
- API response time: <200ms p95

Run tests before every deployment. PRs require passing tests.

## Environment Variables

Required environment variables (see `.env.example` if available):

```bash
# Convex
CONVEX_DEPLOYMENT=            # Convex deployment URL
NEXT_PUBLIC_CONVEX_URL=       # Public Convex URL

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# AI APIs
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
PERPLEXITY_API_KEY=
GOOGLE_GEMINI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Redis (Upstash)
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
AXIOM_TOKEN=

# Proxies (for global tracking)
BRIGHT_DATA_PROXY_URL=        # Week 4+
BRIGHT_DATA_USERNAME=
BRIGHT_DATA_PASSWORD=
```

## Common Gotchas & Important Notes

### Convex-Specific
- **Schema changes require deployment**: Run `npx convex deploy` after modifying `schema.ts`
- **No direct DB access**: All database operations go through Convex queries/mutations
- **Indexes are required**: Complex queries need indexes defined in schema
- **Real-time subscriptions**: Use `useQuery()` for automatic updates, not React Query

### Next.js App Router
- **Server Components by default**: Add `"use client"` only when needed (forms, hooks, state)
- **Server Actions**: Use for mutations, keep them in separate files or with `"use server"` directive
- **Route protection**: Use Clerk middleware in `middleware.ts` for auth

### AI API Integration
- **Rate limits**: OpenAI has rate limits - implement queuing for bulk operations
- **Non-deterministic responses**: Same prompt = different output; run 3-10 queries for statistical confidence
- **Token counting**: Always count tokens to avoid unexpected costs
- **Timeouts**: Set reasonable timeouts (30-60s) for generation

### Background Jobs (Inngest)
- **Concurrency limits**: Set appropriate concurrency (e.g., `concurrency: 5`) to avoid overwhelming APIs
- **Idempotency**: Jobs may retry - ensure operations are idempotent
- **Step functions**: Use `step.run()` for retry-able operations within jobs

### Publishing Integrations
- **Platform rate limits**: WordPress, Shopify have different rate limits - respect them
- **Content adaptation**: Each platform has different markdown/HTML support - test thoroughly
- **Authentication**: Store API keys/tokens securely in Convex, not in code

## 12-Week Roadmap Context

When working on features, understand the phase context:

- **Week 1-3 (Core Engine)**: Content generation, publishing, basic tracking - prioritize speed and MVP functionality
- **Week 4-6 (Intelligence & Scale)**: Global tracking, optimization detection - focus on automation and data accuracy
- **Week 7-9 (Advanced Features)**: Backlinks, content intelligence, keyword research - add sophistication
- **Week 10-12 (Enterprise)**: Multi-brand, teams, white-label, performance optimization - enterprise-grade features

Current development should focus on **Week 1-3 deliverables** unless explicitly stated otherwise.

## Getting Help

- **Convex Docs**: https://docs.convex.dev
- **Inngest Docs**: https://www.inngest.com/docs
- **Vercel AI SDK**: https://sdk.vercel.ai/docs
- **Shadcn/ui**: https://ui.shadcn.com
- **Next.js 14**: https://nextjs.org/docs (App Router section)

For project-specific decisions, refer to:
- [12weekroadmap.md](12weekroadmap.md) - Timeline and phases
- [TECH_STACK_BRAINSTORM.md](TECH_STACK_BRAINSTORM.md) - Detailed tech decisions
- [PROMPTS.md](PROMPTS.md) - SpecKit workflow prompts
- [.specify/memory/constitution.md](.specify/memory/constitution.md) - Core principles

---

**Project Goal**: Build a $7.3B market opportunity platform (GEO market) targeting $50K MRR in 12 weeks through rapid MVP iteration and systematic feature development.
