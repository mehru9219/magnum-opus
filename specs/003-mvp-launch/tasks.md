# Tasks: Magnum Opus MVP (Weeks 1-3, 5)

**Input**: Design documents from `/specs/003-mvp-launch/` and `/specs/roadmap-implementation/`
**Prerequisites**: plan.md ✅, phase-1-spec.md ✅, phase-2-spec.md ✅
**Execution Model**: 10 parallel agents (see `/specs/roadmap-implementation/parallelagents/`)

**Tests**: Not included in MVP tasks - focus on rapid delivery with E2E validation

**Organization**: Tasks organized by parallel agent phases for maximum execution speed. Each agent works independently on separate files/domains.

## Format: `[ID] [P?] [Agent] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Agent]**: Which agent executes this task (A1-A10)
- Include exact file paths in descriptions

## Parallel Agent Execution Strategy

This implementation uses a **10-agent parallel execution model** where agents work simultaneously on independent domains:

**Phase 1 (Foundation)** - Agents 1, 2, 9 start immediately
**Phase 2 (Core Backend)** - Agents 3, 5, 7 start after Phase 1
**Phase 3 (Publishing & Optimization)** - Agents 4, 6, 7 start after Phase 2
**Phase 4 (Orchestration)** - Agent 8 starts after Phase 3
**Phase 5 (QA)** - Agent 10 starts after Phase 4

---

## Phase 1: Foundation Layer (START IMMEDIATELY - 3 Agents)

**Purpose**: Database schema, AI services, authentication infrastructure
**Agents**: A1 (Database), A2 (AI Services), A9 (Infrastructure)
**Duration**: 2-4 hours
**Blocking**: ALL other phases

### Agent 1: Database Schema Architect

- [ ] T001 [P] [A1] Create Convex schema with all 20 tables in `convex/schema.ts`
- [ ] T002 [P] [A1] Define Week 1 tables (articles, topics, qualityChecks, citations) with indexes in `convex/schema.ts`
- [ ] T003 [P] [A1] Define Week 2 tables (platformConnections, publishJobs, publishResults, contentAdaptations) in `convex/schema.ts`
- [ ] T004 [P] [A1] Define Week 3 tables (trackedBrands, trackedKeywords, competitorBrands, trackingRuns, aiResponses, visibilityScores) in `convex/schema.ts`
- [ ] T005 [P] [A1] Define Week 5 tables (opportunityScans, opportunities, competitorSites, competitorPages, stagedChanges) in `convex/schema.ts`
- [ ] T006 [P] [A1] Add users table with Clerk integration fields in `convex/schema.ts`
- [ ] T007 [A1] Verify schema compiles with `npx convex dev` and types generate in `convex/_generated/`

### Agent 2: AI Services Infrastructure Engineer

- [ ] T008 [P] [A2] Create unified AI model interface in `lib/ai/models.ts` (generateText, streamText functions)
- [ ] T009 [P] [A2] Implement OpenAI API integration (GPT-4, GPT-3.5) in `lib/ai/models.ts`
- [ ] T010 [P] [A2] Implement Anthropic Claude API integration (Claude 3.5 Sonnet) in `lib/ai/models.ts`
- [ ] T011 [P] [A2] Implement Perplexity API integration in `lib/ai/models.ts`
- [ ] T012 [P] [A2] Implement Google Gemini API integration in `lib/ai/models.ts`
- [ ] T013 [P] [A2] Build automatic fallback chain (GPT-4 → Claude → Perplexity → Gemini) in `lib/ai/models.ts`
- [ ] T014 [P] [A2] Create prompt template system with variable substitution in `lib/ai/prompts.ts`
- [ ] T015 [P] [A2] Implement token counting and cost calculator in `lib/ai/cost-calculator.ts`
- [ ] T016 [A2] Test all 4 AI models with sample prompts and verify fallback logic

### Agent 9: Authentication, Infrastructure & DevOps Engineer

- [ ] T017 [P] [A9] Initialize Next.js 14 project with TypeScript and App Router
- [ ] T018 [P] [A9] Install and configure Convex (`npx convex dev`)
- [ ] T019 [P] [A9] Install and configure Inngest (`npm install inngest`)
- [ ] T020 [P] [A9] Install and configure Clerk authentication (`npm install @clerk/nextjs`)
- [ ] T021 [P] [A9] Install Shadcn/ui and TailwindCSS (`npx shadcn-ui@latest init`)
- [ ] T022 [P] [A9] Install AI SDKs (Vercel AI SDK, OpenAI, Anthropic) and other dependencies
- [ ] T023 [P] [A9] Create Clerk middleware for route protection in `middleware.ts`
- [ ] T024 [P] [A9] Set up Clerk sign-in/sign-up pages in `app/(auth)/sign-in/page.tsx` and `app/(auth)/sign-up/page.tsx`
- [ ] T025 [P] [A9] Create API route for Clerk webhooks in `app/api/webhooks/clerk/route.ts`
- [ ] T026 [P] [A9] Create API route for OAuth callbacks in `app/api/oauth/callback/route.ts`
- [ ] T027 [P] [A9] Create API route for Inngest webhooks in `app/api/inngest/route.ts`
- [ ] T028 [P] [A9] Configure environment variables in `.env.example` (all API keys)
- [ ] T029 [P] [A9] Set up Upstash Redis for caching layer
- [ ] T030 [P] [A9] Configure Sentry for error tracking
- [ ] T031 [P] [A9] Configure PostHog for product analytics
- [ ] T032 [P] [A9] Configure Axiom for log management
- [ ] T033 [A9] Deploy to Vercel and verify all services connect

**Checkpoint 1**: Foundation complete - Verify database schema compiles, AI services callable, auth redirects work

---

## Phase 2: Core Backend Services (3 Agents - After Phase 1)

**Purpose**: Content generation, AI tracking, initial UI scaffolding
**Agents**: A3 (Content Generation), A5 (Tracking), A7 (Frontend - scaffolding)
**Duration**: 3-5 hours
**Dependencies**: Phase 1 complete

### Agent 3: Content Generation Backend Developer (Week 1)

- [ ] T034 [P] [A3] Create Article Convex mutations in `convex/articles.ts` (generateArticle, generateBulk, listArticlesByUser, getQualityScores)
- [ ] T035 [P] [A3] Create Article Convex queries in `convex/articles.ts` (getArticle, listByStatus, getByUser)
- [ ] T036 [P] [A3] Create Comparison content template in `lib/content-templates/comparison.ts`
- [ ] T037 [P] [A3] Create How-To content template in `lib/content-templates/how-to.ts`
- [ ] T038 [P] [A3] Create Listicle content template in `lib/content-templates/listicle.ts`
- [ ] T039 [P] [A3] Create Problem-Solver content template in `lib/content-templates/problem-solver.ts`
- [ ] T040 [P] [A3] Create Ultimate Guide content template in `lib/content-templates/ultimate-guide.ts`
- [ ] T041 [P] [A3] Integrate plagiarism check API in `lib/quality-check/plagiarism.ts` (< 2% threshold)
- [ ] T042 [P] [A3] Implement readability scoring (Flesch Reading Ease) in `lib/quality-check/readability.ts` (70+ required)
- [ ] T043 [P] [A3] Implement AI-based fact verification in `lib/quality-check/fact-check.ts` (90%+ accuracy)
- [ ] T044 [P] [A3] Create quality check pipeline in `convex/quality.ts` that runs all 3 checks
- [ ] T045 [P] [A3] Build citation finder using web search API in `lib/geo-optimization/citation-finder.ts`
- [ ] T046 [P] [A3] Build citation inserter (min 3 per article) in `lib/geo-optimization/citation-inserter.ts`
- [ ] T047 [P] [A3] Create generation logic in `convex/generation.ts` (template selection, AI model call, quality checks, citation insertion)
- [ ] T048 [A3] Test single article generation end-to-end (<2 min target)

### Agent 5: AI Visibility Tracking Backend Developer (Week 3)

- [ ] T049 [P] [A5] Create Tracking Convex mutations in `convex/tracking.ts` (addTrackedKeyword, runTracking, addCompetitor)
- [ ] T050 [P] [A5] Create Tracking Convex queries in `convex/tracking.ts` (getTrackedBrands, getVisibilityScores, getCompetitorComparison)
- [ ] T051 [P] [A5] Build prompt generator with template system in `lib/tracking/prompt-generator.ts` (50-100 variations per keyword)
- [ ] T052 [P] [A5] Implement Question template (What is X, How does X work) in `lib/tracking/prompt-generator.ts`
- [ ] T053 [P] [A5] Implement Comparison template (X vs Y) in `lib/tracking/prompt-generator.ts`
- [ ] T054 [P] [A5] Implement Use Case template (X for [use case]) in `lib/tracking/prompt-generator.ts`
- [ ] T055 [P] [A5] Implement Audience-Specific template (X for [audience]) in `lib/tracking/prompt-generator.ts`
- [ ] T056 [P] [A5] Create citation extractor (detect brand mentions, URLs, position) in `lib/tracking/citation-extractor.ts`
- [ ] T057 [P] [A5] Implement visibility score calculation in `lib/tracking/scoring.ts` ((mentions / total prompts) × 100)
- [ ] T058 [P] [A5] Create visibility scoring logic in `convex/visibility.ts` (per-platform and aggregate scores)
- [ ] T059 [A5] Test tracking execution for 1 keyword across 4 platforms (<15 min target)

### Agent 7: Frontend UI/UX Engineer (Shadcn Specialist) - Scaffolding

- [ ] T060 [P] [A7] Install Shadcn/ui core components (Button, Card, Form, Input, Table, Badge, Modal, Select, Tabs)
- [ ] T061 [P] [A7] Install Recharts for data visualization (`npm install recharts`)
- [ ] T062 [P] [A7] Create main dashboard layout in `app/dashboard/layout.tsx` with navigation
- [ ] T063 [P] [A7] Create landing page in `app/page.tsx`
- [ ] T064 [P] [A7] Set up global styles in `app/globals.css` with Tailwind configuration

**Checkpoint 2**: Core backend ready - Single article generation works, tracking setup functional, UI scaffolded

---

## Phase 3: Publishing, Optimization & Full UI (3 Agents - After Phase 2)

**Purpose**: Multi-platform publishing, smart optimization, complete dashboards
**Agents**: A4 (Publishing), A6 (Optimization), A7 (Frontend - complete)
**Duration**: 4-6 hours
**Dependencies**: Phase 2 complete

### Agent 4: Multi-Platform Publishing Backend Developer (Week 2)

- [ ] T065 [P] [A4] Create Publishing Convex mutations in `convex/publishing.ts` (connectPlatform, publishToMultiple, schedulePublish)
- [ ] T066 [P] [A4] Create Publishing Convex queries in `convex/publishing.ts` (getPlatformConnections, getPublishHistory, getPublishResults)
- [ ] T067 [P] [A4] Create base platform adapter interface in `lib/publishers/base-adapter.ts` (authenticate, publish, update, delete)
- [ ] T068 [P] [A4] Implement WordPress adapter (OAuth + REST API) in `lib/publishers/wordpress-adapter.ts`
- [ ] T069 [P] [A4] Implement Shopify adapter (Admin API) in `lib/publishers/shopify-adapter.ts`
- [ ] T070 [P] [A4] Implement Medium adapter (OAuth) in `lib/publishers/medium-adapter.ts`
- [ ] T071 [P] [A4] Implement LinkedIn adapter (OAuth) in `lib/publishers/linkedin-adapter.ts`
- [ ] T072 [P] [A4] Implement Webflow adapter (OAuth + CMS API) in `lib/publishers/webflow-adapter.ts`
- [ ] T073 [P] [A4] Implement Dev.to adapter (API key) in `lib/publishers/devto-adapter.ts`
- [ ] T074 [P] [A4] Implement Ghost adapter (Admin API) in `lib/publishers/ghost-adapter.ts`
- [ ] T075 [P] [A4] Implement Wix adapter (API key) in `lib/publishers/wix-adapter.ts`
- [ ] T076 [P] [A4] Implement Squarespace adapter (API key) in `lib/publishers/squarespace-adapter.ts`
- [ ] T077 [P] [A4] Implement Custom CMS adapter (webhook-based) in `lib/publishers/custom-adapter.ts`
- [ ] T078 [P] [A4] Create content adaptation engine in `lib/content-adapter/adapt-content.ts` (platform-specific formatting, length, style)
- [ ] T079 [P] [A4] Implement platform-specific adaptations (WordPress: HTML, Medium: rich text, LinkedIn: 300-500 words, Dev.to: Markdown)
- [ ] T080 [P] [A4] Create platform connection manager in `convex/platforms.ts` (store encrypted credentials, test connections)
- [ ] T081 [A4] Test publishing to 3 platforms simultaneously (<3 min target)

### Agent 6: Smart Optimization Scanner Backend Developer (Week 5)

- [ ] T082 [P] [A6] Create Optimization Convex mutations in `convex/optimization.ts` (runOpportunityScan, approveOpportunity, publishOpportunity)
- [ ] T083 [P] [A6] Create Optimization Convex queries in `convex/optimization.ts` (getPriorityOpportunities, getOpportunityScanHistory)
- [ ] T084 [P] [A6] Build opportunity scanner orchestration in `lib/optimization/scanner.ts` (runs every 6 hours, executes 5 detection rules)
- [ ] T085 [P] [A6] Implement keyword detector (compare H1/H2 to tracking keywords) in `lib/optimization/detectors/keyword-detector.ts`
- [ ] T086 [P] [A6] Implement FAQ detector (extract questions from tracking prompts, cluster similar) in `lib/optimization/detectors/faq-detector.ts`
- [ ] T087 [P] [A6] Implement metadata detector (analyze title/description issues) in `lib/optimization/detectors/metadata-detector.ts`
- [ ] T088 [P] [A6] Implement LLMTXT generator (create llms.txt from all published content) in `lib/optimization/detectors/llmtxt-generator.ts`
- [ ] T089 [P] [A6] Implement internal link detector (find related content opportunities) in `lib/optimization/detectors/internal-link-detector.ts`
- [ ] T090 [P] [A6] Build web crawler for competitor analysis in `lib/crawler/competitor-crawler.ts` (Playwright, max 100 pages, respect robots.txt)
- [ ] T091 [P] [A6] Create competitor analysis logic in `convex/competitors.ts` (crawl, extract content, identify gaps)
- [ ] T092 [P] [A6] Implement priority scoring (effort-based: Quick Win / Moderate / Complex) in `lib/optimization/scanner.ts`
- [ ] T093 [A6] Test scanner execution (<15 min for 20 articles + 3 competitors target)

### Agent 7: Frontend UI/UX Engineer (Shadcn Specialist) - Complete

#### Week 1 UI - Content Generation
- [ ] T094 [P] [A7] Create content generation form in `app/dashboard/generate/page.tsx` (topic, template, model, tone, length selectors)
- [ ] T095 [P] [A7] Create bulk upload form in `app/dashboard/generate/bulk/page.tsx` (CSV upload, text area for topics)
- [ ] T096 [P] [A7] Create generation results table in `app/dashboard/generate/results/page.tsx` (article list, status, quality scores, actions)
- [ ] T097 [P] [A7] Create ArticleCard component in `components/generation/ArticleCard.tsx`
- [ ] T098 [P] [A7] Create QualityScoreDisplay component in `components/generation/QualityScoreDisplay.tsx` (plagiarism, readability, fact-check badges)
- [ ] T099 [P] [A7] Create BulkUploadForm component in `components/generation/BulkUploadForm.tsx`

#### Week 2 UI - Publishing
- [ ] T100 [P] [A7] Create platform connections dashboard in `app/dashboard/publish/page.tsx` (OAuth buttons, connection cards)
- [ ] T101 [P] [A7] Create publish history table in `app/dashboard/publish/history/page.tsx` (publish jobs, status, links)
- [ ] T102 [P] [A7] Create scheduling calendar in `app/dashboard/publish/schedule/page.tsx` (calendar view, drag-drop)
- [ ] T103 [P] [A7] Create PlatformConnectionCard component in `components/publishing/PlatformConnectionCard.tsx`
- [ ] T104 [P] [A7] Create PublishPreview component in `components/publishing/PublishPreview.tsx` (multi-platform preview panels)
- [ ] T105 [P] [A7] Create ScheduleCalendar component in `components/publishing/ScheduleCalendar.tsx`

#### Week 3 UI - Tracking
- [ ] T106 [P] [A7] Create tracking dashboard in `app/dashboard/tracking/page.tsx` (visibility scores, trends)
- [ ] T107 [P] [A7] Create tracking setup form in `app/dashboard/tracking/setup/page.tsx` (brand, keywords, competitors)
- [ ] T108 [P] [A7] Create competitor comparison view in `app/dashboard/tracking/competitors/page.tsx` (side-by-side scores, charts)
- [ ] T109 [P] [A7] Create VisibilityScoreCard component in `components/tracking/VisibilityScoreCard.tsx` (score with trend)
- [ ] T110 [P] [A7] Create TrendChart component using Recharts in `components/tracking/TrendChart.tsx` (7-day, 30-day, 90-day)
- [ ] T111 [P] [A7] Create CompetitorComparison component in `components/tracking/CompetitorComparison.tsx` (bar chart)

#### Week 5 UI - Optimization
- [ ] T112 [P] [A7] Create opportunity dashboard in `app/dashboard/opportunities/page.tsx` (opportunity cards, priority filter)
- [ ] T113 [P] [A7] Create staged preview page in `app/dashboard/opportunities/preview/[id]/page.tsx` (before/after comparison)
- [ ] T114 [P] [A7] Create optimization history in `app/dashboard/opportunities/history/page.tsx` (completed optimizations)
- [ ] T115 [P] [A7] Create OpportunityCard component in `components/optimization/OpportunityCard.tsx` (type, title, priority badge, approve button)
- [ ] T116 [P] [A7] Create StagedPreview component in `components/optimization/StagedPreview.tsx` (highlighted changes)
- [ ] T117 [P] [A7] Create PriorityBadge component in `components/optimization/PriorityBadge.tsx` (Quick Win / Moderate / Complex)

- [ ] T118 [A7] Create custom React hooks for Convex queries in `lib/hooks/` (useArticles, useTracking, useOpportunities, etc.)

**Checkpoint 3**: Full platform functional - Publishing works, optimization detects opportunities, all dashboards complete

---

## Phase 4: Background Job Orchestration (1 Agent - After Phase 3)

**Purpose**: Implement all asynchronous workflows and scheduled tasks
**Agent**: A8 (Background Jobs)
**Duration**: 2-3 hours
**Dependencies**: Phase 3 complete

### Agent 8: Background Jobs & Workflow Orchestrator

- [ ] T119 [A8] Create Inngest client configuration in `inngest/client.ts`

#### Week 1 Jobs
- [ ] T120 [P] [A8] Create bulk article generation job in `inngest/functions/generate-articles-bulk.ts` (process 30 with concurrency 5, auto-retry failures)
- [ ] T121 [P] [A8] Create quality check pipeline job in `inngest/functions/run-quality-checks.ts` (plagiarism → readability → fact-check)
- [ ] T122 [P] [A8] Create citation generation job in `inngest/functions/generate-citations.ts` (web search + insertion)

#### Week 2 Jobs
- [ ] T123 [P] [A8] Create parallel publishing job in `inngest/functions/publish-to-platforms.ts` (publish to multiple platforms, handle partial failures)
- [ ] T124 [P] [A8] Create scheduled publish job in `inngest/functions/schedule-publish.ts` (execute at configured times)
- [ ] T125 [P] [A8] Create platform analytics sync job in `inngest/functions/sync-platform-analytics.ts` (fetch engagement metrics)

#### Week 3 Jobs
- [ ] T126 [P] [A8] Create visibility tracking job in `inngest/functions/run-visibility-tracking.ts` (daily/hourly execution)
- [ ] T127 [P] [A8] Create prompt processing job in `inngest/functions/process-prompt-variations.ts` (send 50-100 prompts to 4 platforms in parallel)
- [ ] T128 [P] [A8] Create visibility score calculation job in `inngest/functions/calculate-scores.ts` (aggregate results, calculate scores, detect trends)

#### Week 5 Jobs
- [ ] T129 [P] [A8] Create optimization scanner job in `inngest/functions/run-optimization-scan.ts` (runs every 6 hours, executes 5 detection rules)
- [ ] T130 [P] [A8] Create competitor crawler job in `inngest/functions/crawl-competitors.ts` (web crawl up to 100 pages per site)
- [ ] T131 [P] [A8] Create LLMTXT generation job in `inngest/functions/generate-llmtxt.ts` (create llms.txt from all published content)
- [ ] T132 [P] [A8] Create daily digest email job in `inngest/functions/send-daily-digest.ts` (email at 9 AM with new opportunities)

- [ ] T133 [A8] Configure concurrency limits per job type (5 for generation, 10 for tracking)
- [ ] T134 [A8] Implement exponential backoff retry logic for all jobs
- [ ] T135 [A8] Test scheduled jobs execute within ±5 minutes of target time

**Checkpoint 4**: All workflows operational - Bulk generation processes 30 articles, tracking runs on schedule, scanner executes every 6 hours

---

## Phase 5: Quality Assurance & Testing (1 Agent - After Phase 4)

**Purpose**: Comprehensive test coverage and validation
**Agent**: A10 (Testing & QA)
**Duration**: 3-4 hours
**Dependencies**: Phase 4 complete

### Agent 10: QA, Testing & Integration Engineer

#### Unit Tests
- [ ] T136 [P] [A10] Create unit tests for AI services in `__tests__/unit/ai/models.test.ts` (model selection, fallback, token counting)
- [ ] T137 [P] [A10] Create unit tests for content templates in `__tests__/unit/templates/*.test.ts` (generation quality, format validation)
- [ ] T138 [P] [A10] Create unit tests for quality checks in `__tests__/unit/quality/*.test.ts` (plagiarism thresholds, readability scoring)
- [ ] T139 [P] [A10] Create unit tests for platform adapters in `__tests__/unit/adapters/*.test.ts` (content adaptation accuracy)
- [ ] T140 [P] [A10] Create unit tests for visibility scoring in `__tests__/unit/tracking/scoring.test.ts` (calculation correctness)
- [ ] T141 [P] [A10] Create unit tests for detection rules in `__tests__/unit/optimization/*.test.ts` (opportunity detection accuracy)

#### Integration Tests
- [ ] T142 [P] [A10] Create Convex database tests in `__tests__/integration/convex/*.test.ts` (mutations, queries with test data)
- [ ] T143 [P] [A10] Create API route tests in `__tests__/integration/api/*.test.ts` (webhooks, OAuth callbacks)
- [ ] T144 [P] [A10] Create Inngest job tests in `__tests__/integration/inngest/*.test.ts` (job execution with test mode)

#### E2E Tests (Critical Paths)
- [ ] T145 [A10] Create E2E test for generation flow in `__tests__/e2e/generation-flow.spec.ts` (sign up → generate article → verify quality scores)
- [ ] T146 [A10] Create E2E test for publishing flow in `__tests__/e2e/publishing-flow.spec.ts` (connect platform → publish → verify success)
- [ ] T147 [A10] Create E2E test for tracking flow in `__tests__/e2e/tracking-flow.spec.ts` (set up tracking → run tracking → view visibility score)
- [ ] T148 [A10] Create E2E test for optimization flow in `__tests__/e2e/optimization-flow.spec.ts` (scanner detects → approve → staged preview → publish)

#### Test Infrastructure
- [ ] T149 [P] [A10] Configure Vitest in `vitest.config.ts`
- [ ] T150 [P] [A10] Configure Playwright in `playwright.config.ts`
- [ ] T151 [P] [A10] Create test fixtures and mocks in `__tests__/fixtures/`
- [ ] T152 [P] [A10] Set up CI/CD pipeline with GitHub Actions (run tests on every PR)

- [ ] T153 [A10] Run full test suite and verify 80%+ code coverage
- [ ] T154 [A10] Validate all E2E flows pass end-to-end

**Checkpoint 5**: MVP validated - All tests pass, E2E flows complete successfully, ready for deployment

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final touches, documentation, deployment prep
**Duration**: 1-2 hours
**Dependencies**: Phase 5 complete

- [ ] T155 [P] Create README.md with setup instructions and architecture overview
- [ ] T156 [P] Create .env.example with all required environment variables documented
- [ ] T157 [P] Create deployment guide in docs/DEPLOYMENT.md
- [ ] T158 [P] Add error boundaries for all major dashboard sections
- [ ] T159 [P] Implement loading states for all async operations
- [ ] T160 [P] Add user-friendly error messages for all API failures
- [ ] T161 [P] Create onboarding tour for first-time users
- [ ] T162 Verify TypeScript strict mode compliance (`npx tsc --noEmit`)
- [ ] T163 Verify build succeeds for production (`npm run build`)
- [ ] T164 Deploy to Vercel production and verify all services connect
- [ ] T165 Run smoke tests on production deployment

---

## Dependencies & Execution Order

### Critical Path (Sequential)
1. **Phase 1 Foundation** (T001-T033) → MUST complete before any other work
2. **Phase 2 Core Backend** (T034-T064) → MUST complete before Phase 3
3. **Phase 3 Full Platform** (T065-T118) → MUST complete before Phase 4
4. **Phase 4 Background Jobs** (T119-T135) → MUST complete before Phase 5
5. **Phase 5 Testing** (T136-T154) → MUST complete before Phase 6
6. **Phase 6 Polish** (T155-T165) → Final phase

### Parallel Opportunities

**Phase 1**: All 3 agents (A1, A2, A9) work completely independently
- Agent 1: Database schema (no external dependencies)
- Agent 2: AI services (no external dependencies)
- Agent 9: Infrastructure setup (no external dependencies)

**Phase 2**: All 3 agents (A3, A5, A7) work independently after Phase 1
- Agent 3: Content generation logic (depends on A1 schema, A2 AI services)
- Agent 5: Tracking logic (depends on A1 schema, A2 AI services)
- Agent 7: UI scaffolding (depends on A1 for types, but can mock data)

**Phase 3**: All 3 agents (A4, A6, A7) work independently after Phase 2
- Agent 4: Publishing adapters (depends on A1 schema)
- Agent 6: Optimization scanner (depends on A1 schema, A5 tracking data)
- Agent 7: Complete all dashboards (depends on A3, A4, A5, A6 APIs)

---

## Testing Strategy

### MVP Testing Approach
- **Unit tests**: Cover critical business logic (AI services, templates, scoring algorithms)
- **Integration tests**: Validate database operations and job execution
- **E2E tests**: Ensure critical user flows work end-to-end
- **Manual testing**: Beta users test all features during Week 6 launch

### Test Coverage Goals
- 80%+ code coverage overall
- 100% coverage for AI cost calculation (prevent budget overruns)
- 100% coverage for quality check thresholds (prevent publishing bad content)
- 100% coverage for visibility scoring (ensure accurate metrics)

---

## Implementation Strategy

### MVP Scope (Week 6 Launch)
**Core Features** (MUST HAVE):
- ✅ Week 1: Generate single article with quality checks (US1 from phase-1-spec)
- ✅ Week 1: Bulk generation (30 articles in 30 minutes) (US2)
- ✅ Week 2: Publish to 3+ platforms (WordPress, Medium, LinkedIn minimum) (US1)
- ✅ Week 3: Track visibility across 4 AI platforms (US1)
- ✅ Week 5: Detect optimization opportunities (5 detection rules) (US1)

**Nice to Have** (Can defer if needed):
- Week 1: Content variations (US3)
- Week 1: Queue management (US4)
- Week 1: Quality dashboard (US5)
- Week 2: All 10 platforms (can launch with 5-6)
- Week 3: Competitor comparison (can simplify to 1-2 competitors)
- Week 5: Competitor crawler (can use manual competitor data entry initially)

### Incremental Delivery
1. **Week 1 Complete** → Users can generate content
2. **Week 2 Complete** → Users can publish generated content
3. **Week 3 Complete** → Users can track their visibility
4. **Week 5 Complete** → Users get automated optimization recommendations
5. **All Weeks** → Full MVP ready for 100 beta users

---

## Task Summary

**Total Tasks**: 165
**Parallelizable Tasks**: 142 (86% can run in parallel)

**By Agent**:
- Agent 1 (Database): 7 tasks
- Agent 2 (AI Services): 9 tasks
- Agent 3 (Content Generation): 15 tasks
- Agent 4 (Publishing): 17 tasks
- Agent 5 (Tracking): 11 tasks
- Agent 6 (Optimization): 12 tasks
- Agent 7 (Frontend UI): 55 tasks
- Agent 8 (Background Jobs): 17 tasks
- Agent 9 (Infrastructure): 17 tasks
- Agent 10 (Testing): 19 tasks
- Cross-cutting (Polish): 11 tasks

**By Phase**:
- Phase 1 (Foundation): 33 tasks (2-4 hours)
- Phase 2 (Core Backend): 32 tasks (3-5 hours)
- Phase 3 (Full Platform): 54 tasks (4-6 hours)
- Phase 4 (Background Jobs): 17 tasks (2-3 hours)
- Phase 5 (Testing): 19 tasks (3-4 hours)
- Phase 6 (Polish): 11 tasks (1-2 hours)

**Estimated Timeline**:
- Sequential execution: ~80 hours
- With 10 parallel agents: ~15-20 hours
- **Target**: 3-4 actual hours with perfect parallelization

**MVP Recommendation**: Focus on User Story 1 from each week first (T034-T048, T065-T081, T049-T059, T082-T093) for fastest time-to-value.

---

**Tasks ready for parallel execution! 🚀 Start with Phase 1 (Agents 1, 2, 9) immediately.**
