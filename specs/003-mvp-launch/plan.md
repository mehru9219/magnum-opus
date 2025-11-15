# Implementation Plan: Magnum Opus MVP (Weeks 1-3, 5)

**Branch**: `003-mvp-launch` | **Date**: 2025-11-16 | **Spec**: [phase-1-spec.md](../roadmap-implementation/phase-1-spec.md), [phase-2-spec.md](../roadmap-implementation/phase-2-spec.md)
**Input**: Comprehensive feature specifications from Phase 1 (Weeks 1-3: Content Generation, Multi-Platform Publishing, AI Visibility Tracking) and Phase 2 (Week 5: Smart Optimization Detector)

## Summary

Build the complete Magnum Opus MVP featuring:
1. **Week 1**: AI-powered content generation engine supporting 4 AI models (GPT-4, Claude, Perplexity, Gemini) with 5 content templates, quality control pipeline, GEO optimization, and bulk generation (30 articles in 30 minutes)
2. **Week 2**: One-click multi-platform publishing system for 10+ platforms (WordPress, Shopify, Webflow, Wix, Squarespace, Ghost, Medium, LinkedIn, Dev.to, Custom CMS) with OAuth authentication, content adaptation, and scheduling
3. **Week 3**: AI visibility tracking across ChatGPT, Claude, Perplexity, and Gemini using prompt simulation (50-100 variations), citation extraction, visibility scoring, and competitor comparison
4. **Week 5**: Smart optimization detector running every 6 hours with 5 detection rules (keywords, FAQs, metadata, LLMTXT, internal links), competitor analysis via web crawler, priority scoring, and staging environment

Technical approach: Next.js 14 App Router + Convex (real-time database) + Inngest (background jobs) + Clerk (auth) + Vercel AI SDK + Shadcn/ui, deployed to Vercel with 10 parallel agent execution model.

## Technical Context

**Language/Version**: TypeScript 5.3+ (strict mode), Node.js 18+, Next.js 14 (App Router)
**Primary Dependencies**:
- **Framework**: Next.js 14 (App Router, Server Components, Server Actions)
- **Database**: Convex (real-time serverless database with auto-generated TypeScript types)
- **Background Jobs**: Inngest (workflow orchestration, scheduled tasks, retry logic)
- **Authentication**: Clerk (OAuth, user management, organizations)
- **AI SDKs**: Vercel AI SDK, OpenAI SDK, Anthropic SDK, Direct API calls (Perplexity, Gemini)
- **UI**: Shadcn/ui (copy-paste components), TailwindCSS, Recharts (data visualization)
- **Forms**: React Hook Form + Zod (validation)
- **Testing**: Vitest (unit), Playwright (E2E)

**Storage**:
- Convex (primary database): 20+ tables (articles, platforms, tracking, opportunities)
- Upstash Redis (caching layer for AI responses, 24-hour TTL)
- Vercel Blob Storage (future: for image uploads)

**Testing**:
- Vitest for unit and integration tests
- Playwright for E2E test flows
- Convex test mode for database tests
- Inngest test mode for job tests

**Target Platform**:
- Vercel Edge (frontend + API routes)
- Convex Cloud (database + backend mutations/queries)
- Inngest Cloud (background job execution)

**Project Type**: Full-stack web application (Next.js monolith with Convex backend)

**Performance Goals**:
- Generate 30 articles in <30 minutes (bulk generation with 5 concurrent jobs)
- API response times <200ms p95
- Dashboard load time <2 seconds
- Tracking execution: 5 keywords × 4 platforms in <15 minutes
- Optimization scan completion in <15 minutes

**Constraints**:
- AI API cost per article <$3 (across generation + quality checks + citations)
- OAuth approval from WordPress, Medium, LinkedIn within Week 2 timeline
- Plagiarism API rate limits (manage via queue)
- Browser automation (Playwright) for platforms without APIs
- 90-day data retention for tracking history

**Scale/Scope**:
- Target: 100 beta users by Week 6
- Support: 1000+ concurrent users (Phase 4 goal)
- 50 keywords tracked per user on Growth plan
- 3-5 competitors analyzed per user
- 100 pages crawled per competitor site
- 20+ database tables, 15+ background jobs, 50+ UI components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with Magnum Opus Constitution principles:

- **✅ I. AI-First Multi-Model Content Generation**: Weeks 1 implements all 4 AI models (GPT-4, Claude 3.5, Perplexity, Gemini) with automatic fallback chain. Supports 5 proven templates (comparison, how-to, listicle, problem-solver, ultimate guide). Bulk generation targets 30 articles in 30 minutes with 5 concurrent processing.

- **✅ II. Universal Multi-Platform Distribution**: Week 2 implements 10+ platform integrations (WordPress, Shopify, Webflow, Wix, Squarespace, Ghost, Medium, LinkedIn, Dev.to, Custom CMS). OAuth 2.0 for supported platforms. Content adaptation engine per platform (format, length, style). Scheduling with optimal time suggestions.

- **✅ III. Comprehensive AI Visibility Tracking**: Week 3 tracks all 4 AI platforms (ChatGPT, Claude, Perplexity, Gemini). Prompt simulation engine generates 50-100 variations per keyword. Citation extraction and visibility scoring. Competitor comparison for up to 5 competitors. *Note: Global tracking (100+ countries) moved to post-MVP per prioritization decision.*

- **✅ IV. Intelligent Automation**: Week 5 implements automated opportunity scanner running every 6 hours. 5 detection rules (keyword updates, FAQ additions, metadata refresh, LLMTXT generation, internal links). One-click approval workflow. Priority scoring (effort-based). Daily digest notifications.

- **✅ V. Quality & GEO Optimization**: Week 1 includes plagiarism checking (<2% threshold), readability scoring (70+ required), fact verification (90%+ accuracy). GEO optimization layer auto-inserts quotes, statistics, citations (minimum 3 per article). Web search API integration for citation sourcing.

- **✅ VI. Scalability & Performance**: Upstash Redis caching for AI responses (24-hour TTL). Parallel processing (5 concurrent for generation, 10 for tracking). Convex indexes for performance. Background jobs via Inngest prevent UI blocking. Queue systems for batch operations. Targets: <200ms p95 API, 30 articles <30 min, 1000+ users supported (Phase 4).

- **✅ VII. Enterprise-Ready Architecture**: Multi-brand management via Convex user relationships. Team collaboration via Clerk organizations. Staging environment for preview (staging.magnumopus.com). API access via Convex HTTP endpoints. Export functionality for analytics. *Note: White-label and advanced permissions deferred to Week 10.*

- **✅ Security & Compliance**: Clerk handles authentication with secure session management. API keys encrypted in Convex database (AES-256). GDPR compliance via data export/deletion support. Audit logs for critical operations (publishing, optimization changes). Rate limiting via Upstash Redis. *Full security audit scheduled for Week 11.*

- **✅ Development Workflow**: Specifications created via comprehensive phase-1-spec.md and phase-2-spec.md following `/speckit.specify` patterns. Implementation plan follows `/speckit.plan` command structure. Tasks will be generated via `/speckit.tasks` organized by user story priority. User stories are independently testable (each story has acceptance scenarios and can be MVP-shipped alone). Parallel agent execution model (10 agents) enables rapid development.

**Result**: ✅ PASS

*Minor Deviations Justified*:
- Global tracking (100+ countries from Principle III) deferred to post-MVP based on strategic prioritization - domestic tracking provides sufficient MVP validation
- White-label features (Principle VII) deferred to Week 10 per roadmap phasing

## Project Structure

### Documentation (this feature)

```text
specs/003-mvp-launch/
├── plan.md                            # This file (/speckit.plan command output)
├── research.md                        # Phase 0 output - technology decisions
├── data-model.md                      # Phase 1 output - 20+ Convex tables
├── quickstart.md                      # Phase 1 output - test scenarios
├── contracts/                         # Phase 1 output - API definitions
│   ├── convex-mutations.md            # Convex mutation signatures
│   ├── convex-queries.md              # Convex query signatures
│   └── inngest-jobs.md                # Background job contracts
└── tasks.md                           # Phase 2 output (/speckit.tasks command)

specs/roadmap-implementation/
├── phase-1-spec.md                    # Source: Weeks 1-3 specifications
├── phase-2-spec.md                    # Source: Week 5 specification
└── parallelagents/                    # 10-agent execution plan
    ├── README.md                      # Coordination guide
    ├── agent-01-database-schema.md    # Convex schema implementation
    ├── agent-02-ai-services.md        # AI integration layer
    ├── agent-03-content-generation.md # Week 1 backend
    ├── agent-04-publishing.md         # Week 2 backend
    ├── agent-05-tracking.md           # Week 3 backend
    ├── agent-06-optimization.md       # Week 5 backend
    ├── agent-07-frontend-ui.md        # All dashboards & UI
    ├── agent-08-background-jobs.md    # Inngest workflows
    ├── agent-09-infrastructure.md     # Auth, deployment, monitoring
    └── agent-10-testing.md            # Test suite
```

### Source Code (repository root)

```text
magnum-opus/
├── app/                               # Next.js 14 App Router
│   ├── (auth)/                        # Auth routes (sign-in, sign-up)
│   ├── dashboard/                     # Protected dashboard routes
│   │   ├── generate/                  # Week 1: Content generation UI
│   │   │   ├── page.tsx               # Main generation form
│   │   │   ├── bulk/page.tsx          # Bulk upload interface
│   │   │   └── results/page.tsx       # Generation results table
│   │   ├── publish/                   # Week 2: Publishing management
│   │   │   ├── page.tsx               # Platform connections
│   │   │   ├── history/page.tsx       # Publish history
│   │   │   └── schedule/page.tsx      # Scheduling calendar
│   │   ├── tracking/                  # Week 3: Visibility tracking
│   │   │   ├── page.tsx               # Tracking dashboard
│   │   │   ├── setup/page.tsx         # Brand/keyword setup
│   │   │   └── competitors/page.tsx   # Competitor comparison
│   │   └── opportunities/             # Week 5: Optimization opportunities
│   │       ├── page.tsx               # Opportunity cards
│   │       ├── preview/[id]/page.tsx  # Staged preview
│   │       └── history/page.tsx       # Completed optimizations
│   ├── api/                           # API routes
│   │   ├── webhooks/                  # Platform webhooks
│   │   │   ├── clerk/route.ts         # Clerk user sync
│   │   │   └── stripe/route.ts        # Payment webhooks (future)
│   │   ├── oauth/                     # OAuth callbacks
│   │   │   └── callback/route.ts      # Platform OAuth returns
│   │   └── inngest/route.ts           # Inngest webhook endpoint
│   ├── layout.tsx                     # Root layout
│   ├── page.tsx                       # Landing page
│   └── globals.css                    # Global styles
│
├── components/                        # React components
│   ├── ui/                            # Shadcn/ui components (copy-paste)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── table.tsx
│   │   └── [30+ components]
│   ├── generation/                    # Week 1 feature components
│   │   ├── ArticleCard.tsx
│   │   ├── QualityScoreDisplay.tsx
│   │   └── BulkUploadForm.tsx
│   ├── publishing/                    # Week 2 feature components
│   │   ├── PlatformConnectionCard.tsx
│   │   ├── PublishPreview.tsx
│   │   └── ScheduleCalendar.tsx
│   ├── tracking/                      # Week 3 feature components
│   │   ├── VisibilityScoreCard.tsx
│   │   ├── TrendChart.tsx
│   │   └── CompetitorComparison.tsx
│   └── optimization/                  # Week 5 feature components
│       ├── OpportunityCard.tsx
│       ├── StagedPreview.tsx
│       └── PriorityBadge.tsx
│
├── convex/                            # Convex backend
│   ├── schema.ts                      # Database schema (20+ tables)
│   ├── articles.ts                    # Week 1: Content queries/mutations
│   ├── generation.ts                  # Week 1: Generation logic
│   ├── quality.ts                     # Week 1: Quality checks
│   ├── publishing.ts                  # Week 2: Publishing orchestration
│   ├── platforms.ts                   # Week 2: Platform management
│   ├── tracking.ts                    # Week 3: Visibility tracking
│   ├── visibility.ts                  # Week 3: Score calculation
│   ├── optimization.ts                # Week 5: Opportunity detection
│   ├── competitors.ts                 # Week 5: Competitor analysis
│   ├── users.ts                       # User management
│   ├── http.ts                        # HTTP endpoints for webhooks
│   └── _generated/                    # Auto-generated types
│
├── inngest/                           # Background jobs
│   ├── client.ts                      # Inngest client setup
│   └── functions/                     # Job definitions
│       ├── generate-articles-bulk.ts  # Week 1: Bulk generation
│       ├── run-quality-checks.ts      # Week 1: Quality pipeline
│       ├── generate-citations.ts      # Week 1: Citation insertion
│       ├── publish-to-platforms.ts    # Week 2: Parallel publishing
│       ├── schedule-publish.ts        # Week 2: Scheduled publishes
│       ├── sync-platform-analytics.ts # Week 2: Fetch engagement metrics
│       ├── run-visibility-tracking.ts # Week 3: Tracking execution
│       ├── process-prompt-variations.ts # Week 3: Prompt processing
│       ├── calculate-scores.ts        # Week 3: Visibility scoring
│       ├── run-optimization-scan.ts   # Week 5: Scanner (every 6h)
│       ├── crawl-competitors.ts       # Week 5: Web crawler
│       ├── generate-llmtxt.ts         # Week 5: LLMTXT generation
│       └── send-daily-digest.ts       # Week 5: Email notifications
│
├── lib/                               # Shared utilities
│   ├── ai/                            # AI integration layer
│   │   ├── models.ts                  # Unified AI interface
│   │   ├── prompts.ts                 # Prompt templates
│   │   └── cost-calculator.ts         # Token counting
│   ├── content-templates/             # Week 1: Content templates
│   │   ├── comparison.ts
│   │   ├── how-to.ts
│   │   ├── listicle.ts
│   │   ├── problem-solver.ts
│   │   └── ultimate-guide.ts
│   ├── quality-check/                 # Week 1: Quality control
│   │   ├── plagiarism.ts              # Plagiarism API integration
│   │   ├── readability.ts             # Flesch Reading Ease
│   │   └── fact-check.ts              # AI-based verification
│   ├── geo-optimization/              # Week 1: GEO layer
│   │   ├── citation-finder.ts         # Web search + extraction
│   │   └── citation-inserter.ts       # Auto-insert logic
│   ├── publishers/                    # Week 2: Platform adapters
│   │   ├── base-adapter.ts            # Interface definition
│   │   ├── wordpress-adapter.ts
│   │   ├── shopify-adapter.ts
│   │   ├── medium-adapter.ts
│   │   └── [10+ platform adapters]
│   ├── content-adapter/               # Week 2: Format adaptation
│   │   └── adapt-content.ts           # Platform-specific formatting
│   ├── tracking/                      # Week 3: Tracking logic
│   │   ├── prompt-generator.ts        # Variation generation
│   │   ├── citation-extractor.ts      # Mention detection
│   │   └── scoring.ts                 # Visibility calculation
│   ├── optimization/                  # Week 5: Detection rules
│   │   ├── scanner.ts                 # Scanner orchestration
│   │   └── detectors/                 # 5 detection engines
│   │       ├── keyword-detector.ts
│   │       ├── faq-detector.ts
│   │       ├── metadata-detector.ts
│   │       ├── llmtxt-generator.ts
│   │       └── internal-link-detector.ts
│   ├── crawler/                       # Week 5: Web crawler
│   │   └── competitor-crawler.ts      # Playwright-based crawler
│   ├── hooks/                         # Custom React hooks
│   │   └── use-*.ts                   # Convex query hooks
│   └── utils.ts                       # General utilities
│
├── __tests__/                         # Test suite
│   ├── unit/                          # Unit tests
│   │   ├── ai/                        # AI service tests
│   │   ├── templates/                 # Template tests
│   │   └── adapters/                  # Platform adapter tests
│   ├── integration/                   # Integration tests
│   │   ├── convex/                    # Database tests
│   │   └── inngest/                   # Job tests
│   └── e2e/                           # End-to-end tests
│       ├── generation-flow.spec.ts    # Week 1 flows
│       ├── publishing-flow.spec.ts    # Week 2 flows
│       ├── tracking-flow.spec.ts      # Week 3 flows
│       └── optimization-flow.spec.ts  # Week 5 flows
│
├── public/                            # Static assets
├── .env.example                       # Environment variables template
├── .gitignore
├── middleware.ts                      # Clerk authentication middleware
├── next.config.js                     # Next.js configuration
├── package.json
├── tailwind.config.ts                 # Tailwind configuration
├── tsconfig.json                      # TypeScript configuration (strict mode)
└── vitest.config.ts                   # Vitest test configuration
```

**Structure Decision**: Full-stack Next.js monolith with Convex backend. This architecture maximizes developer velocity for MVP while maintaining clear separation of concerns. Convex provides real-time database with auto-generated TypeScript types. Inngest handles all background processing (bulk generation, tracking, scanning). Shadcn/ui provides consistent UI components via copy-paste (not npm dependency). Structure supports 10-agent parallel development model.

## Complexity Tracking

> All constitutional principles satisfied - no violations to justify.

---

*Plan complete. Proceed to Phase 0 (research.md generation) and Phase 1 (data-model.md, contracts/, quickstart.md generation).*
