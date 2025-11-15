# Phase 1 Specification: Core Engine (Weeks 1-3)

**Created**: 2025-11-15
**Status**: Draft
**Roadmap Reference**: 12weekroadmap.md - PHASE 1: CORE ENGINE

---

# Week 1: AI Content Generation Foundation

**Timeline**: Days 1-5
**Goal**: Build the engine that generates high-quality, AI-optimized content
**Deliverable**: System that can generate 30 AI-optimized articles in 30 minutes

## User Scenarios & Testing

### User Story 1 - Generate Single Article with AI (Priority: P1)

A content creator wants to generate a single blog article on a specific topic using AI, with automatic quality checks and GEO optimization.

**Why this priority**: Core value proposition - if users can't generate quality content, nothing else matters. This is the foundation for all other features.

**Independent Test**: Can be fully tested by submitting a topic like "Best project management tools for remote teams" and receiving a published-ready article with citations, passing all quality checks.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I enter a topic "10 Best AI Tools for Content Writers" and select "Listicle" template and "GPT-4" model, **Then** the system generates a complete article within 2 minutes with proper structure, citations, and quality scores displayed
2. **Given** I generate an article that fails quality checks (e.g., 4% plagiarism), **When** the system auto-regenerates, **Then** I see regeneration attempts (up to 3) with updated quality scores
3. **Given** I want to customize generation, **When** I select tone (professional/casual), length (800-2000 words), and target audience, **Then** the generated content matches my specifications
4. **Given** generation fails after 3 attempts, **When** I view the failed article, **Then** I see specific failure reasons (plagiarism: 3.2%, threshold: <2%) and option to edit manually or retry with different model

---

### User Story 2 - Bulk Article Generation (Priority: P2)

An agency needs to generate 30 articles from a list of topics for a client content calendar, with progress tracking and failure handling.

**Why this priority**: Differentiator from competitors - bulk generation at scale saves hours of work. Required for the "$30 articles in 30 minutes" deliverable.

**Independent Test**: Can be fully tested by uploading a CSV with 30 topics and verifying all articles are generated, queued, and categorized (success/failed) within 30 minutes.

**Acceptance Scenarios**:

1. **Given** I have 30 topics in a CSV/list, **When** I upload them and click "Generate Bulk", **Then** I see a progress tracker showing articles being generated in parallel (5 concurrent)
2. **Given** bulk generation is running, **When** 5 articles fail quality checks after retries, **Then** generation continues for remaining 25 articles and I can download successful ones immediately
3. **Given** bulk job completes, **When** I view results dashboard, **Then** I see 25 successful articles (ready to publish), 5 failed articles (with failure reasons), total tokens used, and cost breakdown
4. **Given** I have failed articles, **When** I click "Retry Failed" on a specific article, **Then** the system re-generates that article with option to try a different AI model

---

### User Story 3 - Content Variation Generation (Priority: P2)

A marketer wants to create multiple versions of the same topic from different angles to test which performs best (A/B testing).

**Why this priority**: Advanced feature that increases content output diversity and enables testing. Important for agencies managing multiple clients.

**Independent Test**: Can be fully tested by requesting 3 variations of "Email Marketing Best Practices" and verifying each has unique angle, tone, and structure while covering the same core topic.

**Acceptance Scenarios**:

1. **Given** I have a topic "Email Marketing Best Practices", **When** I select "Generate Variations" and specify 3 variations, **Then** I receive 3 articles with different angles: (1) beginner-focused how-to, (2) advanced strategies, (3) case study approach
2. **Given** I generate variations, **When** I review them side-by-side, **Then** I see comparison view highlighting unique points, shared content, and quality scores for each
3. **Given** variations are generated, **When** I select a preferred version, **Then** I can queue it for publishing while archiving others

---

### User Story 4 - Content Queue Management (Priority: P3)

A solo blogger wants to schedule generated articles for future publishing and manage their content calendar.

**Why this priority**: Necessary for workflow automation but doesn't provide immediate value without publishing integrations (Week 2). Can be added after core generation works.

**Independent Test**: Can be fully tested by generating 10 articles, adding them to queue with scheduled dates, and verifying they appear in calendar view organized by date.

**Acceptance Scenarios**:

1. **Given** I have 10 generated articles, **When** I add them to the queue with future dates, **Then** I see a calendar view with articles distributed across dates
2. **Given** I have queued articles, **When** I drag-and-drop an article to a different date, **Then** the schedule updates and I see confirmation
3. **Given** I view my queue, **When** I filter by status (draft/scheduled/published), template type, or AI model, **Then** I see only matching articles

---

### User Story 5 - Quality Control Dashboard (Priority: P3)

A content manager wants to view quality metrics across all generated content to identify patterns and optimize settings.

**Why this priority**: Analytics feature that helps optimize the system over time but not critical for initial generation. Can be simplified for MVP.

**Independent Test**: Can be fully tested by generating 20 articles and viewing aggregated metrics: average plagiarism score, readability distribution, fact-check pass rate, and model performance comparison.

**Acceptance Scenarios**:

1. **Given** I have generated 50 articles across all 4 AI models, **When** I view quality dashboard, **Then** I see model comparison: GPT-4 (avg plagiarism: 0.8%), Claude (1.2%), Perplexity (1.5%), Gemini (1.1%)
2. **Given** I view quality trends, **When** I filter by date range (last 7 days), **Then** I see quality score trends over time and can identify improvement/degradation patterns
3. **Given** I see quality metrics, **When** I click on an outlier (e.g., article with 4% plagiarism that passed), **Then** I can investigate the specific article and regenerate if needed

---

### Edge Cases

- **What happens when AI API is down?** System should attempt fallback to next available model (GPT-4 → Claude → Perplexity → Gemini) and notify user if all models fail
- **How does system handle rate limits?** Queue requests and retry with exponential backoff; show estimated wait time to user
- **What if topic is too vague?** System should prompt user to provide more context or auto-enhance the prompt using AI (e.g., "Best tools" → "Best tools for [what task] in [industry] for [audience]")
- **What if generated content is in wrong language?** Allow language selection (English by default); if detected language doesn't match, auto-translate or regenerate
- **What happens to articles mid-generation if user logs out?** Save generation state in background job; user can resume when they log back in
- **How to handle duplicate topic detection?** Warn user if topic is similar to existing content (>80% similarity) and offer to generate variation instead
- **What if bulk generation exceeds API cost limits?** Show cost estimate before starting; require confirmation if cost exceeds user's monthly budget; pause and notify if limit reached mid-generation

---

## Requirements

### Functional Requirements

#### AI Model Integration
- **FR-001**: System MUST integrate all 4 AI models: GPT-4, Claude 3.5 Sonnet, Perplexity, and Gemini with API authentication
- **FR-002**: System MUST implement automatic fallback sequence (GPT-4 → Claude → Perplexity → Gemini) when primary model fails or hits rate limits
- **FR-003**: Users MUST be able to select their preferred AI model for each generation request
- **FR-004**: System MUST track token usage per model per user for billing and analytics
- **FR-005**: System MUST handle API errors gracefully with user-friendly error messages (not raw API responses)

#### Content Templates
- **FR-006**: System MUST provide 5 proven content templates: Comparisons, How-To Guides, Listicles, Problem-Solvers, Ultimate Guides
- **FR-007**: Each template MUST have predefined structure (sections, headings, word count targets) optimized for SEO/GEO
- **FR-008**: Users MUST be able to preview template structure before generating content
- **FR-009**: System MUST allow basic customization: tone (professional/casual/technical), length (short/medium/long), target audience
- **FR-010**: **FUTURE ENHANCEMENT REMINDER**: Template editor for Growth/Enterprise plans to create custom templates (deferred to post-MVP based on user feedback)

#### Quality Control System
- **FR-011**: System MUST check plagiarism with threshold <2% for content to pass
- **FR-012**: System MUST check readability with minimum score of 70 (Flesch Reading Ease or equivalent)
- **FR-013**: System MUST perform fact-checking with 90%+ accuracy requirement
- **FR-014**: System MUST display quality scores prominently after generation: Plagiarism %, Readability Score, Fact-Check Accuracy %
- **FR-015**: System MUST auto-regenerate failed content up to 3 times with same parameters
- **FR-016**: After 3 failed attempts, system MUST move article to "Failed" status with specific failure reasons displayed
- **FR-017**: Users MUST be able to manually override quality checks and publish anyway (with warning)

#### GEO Optimization Layer
- **FR-018**: System MUST automatically insert relevant quotes from authoritative sources (industry experts, studies)
- **FR-019**: System MUST automatically insert statistics with proper citations (publication name, year, link)
- **FR-020**: System MUST add citations in proper format (APA, MLA, or Chicago style based on user preference)
- **FR-021**: System MUST source quotes/stats from AI model knowledge + web search APIs (Perplexity, Google Search API)
- **FR-022**: Each article MUST include minimum 3 citations for credibility
- **FR-023**: System MUST verify citation links are accessible (not 404) before inserting

#### Bulk Generation System
- **FR-024**: System MUST support bulk generation from topic list (CSV upload, manual paste, or API input)
- **FR-025**: System MUST process up to 30 articles in 30 minutes (performance target)
- **FR-026**: System MUST process articles in parallel (5 concurrent generations) to meet performance target
- **FR-027**: System MUST continue bulk processing even if individual articles fail
- **FR-028**: Failed articles MUST be moved to "Failed" queue with retry option
- **FR-029**: Users MUST see real-time progress indicator: X/30 completed, Y in progress, Z failed
- **FR-030**: System MUST allow downloading successful articles immediately (don't wait for entire batch)
- **FR-031**: System MUST display cost estimate before starting bulk generation and require confirmation if cost exceeds $50

#### Content Variation Generator
- **FR-032**: System MUST generate 2-5 variations of the same topic with different angles/approaches
- **FR-033**: Variations MUST pass uniqueness check (each variation >70% unique compared to others)
- **FR-034**: System MUST provide comparison view for variations (side-by-side or tabbed)
- **FR-035**: Users MUST be able to select which variation to keep/publish and archive others

#### Content Queue System
- **FR-036**: System MUST maintain content queue with statuses: Draft, Queued, Scheduled, Published, Failed
- **FR-037**: Users MUST be able to schedule articles for future dates
- **FR-038**: System MUST display calendar view of scheduled content
- **FR-039**: Users MUST be able to reorder queue items via drag-and-drop
- **FR-040**: System MUST support filtering by status, template type, AI model, date range

#### Dashboard
- **FR-041**: System MUST display content dashboard with: total articles generated, success rate, quality score averages, tokens used, estimated cost
- **FR-042**: Dashboard MUST show model performance comparison (GPT-4 vs Claude vs Perplexity vs Gemini)
- **FR-043**: Users MUST be able to view individual article details: full content, quality scores, generation settings, edit history
- **FR-044**: Dashboard MUST show recent activity feed: "Article X generated", "Bulk job completed", "Article Y failed quality check"

### Constitutional Alignment Requirements

#### Multi-Model AI (Principle 1)
- System integrates all 4 AI models (GPT-4, Claude 3.5, Perplexity, Gemini) as specified
- Automatic fallback strategy ensures high availability
- 5 proven templates align with "GEO-optimized content" requirement
- Bulk generation capability (30 articles in 30 minutes) meets scale expectation

#### Quality & GEO Optimization (Principle 5)
- Plagiarism check (<2%) ensures originality
- Readability score (70+) ensures user-friendly content
- Fact verification (90%+) ensures accuracy and trustworthiness
- Automatic quote/stat/citation insertion aligns with GEO optimization requirements

#### Scalability & Performance (Principle 6)
- Parallel processing (5 concurrent) enables 30 articles in 30 minutes target
- Background job architecture prevents UI blocking
- Token tracking and cost estimation prevent budget overruns
- Error handling and retry logic ensure reliability at scale

### Key Entities

- **Article**: Generated content piece with metadata (title, body, template type, AI model used, quality scores, creation timestamp, user ID, status)
- **Topic**: Input for article generation (topic text, keywords, target length, tone, audience, template selection)
- **QualityCheck**: Result of quality validation (plagiarism %, readability score, fact-check accuracy, pass/fail status, failure reasons)
- **Citation**: Reference embedded in article (quote text, source name, source URL, publication year, citation style)
- **GenerationJob**: Background task for bulk generation (total count, completed count, failed count, status, user ID, estimated completion time)
- **ContentQueue**: Scheduled content item (article ID, scheduled date, publication platform - for Week 2 integration, current status)

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can generate a single article from topic input in under 2 minutes on average
- **SC-002**: System successfully generates 30 articles in 30 minutes or less (bulk generation target)
- **SC-003**: 95% of generated articles pass quality checks (plagiarism <2%, readability 70+, fact-check 90%+) on first attempt
- **SC-004**: System maintains 99% uptime for content generation (accounting for AI API availability across 4 models)
- **SC-005**: Users can create content variations with 70%+ uniqueness between variations
- **SC-006**: Quality dashboard accurately tracks and displays metrics within 5 seconds of generation completion
- **SC-007**: Average cost per article is under $3 (including AI API costs, quality checks, and citations)
- **SC-008**: Failed articles provide actionable error messages that users can understand without technical knowledge
- **SC-009**: 90% of users successfully complete their first article generation without support intervention
- **SC-010**: Content queue supports scheduling of 100+ articles without performance degradation

### User Satisfaction Metrics

- Users report content quality is "good" or "excellent" for 80%+ of generated articles
- 85% of users prefer AI-generated content with GEO optimization over manually writing from scratch
- Average time saved per article is 45+ minutes compared to manual writing
- Users successfully resolve failed articles (via retry or manual edit) 90% of the time

---

## Assumptions

1. AI API keys are provided by users or managed at system level (decision needed during planning)
2. Plagiarism checking will use third-party API (e.g., Copyscape, PlagiarismCheck) - specific service TBD
3. Readability scoring will use Flesch Reading Ease formula (can be computed without external API)
4. Fact-checking will leverage AI models' internal verification + web search cross-reference (not dedicated fact-check API)
5. Web search API (Google Custom Search or Perplexity) is available for citation sourcing
6. Cost per article estimate ($3) assumes: GPT-4 ($0.60), Claude ($0.40), quality checks ($0.30), citations/search ($0.20), infrastructure ($0.50)
7. Users have basic understanding of content marketing concepts (templates, tone, audience)
8. Content is generated in English for MVP; multi-language support is post-MVP

---

## Dependencies

- **External APIs**: OpenAI (GPT-4), Anthropic (Claude), Perplexity, Google (Gemini), plagiarism checking service, web search API
- **Infrastructure**: Background job system (Inngest) for bulk generation and async processing
- **Database**: Storage for articles, quality check results, citations, queue items
- **Authentication**: User identification for content ownership and billing tracking (Clerk integration)

---

## Out of Scope (Week 1)

- Multi-platform publishing (Week 2)
- AI visibility tracking (Week 3)
- Multi-language content generation (future)
- Custom template creation by users (future enhancement per FR-010)
- Image/video generation for articles (future)
- SEO keyword research integration (covered in Week 9)
- Team collaboration and approval workflows (Week 10)
- White-label customization (Week 10)

---

## Technical Notes for Planning Phase

When creating the implementation plan (`/speckit.plan`), consider:

1. **API Integration Order**: Start with GPT-4 (most reliable), then add Claude, Perplexity, Gemini sequentially
2. **Quality Check Pipeline**: Implement as modular steps (plagiarism → readability → fact-check) so each can be tested independently
3. **Parallel Processing**: Use job queue (Inngest) with concurrency control to avoid overwhelming AI APIs
4. **Cost Tracking**: Implement token counting immediately to prevent budget surprises
5. **Error Handling**: Implement comprehensive logging for debugging AI API failures
6. **Testing Strategy**: Use test topics with known outputs to validate quality checks (e.g., topic that should trigger plagiarism failure)

---

*End of Week 1 Specification*

---

# Week 2: Multi-Platform Publishing System

**Timeline**: Days 6-10
**Goal**: Publish everywhere with one click
**Deliverable**: One-click publishing to 10+ platforms simultaneously

## User Scenarios & Testing

### User Story 1 - Publish Single Article to Multiple Platforms (Priority: P1)

A blogger wants to publish a generated article to their WordPress blog, Medium profile, and LinkedIn page simultaneously with one click.

**Why this priority**: Core value proposition for Week 2 - if users can't publish to multiple platforms easily, the feature provides no advantage over manual publishing. This is the "wow" moment.

**Independent Test**: Can be fully tested by selecting a generated article, choosing WordPress + Medium + LinkedIn as targets, reviewing adapted previews, clicking "Publish All", and verifying the article appears on all three platforms within 2 minutes.

**Acceptance Scenarios**:

1. **Given** I have a generated article ready to publish, **When** I click "Publish" and select WordPress, Medium, and LinkedIn as targets, **Then** I see three preview panels showing how the content will appear on each platform with platform-specific adaptations (length, formatting, featured image)
2. **Given** I review the adapted previews, **When** I edit the LinkedIn preview to shorten the introduction, **Then** my changes are saved for this publish (without affecting the original article or other platform versions)
3. **Given** I am satisfied with previews, **When** I click "Publish All", **Then** I see real-time progress indicators for each platform (WordPress: Publishing..., Medium: Publishing..., LinkedIn: Queued) and receive confirmation when all succeed
4. **Given** all platforms succeed, **When** I view the publish history, **Then** I see a success record with links to each published article, publish timestamp, and engagement metrics (if available)

---

### User Story 2 - Connect Platform Accounts with Secure Authentication (Priority: P1)

A user wants to securely connect their WordPress site, Shopify store, and LinkedIn account so they can publish content without re-entering credentials each time.

**Why this priority**: Without reliable authentication, publishing cannot work. Must be completed before any publishing features are useful.

**Independent Test**: Can be fully tested by connecting a WordPress site via OAuth, a Shopify store via API key, and LinkedIn via OAuth, then verifying all connections persist across sessions and can publish successfully.

**Acceptance Scenarios**:

1. **Given** I want to connect WordPress, **When** I click "Connect WordPress" and choose OAuth login, **Then** I am redirected to WordPress.com for authorization and returned to the dashboard with "WordPress connected" confirmation
2. **Given** I want to connect Shopify, **When** I click "Connect Shopify" and enter my store URL and API key, **Then** the system validates the credentials and shows "Shopify connected" with store name and product count
3. **Given** I want to connect LinkedIn, **When** I click "Connect LinkedIn" and complete OAuth flow, **Then** I see "LinkedIn connected" with my profile picture, name, and follower count displayed
4. **Given** I have connected platforms, **When** I view my connected accounts dashboard, **Then** I see all platforms with status (connected/disconnected), last sync time, and "Test Connection" button to verify credentials are still valid
5. **Given** OAuth token expires, **When** I attempt to publish, **Then** system detects expired token, prompts me to re-authenticate, and resumes publish after successful re-auth

---

### User Story 3 - Handle Partial Publishing Failures Gracefully (Priority: P2)

An agency publishes a client article to 5 platforms, but Medium's API is temporarily down - they want to see which platforms succeeded and easily retry the failed one.

**Why this priority**: Real-world reliability issue - APIs fail, rate limits hit, networks timeout. Users need clear visibility and recovery options to trust the system.

**Independent Test**: Can be fully tested by simulating an API failure (disconnect Medium integration) while publishing to 5 platforms, verifying 4 succeed and Medium shows clear failure reason with retry button.

**Acceptance Scenarios**:

1. **Given** I publish to WordPress, Medium, LinkedIn, Dev.to, and Ghost, **When** Medium's API returns an error, **Then** I see status: WordPress (✓ Published), Medium (✗ Failed: API timeout), LinkedIn (✓ Published), Dev.to (✓ Published), Ghost (✓ Published)
2. **Given** Medium failed to publish, **When** I click "View Details" on the failure, **Then** I see the specific error message ("Medium API returned 503 Service Unavailable"), suggested actions ("Wait 5 minutes and retry"), and timestamp of failure
3. **Given** I want to retry Medium, **When** I click "Retry Failed Platforms", **Then** the system attempts to publish only to Medium (not re-publishing to successful platforms) and shows updated status
4. **Given** all retries are exhausted (3 attempts), **When** Medium still fails, **Then** I see option to "Publish Manually" (opens Medium editor with pre-filled content) or "Skip Medium" (mark job as complete with Medium excluded)

---

### User Story 4 - Schedule Content Across Platforms with Optimal Timing (Priority: P2)

A content manager wants to schedule 10 articles to publish across multiple platforms at different optimal times (e.g., LinkedIn weekday mornings, Medium weekend afternoons).

**Why this priority**: Enables content calendar automation - key differentiator for agencies managing multiple clients. Builds on Week 1's scheduling foundation.

**Independent Test**: Can be fully tested by scheduling 10 articles with platform-specific optimal times, verifying the schedule displays correctly in calendar view, and confirming articles publish at the specified times (can use accelerated test times).

**Acceptance Scenarios**:

1. **Given** I want to schedule an article, **When** I click "Schedule Publish" and select platforms, **Then** I see recommended optimal times for each platform: LinkedIn (Tuesday 9:00 AM), Medium (Thursday 2:00 PM), WordPress (Monday 8:00 AM)
2. **Given** I see recommended times, **When** I customize LinkedIn to publish at 10:00 AM instead and accept defaults for others, **Then** the system saves my custom times and shows calendar with staggered publish times across platforms
3. **Given** I have 10 articles scheduled across next 2 weeks, **When** I view the publishing calendar, **Then** I see color-coded events by platform, can drag-and-drop to reschedule, and see tooltip with article title + platforms on hover
4. **Given** scheduled publish time arrives, **When** the system attempts to publish, **Then** it follows the same preview → publish → status tracking flow as manual publishes (with email notification on success/failure)

---

### User Story 5 - Adapt Content Automatically for Platform Requirements (Priority: P2)

A marketer has a 2000-word WordPress article but wants it adapted to LinkedIn's best practices (500 words), Medium's style (1500 words, more casual), and Dev.to's technical format (code blocks, markdown).

**Why this priority**: Content adaptation is what makes multi-platform publishing valuable - without it, users get formatting errors and poor engagement. Differentiates from simple cross-posting tools.

**Independent Test**: Can be fully tested by publishing a long-form technical article and verifying each platform receives appropriately adapted content: WordPress (full), LinkedIn (summary), Medium (casual tone), Dev.to (technical with code snippets).

**Acceptance Scenarios**:

1. **Given** I have a 2000-word article with technical content, **When** I select WordPress + LinkedIn + Dev.to for publishing, **Then** preview shows: WordPress (2000 words, full content), LinkedIn (500-word summary with hook), Dev.to (full content with properly formatted code blocks)
2. **Given** I review LinkedIn preview, **When** I see the auto-generated summary doesn't capture key points, **Then** I can click "Edit Summary" to customize the LinkedIn version without affecting other platforms
3. **Given** article contains images, **When** I publish to platforms with different image requirements, **Then** system auto-resizes: WordPress (full width 1200px), LinkedIn (1200x627 for link preview), Medium (optimal inline sizing)
4. **Given** article has citations and links, **When** published to different platforms, **Then** formatting adapts: WordPress (footnotes), Medium (inline links with hover cards), LinkedIn (shortened URLs), Dev.to (markdown reference-style links)

---

### User Story 6 - Monitor Cross-Platform Publishing Analytics (Priority: P3)

An agency wants to see which platforms drive the most engagement for their clients' content to optimize future publishing strategy.

**Why this priority**: Nice-to-have analytics feature that adds value but isn't required for core publishing functionality. Can be basic for MVP and enhanced later.

**Independent Test**: Can be fully tested by publishing 5 articles across 3 platforms and viewing aggregated analytics showing total views, engagement rate, and best-performing platform.

**Acceptance Scenarios**:

1. **Given** I have published 20 articles across WordPress, Medium, and LinkedIn, **When** I view publishing analytics dashboard, **Then** I see aggregated metrics: total publishes by platform, success rate by platform, average publish time
2. **Given** platforms provide engagement APIs, **When** I view article-level analytics, **Then** I see platform-specific metrics: WordPress (pageviews, comments), Medium (claps, reading time), LinkedIn (reactions, shares, comments)
3. **Given** I want to compare platform performance, **When** I view the comparison chart, **Then** I see which platform drives most engagement for my content type (e.g., "LinkedIn: 3x more engagement than Medium for B2B content")
4. **Given** I identify best-performing platforms, **When** I schedule future content, **Then** system can suggest "Based on your analytics, publish to LinkedIn + WordPress" for similar content

---

### Edge Cases

- **What happens when OAuth token expires mid-publish?** System should detect expired token, pause publish, prompt user to re-authenticate, then resume from where it left off (don't re-publish to already-successful platforms)
- **How does system handle platform-specific content restrictions?** Validate before publishing (e.g., LinkedIn 3000-char limit, Medium requires 100+ words) and warn user with "Content too short for Medium - would you like to expand it?"
- **What if user disconnects a platform while articles are scheduled?** Cancel scheduled publishes for that platform and notify user: "3 scheduled publishes to WordPress cancelled due to disconnection"
- **How to handle duplicate content penalties?** Warn user if publishing identical content to multiple platforms that share SEO space (e.g., Medium + personal blog); suggest canonical URL or content variation
- **What if platform API changes break integration?** Implement webhook monitoring for API health; if integration breaks, notify affected users, pause scheduled publishes, and show "Platform integration temporarily unavailable" status
- **How does bulk publishing work?** Allow selecting multiple articles and publishing all to the same platform set simultaneously (queue as background jobs); show bulk progress tracker
- **What about platforms requiring manual review?** Some platforms (like LinkedIn company pages) may require approval - system should indicate "Pending approval" status and provide link to platform's approval interface

---

## Requirements

### Functional Requirements

#### Platform Integrations - CMS Platforms
- **FR-001**: System MUST integrate with WordPress via OAuth 2.0 and REST API for reading sites, creating posts, updating posts, and deleting posts
- **FR-002**: System MUST integrate with Shopify via Admin API with API key authentication for publishing blog posts to Shopify stores
- **FR-003**: System MUST integrate with Webflow via OAuth 2.0 and CMS API for publishing to Webflow CMS collections
- **FR-004**: System MUST integrate with Wix via API key authentication for publishing blog posts to Wix sites
- **FR-005**: System MUST integrate with Squarespace via API key authentication for publishing blog posts
- **FR-006**: System MUST integrate with Ghost via Admin API and API key for publishing posts to Ghost publications
- **FR-007**: System MUST provide "Custom CMS" integration option where users can configure webhook URLs or custom API endpoints

#### Platform Integrations - Syndication Platforms
- **FR-008**: System MUST integrate with Medium via OAuth 2.0 for publishing stories to user's Medium profile
- **FR-009**: System MUST integrate with LinkedIn via OAuth 2.0 for publishing articles to user's LinkedIn profile or company pages
- **FR-010**: System MUST integrate with Dev.to via API key for publishing articles to Dev.to community

#### Authentication & Credential Management
- **FR-011**: System MUST support OAuth 2.0 authentication for platforms that provide it: WordPress, Webflow, Medium, LinkedIn
- **FR-012**: System MUST securely store API keys and tokens encrypted in database (AES-256 encryption at rest)
- **FR-013**: System MUST detect expired OAuth tokens and prompt users to re-authenticate before publishing
- **FR-014**: Users MUST be able to view all connected platforms with connection status (active/disconnected/expired)
- **FR-015**: Users MUST be able to test connections with "Test Connection" button that validates credentials without publishing
- **FR-016**: Users MUST be able to disconnect platforms, with warning if scheduled publishes will be affected
- **FR-017**: System MUST support multiple accounts per platform type (e.g., 3 different WordPress sites)

#### Publishing Workflow
- **FR-018**: Users MUST be able to select one or multiple articles to publish simultaneously
- **FR-019**: Users MUST be able to select target platforms from their connected accounts
- **FR-020**: System MUST display content adaptation preview for each selected platform before publishing
- **FR-021**: Users MUST be able to edit platform-specific previews without affecting the original article
- **FR-022**: Users MUST confirm publish action with "Publish All" button (prevent accidental publishes)
- **FR-023**: System MUST publish to all selected platforms in parallel (not sequentially) for speed
- **FR-024**: System MUST display real-time progress for each platform during publish: Queued → Publishing → Published/Failed
- **FR-025**: System MUST mark publishes as "Partially Published" if some platforms succeed and others fail
- **FR-026**: Users MUST be able to retry failed platforms individually without re-publishing to successful platforms
- **FR-027**: System MUST limit retry attempts to 3 per platform and display failure reasons clearly

#### Content Adaptation Engine
- **FR-028**: System MUST automatically adapt content length per platform: LinkedIn (300-500 words summary), Medium (original or condensed), WordPress (full content), Dev.to (full content)
- **FR-029**: System MUST adapt formatting per platform: WordPress (HTML), Medium (rich text), Dev.to (Markdown), LinkedIn (plain text with limited formatting)
- **FR-030**: System MUST adapt images per platform: resize to platform-optimal dimensions, compress as needed, add alt text
- **FR-031**: System MUST preserve citations and links with platform-appropriate formatting
- **FR-032**: System MUST generate platform-specific meta descriptions and SEO tags where applicable
- **FR-033**: System MUST allow users to override automatic adaptations in preview step
- **FR-034**: System MUST validate content meets platform requirements before publishing (char limits, minimum length, required fields) and warn users of issues

#### Scheduling System
- **FR-035**: Users MUST be able to schedule publishes for future dates and times
- **FR-036**: Users MUST be able to set different publish times for different platforms (staggered publishing)
- **FR-037**: System MUST provide "optimal time" suggestions per platform based on user-configured defaults
- **FR-038**: Users MUST be able to save platform-specific optimal times as templates (e.g., "LinkedIn: Tuesdays 9 AM, Medium: Thursdays 2 PM")
- **FR-039**: System MUST display scheduled publishes in calendar view with color-coding by platform
- **FR-040**: Users MUST be able to reschedule publishes via drag-and-drop in calendar or edit modal
- **FR-041**: System MUST execute scheduled publishes via background job queue (Inngest) with automatic retry on failure
- **FR-042**: System MUST notify users of scheduled publish success/failure via email or in-app notification

#### Publishing Analytics
- **FR-043**: System MUST track basic publishing metrics: total publishes by platform, success rate by platform, average publish time
- **FR-044**: System MUST store publish history: article ID, platforms published to, timestamps, success/failure status, links to published content
- **FR-045**: System MUST display publish history in user dashboard with filtering by date, platform, status
- **FR-046**: System MUST fetch engagement metrics from platforms that provide APIs: Medium (claps, reads), LinkedIn (reactions, comments, shares), WordPress (pageviews if Jetpack enabled)
- **FR-047**: Users MUST be able to view engagement metrics per article per platform
- **FR-048**: System MUST provide basic analytics comparison: which platform performed best for this content type

#### Syndication Network Manager
- **FR-049**: Users MUST be able to create "syndication presets" - saved sets of platforms for quick publishing (e.g., "Blog Network" = WordPress + Medium + Dev.to)
- **FR-050**: Users MUST be able to publish to a syndication preset with one click
- **FR-051**: System MUST support "canonical URL" configuration to avoid duplicate content SEO penalties (points all syndicated versions to original WordPress URL)

### Constitutional Alignment Requirements

#### Multi-Platform Distribution (Principle 2)
- Integrates all 10+ platforms as specified: WordPress, Shopify, Webflow, Wix, Squarespace, Ghost, Medium, LinkedIn, Dev.to, Custom CMS
- One-click publishing workflow with preview step for control
- Content adaptation ensures each platform receives optimized content
- Syndication network manager enables agency workflows

#### Intelligent Automation (Principle 4)
- Automatic content adaptation reduces manual reformatting work
- Optimal time suggestions help users maximize engagement
- Partial failure handling with automatic retry reduces manual intervention
- Background job processing prevents UI blocking

#### Scalability & Performance (Principle 6)
- Parallel publishing (concurrent platform publishes) meets performance targets
- OAuth 2.0 authentication provides secure, scalable credential management
- Background job queue (Inngest) handles scheduled publishes reliably at scale

#### Enterprise-Ready Architecture (Principle 7)
- Multiple accounts per platform type supports agency use cases (manage multiple client sites)
- Syndication presets enable efficient multi-client workflows
- Publishing analytics provide client reporting capabilities

### Key Entities

- **PlatformConnection**: User's connected platform account (platform type, auth method, credentials encrypted, connection status, last sync timestamp, account metadata like username/site URL)
- **PublishJob**: Single or multi-platform publish operation (article ID, target platforms, scheduled time, status, retry count, user ID)
- **PublishResult**: Outcome of publishing to one platform (publish job ID, platform, status success/failed/partial, published URL, failure reason, timestamp, engagement metrics)
- **ContentAdaptation**: Platform-specific version of article (article ID, platform, adapted content, adapted images, meta description, custom edits, approval status)
- **SyndicationPreset**: Saved set of platforms for quick publishing (preset name, platform IDs, optimal times per platform, user ID)
- **PublishSchedule**: Scheduled publish configuration (article ID, syndication preset or platform list, scheduled datetime per platform, recurrence if applicable)

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can successfully publish one article to 3 platforms simultaneously in under 3 minutes (from article selection to confirmation)
- **SC-002**: OAuth authentication flow completes in under 30 seconds per platform
- **SC-003**: Content adaptation preview generates in under 5 seconds for all selected platforms
- **SC-004**: System maintains 95% publishing success rate across all platforms (accounting for temporary API issues)
- **SC-005**: Partial publish failures are detected and reported within 10 seconds of occurrence
- **SC-006**: Scheduled publishes execute within 2 minutes of scheduled time (±2min accuracy)
- **SC-007**: Publishing analytics dashboard loads in under 3 seconds even with 100+ publish records
- **SC-008**: System supports publishing to 5 platforms in parallel without performance degradation
- **SC-009**: Content adaptations maintain 95%+ accuracy (no broken formatting, missing images, or truncated content)
- **SC-010**: Users can retry failed platforms and achieve success 80%+ of the time (failures were temporary)

### User Satisfaction Metrics

- 90% of users successfully connect at least 2 platforms within first session
- Users report multi-platform publishing saves 60+ minutes per article compared to manual posting
- 85% of users find content adaptation previews accurate and helpful
- Failed publish recovery (via retry) succeeds without support intervention 90% of the time
- Users publish to an average of 3.5 platforms per article (demonstrates value of multi-platform capability)

---

## Assumptions

1. Platform API documentation is accurate and up-to-date; integration follows official best practices
2. OAuth app approval from WordPress, Medium, LinkedIn can be obtained within Week 2 timeline (may require pre-work)
3. Content adaptation rules are generalized for MVP; platform-specific customization (user-defined rules) is post-MVP
4. Optimal publishing times are user-configured manually; ML-based time optimization is future enhancement
5. Analytics data availability depends on platform API support; not all platforms provide engagement metrics
6. Canonical URL for SEO is set to user's primary platform (typically WordPress); users can override
7. Image handling assumes images are hosted and accessible via URL (not local uploads requiring storage)
8. Platform rate limits are respected via job queue throttling; specific limits TBD per platform docs

---

## Dependencies

- **External Platform APIs**: WordPress REST API, Shopify Admin API, Webflow CMS API, Wix API, Squarespace API, Ghost Admin API, Medium API, LinkedIn API, Dev.to API
- **OAuth Providers**: WordPress.com OAuth, Webflow OAuth, Medium OAuth, LinkedIn OAuth (requires app registration and approval)
- **Week 1 Integration**: Content queue from Week 1 provides articles to publish; scheduled articles flow into Week 2 publishing system
- **Background Jobs**: Inngest for scheduled publish execution and parallel publishing
- **Database**: Storage for platform connections (credentials encrypted), publish jobs, publish results, content adaptations
- **Image Processing**: Image resizing/optimization service (can be integrated in future; use original images for MVP)

---

## Out of Scope (Week 2)

- AI-powered optimal time detection (ML-based scheduling - future)
- Custom content adaptation rules per user (use default rules for MVP)
- Video content publishing (focus on text/image articles)
- Platform-specific advanced features (e.g., WordPress custom post types, LinkedIn company pages beyond basic access)
- Advanced analytics (traffic sources, conversion tracking, A/B testing)
- Automated content repurposing (different content for each platform generated from single source - Week 8 feature)
- Social media platforms (Twitter/X, Facebook, Instagram - potential future expansion)
- Email newsletter distribution (Substack, Beehiiv - potential Week 7-9)

---

## Technical Notes for Planning Phase

When creating the implementation plan (`/speckit.plan`), consider:

1. **OAuth App Registration**: Must apply for OAuth apps from WordPress, Medium, LinkedIn early in Week 2 (approval can take 1-3 days)
2. **Platform Integration Priority**: Even though all 10+ platforms are in scope, implement in phases: Tier 1 (WordPress, Medium, LinkedIn), Tier 2 (Shopify, Webflow, Dev.to), Tier 3 (Wix, Squarespace, Ghost, Custom)
3. **Content Adaptation Engine**: Build as modular service with platform adapters (strategy pattern) so new platforms can be added easily
4. **Error Handling**: Implement comprehensive error codes for each platform's API errors (map to user-friendly messages)
5. **Testing Strategy**: Use test accounts for each platform; create automated integration tests that publish to test sites
6. **Credential Security**: Use environment variables for OAuth client secrets; never log or expose encrypted credentials
7. **Rate Limit Handling**: Implement per-platform rate limit tracking; queue publishes if limits approached
8. **Idempotency**: Prevent duplicate publishes if user clicks "Publish" twice or job retries; use unique job IDs

---

*End of Week 2 Specification*

---

# Week 3: AI Visibility Tracking Core

**Timeline**: Days 11-15
**Goal**: Track rankings across all AI platforms
**Deliverable**: Track visibility across 4 AI platforms with competitor comparison

## User Scenarios & Testing

### User Story 1 - Track Brand Visibility Across AI Platforms (Priority: P1)

A SaaS founder wants to see how often their product "ProjectHub" is mentioned by ChatGPT, Claude, Perplexity, and Gemini when users ask about project management tools.

**Why this priority**: Core value proposition for GEO - if users can't see their visibility in AI responses, they can't optimize for it. This is the foundational "measurement" that enables all optimization work.

**Independent Test**: Can be fully tested by adding "ProjectHub" as tracked brand with 5 keywords (e.g., "best project management tools"), running tracking across all 4 AI platforms, and viewing visibility scores and mention details within 24 hours.

**Acceptance Scenarios**:

1. **Given** I want to track my brand "ProjectHub", **When** I enter brand name and 5 target keywords, **Then** the system schedules daily tracking checks across ChatGPT, Claude, Perplexity, and Gemini
2. **Given** tracking runs for the first time, **When** I view results after 24 hours, **Then** I see visibility scores per platform: ChatGPT (12%), Claude (8%), Perplexity (25%), Gemini (15%) with explanation "Your brand was mentioned in X out of Y prompt variations tested"
3. **Given** I see my visibility score, **When** I click into a specific platform (e.g., Perplexity 25%), **Then** I see which prompt variations mentioned my brand and exact position in responses (e.g., "mentioned 3rd in response to 'top project management tools for remote teams'")
4. **Given** I want to understand changes, **When** I view 7-day trend chart, **Then** I see daily visibility scores plotted over time with annotations for significant changes (e.g., "↑15% on Day 3")

---

### User Story 2 - Simulate Prompts to Test Visibility Coverage (Priority: P1)

A content marketer wants to test 50-100 different prompt variations for their target keyword "email marketing software" to understand which questions their brand appears in.

**Why this priority**: Prompt simulation is the engine that powers visibility tracking - without comprehensive prompt testing, users get incomplete data. This differentiates from manual testing.

**Independent Test**: Can be fully tested by selecting keyword "email marketing software", generating 75 prompt variations, running them through all 4 AI platforms, and viewing which prompts returned mentions.

**Acceptance Scenarios**:

1. **Given** I add keyword "email marketing software", **When** the system generates prompt variations, **Then** I see 50-100 variations created using templates: questions ("What is the best email marketing software?"), comparisons ("email marketing software vs CRM"), use cases ("email marketing software for small business"), audience-specific ("email marketing tools for agencies")
2. **Given** prompt variations are generated, **When** I review them before running, **Then** I can see all variations grouped by category (Questions, Comparisons, Use Cases, Audience-Specific) and can add custom prompts or remove irrelevant ones
3. **Given** I run prompt simulation, **When** processing completes (~10-15 minutes for 75 prompts × 4 platforms), **Then** I see results summary: Total prompts (75), Total AI responses analyzed (300), Brand mentions found (42), Visibility score (14%)
4. **Given** simulation completes, **When** I view detailed results, **Then** I can filter by: prompts that mentioned my brand, prompts that mentioned competitors, prompts with no relevant mentions, and export results as CSV

---

### User Story 3 - Extract and Analyze Citations (Priority: P2)

An SEO manager wants to see exactly where their website is cited in AI responses and how it's described (as a tool recommendation, case study reference, or data source).

**Why this priority**: Citation extraction is how users identify opportunities - knowing they're mentioned is valuable, knowing the context helps them optimize. Required for competitive analysis.

**Independent Test**: Can be fully tested by running tracking for "content marketing tools" and viewing detailed citation report showing exact quotes, URLs mentioned, and context of each mention.

**Acceptance Scenarios**:

1. **Given** tracking finds my brand mentioned, **When** I view citation details, **Then** I see: exact quote from AI response, platform (ChatGPT/Claude/Perplexity/Gemini), prompt that triggered it, position in response (1st, 3rd, 7th, etc.), timestamp
2. **Given** I want to understand citation context, **When** I review a specific mention, **Then** I see: full AI response text with my brand highlighted, surrounding mentions (competitors listed before/after me), category of mention (recommendation, comparison, case study, data source)
3. **Given** my website URL is mentioned, **When** I view URL citations, **Then** I see which specific pages are cited (homepage, blog posts, product pages) and can click through to verify accuracy
4. **Given** I track 10 keywords, **When** I view aggregated citation report, **Then** I see: total mentions across all keywords, most frequently cited pages, most common contexts (e.g., "Mentioned as alternative to Competitor X in 60% of citations")

---

### User Story 4 - Compare Against Competitors (Priority: P2)

A startup wants to see how their visibility compares to 3 established competitors (Asana, Monday.com, ClickUp) for the same set of keywords.

**Why this priority**: Competitive benchmarking is essential for understanding market position and identifying gaps. Users need context to know if 12% visibility is good or terrible.

**Independent Test**: Can be fully tested by adding 3 competitors to tracking, running same prompts for all brands, and viewing comparison dashboard showing relative visibility scores.

**Acceptance Scenarios**:

1. **Given** I want to track competitors, **When** I add "Asana", "Monday.com", "ClickUp" to competitor list, **Then** the system runs the same prompt variations for all competitors during daily tracking
2. **Given** tracking completes for all brands, **When** I view competitor comparison, **Then** I see side-by-side visibility scores: Me (12%), Asana (68%), Monday.com (82%), ClickUp (45%) with visual bar chart
3. **Given** I see competitor scores, **When** I drill into specific platform (e.g., ChatGPT), **Then** I see which prompts favored each competitor and can identify gaps (e.g., "Competitors dominate 'enterprise project management' prompts - opportunity to optimize")
4. **Given** I track over 30 days, **When** I view competitor trend comparison, **Then** I see all brands plotted on same chart to identify who's gaining/losing visibility over time

---

### User Story 5 - Monitor Historical Trends and Alerts (Priority: P3)

A marketing director wants to see how their AI visibility changes over time and get alerted when significant drops or spikes occur.

**Why this priority**: Historical trending enables long-term strategy and ROI measurement. Alerts help users respond quickly to changes. Nice-to-have for MVP but valuable for retention.

**Independent Test**: Can be fully tested by running tracking for 30 days, viewing trend charts showing daily changes, and configuring alert for >20% visibility drop.

**Acceptance Scenarios**:

1. **Given** I have 30 days of tracking data, **When** I view historical dashboard, **Then** I see three trend charts: 7-day (daily granularity), 30-day (daily granularity), 90-day (weekly granularity)
2. **Given** I view trend chart, **When** I hover over a specific day, **Then** I see tooltip with: date, visibility score, change from previous period (±5%), and note if any major event (e.g., "Published new article on this date")
3. **Given** I want to understand score changes, **When** I see a spike from 12% to 28%, **Then** I can click into that day to see: which new prompts started mentioning me, which platforms improved, any competitor drops
4. **Given** I configure alert for >20% drop, **When** my visibility drops from 25% to 18% overnight, **Then** I receive email/in-app notification: "AI Visibility Alert: 28% drop on ChatGPT - review details"

---

### Edge Cases

- **What happens when AI platform changes response format?** System should detect unexpected response structures, flag for manual review, and notify developers to update parsing logic
- **How to handle rate limits from AI platforms?** Implement exponential backoff, distribute prompts over 24-hour period to avoid hitting limits, prioritize VIP keywords if limits reached
- **What if tracked brand name is ambiguous?** (e.g., "Apple" - fruit vs company) Allow user to specify context clues (e.g., "tech company" or "smartphone maker") to filter false positives
- **How does system handle non-English responses?** AI platforms may respond in user's language - either constrain prompts to English or implement multi-language mention detection
- **What if competitor brand name changes?** Allow editing competitor names with historical data migration (e.g., "Facebook" → "Meta")
- **How to handle tracking for new brands with zero mentions?** Show visibility score as 0% with actionable suggestions: "No mentions found - consider: creating linkable assets, improving content quality, building citations"
- **What if user exceeds daily API cost limits?** Pause tracking, notify user, offer to continue with reduced prompt variations (e.g., 25 instead of 75) or upgrade plan

---

## Requirements

### Functional Requirements

#### AI Platform Integration
- **FR-001**: System MUST integrate with ChatGPT via OpenAI API to submit prompts and capture responses
- **FR-002**: System MUST integrate with Claude via Anthropic API to submit prompts and capture responses
- **FR-003**: System MUST integrate with Perplexity via Perplexity API to submit prompts and capture responses
- **FR-004**: System MUST integrate with Gemini via Google AI API to submit prompts and capture responses
- **FR-005**: System MUST handle API authentication securely for all platforms
- **FR-006**: System MUST implement rate limit handling with exponential backoff for each platform
- **FR-007**: System MUST log all API requests and responses for debugging and cost tracking

#### Brand & Keyword Configuration
- **FR-008**: Users MUST be able to add their brand name and up to 50 target keywords to track
- **FR-009**: Users MUST be able to specify brand variations (e.g., "ProjectHub", "Project Hub", "projecthub.com")
- **FR-010**: Users MUST be able to add up to 5 competitor brands for comparison tracking
- **FR-011**: Users MUST be able to mark specific keywords as "VIP" for hourly tracking (others tracked daily)
- **FR-012**: System MUST validate brand names and keywords to prevent duplicates or invalid inputs

#### Prompt Simulation Engine
- **FR-013**: System MUST generate 50-100 prompt variations per keyword using template system
- **FR-014**: Prompt templates MUST cover categories: Questions, Comparisons, Use Cases, Audience-Specific, Problem-Solving
- **FR-015**: Users MUST be able to preview generated prompts before running tracking
- **FR-016**: Users MUST be able to add custom prompts manually (up to 20 per keyword)
- **FR-017**: Users MUST be able to remove irrelevant auto-generated prompts
- **FR-018**: System MUST support prompt variables: {keyword}, {audience}, {use_case}, {industry} for dynamic generation
- **FR-019**: System MUST store prompt templates for reuse across different keywords

#### Tracking Execution
- **FR-020**: System MUST run daily tracking for all keywords at user-configured time (default: 2 AM UTC)
- **FR-021**: System MUST run hourly tracking for VIP keywords (Growth/Enterprise plans only)
- **FR-022**: System MUST execute tracking as background jobs (Inngest) to avoid blocking UI
- **FR-023**: System MUST process prompts in parallel (10 concurrent) to complete tracking within 15 minutes for 5 keywords
- **FR-024**: System MUST retry failed prompts up to 3 times with exponential backoff
- **FR-025**: System MUST track API costs per tracking run and display to users
- **FR-026**: Users MUST be able to manually trigger tracking runs for specific keywords on-demand

#### Citation Extraction
- **FR-027**: System MUST detect direct brand mentions (exact match of brand name or variations) in AI responses
- **FR-028**: System MUST detect URL mentions (brand website or specific pages) in AI responses
- **FR-029**: System MUST extract exact quote/context around each mention (±50 words)
- **FR-030**: System MUST identify position of mention in response: 1st, 2nd, 3rd, etc.
- **FR-031**: System MUST categorize mention context: Recommendation, Comparison, Case Study, Data Source, Alternative Option
- **FR-032**: System MUST count mentions per platform per prompt variation
- **FR-033**: System MUST flag potential false positives (e.g., "apple" fruit vs Apple company) for user review

#### Visibility Scoring
- **FR-034**: System MUST calculate visibility score as: (Prompts with brand mentions / Total prompts tested) × 100
- **FR-035**: System MUST calculate separate scores per platform (ChatGPT, Claude, Perplexity, Gemini)
- **FR-036**: System MUST calculate overall aggregate score across all platforms
- **FR-037**: System MUST display scores with context: "12% visibility - Your brand appeared in 9 out of 75 prompts tested"
- **FR-038**: System MUST track score changes: "+5% from yesterday", "-12% from last week"

#### Competitor Comparison
- **FR-039**: System MUST run same prompt variations for user's brand and all competitor brands
- **FR-040**: System MUST display side-by-side comparison: User (12%), Competitor A (45%), Competitor B (68%)
- **FR-041**: System MUST show visual comparison charts (bar chart, line chart over time)
- **FR-042**: System MUST identify "gap opportunities": prompts where competitors appear but user doesn't
- **FR-043**: System MUST allow filtering comparison by platform, keyword, or date range

#### Historical Tracking & Trends
- **FR-044**: System MUST store all tracking results for 90 days
- **FR-045**: System MUST display trend charts: 7-day (daily), 30-day (daily), 90-day (weekly aggregation)
- **FR-046**: System MUST annotate trends with events: content published, score spikes/drops
- **FR-047**: Users MUST be able to export historical data as CSV (date, platform, keyword, score, mentions)
- **FR-048**: System MUST calculate summary statistics: average score, highest score, lowest score, volatility

#### Tracking Dashboard
- **FR-049**: System MUST display visibility dashboard with: overall score, score per platform, recent changes, top keywords
- **FR-050**: Dashboard MUST show last tracking run timestamp and next scheduled run
- **FR-051**: Dashboard MUST display tracking status: Scheduled, Running, Completed, Failed
- **FR-052**: Users MUST be able to drill down from overall score to platform to keyword to individual prompts
- **FR-053**: Dashboard MUST display cost summary: API costs this month, projected monthly cost
- **FR-054**: Dashboard MUST show actionable insights: "Visibility increased 15% after publishing article X", "Competitors dominate 'enterprise' keywords - opportunity to target"

### Constitutional Alignment Requirements

#### AI Visibility Tracking (Principle 3)
- Monitors all 4 specified AI platforms: ChatGPT, Claude, Perplexity, Gemini
- Prompt simulation engine tests 50-100 variations for comprehensive coverage
- Citation extraction identifies exactly where and how brands are mentioned
- Competitor comparison provides market context

#### Intelligent Automation (Principle 4)
- Daily automated tracking (hourly for VIP keywords) eliminates manual checking
- Background job processing prevents UI blocking
- Automatic prompt generation using templates reduces manual work
- Visibility scoring algorithm provides clear, actionable metrics

#### Scalability & Performance (Principle 6)
- Parallel processing (10 concurrent prompts) completes tracking efficiently
- 90-day data retention with aggregation strategy manages storage costs
- Rate limit handling ensures reliability at scale
- Background jobs (Inngest) enable tracking for 1000+ users simultaneously

### Key Entities

- **TrackedBrand**: User's brand configuration (brand name, brand variations, website URL, user ID, creation date)
- **TrackedKeyword**: Keyword being monitored (keyword text, VIP status, tracking frequency, associated brand, custom prompts)
- **CompetitorBrand**: Competitor for comparison (competitor name, competitor website, tracked against brand ID)
- **PromptTemplate**: Reusable prompt structure (template text with variables, category, platform compatibility)
- **PromptVariation**: Generated or custom prompt (prompt text, keyword ID, category, auto-generated or custom)
- **TrackingRun**: Execution of tracking job (brand ID, keyword ID, scheduled time, status, completion time, total prompts, total cost)
- **AIResponse**: Response from AI platform (tracking run ID, prompt ID, platform, response text, timestamp, API cost)
- **Citation**: Detected brand mention (response ID, brand ID, mention type direct/URL, quote excerpt, position in response, context category)
- **VisibilityScore**: Calculated score (tracking run ID, brand ID, platform, score percentage, total prompts, prompts with mentions, change from previous)
- **HistoricalSnapshot**: Aggregated historical data (date, brand ID, platform, average score, total mentions, weekly/monthly aggregation)

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: System successfully tracks brand visibility across all 4 AI platforms within 15 minutes per keyword
- **SC-002**: Prompt generation creates 50-100 relevant variations per keyword with 95%+ relevance (manual review confirms quality)
- **SC-003**: Citation extraction achieves 98%+ accuracy for direct brand mentions (no false negatives, <2% false positives)
- **SC-004**: Visibility scores are calculated and displayed within 5 seconds of tracking run completion
- **SC-005**: Daily tracking runs execute within ±5 minutes of scheduled time (e.g., 2:00 AM ±5 min)
- **SC-006**: Competitor comparison processes all brands in parallel without exceeding 20-minute total runtime
- **SC-007**: Historical trend charts load in under 2 seconds even with 90 days of data
- **SC-008**: System maintains 99% tracking success rate (accounting for temporary API outages)
- **SC-009**: Average API cost per keyword per tracking run is under $2 (50-100 prompts × 4 platforms)
- **SC-010**: Users can drill down from overall score to individual prompt details in under 3 clicks

### User Satisfaction Metrics

- 90% of users successfully set up tracking for at least 3 keywords within first session
- Users report understanding their visibility score and how to improve it without support help
- Competitor comparison insights lead to actionable optimization decisions 80%+ of the time
- Historical trending helps users correlate content changes with visibility improvements
- Average tracking cost per user is under $50/month (manageable for Growth plan pricing)

---

## Assumptions

1. AI platform APIs are stable and provide consistent response formats (changes require parser updates)
2. Direct brand mentions (text match) are sufficient for MVP; NLP-based paraphrasing detection is post-MVP
3. Tracking frequency (daily for most, hourly for VIP) balances timeliness with API cost constraints
4. 50-100 prompt variations provide statistically significant coverage without excessive costs
5. Users track 5-10 keywords on average; power users may track up to 50
6. Competitor tracking uses same prompt set as user's brand (no separate prompt generation)
7. 90-day retention is sufficient for trend analysis; users can export data for longer-term storage
8. API costs are passed through to users or absorbed based on plan tier pricing
9. Browser automation (Playwright) may be needed for platforms without official APIs (future consideration)

---

## Dependencies

- **External AI APIs**: OpenAI API (ChatGPT), Anthropic API (Claude), Perplexity API, Google AI API (Gemini)
- **Background Jobs**: Inngest for scheduled tracking runs and parallel prompt processing
- **Database**: Storage for brands, keywords, prompts, responses, citations, scores, historical data
- **Week 1 Integration**: Published content from Week 1 can trigger visibility changes tracked in Week 3
- **NLP/Parsing Libraries**: Text parsing for citation extraction, position detection, context categorization
- **Cost Tracking**: Real-time API cost calculation and budgeting alerts

---

## Out of Scope (Week 3)

- Global tracking across 100+ countries (Week 4)
- Automated optimization suggestions based on tracking data (Week 5)
- Advanced NLP for paraphrasing detection (future enhancement)
- Browser automation for platforms without APIs (use official APIs for MVP)
- Multi-language tracking (English only for MVP)
- Video/podcast AI platform tracking (YouTube AI summaries, Spotify AI - future)
- Social media AI tracking (Twitter/X AI summaries - future)
- Custom prompt templates created by users (use system templates for MVP)

---

## Technical Notes for Planning Phase

When creating the implementation plan (`/speckit.plan`), consider:

1. **API Cost Management**: Implement cost estimation before tracking runs; warn users if projected monthly cost exceeds budget
2. **Prompt Template System**: Build modular template engine where new templates can be added without code changes
3. **Parallel Processing**: Use Inngest's concurrency control to avoid overwhelming AI APIs (max 10 concurrent per platform)
4. **Citation Extraction**: Start with regex-based text matching for MVP; plan for NLP upgrade in future
5. **Testing Strategy**: Use known test cases (brand definitely mentioned, definitely not mentioned) to validate detection accuracy
6. **Error Handling**: Log all API errors with full context (prompt, platform, response) for debugging
7. **Data Aggregation**: Implement background job to aggregate daily data into weekly/monthly for 90+ day old records
8. **Dashboard Performance**: Use database indexes on tracking_run + brand_id + date for fast trend queries

---

*End of Week 3 Specification*

---

*End of Phase 1 Specification (Weeks 1-3)*

Phase 1 delivers the **Core Engine**: AI content generation, multi-platform publishing, and AI visibility tracking. These three capabilities form the foundation for all advanced features in Phases 2-4.

**Next Phase**: Phase 2 (Weeks 4-6) adds Intelligence & Scale - global tracking, smart optimization detection, and MVP launch.

---

