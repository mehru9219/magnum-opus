# Parallel Agent Execution Plan - Magnum Opus MVP

**Project**: Magnum Opus - AI-Powered Content Generation & GEO Platform
**Scope**: Weeks 1, 2, 3, 5 (MVP Implementation)
**Execution Model**: 10 Specialized Agents Running in Parallel
**Estimated Timeline**: 3-4 hours with perfect parallelization (~18 hours total agent work)

---

## Quick Start

### Prerequisites
- Access to 10 parallel Claude Code instances
- All environment variables configured (.env with API keys)
- Fresh Next.js 14 + Convex project initialized
- Git repository ready

### Execution Order

**Phase 1 - Foundation (START IMMEDIATELY)**:
```bash
# Run these 3 agents in parallel:
Agent 1: Database Schema Architect
Agent 2: AI Services Infrastructure
Agent 9: Authentication & Infrastructure
```

**Phase 2 - Core Backend (After Phase 1 Complete)**:
```bash
# Run these 3 agents in parallel:
Agent 3: Content Generation Backend
Agent 5: AI Tracking Backend
Agent 7: Frontend UI (with mocked data initially)
```

**Phase 3 - Publishing & Optimization (After Phase 2 Complete)**:
```bash
# Run these 3 agents in parallel:
Agent 4: Multi-Platform Publishing
Agent 6: Smart Optimization Scanner
Agent 7: Frontend UI (complete integration with real APIs)
```

**Phase 4 - Orchestration (After Phase 3 Complete)**:
```bash
# Run sequentially:
Agent 8: Background Jobs & Workflows
```

**Phase 5 - Quality Assurance (After Phase 4 Complete)**:
```bash
# Run final agent:
Agent 10: QA & Testing
```

---

## Agent Specifications

Each agent has a dedicated specification file with:
- **Mission & Scope**: What this agent is responsible for
- **File Structure**: Exact files to create with paths
- **Implementation Guide**: Step-by-step instructions
- **Code Patterns**: Examples and conventions
- **Dependencies**: What this agent needs from others
- **Integration Points**: How to connect with other agents
- **Completion Checklist**: How to verify the work is done

### Agent Files

1. [**agent-01-database-schema.md**](./agent-01-database-schema.md) - Database Schema Architect
2. [**agent-02-ai-services.md**](./agent-02-ai-services.md) - AI Services Infrastructure Engineer
3. [**agent-03-content-generation.md**](./agent-03-content-generation.md) - Content Generation Backend Developer
4. [**agent-04-publishing.md**](./agent-04-publishing.md) - Multi-Platform Publishing Backend Developer
5. [**agent-05-tracking.md**](./agent-05-tracking.md) - AI Visibility Tracking Backend Developer
6. [**agent-06-optimization.md**](./agent-06-optimization.md) - Smart Optimization Scanner Backend Developer
7. [**agent-07-frontend-ui.md**](./agent-07-frontend-ui.md) - Frontend UI/UX Engineer (Shadcn Specialist)
8. [**agent-08-background-jobs.md**](./agent-08-background-jobs.md) - Background Jobs & Workflow Orchestrator
9. [**agent-09-infrastructure.md**](./agent-09-infrastructure.md) - Authentication, Infrastructure & DevOps Engineer
10. [**agent-10-testing.md**](./agent-10-testing.md) - QA, Testing & Integration Engineer

---

## Shared Conventions

All agents MUST follow these standards:

### Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: Convex (real-time, serverless)
- **Background Jobs**: Inngest (workflows, scheduling)
- **Authentication**: Clerk (OAuth, user management)
- **UI Components**: Shadcn/ui (copy-paste components)
- **Styling**: TailwindCSS
- **AI SDKs**: Vercel AI SDK + direct API calls
- **Deployment**: Vercel (frontend + Convex backend)

### Code Style
- **TypeScript**: Strict mode enabled (`"strict": true` in tsconfig.json)
- **Naming Conventions**:
  - camelCase: variables, functions, parameters
  - PascalCase: React components, TypeScript types/interfaces
  - kebab-case: file names
  - UPPER_SNAKE_CASE: environment variables, constants
- **File Organization**:
  - Convex backend: `convex/[domain].ts` (e.g., `convex/articles.ts`)
  - Libraries: `lib/[feature]/[module].ts` (e.g., `lib/ai/models.ts`)
  - UI Components: `components/ui/[component].tsx` (Shadcn), `components/[feature]/[component].tsx` (custom)
  - App pages: `app/[route]/page.tsx`
  - Inngest jobs: `inngest/functions/[job-name].ts`

### Error Handling
- Always use try-catch for external API calls
- Never expose raw error messages to users
- Log errors to console in development, Sentry in production
- Return user-friendly error messages

### API Patterns
- **Convex Queries**: Read-only, reactive (auto-update UI)
- **Convex Mutations**: Write operations, return `{ success: boolean, error?: string }`
- **Server Actions**: Next.js server actions for form submissions
- **Inngest Jobs**: Long-running, retryable, idempotent

### Git Workflow
- Each agent works in separate feature branch: `agent-01-schema`, `agent-02-ai-services`, etc.
- Commit frequently with descriptive messages
- After phase completion, merge all agent branches to `main`

---

## Integration Checkpoints

### Checkpoint 1: After Phase 1 (Foundation Layer)
**Verify**:
- [ ] `npx convex dev` starts without errors
- [ ] All database tables show in Convex dashboard
- [ ] AI services can make test call to OpenAI API
- [ ] Clerk sign-in page loads at `/sign-in`

**Test Commands**:
```bash
npx convex dev
npm run dev
# Visit http://localhost:3000/sign-in
```

### Checkpoint 2: After Phase 2 (Core Backend)
**Verify**:
- [ ] Can generate single article via Convex mutation
- [ ] Quality checks return scores (plagiarism, readability)
- [ ] Can create tracked keyword and run test tracking
- [ ] UI dashboards render with mocked data

**Test Commands**:
```bash
npx convex run articles:generateArticle --args '{"topic": "Test Article", "template": "listicle", "model": "gpt-4"}'
```

### Checkpoint 3: After Phase 3 (Publishing & Optimization)
**Verify**:
- [ ] Can connect WordPress account via OAuth
- [ ] Can publish article to WordPress
- [ ] Optimization scanner detects at least 1 opportunity
- [ ] All dashboards display real data from backend

### Checkpoint 4: After Phase 4 (Orchestration)
**Verify**:
- [ ] Bulk generation Inngest job processes 10 articles
- [ ] Tracking job runs on daily schedule
- [ ] Optimization scanner job runs every 6 hours
- [ ] Daily digest email job triggers correctly

### Checkpoint 5: After Phase 5 (QA)
**Verify**:
- [ ] All unit tests pass (`npm run test`)
- [ ] E2E tests complete successfully (`npm run test:e2e`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Build succeeds (`npm run build`)

---

## Communication Protocol

### Agent Collaboration
- **Slack/Discord Channel**: Use for real-time coordination
- **Status Updates**: Each agent posts completion status after their phase
- **Blockers**: If blocked waiting for another agent, @mention them immediately
- **Code Reviews**: After phase completion, review integration points together

### Example Status Update Format
```
Agent 3 (Content Generation) - STATUS: COMPLETE ✅
- Created: convex/articles.ts, lib/content-templates/, lib/quality-check/
- Exported: Article types in convex/_generated/
- Integration ready for: Agent 4 (needs articles to publish), Agent 7 (UI can display)
- Blockers: None
- Next: Waiting for Agent 4, 5, 6 to complete Phase 3
```

---

## Troubleshooting

### Common Issues

**Issue**: Convex schema won't compile
**Solution**: Check for circular dependencies, ensure all imports are correct, run `npx convex dev --clear` to reset

**Issue**: Type errors from another agent's code
**Solution**: Ensure that agent completed their work and pushed types to `convex/_generated/`. Run `npx convex codegen` to regenerate types

**Issue**: OAuth callbacks failing
**Solution**: Check environment variables are set, verify callback URLs in platform settings match your localhost/deployment URL

**Issue**: Inngest jobs not triggering
**Solution**: Ensure Inngest dev server is running (`npx inngest-cli dev`), check job is registered in `inngest/client.ts`

**Issue**: Merge conflicts between agents
**Solution**: Agents should work on separate files/directories. If conflict occurs, the later agent should resolve by integrating both changes

---

## Success Criteria

### MVP Definition of Done

**Functional Requirements**:
- [x] Generate 30 articles in under 30 minutes (bulk generation)
- [x] Publish to 3+ platforms simultaneously (WordPress, Medium, LinkedIn minimum)
- [x] Track visibility across 4 AI platforms (ChatGPT, Claude, Perplexity, Gemini)
- [x] Detect 8-15 optimization opportunities per scan
- [x] All 5 detection rules working (keywords, FAQs, metadata, LLMTXT, internal links)

**Performance Requirements**:
- [ ] Dashboard loads in <2 seconds
- [ ] API response times <200ms (p95)
- [ ] Background jobs complete within SLA (bulk gen: 30min, tracking: 15min, scan: 15min)

**Quality Requirements**:
- [ ] 80%+ test coverage
- [ ] Zero TypeScript errors
- [ ] All E2E flows passing
- [ ] No console errors in production build

**Deployment Requirements**:
- [ ] Deploys successfully to Vercel
- [ ] All environment variables configured in Vercel
- [ ] Convex backend deployed to production
- [ ] Monitoring tools active (Sentry, PostHog, Axiom)

---

## Post-Implementation

### After All Agents Complete

1. **Final Integration**: Merge all agent branches to `main`
2. **E2E Testing**: Run full E2E test suite (`npm run test:e2e`)
3. **Production Deployment**: Deploy to Vercel (`vercel --prod`)
4. **Smoke Testing**: Test critical paths in production
5. **Documentation**: Update README with setup instructions
6. **Launch Prep**: Prepare demo video, Product Hunt submission

---

**Read the individual agent specification files for detailed implementation instructions. Good luck! 🚀**
