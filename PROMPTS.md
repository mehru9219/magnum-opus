# 📝 SPECKIT PROMPTS - AI Content & GEO Platform

> **Purpose**: Optimized prompts for each speckit command to build our AI Content & GEO Platform
>
> **Tech Stack**: Next.js 14, Convex, Clerk, Stripe, OpenAI/Anthropic/Perplexity APIs
>
> **Timeline**: 12 weeks from MVP to $50K MRR

---

## 📋 TABLE OF CONTENTS

1. [Core Workflow Prompts](#core-workflow-prompts)
   - [/speckit.constitution](#1-speckitconstitution)
   - [/speckit.specify](#2-speckitspecify)
   - [/speckit.plan](#3-speckitplan)
   - [/speckit.tasks](#4-speckittasks)
   - [/speckit.implement](#5-speckitimplement)

2. [Enhancement Prompts](#enhancement-prompts)
   - [/speckit.clarify](#6-speckitclarify)
   - [/speckit.analyze](#7-speckitanalyze)
   - [/speckit.checklist](#8-speckitchecklist)

3. [Phase-Specific Prompts](#phase-specific-prompts)
4. [Feature-Specific Prompts](#feature-specific-prompts)

---

## 🎯 CORE WORKFLOW PROMPTS

### 1. /speckit.constitution

**When to use**: Before starting any new phase or major feature

#### Prompt Template:

```
Create a project constitution for [FEATURE/PHASE NAME] of our AI Content & GEO Platform.

CONTEXT:
- Product: SaaS platform for AI content generation, multi-platform publishing, and AI visibility tracking
- Tech Stack: Next.js 14 App Router, Convex (realtime DB), Clerk (auth), Stripe (payments), OpenAI/Anthropic/Perplexity APIs
- Team: Expert level with Next.js, TypeScript, Convex
- Budget: Moderate ($1K-5K/month operating costs)
- Timeline: [X weeks] for this phase
- Current Phase: [Week X of 12-week roadmap]

GOALS:
- [Primary goal for this feature/phase]
- [Secondary goal]
- [Success metrics]

CONSTRAINTS:
- Must maintain sub-2s page load times
- AI API costs must stay under [X% of revenue]
- Must work with existing Convex schema without breaking changes
- Must be mobile-responsive (TailwindCSS)
- Must follow our monorepo structure (Turborepo)

PRINCIPLES TO ESTABLISH:
1. **Code Quality**: TypeScript strict mode, ESLint rules, test coverage requirements
2. **User Experience**: Real-time updates (Convex subscriptions), optimistic UI updates
3. **Performance**: Caching strategy (Upstash Redis), edge functions where appropriate
4. **Security**: Auth middleware (Clerk), rate limiting, input validation (Zod)
5. **Cost Optimization**: AI model selection strategy, caching, batch processing
6. **Scalability**: Serverless-first, queue for background jobs (Inngest)
7. **Monitoring**: Error tracking (Sentry), analytics (PostHog), logging (Axiom)

ARCHITECTURE DECISIONS NEEDED:
- [Specific architectural choices for this feature]
- [Integration points with existing systems]
- [Data modeling considerations]

Please create a constitution that:
1. Defines clear technical principles for this feature
2. Establishes coding standards and patterns
3. Specifies testing requirements
4. Defines success criteria
5. Identifies risks and mitigation strategies
6. Sets performance benchmarks
```

#### Example Usage (Phase 1, Week 1):

```
Create a project constitution for the AI Content Generation Engine (Phase 1, Week 1).

CONTEXT:
- Product: SaaS platform for AI content generation, multi-platform publishing, and AI visibility tracking
- Tech Stack: Next.js 14 App Router, Convex, Clerk, Stripe, OpenAI/Anthropic/Perplexity APIs
- Team: Expert level with Next.js, TypeScript, Convex
- Budget: $80/month for MVP (need to stay in free tiers)
- Timeline: 5 days (Monday-Friday Week 1)
- Current Phase: Week 1 of 12-week roadmap

GOALS:
- Generate 30 AI-optimized articles in 30 minutes
- Support 5 proven content templates (comparisons, how-to, listicles, problem-solvers, ultimate guides)
- Implement GEO optimization (quotes, statistics, citations)
- Build content queue and scheduling system
- Create content dashboard for monitoring

CONSTRAINTS:
- Must use free tiers of all services (Convex, OpenAI, Vercel)
- AI costs must stay under $50/month for MVP testing
- Must support multiple AI models (GPT-4, Claude, Perplexity)
- Generation time must be < 60 seconds per article
- Must handle failures gracefully (retry logic)

PRINCIPLES TO ESTABLISH:
1. **Multi-Model Strategy**: Abstract AI provider interface, easy to swap models
2. **Cost Control**: Cache duplicate prompts, use cheaper models for simple tasks
3. **Quality Assurance**: Plagiarism check, readability score, fact verification
4. **User Experience**: Real-time progress updates, streaming responses
5. **Error Handling**: Retry with exponential backoff, fallback to different model
6. **Testing**: Unit tests for content formatters, integration tests for AI calls

ARCHITECTURE DECISIONS NEEDED:
- How to structure content templates (React components? JSON configs?)
- How to implement bulk generation (sequential? parallel? queued?)
- Where to cache AI responses (Upstash Redis? Convex? Both?)
- How to track token usage per user (Convex mutation? separate table?)
- How to implement GEO optimization (post-processing? prompt engineering?)

Please create a constitution that guides our Week 1 development with clear principles and patterns.
```

---

### 2. /speckit.specify

**When to use**: After constitution is established, before planning implementation

#### Prompt Template:

```
Create a detailed specification for [FEATURE NAME] based on our project constitution.

FEATURE OVERVIEW:
- Name: [Feature name]
- User Story: As a [user type], I want to [action] so that [benefit]
- Priority: [Critical/High/Medium/Low]
- Phase: [Week X of roadmap]
- Dependencies: [List features this depends on]

FUNCTIONAL REQUIREMENTS:

1. **Core Functionality**:
   - [Requirement 1]: [Detailed description]
   - [Requirement 2]: [Detailed description]
   - [Requirement 3]: [Detailed description]

2. **User Interface**:
   - Screens/Components needed: [List]
   - User flows: [Describe step-by-step]
   - Interactions: [Buttons, forms, real-time updates]
   - Mobile experience: [Responsive requirements]

3. **API/Backend**:
   - Convex Queries needed: [List with descriptions]
   - Convex Mutations needed: [List with descriptions]
   - External API calls: [OpenAI, Stripe, etc.]
   - Background Jobs (Inngest): [List jobs needed]

4. **Data Model**:
   - Convex Tables: [Tables to create/modify]
   - Schema changes: [Field additions/modifications]
   - Indexes needed: [For query performance]
   - Relationships: [Between tables]

NON-FUNCTIONAL REQUIREMENTS:

1. **Performance**:
   - Page load time: [Target]
   - API response time: [Target]
   - Concurrent users supported: [Number]
   - Background job completion time: [Target]

2. **Security**:
   - Authentication: [Clerk middleware, protected routes]
   - Authorization: [User roles, permissions]
   - Input validation: [Zod schemas]
   - Rate limiting: [Requests per minute]

3. **Cost**:
   - Estimated AI API costs: [Per user/month]
   - Database operations: [Convex function calls]
   - Third-party services: [Any new subscriptions needed]

4. **Monitoring**:
   - Metrics to track: [PostHog events]
   - Errors to catch: [Sentry integration points]
   - Logs to capture: [Axiom logging]

TECHNICAL SPECIFICATIONS:

1. **Frontend** (Next.js):
   ```typescript
   // Example component structure
   app/
     [feature]/
       page.tsx              // Main page
       layout.tsx            // Layout wrapper
       components/
         FeatureForm.tsx     // Form component
         FeatureList.tsx     // List component
         FeatureCard.tsx     // Card component
   ```

2. **Backend** (Convex):
   ```typescript
   // Example schema
   [tableName]: defineTable({
     field1: v.string(),
     field2: v.number(),
     userId: v.id("users"),
   }).index("by_user", ["userId"])

   // Example queries/mutations needed
   - query: list[Feature]() -> returns paginated list
   - mutation: create[Feature]() -> creates new record
   - mutation: update[Feature]() -> updates existing
   - mutation: delete[Feature]() -> soft/hard delete
   ```

3. **Integration Points**:
   - [External API 1]: [How it's used, error handling]
   - [External API 2]: [How it's used, error handling]

EDGE CASES & ERROR HANDLING:

1. [Edge Case 1]: [How to handle]
2. [Edge Case 2]: [How to handle]
3. [Error Scenario 1]: [User feedback, retry logic]
4. [Error Scenario 2]: [User feedback, retry logic]

SUCCESS CRITERIA:

- [ ] [Criterion 1 - measurable]
- [ ] [Criterion 2 - measurable]
- [ ] [Criterion 3 - measurable]
- [ ] [Criterion 4 - measurable]

TESTING REQUIREMENTS:

1. **Unit Tests**:
   - [Function/component to test]
   - [Expected behavior]

2. **Integration Tests**:
   - [API flow to test]
   - [Expected outcome]

3. **E2E Tests** (Playwright):
   - [User flow to test]
   - [Success criteria]

OUT OF SCOPE (for this iteration):
- [Feature/aspect not included]
- [Future enhancement]
- [Nice-to-have not critical]
```

#### Example Usage (Content Generation Form):

```
Create a detailed specification for the AI Content Generation Form.

FEATURE OVERVIEW:
- Name: Bulk Article Generation Form
- User Story: As a content marketer, I want to input 30 topics and generate all articles in one click, so that I can quickly create a month's worth of content
- Priority: Critical (Week 1 deliverable)
- Phase: Week 1, Day 1-2
- Dependencies: Convex setup, OpenAI API integration

FUNCTIONAL REQUIREMENTS:

1. **Core Functionality**:
   - User can paste/type a list of topics (one per line or comma-separated)
   - User can select AI model (GPT-4, Claude 3.5, Perplexity, GPT-3.5)
   - User can select content template (Comparison, How-To, Listicle, Problem-Solver, Ultimate Guide)
   - User can set word count target (500-3000 words)
   - System generates all articles in background (Inngest job)
   - User sees real-time progress (0/30 completed)
   - User can view generated articles in dashboard

2. **User Interface**:
   - Screens: Article Generation page (/dashboard/generate)
   - Form with:
     * Textarea for topics (min 1, max 50 topics)
     * Dropdown for AI model selection
     * Dropdown for template selection
     * Slider for word count (500-3000)
     * "Generate Articles" button (disabled during generation)
   - Progress indicator: Progress bar + "X/Y completed" counter
   - Real-time updates using Convex subscriptions
   - Toast notifications for completion/errors

3. **API/Backend**:
   - Convex Mutation: `articles.generateBulk(topics, model, template, wordCount)`
   - Inngest Function: `generate-articles-bulk` (triggered by mutation)
   - External API: OpenAI/Anthropic/Perplexity based on model selected
   - Convex Query: `articles.listByUser()` for dashboard
   - Convex Subscription: `articles.generationProgress(userId)` for real-time updates

4. **Data Model**:
   - Convex Table: `articles`
     ```typescript
     articles: defineTable({
       userId: v.id("users"),
       title: v.string(),
       content: v.string(),
       status: v.union(
         v.literal("queued"),
         v.literal("generating"),
         v.literal("completed"),
         v.literal("failed")
       ),
       generatedBy: v.string(), // "gpt-4" | "claude-3.5-sonnet" | "perplexity"
       template: v.string(), // "comparison" | "how-to" | "listicle" | etc.
       wordCount: v.number(),
       tokensUsed: v.number(),
       estimatedCost: v.number(),
       error: v.optional(v.string()),
       createdAt: v.number(),
       completedAt: v.optional(v.number()),
     })
       .index("by_user", ["userId"])
       .index("by_user_status", ["userId", "status"])
       .index("by_status", ["status"])
     ```

   - Convex Table: `generation_jobs`
     ```typescript
     generationJobs: defineTable({
       userId: v.id("users"),
       totalArticles: v.number(),
       completedArticles: v.number(),
       failedArticles: v.number(),
       status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed")),
       startedAt: v.number(),
       completedAt: v.optional(v.number()),
     }).index("by_user", ["userId"])
     ```

NON-FUNCTIONAL REQUIREMENTS:

1. **Performance**:
   - Form validation: < 100ms
   - API mutation response: < 500ms (just queues job, doesn't wait)
   - Article generation: 30-60s per article (acceptable for background job)
   - Dashboard update latency: < 1s (Convex real-time)

2. **Security**:
   - Authentication: Clerk middleware on /dashboard routes
   - Authorization: Users can only see their own articles
   - Input validation: Zod schema for form inputs
     ```typescript
     const generateSchema = z.object({
       topics: z.array(z.string().min(5).max(200)).min(1).max(50),
       model: z.enum(["gpt-4", "claude-3.5-sonnet", "perplexity", "gpt-3.5-turbo"]),
       template: z.enum(["comparison", "how-to", "listicle", "problem-solver", "ultimate-guide"]),
       wordCount: z.number().min(500).max(3000),
     })
     ```
   - Rate limiting: Max 5 bulk generations per hour per user (free tier)

3. **Cost**:
   - GPT-4: ~$0.12 per 2000-word article (2500 tokens in + out)
   - Claude: ~$0.05 per 2000-word article
   - Target: < $3 for 30 articles using mixed strategy
   - Cache prompts in Redis (24h TTL) to avoid duplicate generation

4. **Monitoring**:
   - PostHog events: "bulk_generation_started", "article_completed", "article_failed"
   - Sentry: Catch AI API errors, timeout errors
   - Axiom logs: Log token usage, cost, generation time per article

TECHNICAL SPECIFICATIONS:

1. **Frontend** (Next.js):
   ```typescript
   // app/dashboard/generate/page.tsx
   "use client"

   export default function GeneratePage() {
     const [topics, setTopics] = useState<string>("")
     const [model, setModel] = useState<AIModel>("gpt-4")
     const [template, setTemplate] = useState<Template>("how-to")
     const [wordCount, setWordCount] = useState(1000)
     const [isGenerating, setIsGenerating] = useState(false)

     const generateArticles = useMutation(api.articles.generateBulk)
     const progress = useQuery(api.articles.generationProgress)

     const handleSubmit = async (e: FormEvent) => {
       e.preventDefault()
       const topicArray = topics.split("\n").filter(t => t.trim())

       await generateArticles({
         topics: topicArray,
         model,
         template,
         wordCount
       })

       toast.success(`Started generating ${topicArray.length} articles!`)
       router.push("/dashboard")
     }

     return (
       <Card>
         <CardHeader>
           <CardTitle>Bulk Article Generation</CardTitle>
         </CardHeader>
         <CardContent>
           <form onSubmit={handleSubmit}>
             <Textarea
               placeholder="Enter topics (one per line)"
               value={topics}
               onChange={(e) => setTopics(e.target.value)}
               rows={10}
             />

             <Select value={model} onValueChange={setModel}>
               <SelectTrigger>
                 <SelectValue placeholder="Select AI Model" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="gpt-4">GPT-4 Turbo (Highest Quality)</SelectItem>
                 <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet (Balanced)</SelectItem>
                 <SelectItem value="gpt-3.5-turbo">GPT-3.5 (Fastest/Cheapest)</SelectItem>
               </SelectContent>
             </Select>

             <Select value={template} onValueChange={setTemplate}>
               {/* Template options */}
             </Select>

             <div>
               <Label>Word Count: {wordCount}</Label>
               <Slider
                 value={[wordCount]}
                 onValueChange={([value]) => setWordCount(value)}
                 min={500}
                 max={3000}
                 step={100}
               />
             </div>

             <Button type="submit" disabled={isGenerating || !topics.trim()}>
               {isGenerating ? "Generating..." : "Generate Articles"}
             </Button>
           </form>
         </CardContent>
       </Card>
     )
   }
   ```

2. **Backend** (Convex):
   ```typescript
   // convex/articles.ts
   import { v } from "convex/values"
   import { mutation, query } from "./_generated/server"
   import { inngest } from "../inngest/client"

   export const generateBulk = mutation({
     args: {
       topics: v.array(v.string()),
       model: v.string(),
       template: v.string(),
       wordCount: v.number(),
     },
     handler: async (ctx, args) => {
       const user = await getCurrentUser(ctx)
       if (!user) throw new Error("Unauthorized")

       // Create generation job
       const jobId = await ctx.db.insert("generationJobs", {
         userId: user._id,
         totalArticles: args.topics.length,
         completedArticles: 0,
         failedArticles: 0,
         status: "running",
         startedAt: Date.now(),
       })

       // Create article stubs
       const articleIds = await Promise.all(
         args.topics.map(topic =>
           ctx.db.insert("articles", {
             userId: user._id,
             title: topic,
             content: "",
             status: "queued",
             generatedBy: args.model,
             template: args.template,
             wordCount: args.wordCount,
             tokensUsed: 0,
             estimatedCost: 0,
             createdAt: Date.now(),
           })
         )
       )

       // Trigger Inngest workflow
       await inngest.send({
         name: "article.generate.bulk",
         data: {
           jobId,
           articleIds,
           model: args.model,
           template: args.template,
           wordCount: args.wordCount,
         },
       })

       return { jobId, articleIds }
     },
   })

   export const generationProgress = query({
     args: {},
     handler: async (ctx) => {
       const user = await getCurrentUser(ctx)
       if (!user) return null

       const job = await ctx.db
         .query("generationJobs")
         .withIndex("by_user", q => q.eq("userId", user._id))
         .order("desc")
         .first()

       return job
     },
   })
   ```

3. **Background Job** (Inngest):
   ```typescript
   // inngest/functions/generate-articles-bulk.ts
   import { inngest } from "../client"
   import { openai } from "@ai-sdk/openai"
   import { anthropic } from "@ai-sdk/anthropic"
   import { generateText } from "ai"

   export const generateArticlesBulk = inngest.createFunction(
     { id: "generate-articles-bulk", concurrency: 5 }, // Max 5 parallel
     { event: "article.generate.bulk" },
     async ({ event, step }) => {
       const { jobId, articleIds, model, template, wordCount } = event.data

       // Process each article
       for (const articleId of articleIds) {
         await step.run(`generate-${articleId}`, async () => {
           try {
             // Get article details
             const article = await convex.query(api.articles.get, { id: articleId })

             // Update status to generating
             await convex.mutation(api.articles.updateStatus, {
               id: articleId,
               status: "generating",
             })

             // Generate content
             const prompt = buildPrompt(article.title, template, wordCount)
             const modelConfig = getModelConfig(model)

             const result = await generateText({
               model: modelConfig,
               prompt,
               temperature: 0.7,
               maxTokens: Math.ceil(wordCount * 1.5),
             })

             // Update article with content
             await convex.mutation(api.articles.updateContent, {
               id: articleId,
               content: result.text,
               status: "completed",
               tokensUsed: result.usage.totalTokens,
               estimatedCost: calculateCost(model, result.usage.totalTokens),
               completedAt: Date.now(),
             })

             // Update job progress
             await convex.mutation(api.generationJobs.incrementCompleted, { id: jobId })

           } catch (error) {
             // Handle failure
             await convex.mutation(api.articles.updateStatus, {
               id: articleId,
               status: "failed",
               error: error.message,
             })

             await convex.mutation(api.generationJobs.incrementFailed, { id: jobId })
           }
         })
       }

       // Mark job as completed
       await step.run("complete-job", async () => {
         await convex.mutation(api.generationJobs.complete, { id: jobId })
       })
     }
   )
   ```

EDGE CASES & ERROR HANDLING:

1. **Empty topics list**: Disable submit button, show validation error
2. **Duplicate topics**: Show warning, allow user to proceed or dedupe
3. **AI API timeout**: Retry 3 times with exponential backoff, then mark as failed
4. **AI API rate limit**: Queue remaining articles, retry after delay
5. **User navigates away**: Generation continues in background (Inngest)
6. **User reaches plan limit**: Show upgrade modal, queue remaining articles
7. **Network error**: Show toast notification, articles remain in "queued" state for retry

SUCCESS CRITERIA:

- [ ] User can generate 30 articles in < 30 minutes
- [ ] Real-time progress updates work without page refresh
- [ ] Failed articles show clear error messages
- [ ] User can retry failed articles
- [ ] AI costs stay under $3 for 30 articles
- [ ] 95% success rate for generation (5% failure acceptable)
- [ ] Mobile-responsive form works on all screen sizes

TESTING REQUIREMENTS:

1. **Unit Tests**:
   - `buildPrompt()`: Test all 5 template types
   - `calculateCost()`: Test for all AI models
   - Form validation: Test all edge cases

2. **Integration Tests**:
   - Convex mutation: Test article creation and job creation
   - AI API: Test with mock responses (don't hit real API)
   - Background job: Test with 1 article, verify completion

3. **E2E Tests** (Playwright):
   - Full flow: Enter topics → Select options → Generate → View dashboard
   - Error handling: Test with invalid API key, verify error message
   - Real-time updates: Verify progress bar updates

OUT OF SCOPE (for this iteration):
- Article editing (Week 2)
- Scheduled generation (Week 2)
- Content preview before generation (Week 2)
- Bulk export (Week 3)
- Advanced GEO optimization (Week 5)
```

---

### 3. /speckit.plan

**When to use**: After specification is complete, before breaking into tasks

#### Prompt Template:

```
Create an implementation plan for [FEATURE NAME] based on the specification.

SPECIFICATION SUMMARY:
[Paste key points from /speckit.specify output]

IMPLEMENTATION APPROACH:

Break down into logical steps:

1. **Phase 1: Foundation** (Day 1)
   - Set up basic structure
   - Create database schema
   - Write core utilities

2. **Phase 2: Backend Implementation** (Day 2)
   - Implement Convex queries/mutations
   - Set up background jobs (if needed)
   - Add error handling

3. **Phase 3: Frontend Implementation** (Day 3-4)
   - Build UI components
   - Integrate with backend
   - Add real-time updates

4. **Phase 4: Testing & Polish** (Day 5)
   - Write tests
   - Fix bugs
   - Optimize performance
   - Add monitoring

FILE STRUCTURE:

```
app/
  dashboard/
    [feature]/
      page.tsx
      components/
        [Component1].tsx
        [Component2].tsx
      actions.ts (Server Actions if needed)

convex/
  [feature].ts (queries/mutations)

inngest/
  functions/
    [feature]-job.ts (background jobs)

lib/
  [feature]/
    utils.ts
    types.ts
    constants.ts

components/
  ui/
    [shadcn components needed]

__tests__/
  [feature]/
    unit/
    integration/
    e2e/
```

IMPLEMENTATION ORDER:

Day-by-day breakdown with specific tasks:

**Day 1: Foundation**
- [ ] Create Convex schema for [tables]
- [ ] Deploy schema changes
- [ ] Create types in `lib/[feature]/types.ts`
- [ ] Set up constants
- [ ] Create basic page structure

**Day 2: Backend**
- [ ] Implement Convex query: [query1]
- [ ] Implement Convex mutation: [mutation1]
- [ ] Implement Convex mutation: [mutation2]
- [ ] Set up Inngest function (if needed)
- [ ] Add error handling and retries
- [ ] Test mutations in Convex dashboard

**Day 3: Frontend (Part 1)**
- [ ] Create [Component1] with Shadcn/ui
- [ ] Create [Component2] with Shadcn/ui
- [ ] Integrate form validation (React Hook Form + Zod)
- [ ] Connect to Convex mutations

**Day 4: Frontend (Part 2)**
- [ ] Add real-time updates (Convex subscriptions)
- [ ] Implement loading states
- [ ] Add error handling (toast notifications)
- [ ] Mobile responsive styling

**Day 5: Testing & Polish**
- [ ] Write unit tests for utilities
- [ ] Write integration tests for API
- [ ] Write E2E test for happy path
- [ ] Add PostHog tracking events
- [ ] Add Sentry error boundaries
- [ ] Performance optimization
- [ ] Documentation

DEPENDENCIES:

External:
- [ ] [API key needed]
- [ ] [Service account setup]

Internal:
- [ ] [Other feature that must be completed first]
- [ ] [Database changes required]

RISKS & MITIGATION:

1. **Risk**: [Specific risk]
   - **Mitigation**: [How to address]
   - **Contingency**: [Backup plan]

2. **Risk**: [Specific risk]
   - **Mitigation**: [How to address]
   - **Contingency**: [Backup plan]

TESTING STRATEGY:

1. **Manual Testing**:
   - Test Case 1: [Description]
   - Test Case 2: [Description]
   - Test Case 3: [Description]

2. **Automated Testing**:
   - Unit tests: [What to test]
   - Integration tests: [What to test]
   - E2E tests: [Critical path]

3. **Performance Testing**:
   - Load test: [Scenario]
   - Stress test: [Scenario]

DEPLOYMENT PLAN:

1. **Development**: Push to feature branch, auto-deploy to Vercel preview
2. **Testing**: Manual QA on preview deployment
3. **Staging**: Merge to `develop` branch, deploy to staging
4. **Production**: Merge to `main`, auto-deploy to production
5. **Monitoring**: Watch Sentry, PostHog for 24h post-launch

ROLLBACK PLAN:

If critical issues found:
1. Revert commit on `main` branch
2. Re-deploy previous version
3. Fix issues in feature branch
4. Re-test before re-deploying

SUCCESS METRICS:

- [ ] [Measurable metric 1]
- [ ] [Measurable metric 2]
- [ ] [Measurable metric 3]
```

#### Example Usage (Content Generation Plan):

```
Create an implementation plan for the Bulk Article Generation feature.

SPECIFICATION SUMMARY:
- Feature: Form to generate 30 articles from topics list
- AI models: GPT-4, Claude, Perplexity, GPT-3.5
- Templates: 5 types (comparison, how-to, listicle, problem-solver, ultimate guide)
- Background processing with Inngest
- Real-time progress updates via Convex
- Target: 30 articles in < 30 minutes

IMPLEMENTATION APPROACH:

1. **Phase 1: Database & Types** (Monday AM)
   - Set up Convex schema
   - Create TypeScript types
   - Deploy schema

2. **Phase 2: AI Integration** (Monday PM)
   - Set up Vercel AI SDK
   - Create prompt templates
   - Test with each AI model

3. **Phase 3: Backend Logic** (Tuesday)
   - Convex mutations for article creation
   - Inngest job for bulk generation
   - Progress tracking

4. **Phase 4: Frontend** (Wednesday-Thursday)
   - Generation form UI
   - Real-time progress display
   - Dashboard integration

5. **Phase 5: Testing & Deploy** (Friday)
   - Write tests
   - Performance optimization
   - Deploy to production

FILE STRUCTURE:

```
app/
  dashboard/
    generate/
      page.tsx                    # Main generation form page
      components/
        GenerateForm.tsx          # Form component
        ModelSelector.tsx         # AI model dropdown
        TemplateSelector.tsx      # Template dropdown
        ProgressTracker.tsx       # Real-time progress display

convex/
  schema.ts                       # Add articles & generationJobs tables
  articles.ts                     # Queries/mutations for articles
  generationJobs.ts              # Queries/mutations for jobs

inngest/
  functions/
    generate-articles-bulk.ts   # Background job for generation

lib/
  ai/
    prompts.ts                  # Prompt templates for each content type
    models.ts                   # AI model configurations
    cost-calculator.ts          # Token usage → cost calculator
  content/
    templates.ts                # Content template definitions
    validators.ts               # Zod schemas for validation

components/
  ui/
    card.tsx                    # Shadcn card
    button.tsx                  # Shadcn button
    form.tsx                    # Shadcn form
    select.tsx                  # Shadcn select
    textarea.tsx                # Shadcn textarea
    slider.tsx                  # Shadcn slider
    progress.tsx                # Shadcn progress bar

__tests__/
  articles/
    unit/
      prompts.test.ts           # Test prompt generation
      cost-calculator.test.ts   # Test cost calculations
    integration/
      articles.test.ts          # Test Convex mutations
    e2e/
      generate-flow.spec.ts     # Test full generation flow
```

IMPLEMENTATION ORDER:

**Monday AM: Foundation (3 hours)**
- [x] Create Convex schema for `articles` table
- [x] Create Convex schema for `generationJobs` table
- [x] Deploy schema to Convex
- [x] Create TypeScript types in `lib/ai/types.ts`
- [x] Create constants in `lib/ai/constants.ts`
- [x] Set up prompt templates structure

**Monday PM: AI Integration (4 hours)**
- [x] Install Vercel AI SDK: `npm install ai @ai-sdk/openai @ai-sdk/anthropic`
- [x] Create AI model configurations in `lib/ai/models.ts`
- [x] Create prompt templates for each content type in `lib/ai/prompts.ts`
- [x] Test generation with GPT-4 (console test)
- [x] Test generation with Claude (console test)
- [x] Implement cost calculator
- [x] Add caching layer (Upstash Redis setup)

**Tuesday AM: Backend - Convex (3 hours)**
- [x] Implement `articles.generateBulk` mutation
- [x] Implement `articles.get` query
- [x] Implement `articles.listByUser` query
- [x] Implement `articles.updateStatus` mutation
- [x] Implement `articles.updateContent` mutation
- [x] Implement `generationJobs.create` mutation
- [x] Implement `generationJobs.incrementCompleted` mutation
- [x] Test mutations in Convex dashboard

**Tuesday PM: Backend - Inngest (4 hours)**
- [x] Install Inngest: `npm install inngest`
- [x] Set up Inngest client in `/inngest/client.ts`
- [x] Create `generate-articles-bulk` function
- [x] Implement article generation loop
- [x] Add error handling and retries (3 attempts)
- [x] Test with 1 article first
- [x] Test with 5 articles
- [x] Add logging (Axiom)

**Wednesday: Frontend - Form (6 hours)**
- [x] Create `/app/dashboard/generate/page.tsx`
- [x] Create `GenerateForm.tsx` component
- [x] Add Shadcn components: Textarea, Select, Slider, Button
- [x] Implement form state management (useState)
- [x] Add form validation (Zod schema)
- [x] Connect to `articles.generateBulk` mutation
- [x] Add error handling (toast notifications)
- [x] Test form submission
- [x] Mobile responsive styling

**Thursday: Frontend - Real-time Updates (6 hours)**
- [x] Create `ProgressTracker.tsx` component
- [x] Set up Convex subscription for `generationProgress`
- [x] Add progress bar (Shadcn Progress component)
- [x] Add "X/Y completed" counter
- [x] Add real-time article list updates
- [x] Test with 10 articles
- [x] Add celebration animation on completion
- [x] Add error state display

**Friday: Testing & Polish (6 hours)**
- [x] Write unit tests for `buildPrompt()` function
- [x] Write unit tests for `calculateCost()` function
- [x] Write integration test for `articles.generateBulk`
- [x] Write E2E test for full flow (Playwright)
- [x] Add PostHog event tracking
- [x] Add Sentry error boundaries
- [x] Performance optimization (lazy loading, code splitting)
- [x] Update documentation
- [x] Deploy to production
- [x] Monitor for 2 hours post-launch

DEPENDENCIES:

External:
- [x] OpenAI API key (set in env: `OPENAI_API_KEY`)
- [x] Anthropic API key (set in env: `ANTHROPIC_API_KEY`)
- [x] Perplexity API key (set in env: `PERPLEXITY_API_KEY`)
- [x] Inngest app ID and signing key (set in env)
- [x] Upstash Redis URL and token (for caching)

Internal:
- [x] Clerk authentication must be working
- [x] User management in Convex
- [x] Basic dashboard layout

RISKS & MITIGATION:

1. **Risk**: AI API rate limits hit during testing
   - **Mitigation**: Use free tier accounts for different APIs, rotate between models
   - **Contingency**: Add queue system, process slower if rate limited

2. **Risk**: Generation takes longer than 30 minutes for 30 articles
   - **Mitigation**: Parallel processing with Inngest (5 concurrent)
   - **Contingency**: Increase concurrency to 10, or use faster models (GPT-3.5)

3. **Risk**: Inngest free tier limit exceeded (50K steps/month)
   - **Mitigation**: Monitor usage in Inngest dashboard
   - **Contingency**: Upgrade to paid plan ($50/month) or optimize job steps

4. **Risk**: Real-time updates don't work (Convex subscription issues)
   - **Mitigation**: Test thoroughly in development
   - **Contingency**: Fall back to polling every 5 seconds

5. **Risk**: Generated content quality is poor
   - **Mitigation**: Test prompts manually, iterate on prompt templates
   - **Contingency**: Add "regenerate" button for failed articles

TESTING STRATEGY:

1. **Manual Testing**:
   - Test Case 1: Generate 1 article with GPT-4, verify quality
   - Test Case 2: Generate 5 articles with mixed models, verify all complete
   - Test Case 3: Test error handling (invalid API key, network error)
   - Test Case 4: Test progress updates (watch real-time counter)
   - Test Case 5: Mobile testing on iPhone/Android

2. **Automated Testing**:
   - Unit tests: Prompt generation for all 5 templates
   - Unit tests: Cost calculation for all models
   - Integration tests: Convex mutations (create, update, list)
   - E2E test: Full generation flow (5 articles, verify dashboard)

3. **Performance Testing**:
   - Load test: 10 concurrent users generating 30 articles each
   - Stress test: 100 articles generation, verify no timeouts

DEPLOYMENT PLAN:

1. **Development**:
   - Push to `feature/article-generation` branch
   - Auto-deploy to Vercel preview URL
   - Share with team for feedback

2. **Testing**:
   - Manual QA on preview deployment
   - Run automated test suite
   - Check Sentry for errors

3. **Staging**:
   - Merge to `develop` branch
   - Deploy to staging environment
   - Run smoke tests

4. **Production**:
   - Merge PR to `main` branch
   - Auto-deploy to production (Vercel)
   - Monitor Sentry, PostHog for 24h

5. **Monitoring**:
   - Watch error rate (should be < 1%)
   - Watch API costs (should be < $50 for first week)
   - Watch user engagement (PostHog events)

ROLLBACK PLAN:

If critical issues found:
1. Identify issue in Sentry
2. Revert commit on `main` branch: `git revert <commit-hash>`
3. Push to trigger re-deployment
4. Fix issues in feature branch
5. Re-test thoroughly before re-deploying

SUCCESS METRICS:

- [x] 30 articles generated in < 30 minutes
- [x] < 5% failure rate
- [x] Real-time updates work without page refresh
- [x] AI costs < $3 for 30 articles
- [x] 0 critical errors in Sentry
- [x] Page load time < 2s
- [x] Mobile responsive (tested on 3+ devices)
```

---

### 4. /speckit.tasks

**When to use**: After implementation plan is finalized, before coding

#### Prompt Template:

```
Generate actionable tasks from the implementation plan for [FEATURE NAME].

FORMAT: GitHub Issues / Linear tickets style

For each task:
- Title (clear, actionable)
- Description (what needs to be done)
- Acceptance criteria (how to verify it's done)
- Priority (P0/P1/P2/P3)
- Estimated time (hours)
- Dependencies (blocks/blocked by)
- Labels (frontend/backend/testing/docs)

---

TASKS:

## 🏗️ Foundation Tasks

### Task 1: Set up Convex Schema for Articles
**Priority**: P0 (Critical)
**Estimate**: 1 hour
**Labels**: backend, database
**Assignee**: [Developer name]
**Dependencies**: None

**Description**:
Create the Convex schema for the `articles` table with all required fields for content generation.

**Implementation Details**:
- Open `convex/schema.ts`
- Add `articles` table definition
- Include fields: userId, title, content, status, generatedBy, template, wordCount, tokensUsed, estimatedCost, error, createdAt, completedAt
- Add indexes: by_user, by_user_status, by_status
- Deploy schema with `npx convex deploy`

**Acceptance Criteria**:
- [ ] Schema deployed successfully to Convex
- [ ] Can insert test article via Convex dashboard
- [ ] Indexes created and queryable
- [ ] TypeScript types auto-generated

**Code Location**: `convex/schema.ts`

---

### Task 2: Set up Convex Schema for Generation Jobs
**Priority**: P0 (Critical)
**Estimate**: 0.5 hours
**Labels**: backend, database
**Dependencies**: None

**Description**:
Create the Convex schema for tracking bulk generation jobs.

**Implementation Details**:
- Add `generationJobs` table to `convex/schema.ts`
- Fields: userId, totalArticles, completedArticles, failedArticles, status, startedAt, completedAt
- Add index: by_user
- Deploy schema

**Acceptance Criteria**:
- [ ] Schema deployed
- [ ] Can query jobs by user
- [ ] Status field validates correctly

---

### Task 3: Create TypeScript Types
**Priority**: P1 (High)
**Estimate**: 0.5 hours
**Labels**: backend, types
**Dependencies**: Task 1, Task 2

**Description**:
Create shared TypeScript types for the feature.

**Implementation Details**:
- Create `lib/ai/types.ts`
- Export types: `AIModel`, `ContentTemplate`, `ArticleStatus`, `GenerationJob`
- Import Convex auto-generated types
- Add Zod schemas for validation

**Acceptance Criteria**:
- [ ] Types compile without errors
- [ ] Used in at least 2 files
- [ ] Zod schemas validate correctly

---

## 🤖 AI Integration Tasks

### Task 4: Set up Vercel AI SDK
**Priority**: P0 (Critical)
**Estimate**: 0.5 hours
**Labels**: backend, setup
**Dependencies**: None

**Description**:
Install and configure Vercel AI SDK for multi-model support.

**Implementation Details**:
```bash
npm install ai @ai-sdk/openai @ai-sdk/anthropic
```
- Add API keys to `.env.local`
- Create test script to verify connection
- Test with simple prompt

**Acceptance Criteria**:
- [ ] Package installed
- [ ] Can generate text with OpenAI
- [ ] Can generate text with Anthropic
- [ ] No errors in console

---

### Task 5: Create Prompt Templates
**Priority**: P0 (Critical)
**Estimate**: 2 hours
**Labels**: backend, ai
**Dependencies**: Task 3

**Description**:
Create prompt templates for each content type (comparison, how-to, listicle, problem-solver, ultimate guide).

**Implementation Details**:
- Create `lib/ai/prompts.ts`
- Function: `buildPrompt(topic: string, template: ContentTemplate, wordCount: number): string`
- Each template should include:
  - Role instruction
  - Content type guidelines
  - GEO optimization instructions
  - Word count target
  - Formatting requirements

**Acceptance Criteria**:
- [ ] 5 templates implemented
- [ ] Each template tested with sample topic
- [ ] Generated content matches template style
- [ ] Prompts include GEO optimization instructions
- [ ] Unit tests written for `buildPrompt()`

---

[Continue with remaining tasks...]

---

## 📊 Final Checklist

**Before marking feature complete**:
- [ ] All P0 tasks completed
- [ ] All P1 tasks completed (or explicitly moved to next iteration)
- [ ] All tests passing
- [ ] Deployed to production
- [ ] Monitored for 24h (no critical errors)
- [ ] Documentation updated
- [ ] Team demo completed
```

#### Example Usage (Article Generation Tasks):

```
Generate actionable tasks for the Bulk Article Generation feature implementation plan.

Break down the 5-day plan into granular tasks that can be tracked in GitHub Issues.

Include:
- Database setup tasks
- AI integration tasks
- Backend logic tasks
- Frontend UI tasks
- Testing tasks
- Deployment tasks

Format as GitHub Issues with:
- Clear titles
- Detailed descriptions
- Acceptance criteria
- Time estimates
- Dependencies
```

---

### 5. /speckit.implement

**When to use**: When ready to start coding, after all tasks are defined

#### Prompt Template:

```
Implement [SPECIFIC TASK] from the task list.

TASK CONTEXT:
- Task ID: [Task number/ID]
- Title: [Task title]
- Priority: [P0/P1/P2]
- Dependencies: [List completed dependencies]

IMPLEMENTATION REQUIREMENTS:

1. **Follow existing patterns**:
   - Use established coding style
   - Match existing file structure
   - Follow naming conventions
   - Use shared utilities where applicable

2. **Code Quality**:
   - TypeScript strict mode
   - ESLint compliance
   - Proper error handling
   - Meaningful variable names
   - Comments for complex logic

3. **Testing**:
   - Write unit tests for utilities
   - Test happy path
   - Test error cases
   - Test edge cases

4. **Documentation**:
   - Add JSDoc comments for public functions
   - Update README if needed
   - Add inline comments for complex logic

STEP-BY-STEP IMPLEMENTATION:

1. **Create/Update Files**:
   - [File path 1]: [What to implement]
   - [File path 2]: [What to implement]

2. **Write Code**:
   - Implement core functionality
   - Add error handling
   - Add logging/monitoring

3. **Test**:
   - Manual testing steps
   - Automated test implementation

4. **Review**:
   - Self-review checklist
   - Test against acceptance criteria

ACCEPTANCE CRITERIA:
[List from task definition]

VERIFICATION STEPS:

After implementation:
1. Run `npm run typecheck` - should pass
2. Run `npm run lint` - should pass
3. Run `npm run test` - should pass
4. Manual test: [Specific steps]
5. Check Convex dashboard: [What to verify]
6. Check Vercel deployment: [What to verify]

Please implement this task following the requirements above.
```

#### Example Usage (Implement Convex Schema):

```
Implement Task 1: Set up Convex Schema for Articles

TASK CONTEXT:
- Task ID: #1
- Title: Set up Convex Schema for Articles
- Priority: P0
- Dependencies: None (first task)

IMPLEMENTATION REQUIREMENTS:

1. **File to modify**: `convex/schema.ts`

2. **Code to add**:
   - Import necessary types from convex
   - Define `articles` table with all fields
   - Add 3 indexes for efficient querying
   - Ensure proper TypeScript types

3. **Fields required**:
   - userId (reference to users table)
   - title (string)
   - content (string)
   - status (union: "queued" | "generating" | "completed" | "failed")
   - generatedBy (string: AI model used)
   - template (string: content template type)
   - wordCount (number)
   - tokensUsed (number)
   - estimatedCost (number in dollars)
   - error (optional string)
   - createdAt (timestamp)
   - completedAt (optional timestamp)

4. **Indexes required**:
   - by_user (on userId) - for listing user's articles
   - by_user_status (on userId + status) - for filtered lists
   - by_status (on status) - for admin views

ACCEPTANCE CRITERIA:
- [ ] Schema compiles without TypeScript errors
- [ ] Can insert test article via Convex dashboard
- [ ] All 3 indexes work (test queries)
- [ ] Types auto-generated in _generated/dataModel.d.ts

VERIFICATION STEPS:

1. Run `npx convex dev` - should show "Schema updated"
2. Open Convex dashboard → Data → articles table
3. Insert test record manually
4. Run query: `db.query("articles").withIndex("by_user").collect()`
5. Verify TypeScript autocomplete works in editor

Please implement the schema following the requirements above.
```

---

## 🔧 ENHANCEMENT PROMPTS

### 6. /speckit.clarify

**When to use**: Before /speckit.plan if requirements are ambiguous

#### Prompt Template:

```
Clarify ambiguous requirements for [FEATURE NAME] before creating implementation plan.

CURRENT UNDERSTANDING:
[Paste specification or requirements]

AREAS OF UNCERTAINTY:

1. **[Area 1 - e.g., User Experience]**:
   - Question: [Specific question about UX flow]
   - Impact if wrong: [What could go wrong]
   - Options: [List possible approaches]

2. **[Area 2 - e.g., Technical Implementation]**:
   - Question: [Specific technical question]
   - Impact if wrong: [Technical debt, performance, etc.]
   - Options: [List alternatives]

3. **[Area 3 - e.g., Data Model]**:
   - Question: [Question about data structure]
   - Impact if wrong: [Migration complexity, query performance]
   - Options: [List schema options]

4. **[Area 4 - e.g., Integration]**:
   - Question: [Question about third-party integration]
   - Impact if wrong: [Cost, reliability, vendor lock-in]
   - Options: [List alternatives]

DECISION FRAMEWORK:

For each question, consider:
- **User Impact**: How does this affect user experience?
- **Technical Complexity**: How hard to implement?
- **Cost**: AI API costs, infrastructure costs
- **Scalability**: Will this work at 10x scale?
- **Maintainability**: How easy to change later?
- **Timeline**: Does this fit in the 12-week roadmap?

RECOMMENDATIONS:

Provide recommended answers with rationale, but also present alternatives for discussion.

OUTPUT FORMAT:

For each area of uncertainty, provide:
1. Recommended approach (with reasoning)
2. Alternative approaches (pros/cons)
3. Questions for stakeholders (if any)
4. Risks if we proceed without clarification
```

#### Example Usage (Tracking System Clarification):

```
Clarify ambiguous requirements for the AI Visibility Tracking System (Week 3).

CURRENT UNDERSTANDING:
- Track ChatGPT, Claude, Perplexity, Gemini rankings
- Test 100+ prompt variations
- Track in 100+ countries (Week 4)
- Compare competitors

AREAS OF UNCERTAINTY:

1. **Authentication with AI Platforms**:
   - Question: How do we authenticate with ChatGPT for scraping? Do we use:
     a) User's own ChatGPT account (they provide session token)
     b) Our own ChatGPT Plus accounts (we manage, users don't need accounts)
     c) Mix of both (users can BYO or use ours)
   - Impact if wrong: If we use our accounts, costs could be high. If users provide tokens, onboarding friction increases.
   - Options:
     * Option A: User provides session token (Pros: No cost for us, Cons: Friction, security concerns)
     * Option B: We manage accounts (Pros: Better UX, Cons: High cost, account management complexity)
     * Option C: Hybrid approach (Pros: Flexibility, Cons: More code complexity)

2. **Tracking Frequency**:
   - Question: How often do we track rankings?
     a) Real-time (on-demand when user clicks "Check Now")
     b) Scheduled (every 6 hours, daily, weekly)
     c) Smart scheduling (more frequent for important keywords)
   - Impact if wrong: Real-time is expensive (proxy costs, API costs). Too infrequent means stale data.
   - Options:
     * Option A: On-demand only (Cost: Low, Freshness: User-controlled)
     * Option B: Fixed schedule every 6h (Cost: Medium, Freshness: Good)
     * Option C: Smart scheduling (Cost: Optimized, Freshness: Best, Complexity: High)

3. **Result Storage Strategy**:
   - Question: How much historical data do we store?
     a) All responses forever (expensive, rich data)
     b) Just citation status + ranking (cheap, limited data)
     c) Full responses for 30 days, then summary (balanced)
   - Impact if wrong: Storage costs, query performance, analytics capabilities
   - Options:
     * Option A: Full forever (DB size grows fast, rich historical analysis)
     * Option B: Minimal data (Cheap, but can't show "what changed")
     * Option C: Time-based retention (Balanced, most practical)

4. **Proxy Service**:
   - Question: Do we need proxies for Week 3 MVP, or can we start without (US-only)?
   - Impact if wrong: If we build without proxies, harder to add later. If we add too early, costs increase.
   - Options:
     * Option A: Start with direct connections (US only) - Save money, faster development
     * Option B: Add Bright Data from Week 3 - Ready for global, higher cost
     * Option C: Use free proxies initially - Unreliable, but good for testing

DECISION FRAMEWORK:

For tracking system:
- **User Impact**: High - this is a unique feature, must work reliably
- **Cost**: Medium-High - proxies + AI API calls can get expensive
- **Scalability**: Must work for 1000+ users
- **Timeline**: Week 3 for MVP (basic tracking), Week 4 for global

RECOMMENDATIONS:

1. **Authentication**: Start with Option B (we manage accounts) for MVP
   - Reasoning: Better UX, easier onboarding
   - Migration path: Add Option A (BYO account) in Week 7 for cost-conscious users
   - Risk: Account management complexity, but worth it for UX

2. **Tracking Frequency**: Start with Option B (scheduled every 6h)
   - Reasoning: Balances cost and freshness
   - Migration path: Add Option A (on-demand) in Week 5, Option C (smart) in Week 8
   - Risk: May miss rapid ranking changes, acceptable for MVP

3. **Result Storage**: Option C (full for 30 days, then summary)
   - Reasoning: Best balance of cost and utility
   - Implementation: Use Convex for recent data, archive to R2 after 30 days
   - Risk: Archiving logic adds complexity, but manageable

4. **Proxy Service**: Option A for Week 3 (US only), Option B for Week 4
   - Reasoning: Save $500/month in Week 3, add proxies once validated
   - Risk: Users may expect global from day 1, mitigate with clear roadmap

QUESTIONS FOR STAKEHOLDERS:

1. Are users willing to wait 6 hours for tracking updates, or do they need real-time?
2. Is US-only tracking acceptable for MVP, or must we launch with global support?
3. What's the budget for proxy services? ($500/month = 100 countries, $100/month = 10 countries)
4. Should we support ChatGPT-4 only, or also GPT-3.5? (Different results, 2x scraping)

RISKS IF WE PROCEED WITHOUT CLARIFICATION:

- May build expensive system that doesn't fit budget
- May build system that doesn't meet user expectations
- May lock ourselves into architecture that's hard to change
- May miss opportunity to use APIs instead of scraping (if available)
```

---

### 7. /speckit.analyze

**When to use**: After /speckit.tasks, before /speckit.implement

#### Prompt Template:

```
Analyze cross-artifact consistency and alignment for [FEATURE NAME].

ARTIFACTS TO ANALYZE:
1. Constitution (principles, constraints)
2. Specification (requirements, design)
3. Implementation Plan (approach, timeline)
4. Task List (breakdown, estimates)

ANALYSIS DIMENSIONS:

## 1. Completeness Check

**Are all requirements covered by tasks?**
- Review each requirement in spec
- Verify corresponding task exists
- Flag missing tasks

**Are all tasks mapped to requirements?**
- Review each task
- Verify it traces to a requirement
- Flag "orphan tasks" (not needed)

## 2. Consistency Check

**Do tasks align with implementation plan?**
- Verify task order matches plan
- Check time estimates match plan timeline
- Flag discrepancies

**Do implementation details match specification?**
- Verify all spec'd components have implementation tasks
- Check data models match schema definitions
- Flag inconsistencies

**Do principles from constitution align with implementation?**
- Check if implementation follows stated principles
- Verify constraints are respected
- Flag violations

## 3. Risk Assessment

**Are dependencies properly sequenced?**
- Verify tasks with dependencies come after blockers
- Check for circular dependencies
- Suggest reordering if needed

**Are estimates realistic?**
- Sum total hours, compare to timeline
- Flag tasks with suspicious estimates (too high/low)
- Suggest buffer time

**Are external dependencies accounted for?**
- Verify API keys, services, accounts listed
- Check setup time included in estimates
- Flag missing prerequisites

## 4. Quality Check

**Is testing adequate?**
- Verify unit tests for all utilities
- Verify integration tests for critical paths
- Verify E2E tests for user flows
- Flag gaps in test coverage

**Is monitoring/observability included?**
- Verify PostHog events defined
- Verify Sentry error tracking added
- Verify Axiom logging included
- Flag missing instrumentation

**Is documentation included?**
- Verify README updates planned
- Verify JSDoc comments mentioned
- Verify inline comments for complex logic

## 5. Alignment with Broader Goals

**Does this feature fit 12-week roadmap?**
- Verify timeline matches roadmap phase
- Check if this blocks other features
- Flag scope creep

**Does this support success metrics?**
- Verify how this feature moves the needle
- Check if success criteria are measurable
- Suggest metrics if missing

**Does this fit budget constraints?**
- Verify no new services outside budget
- Check AI API costs estimated
- Flag potential cost overruns

OUTPUT FORMAT:

### ✅ Strengths
- [What's well-aligned]
- [What's thorough]
- [What's realistic]

### ⚠️ Issues Found
- [Inconsistency 1]: [Description and impact]
- [Inconsistency 2]: [Description and impact]
- [Gap 1]: [What's missing]

### 💡 Recommendations
1. [Specific action to fix issue]
2. [Specific action to improve quality]
3. [Specific action to reduce risk]

### 📊 Summary Metrics
- Requirements: X total, Y covered by tasks, Z missing
- Tasks: X total, Y estimated hours, Z expected days
- Tests: X unit, Y integration, Z E2E
- Budget: $X estimated monthly cost
- Timeline: X days (Y buffer)

### ✅ Sign-off
Ready to implement: [YES/NO with conditions]
```

#### Example Usage (Article Generation Analysis):

```
Analyze cross-artifact consistency for the Bulk Article Generation feature.

ARTIFACTS:
1. Constitution: Week 1 AI Content Generation principles
2. Specification: Bulk Article Generation Form spec
3. Implementation Plan: 5-day plan (Mon-Fri)
4. Task List: 28 tasks total

Perform deep analysis to ensure:
- All requirements have corresponding tasks
- All tasks align with the plan
- Estimates are realistic
- Testing is adequate
- Nothing is missing

Provide specific recommendations before we start implementation.
```

---

### 8. /speckit.checklist

**When to use**: After /speckit.plan, before /speckit.implement

#### Prompt Template:

```
Generate quality checklists for [FEATURE NAME] to validate completeness, clarity, and consistency.

Create checklists for:
1. Requirements Quality
2. Design Quality
3. Implementation Readiness
4. Testing Coverage
5. Deployment Readiness

---

## 1. REQUIREMENTS QUALITY CHECKLIST

### Clarity
- [ ] Each requirement has a clear "success criterion"
- [ ] No ambiguous words ("should", "might", "probably")
- [ ] All technical terms defined
- [ ] User stories follow format: "As a [role], I want [action], so that [benefit]"

### Completeness
- [ ] Happy path defined
- [ ] Error cases defined
- [ ] Edge cases identified
- [ ] Performance requirements specified
- [ ] Security requirements specified
- [ ] Mobile requirements specified

### Testability
- [ ] Each requirement can be tested
- [ ] Acceptance criteria are measurable
- [ ] Success metrics defined

### Feasibility
- [ ] No impossible requirements (given constraints)
- [ ] Timeline realistic
- [ ] Budget realistic
- [ ] Team has necessary skills

---

## 2. DESIGN QUALITY CHECKLIST

### Architecture
- [ ] Fits existing architecture
- [ ] No unnecessary complexity
- [ ] Scalability considered
- [ ] Error handling strategy defined
- [ ] Caching strategy defined (if needed)
- [ ] Background job strategy defined (if needed)

### Data Model
- [ ] Convex schema defined
- [ ] Indexes identified for performance
- [ ] Relationships between tables clear
- [ ] Data validation rules defined
- [ ] Migration path (if modifying existing schema)

### API Design
- [ ] Convex queries/mutations list complete
- [ ] Function signatures defined
- [ ] Error responses defined
- [ ] Rate limiting strategy

### UI/UX
- [ ] Wireframes or mockups (if needed)
- [ ] Component hierarchy defined
- [ ] Loading states defined
- [ ] Error states defined
- [ ] Empty states defined
- [ ] Mobile responsive strategy

---

## 3. IMPLEMENTATION READINESS CHECKLIST

### Prerequisites
- [ ] All dependencies installed
- [ ] All API keys obtained
- [ ] All accounts created
- [ ] Development environment set up
- [ ] Access to necessary services (Convex, Clerk, etc.)

### Code Structure
- [ ] File structure planned
- [ ] Naming conventions established
- [ ] Shared utilities identified
- [ ] Types/interfaces defined

### Dependencies
- [ ] Task dependencies identified
- [ ] Blocked tasks clearly marked
- [ ] External dependencies documented
- [ ] Risk mitigation plans for dependencies

### Team Readiness
- [ ] Team members assigned
- [ ] Skills gaps identified (if any)
- [ ] Communication plan established
- [ ] Review process defined

---

## 4. TESTING COVERAGE CHECKLIST

### Unit Tests
- [ ] All utility functions have unit tests
- [ ] All business logic functions have unit tests
- [ ] Edge cases covered
- [ ] Error cases covered
- [ ] Mocking strategy defined

### Integration Tests
- [ ] All Convex mutations have integration tests
- [ ] All Convex queries have integration tests
- [ ] External API calls mocked
- [ ] Error scenarios tested

### E2E Tests
- [ ] Happy path E2E test defined
- [ ] Critical user flows tested
- [ ] Cross-browser testing plan (if needed)
- [ ] Mobile testing plan

### Performance Tests
- [ ] Load testing plan (if needed)
- [ ] Performance benchmarks defined
- [ ] Optimization strategy if benchmarks not met

### Manual Testing
- [ ] Manual test cases written
- [ ] QA checklist prepared
- [ ] Test data prepared

---

## 5. DEPLOYMENT READINESS CHECKLIST

### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] ESLint configured and passing
- [ ] Prettier configured
- [ ] No console.logs (use proper logging)
- [ ] No hardcoded values (use env vars)
- [ ] Error boundaries added (React)

### Security
- [ ] Input validation (Zod schemas)
- [ ] Authentication on protected routes
- [ ] Authorization checks (user can only access their data)
- [ ] Rate limiting implemented
- [ ] No secrets in code (use env vars)
- [ ] CORS configured properly

### Monitoring
- [ ] PostHog events added
- [ ] Sentry error tracking added
- [ ] Axiom logging added (for debugging)
- [ ] Cost tracking (AI API usage)

### Documentation
- [ ] README updated (if needed)
- [ ] API documentation (if external API)
- [ ] JSDoc comments for public functions
- [ ] Inline comments for complex logic
- [ ] Migration guide (if breaking changes)

### Deployment
- [ ] Environment variables set (production)
- [ ] Database schema deployed (Convex)
- [ ] Feature flag (if needed for rollout)
- [ ] Rollback plan documented
- [ ] Monitoring dashboard ready

### Post-Deployment
- [ ] Smoke test plan
- [ ] Monitoring checklist (first 24h)
- [ ] Incident response plan
- [ ] User communication plan (if needed)

---

## SCORING

For each checklist, calculate:
- **Total items**: Count of checklist items
- **Completed**: Items checked off
- **Score**: (Completed / Total) × 100%
- **Grade**:
  - A: 90-100% (Excellent)
  - B: 80-89% (Good)
  - C: 70-79% (Acceptable)
  - D: 60-69% (Needs Improvement)
  - F: < 60% (Not Ready)

**Overall Readiness**: Average of all checklist scores

**Recommendation**:
- 90%+: Ready to implement
- 80-89%: Ready with minor improvements
- 70-79%: Complete gaps before implementing
- < 70%: Significant work needed, do not implement yet
```

#### Example Usage (Article Generation Checklist):

```
Generate quality checklists for the Bulk Article Generation feature before we start implementation.

Validate:
1. Requirements are clear and complete
2. Design is solid
3. We're ready to start coding
4. Testing strategy is comprehensive
5. Deployment plan is thorough

Provide a scored assessment with go/no-go recommendation.
```

---

## 📅 PHASE-SPECIFIC PROMPTS

### Phase 1: Core Engine (Weeks 1-3)

#### Week 1: AI Content Generation

```
/speckit.constitution

Create constitution for AI Content Generation Engine (Week 1).

Focus areas:
- Multi-model AI strategy (GPT-4, Claude, Perplexity)
- Cost optimization (caching, model selection)
- Quality assurance (plagiarism, readability)
- Bulk generation performance
- GEO optimization approach

Establish:
- Prompt engineering best practices
- Error handling for AI APIs
- Token usage tracking
- Cost calculation methods
- Quality scoring system
```

#### Week 2: Multi-Platform Publishing

```
/speckit.specify

Create specification for Multi-Platform Publishing System.

Platforms (Priority order):
1. WordPress (REST API)
2. Shopify (Admin API)
3. Webflow (API)
4. Medium (API)
5. LinkedIn (API)
6. Dev.to (API)

Requirements:
- One-click publish to multiple platforms
- Content adaptation per platform (format, length)
- Retry logic for failures
- Publishing scheduler (optimal times)
- Status tracking per platform

Focus on:
- Adapter pattern for each platform
- Background job orchestration (Inngest)
- Error handling and retry strategies
- Rate limiting per platform API
```

#### Week 3: AI Visibility Tracking

```
/speckit.clarify

Clarify requirements for AI Visibility Tracking Core (Week 3).

Ambiguous areas:
1. How to authenticate with AI platforms?
2. How often to track (real-time vs scheduled)?
3. How much data to store (full responses vs summaries)?
4. Which prompt variations to test (100s mentioned)?
5. How to determine "ranking" (AI doesn't rank like Google)?

Need decisions on:
- Scraping strategy (Playwright + proxies)
- Citation extraction method
- Competitor comparison approach
- Prompt simulation engine design
```

---

### Phase 2: Intelligence & Scale (Weeks 4-6)

#### Week 4: Global Tracking

```
/speckit.plan

Create implementation plan for Global Tracking System (100+ countries).

Components:
1. Proxy infrastructure (Bright Data setup)
2. Country-specific testing system
3. Language-specific prompt variations
4. Regional AI behavior detection
5. Global dashboard (world map)

Technical approach:
- Proxy rotation strategy
- Country code → proxy mapping
- Language detection and translation
- Regional data storage (Convex schema)
- Map visualization (Recharts or Mapbox)

Timeline: 5 days
Budget: +$500/month for proxies
```

#### Week 5: Smart Optimization Detector

```
/speckit.specify

Create specification for Smart Optimization Detector (Week 5).

Feature: Automatically detect and fix SEO/GEO opportunities.

Detection rules:
1. "Update headings & intro keywords"
2. "Add new FAQs to site"
3. "Refresh metadata for top pages"
4. "Upload latest LLMTXT"
5. "Add internal links"

Requirements:
- Scanner runs every 6 hours (Inngest cron)
- AI-powered analysis (GPT-4)
- Priority scoring system
- One-click fixes
- Progress tracking
- Notifications (email, Slack)

Architecture:
- How to scan user's site?
- How to analyze content?
- How to generate fixes?
- How to apply fixes automatically?
```

#### Week 6: MVP Launch

```
/speckit.checklist

Generate launch readiness checklist for MVP (Week 6).

Validate:
1. All Week 1-5 features complete and tested
2. Authentication working (Clerk)
3. Payments working (Stripe)
4. Monitoring in place (Sentry, PostHog)
5. Documentation complete
6. Onboarding flow polished
7. Demo video recorded
8. Product Hunt submission ready
9. AppSumo listing ready
10. Launch day plan

Include:
- Pre-launch checklist
- Launch day checklist
- Post-launch monitoring checklist
- Week 1 support checklist
```

---

### Phase 3: Advanced Features (Weeks 7-9)

#### Week 7: AI Backlink Network

```
/speckit.tasks

Generate tasks for AI Backlink Network implementation (Week 7).

Features:
- Citation building system
- Automatic submission (SlideShare, Medium, GitHub, Academia.edu)
- HARO automation
- Press release generator
- Guest post pitch automation
- Citation tracking dashboard

Break down into:
- Content creation tasks
- API integration tasks
- Automation workflow tasks
- Tracking and reporting tasks

Priority: Focus on highest-ROI backlink sources first.
```

#### Week 8: Advanced Content Intelligence

```
/speckit.specify

Create specification for Advanced Content Intelligence (Week 8).

Features:
1. Competitor content analyzer (find gaps)
2. Trending topic detector
3. Seasonal opportunity identifier
4. Content performance predictor
5. A/B testing for titles/formats
6. Auto-optimization based on performance
7. Content refresh system
8. Pillar page builder

Focus on:
- How to analyze competitor content (scraping? APIs?)
- How to detect trends (Twitter API? Google Trends?)
- How to predict performance (ML model? Heuristics?)
- How to A/B test (Vercel Edge Middleware? PostHog?)
```

#### Week 9: Keyword Research Automation

```
/speckit.plan

Create plan for Keyword Research Automation (Week 9).

Goal: Fully automated keyword → content pipeline

Components:
1. People Also Ask scraper
2. Reddit/Quora question miner
3. Google Suggest integration
4. Competitor keyword gap finder
5. AI response likelihood scorer
6. Opportunity prioritization
7. Content calendar generator
8. Bulk content brief generator

Integration: Connect to Week 1 content generation system

Output: One-click "Generate content for top 30 opportunities"
```

---

### Phase 4: Enterprise & Scale (Weeks 10-12)

#### Week 10: Enterprise Features

```
/speckit.constitution

Create constitution for Enterprise Features (Week 10).

Enterprise requirements:
- Multi-brand management
- Team collaboration (roles, permissions)
- Approval workflows
- White-label options
- Client reporting portal
- API access for developers
- Webhooks
- SSO (Clerk Organizations)

Principles:
- Multi-tenancy architecture
- Role-based access control
- Audit logging
- API rate limiting
- SLA guarantees
- Enterprise security standards
```

#### Week 11: Performance & Optimization

```
/speckit.tasks

Generate tasks for Performance & Optimization (Week 11).

Focus areas:
1. API cost optimization (caching, batching)
2. Generation speed (parallel processing)
3. Database optimization (indexes, queries)
4. CDN setup (Cloudflare)
5. Queue system (Inngest optimization)
6. Failover systems
7. Load testing
8. Security audit
9. GDPR compliance

Goal: Platform ready for 1000+ users

Benchmarks:
- Page load < 2s
- API response < 500ms
- 99.9% uptime
- Handle 100 concurrent bulk generations
```

#### Week 12: Growth Launch

```
/speckit.checklist

Generate Growth Launch checklist (Week 12).

Validate readiness for scale:

**Product**:
- [ ] All features Week 1-11 complete
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] GDPR compliant

**Marketing**:
- [ ] Case studies (3+ beta users)
- [ ] Affiliate program ready
- [ ] Agency partnerships
- [ ] AppSumo listing live
- [ ] Influencer outreach done
- [ ] Paid ads campaign ready

**Growth**:
- [ ] Pricing updated ($149/month base)
- [ ] Version 2.0 roadmap ready
- [ ] Investor deck ready (Series A)
- [ ] Team hiring plan

**Metrics**:
- [ ] Track to $50K MRR
- [ ] 500+ paying customers
- [ ] 3+ enterprise clients
```

---

## 🎯 FEATURE-SPECIFIC PROMPTS

### Content Generation Features

```
/speckit.specify

Create specification for [Content Template Type] template.

Template: [Comparison / How-To / Listicle / Problem-Solver / Ultimate Guide]

Requirements:
- Prompt structure optimized for this content type
- GEO optimization built-in (quotes, stats, citations)
- Target word count handling
- Formatting guidelines
- Internal linking suggestions
- Meta description generation
- FAQ section generation

Example topics to test:
1. [Topic 1]
2. [Topic 2]
3. [Topic 3]

Success criteria:
- Generated content matches template style
- Readability score > 60 (Flesch Reading Ease)
- 0% plagiarism
- Includes 3+ credible citations
- Contains semantic keywords (LSI)
```

### Publishing Features

```
/speckit.implement

Implement [Platform Name] publishing adapter.

Platform: [WordPress / Shopify / Webflow / Medium / LinkedIn / Dev.to]

Requirements:
1. Adapter class with methods:
   - `authenticate(credentials)`: Verify API access
   - `publish(article)`: Publish article
   - `update(articleId, article)`: Update existing
   - `delete(articleId)`: Remove article
   - `getStatus(articleId)`: Check publication status

2. Content formatting:
   - Convert markdown to platform format
   - Handle images (upload, embed)
   - Handle code blocks (if developer platform)
   - Truncate if length limit

3. Error handling:
   - Rate limiting (wait and retry)
   - Authentication errors (notify user)
   - Validation errors (fix and retry)
   - Network errors (retry with backoff)

4. Testing:
   - Unit tests with mocked API
   - Integration tests with sandbox account
   - E2E test with real publication (then cleanup)

Implementation: Follow adapter pattern in `lib/publishers/`
```

### Tracking Features

```
/speckit.clarify

Clarify tracking implementation for [AI Platform].

Platform: [ChatGPT / Claude / Perplexity / Gemini]

Questions:

1. **Authentication Method**:
   - How to authenticate? (Session token? API key? Browser login?)
   - Where do we get credentials? (User provides? We manage?)

2. **Scraping vs API**:
   - Does platform have official API for this?
   - If scraping, what's the DOM structure?
   - How stable is the UI (risk of breaking)?

3. **Response Format**:
   - How are citations displayed?
   - How do we extract cited sources?
   - How do we determine ranking/order?

4. **Rate Limits**:
   - What are the rate limits?
   - How do we respect them?
   - What happens if we exceed?

5. **Cost**:
   - Is there a cost per query?
   - How does this affect our pricing?

Provide:
- Recommended approach
- Risks and mitigation
- Alternative if primary approach fails
- Cost estimate
```

### Optimization Features

```
/speckit.tasks

Generate tasks for "[Optimization Type]" detector.

Optimization: [Update headings / Add FAQs / Refresh metadata / Upload LLMTXT / Add links]

Components:
1. Detection logic (how to identify opportunity)
2. Opportunity scoring (priority/impact)
3. Fix generation (AI generates solution)
4. Fix application (automatically apply or suggest)
5. Progress tracking (before/after metrics)
6. Notification (email/Slack when found)

Break down into:
- Analysis tasks (how to detect)
- AI integration tasks (use GPT-4 to analyze)
- Automation tasks (apply fixes)
- UI tasks (show opportunities)
- Testing tasks (verify detection accuracy)

Success criteria:
- 80%+ detection accuracy (compared to manual review)
- < 5 minute analysis time per site
- Fixes improve ranking (verify after 7 days)
```

---

## 📝 BEST PRACTICES

### 1. Always Start with Constitution
Before any feature, establish principles and constraints. This prevents scope creep and misalignment.

### 2. Clarify Before Planning
If anything is ambiguous, use /speckit.clarify. It's faster to ask questions upfront than to rebuild later.

### 3. Specify Before Implementing
Write detailed specs with acceptance criteria. "Code is 10x faster than debugging."

### 4. Break Plans into Small Tasks
Each task should be < 4 hours. If longer, break it down further. Small tasks = clear progress.

### 5. Implement One Task at a Time
Focus. Complete one task fully (code + tests + docs) before moving to next.

### 6. Analyze Before Big Implementations
Use /speckit.analyze for multi-day features. Catch issues before writing code.

### 7. Use Checklists for Quality Gates
Before deploying, run through checklists. Catches 80% of issues.

### 8. Document Decisions
Every /speckit.clarify decision should be documented in DECISIONS.md for future reference.

---

## 🚀 QUICK REFERENCE

### Typical Workflow

```
1. /speckit.constitution    → Establish principles (30 min)
2. /speckit.clarify        → Resolve ambiguities (optional, 30 min)
3. /speckit.specify        → Detailed requirements (2 hours)
4. /speckit.plan          → Implementation strategy (1 hour)
5. /speckit.checklist     → Quality validation (optional, 30 min)
6. /speckit.tasks         → Actionable breakdown (1 hour)
7. /speckit.analyze       → Consistency check (optional, 30 min)
8. /speckit.implement     → Code! (days/weeks)
```

### When to Use Each Command

| Command | Use When | Time Investment | ROI |
|---------|----------|----------------|-----|
| constitution | Starting new phase/feature | 30 min | High |
| specify | Before any implementation | 2 hours | Very High |
| plan | After spec, before tasks | 1 hour | High |
| tasks | Ready to break down work | 1 hour | Very High |
| implement | Ready to code | N/A | N/A |
| clarify | Requirements unclear | 30 min | Very High |
| analyze | Before big features | 30 min | Medium |
| checklist | Before deploying | 30 min | High |

---

## 🎯 SUCCESS METRICS

Track effectiveness of speckit process:

- **Time to implement**: Faster with clear specs
- **Bug rate**: Lower with thorough analysis
- **Rework rate**: Lower with clarification upfront
- **Test coverage**: Higher with planning
- **Deploy confidence**: Higher with checklists

**Goal**: 50% less rework, 2x faster implementation, 90%+ test coverage

---

This is a living document. Update prompts as you discover what works best for your team and project.
