# Phase 2 Specification: Intelligence & Scale (Weeks 4-6)

**Created**: 2025-11-15
**Status**: Draft
**Roadmap Reference**: 12weekroadmap.md - PHASE 2: INTELLIGENCE & SCALE

**Note**: Original Week 4 (Global Tracking System) has been moved to post-launch phase (after Week 12) based on MVP prioritization. Phase 2 now focuses on Weeks 5-6.

---

# Week 5: Smart Optimization Detector

**Timeline**: Days 16-20 (formerly Week 5, now Week 4 in revised schedule)
**Goal**: Automatically detect and fix optimization opportunities
**Deliverable**: System that finds and fixes SEO/GEO opportunities automatically

## Overview

The Smart Optimization Detector is the intelligence layer that continuously analyzes user content, competitor content, and AI visibility data to automatically identify actionable optimization opportunities. It runs every 6 hours, detecting 5 types of opportunities:

1. **Update headings & intro keywords** - Detect keyword gaps in H1/H2 and introductions
2. **Add new FAQs to site** - Identify common questions from AI tracking that should be answered on site
3. **Refresh metadata for top pages** - Update title tags, meta descriptions for better AI visibility
4. **Upload latest LLMTXT** - Generate and update llms.txt file for LLM-friendly content summaries
5. **Add internal links** - Identify opportunities to link related content together

Each opportunity includes:
- **Detection**: What issue was found and why it matters
- **Recommendation**: Generic suggestion for improvement (e.g., "Add keywords X, Y to your H1")
- **Priority Score**: Effort-based ranking (quick wins prioritized)
- **One-click approval**: User reviews and approves with single click
- **Staged deployment**: Changes preview in staging before production publish

## User Scenarios & Testing

### User Story 1 - Receive Automated Optimization Opportunities (Priority: P1)

A busy founder wants the system to automatically identify SEO/GEO improvements for their content without manual audits.

**Why this priority**: This is the core value proposition of the Smart Optimization Detector - if users don't receive useful, actionable opportunities, the entire feature fails. Everything else builds on this foundation.

**Independent Test**: Can be fully tested by publishing 5 articles, adding 3 competitors, waiting 6 hours for scanner to run, and viewing detected opportunities dashboard with at least 8-12 opportunities across the 5 detection types.

**Acceptance Scenarios**:

1. **Given** I have published 5 articles and the scanner runs every 6 hours, **When** I check the Opportunities Dashboard after the first scan, **Then** I see opportunities grouped by type: Keyword Updates (3), FAQs (2), Metadata (4), LLMTXT (1), Internal Links (5) - Total: 15 opportunities
2. **Given** opportunities are detected, **When** I click into "Keyword Updates" category, **Then** I see each opportunity with: affected page, current issue ("Missing keywords 'project management' in H1"), recommended action ("Add keywords to heading"), estimated effort (5 min), priority score (Quick Win)
3. **Given** I view an opportunity, **When** I click "View Details", **Then** I see: full context (current heading text, competitor analysis showing they all use these keywords, AI tracking data showing this keyword drives visibility), expected impact ("Could improve visibility from 12% to 18%")
4. **Given** I receive 15 opportunities, **When** I view the priority-sorted list, **Then** quick wins appear first (metadata updates, LLMTXT generation) followed by moderate effort items (keyword updates, FAQs) and complex items (internal link network) at the bottom

---

### User Story 2 - Review & Approve Optimization with Staging Preview (Priority: P1)

A content manager wants to preview how keyword updates will look on their site before publishing the changes live.

**Why this priority**: Without staging/preview, users can't confidently approve changes - fear of breaking their site or publishing poor-quality edits will prevent adoption. This is critical for trust.

**Independent Test**: Can be fully tested by approving a "Keyword Update" opportunity, viewing the staged preview at staging.magnumopus.com, verifying the change looks correct, and promoting to production with one click.

**Acceptance Scenarios**:

1. **Given** I have an opportunity "Add 'remote team collaboration' to article H1", **When** I click "Approve & Preview", **Then** the system generates the updated content and deploys to staging.magnumopus.com/preview/article-slug
2. **Given** staged preview is ready, **When** I view it, **Then** I see the article with updated H1 highlighted in yellow, with before/after comparison: "Before: 'Best Collaboration Tools' → After: 'Best Remote Team Collaboration Tools'"
3. **Given** I review the preview, **When** I see the change looks good and click "Publish to Live Site", **Then** the system publishes to my connected WordPress/Shopify/etc. site and marks opportunity as "Completed"
4. **Given** I review the preview, **When** I see the keyword placement feels unnatural and click "Reject Changes", **Then** the opportunity returns to "Pending" with option to "Edit Recommendation" and provide feedback ("Keyword placement feels forced")
5. **Given** I don't review the staged preview within 7 days, **When** the auto-expire timer runs, **Then** the staged content is deleted and opportunity remains in "Pending" status with note "Approval expired - review again?"

---

### User Story 3 - Analyze Competitor Content for Gaps (Priority: P2)

An SEO specialist wants to see what topics their competitors cover that they don't, to identify content creation opportunities.

**Why this priority**: Competitor analysis differentiates this tool from simple SEO checkers - it provides strategic insights not just technical fixes. Key for competitive positioning.

**Independent Test**: Can be fully tested by adding 3 competitors (Asana, Monday.com, ClickUp), waiting for scanner to analyze their sites, and viewing "Content Gap" report showing 10+ topics competitors cover but user doesn't.

**Acceptance Scenarios**:

1. **Given** I add 3 competitor URLs (asana.com, monday.com, clickup.com), **When** the scanner runs, **Then** it crawls competitor sites (max 100 pages each) and extracts topics, keywords, and content structure
2. **Given** competitor analysis completes, **When** I view "Content Gaps" dashboard, **Then** I see: Topics competitors cover that I don't (15 gaps found), Topics I cover uniquely (8 unique topics), Shared topic coverage (12 common topics)
3. **Given** I see content gaps, **When** I click on a gap "Gantt Chart Features - covered by all 3 competitors, missing from your content", **Then** I see: links to competitor pages covering this topic, keyword suggestions for creating content, priority score based on AI visibility tracking (if competitors get mentioned for these keywords)
4. **Given** a content gap is identified, **When** I click "Create Content from Gap", **Then** the system pre-fills Week 1's content generator with: topic ("Gantt Chart Features"), keywords extracted from competitors, template recommendation (Comparison or Ultimate Guide), and competitors listed for reference

---

### User Story 4 - Generate and Deploy LLMTXT for AI Visibility (Priority: P2)

A marketer wants to ensure AI platforms (ChatGPT, Claude, etc.) can easily parse their content by providing an llms.txt file with structured summaries.

**Why this priority**: LLMTXT is emerging as a standard for AI-friendly content (like robots.txt for SEO). Implementing this early positions users ahead of competitors and directly improves AI visibility.

**Independent Test**: Can be fully tested by having 10 published articles, triggering LLMTXT generation, viewing the generated llms.txt file content, and manually uploading it to site root to verify format.

**Acceptance Scenarios**:

1. **Given** I have 10 published articles across my WordPress site, **When** the scanner detects "LLMTXT is missing or outdated" opportunity, **Then** I see recommendation: "Generate llms.txt to help AI platforms understand your content - improves visibility"
2. **Given** I approve LLMTXT generation, **When** the system creates the file, **Then** I see preview of llms.txt content: structured summary of all published content (title, URL, summary, key topics, last updated date) in LLM-friendly format
3. **Given** llms.txt is generated, **When** I click "View Upload Instructions", **Then** I see platform-specific steps: WordPress (install llms.txt plugin or manual upload via FTP), Shopify (upload to theme assets), Generic (add to site root directory)
4. **Given** I upload llms.txt manually, **When** I return to platform and click "Verify Upload", **Then** the system checks mysite.com/llms.txt is accessible and correctly formatted, marks opportunity as "Completed"
5. **Given** I publish 10 new articles, **When** scanner runs next week, **Then** it detects "LLMTXT is outdated (last updated 7 days ago, 10 new articles published)" and offers to regenerate

---

### User Story 5 - Auto-Detect FAQ Opportunities from AI Tracking (Priority: P2)

A content creator wants to identify common questions people ask AI platforms about their topic and add FAQ sections to rank for those queries.

**Why this priority**: Bridges Week 3 (AI tracking) and Week 5 (optimization) - uses tracking data to drive content improvements. This is "smart" optimization, not just generic SEO rules.

**Independent Test**: Can be fully tested by having Week 3 tracking data showing 20+ prompts about "project management", system detecting 5 common question patterns, and suggesting FAQ additions to relevant articles.

**Acceptance Scenarios**:

1. **Given** Week 3 tracking has captured 100+ prompts about my industry, **When** the FAQ detector analyzes them, **Then** it identifies common question patterns: "What is X?", "How does X work?", "X vs Y?", "Best X for [use case]"
2. **Given** 5 common questions are identified (e.g., "What is the best project management tool for remote teams?"), **When** I view FAQ opportunities, **Then** I see: the question, frequency (asked in 15 of 100 prompts), which article should answer it (matched to relevant content), AI-generated draft answer
3. **Given** I approve an FAQ addition, **When** the system stages the change, **Then** I see the article with new FAQ section added at bottom, properly formatted with Schema.org FAQ markup for SEO, and question/answer clearly structured
4. **Given** FAQs are published, **When** I track visibility in subsequent scans, **Then** I can correlate FAQ additions with visibility improvements (e.g., "Added FAQ 'What is the best PM tool for remote teams' - visibility for this prompt increased from 8% to 22%")

---

### User Story 6 - Optimize Internal Linking Structure (Priority: P3)

An SEO expert wants to strengthen their internal linking by connecting related articles together for better site architecture and AI discoverability.

**Why this priority**: Internal linking is important for SEO/GEO but is lower priority than content quality improvements. Nice-to-have for MVP, powerful for advanced users.

**Independent Test**: Can be fully tested by having 20 published articles on related topics, system detecting 15 internal link opportunities, and viewing suggested anchor text and link placements.

**Acceptance Scenarios**:

1. **Given** I have 20 articles about project management topics, **When** the internal link detector analyzes them, **Then** it identifies opportunities to link related content: "Article A about 'Gantt charts' should link to Article B about 'Project Timelines' (related topics)"
2. **Given** 15 link opportunities are found, **When** I view them prioritized, **Then** I see: source article, target article, suggested anchor text ("learn more about project timelines"), suggested placement (after paragraph 3 where timelines are mentioned), relevance score (High/Medium/Low)
3. **Given** I approve an internal link addition, **When** the system stages it, **Then** I see the source article with new link highlighted in context, properly integrated into sentence flow (not jarring insertion)
4. **Given** internal links are added, **When** I view link graph visualization, **Then** I see network diagram of all my articles with lines showing internal links, color-coded by strength (number of links), helping identify orphaned content or over-linked hub pages

---

### User Story 7 - Receive Daily Digest of New Opportunities (Priority: P3)

A busy entrepreneur wants a daily summary of new optimization opportunities delivered to their inbox rather than constantly checking the dashboard.

**Why this priority**: Notification system is table stakes for retention - users won't remember to check dashboard daily. Email digest reduces friction and keeps users engaged.

**Independent Test**: Can be fully tested by configuring daily digest for 9 AM, waiting 24 hours after scanner runs, and receiving email with 8+ new opportunities summarized with one-click approval links.

**Acceptance Scenarios**:

1. **Given** I configure daily digest notifications for 9:00 AM, **When** scanner runs at 2 AM, 8 AM, 2 PM, 8 PM within 24 hours, **Then** I receive one email at 9:00 AM next day summarizing all opportunities detected in last 24 hours
2. **Given** daily digest email arrives, **When** I open it, **Then** I see: summary stats (12 new opportunities, 3 high priority), opportunities grouped by type with top 2-3 previewed per category, one-click "Review All Opportunities" button
3. **Given** I see opportunity preview in email, **When** I click "Quick Approve" link directly in email, **Then** the system approves that opportunity, generates staged preview, and sends follow-up email with staging link for review
4. **Given** scanner finds 0 new opportunities, **When** daily digest time arrives, **Then** I receive email with positive message: "No new opportunities found - your content is well-optimized! Current visibility score: 24% (↑2% this week)"

---

### Edge Cases

- **What happens if scanner detects 50+ opportunities for one site?** Limit to top 20 by priority score to avoid overwhelming user; show "20 of 53 opportunities - showing highest priority" with option to view all
- **How to handle conflicting recommendations?** (e.g., add keyword to H1 vs keep H1 concise) Use priority scoring to surface one recommendation; note conflict in details; allow user to dismiss with reason
- **What if competitor site blocks crawler?** Detect 403/robots.txt blocking, notify user "Competitor X blocked analysis - try adding their RSS feed or public API instead", allow manual competitor data entry
- **How does system handle already-optimized content?** If no opportunities found for an article after 3 consecutive scans, mark as "Fully Optimized" and reduce scan frequency to weekly to save resources
- **What if staged preview link is shared publicly?** Add authentication token to staging URLs, expire after 7 days, optionally add password protection for sensitive content
- **How to handle platform-specific limitations?** Some platforms can't edit certain fields (Shopify blog metadata limited) - detect capabilities, hide incompatible opportunities, show warning "Shopify doesn't support custom meta descriptions"
- **What if AI-generated FAQ answer is factually wrong?** Always show "Generated by AI - Review for accuracy" warning; require user to edit before approving; track user feedback to improve generation
- **How does batch approval work?** Allow selecting multiple opportunities (checkboxes), "Approve All" button, generates single staging environment with all changes combined, publish all or none (atomic operation)

---

## Requirements

### Functional Requirements

#### Opportunity Scanner Infrastructure
- **FR-001**: System MUST run opportunity scanner every 6 hours for all users (2 AM, 8 AM, 2 PM, 8 PM UTC)
- **FR-002**: Scanner MUST execute as background job (Inngest) without blocking user interface
- **FR-003**: Scanner MUST analyze: user's published content (Week 1+2), connected site content, competitor content, AI tracking data (Week 3), citation patterns
- **FR-004**: Scanner MUST complete full analysis for average user (20 articles, 3 competitors) within 15 minutes
- **FR-005**: Users MUST be able to manually trigger scanner on-demand (max 1x per hour to prevent abuse)
- **FR-006**: Scanner MUST track last run timestamp and next scheduled run, displayed in dashboard
- **FR-007**: System MUST log all scanner runs with: start time, duration, opportunities detected, errors encountered

#### Detection Rule 1: Update Headings & Intro Keywords
- **FR-008**: System MUST analyze H1, H2, and first paragraph of each article for keyword coverage
- **FR-009**: System MUST compare user's keyword usage to Week 3 AI tracking data (which keywords drive visibility)
- **FR-010**: System MUST compare user's keyword usage to competitor usage for same topics
- **FR-011**: System MUST detect missing keywords that appear in: AI tracking top prompts, competitor headings, or high-visibility content
- **FR-012**: Recommendations MUST be generic suggestions: "Add keywords [X, Y, Z] to your H1 or introduction to improve visibility for these terms"
- **FR-013**: System MUST NOT auto-rewrite content; users approve and implement changes manually or via staged preview
- **FR-014**: System MUST flag opportunities with estimated keyword impact: "Adding these keywords could improve visibility for 12 related prompts"

#### Detection Rule 2: Add New FAQs to Site
- **FR-015**: System MUST analyze Week 3 tracking prompts to identify common question patterns
- **FR-016**: Question detection MUST recognize patterns: "What is...", "How to...", "Best X for Y", "X vs Y", "Why X..."
- **FR-017**: System MUST cluster similar questions (e.g., "Best PM tool for remote teams" and "Top project management software for distributed teams" = same FAQ)
- **FR-018**: System MUST match questions to relevant articles based on topic similarity (using keyword/semantic matching)
- **FR-019**: System MUST generate draft FAQ answers using AI (GPT-4/Claude) with warning "AI-generated - review for accuracy"
- **FR-020**: FAQ recommendations MUST include: question text, frequency (mentioned in X prompts), suggested target article, draft answer, Schema.org markup template
- **FR-021**: System MUST prioritize FAQ opportunities by question frequency (most-asked questions first)

#### Detection Rule 3: Refresh Metadata for Top Pages
- **FR-022**: System MUST analyze title tags and meta descriptions for all indexed pages
- **FR-023**: System MUST detect metadata issues: missing title/description, too long (>60 chars title, >160 chars description), missing target keywords, duplicate across pages
- **FR-024**: System MUST prioritize metadata updates for "top pages" defined by: highest traffic, best AI visibility, most competitor overlap
- **FR-025**: Recommendations MUST specify: current metadata, detected issue, suggested keywords to include, character count targets
- **FR-026**: System MUST validate metadata changes meet length requirements before staging
- **FR-027**: System MUST support platform-specific metadata fields: WordPress (Yoast/RankMath), Shopify (page title/description), Webflow (SEO settings)

#### Detection Rule 4: Upload Latest LLMTXT
- **FR-028**: System MUST generate llms.txt file containing: site overview, list of all published content with titles/URLs/summaries, key topics/keywords, last updated timestamp
- **FR-029**: LLMTXT format MUST follow emerging standard: structured markdown or JSON-LD, LLM-friendly formatting (clear sections, concise summaries)
- **FR-030**: System MUST detect when llms.txt should be updated: doesn't exist, >7 days old, 10+ new articles published since last generation
- **FR-031**: System MUST regenerate llms.txt weekly OR when significant changes detected (whichever comes first)
- **FR-032**: System MUST provide download link for generated llms.txt file
- **FR-033**: System MUST provide platform-specific upload instructions: WordPress (FTP/SFTP, file manager, plugin), Shopify (theme assets), Generic (add to site root)
- **FR-034**: System MUST verify llms.txt accessibility: check site.com/llms.txt returns 200 status and correct content
- **FR-035**: Users MUST be able to preview llms.txt before downloading/uploading

#### Detection Rule 5: Add Internal Links
- **FR-036**: System MUST analyze all published articles to identify related content (using keyword/topic similarity)
- **FR-037**: System MUST detect missing internal link opportunities: Article A mentions Topic X, Article B covers Topic X in detail, but A doesn't link to B
- **FR-038**: System MUST generate suggested anchor text from context: extract sentence mentioning topic, suggest natural link placement
- **FR-039**: Recommendations MUST include: source article, target article, suggested anchor text, suggested placement (paragraph number or after specific sentence), relevance score
- **FR-040**: System MUST avoid over-linking: max 3-5 internal links per article, no duplicate links to same target, no circular link patterns
- **FR-041**: System MUST visualize internal link graph: show all articles as nodes, links as edges, highlight orphaned content (no incoming links)

#### Competitor Analysis System
- **FR-042**: Users MUST be able to add 3-5 competitor URLs manually
- **FR-043**: System MUST crawl competitor websites (max 100 pages each) to extract: page titles, headings, keywords, topics covered, metadata
- **FR-044**: Crawler MUST respect robots.txt and rate limits (max 1 request per second per domain)
- **FR-045**: System MUST detect content gaps: topics/keywords competitors cover that user doesn't
- **FR-046**: Content gap analysis MUST show: gap description ("All 3 competitors cover 'Gantt Charts' but you don't"), competitor page links, priority score based on AI visibility (if competitors mentioned for these keywords in Week 3 tracking)
- **FR-047**: Users MUST be able to create content directly from gap: pre-fill Week 1 generator with gap topic and competitor references
- **FR-048**: Competitor data MUST refresh weekly to detect new competitor content
- **FR-049**: System MUST handle crawler errors gracefully: 403/robots.txt blocking, timeouts, invalid URLs - notify user and allow manual competitor data entry

#### Priority Scoring & Ranking
- **FR-050**: System MUST calculate priority score for each opportunity based on effort estimation
- **FR-051**: Effort estimation MUST categorize opportunities: Quick Win (1-5 min), Moderate (10-30 min), Complex (1+ hour)
- **FR-052**: Quick Win examples: metadata updates, LLMTXT generation, single FAQ addition
- **FR-053**: Moderate examples: keyword updates to headings, multiple FAQ additions, internal link additions
- **FR-054**: Complex examples: content gap creation (full new article), internal link restructure (10+ links)
- **FR-055**: Opportunities MUST display in priority order: Quick Wins first, then Moderate, then Complex
- **FR-056**: Users MUST be able to manually reorder priorities or mark opportunities as "Low Priority" to defer

#### Approval Workflow & Staging
- **FR-057**: All optimization opportunities MUST require user approval before applying (one-click approve, no auto-apply)
- **FR-058**: Users MUST be able to approve opportunities individually or in batch (select multiple, approve all)
- **FR-059**: Upon approval, system MUST generate staged preview at staging.magnumopus.com/preview/[unique-id]
- **FR-060**: Staged preview MUST show: before/after comparison, changes highlighted in yellow, full page context
- **FR-061**: Staged preview URLs MUST include authentication token, expire after 7 days, optionally support password protection
- **FR-062**: Users MUST be able to: Publish to Live (apply to production site), Reject Changes (return to Pending), Edit Recommendation (provide feedback for improvement)
- **FR-063**: Publishing to live MUST trigger Week 2 publishing workflow: publish to connected platforms (WordPress, Shopify, etc.)
- **FR-064**: System MUST track opportunity lifecycle: Detected → Pending → Approved → Staged → Published/Rejected
- **FR-065**: Users MUST be able to undo published changes within 24 hours (revert to previous version)

#### Opportunity Dashboard
- **FR-066**: System MUST display Opportunity Dashboard with: total opportunities, grouped by type (5 categories), priority-sorted list, filter by status/type/priority
- **FR-067**: Dashboard MUST show summary stats: X new opportunities since last check, Y opportunities approved this week, Z opportunities published
- **FR-068**: Each opportunity card MUST display: type icon, title/description, affected page, priority badge (Quick Win/Moderate/Complex), one-click "Approve" button
- **FR-069**: Dashboard MUST support bulk actions: Select all Quick Wins, Approve All Selected, Dismiss All Low Priority
- **FR-070**: Users MUST be able to view opportunity details: full context, competitor analysis, AI tracking correlation, estimated impact
- **FR-071**: Dashboard MUST show progress tracking: opportunities detected over time (chart), approval rate, time-to-publish metrics

#### Notification System
- **FR-072**: System MUST send daily digest email to all users at user-configured time (default: 9:00 AM user's timezone)
- **FR-073**: Daily digest MUST include: summary stats (X new opportunities), top 2-3 opportunities per category previewed, one-click "Review All" button
- **FR-074**: Daily digest MUST support one-click approval: "Quick Approve" link in email for individual opportunities
- **FR-075**: If 0 new opportunities found, daily digest MUST send positive message: "No new opportunities - content is well-optimized!" with current visibility score
- **FR-076**: In-app notifications MUST show when new opportunities are detected (badge count on dashboard icon)
- **FR-077**: Users MUST be able to configure notification preferences: enable/disable daily digest, change time, email vs in-app only
- **FR-078**: System MUST track notification engagement: open rate, click-through rate, approval rate from email vs dashboard

### Constitutional Alignment Requirements

#### Intelligent Automation (Principle 4)
- Opportunity scanner runs every 6 hours automatically (no manual audits)
- 5 detection rules cover comprehensive optimization needs
- Competitor analysis provides strategic insights, not just technical fixes
- One-click approval reduces friction while maintaining control
- Daily digest keeps users engaged without overwhelming

#### Quality & GEO Optimization (Principle 5)
- Keyword detection improves content relevance for AI platforms
- FAQ addition directly targets common user queries from AI tracking
- LLMTXT generation ensures LLM-friendly content formatting
- Metadata optimization improves discoverability

#### Scalability & Performance (Principle 6)
- Background job processing handles scanner without blocking UI
- 15-minute scan completion for average user ensures responsiveness
- Staged preview environment prevents production issues
- Batch approval supports power users managing many opportunities

#### Enterprise-Ready Architecture (Principle 7)
- Competitor analysis supports agency workflows (track client competitors)
- Batch operations enable efficient multi-client management
- Export/reporting for client deliverables
- Staging workflow supports professional content review processes

### Key Entities

- **OpportunityScan**: Execution of scanner job (scan ID, user ID, start time, completion time, opportunities detected, status, errors)
- **Opportunity**: Detected optimization issue (scan ID, type, title, description, affected content ID, priority score, effort estimate, status, created date)
- **OpportunityType**: Category of optimization (KEYWORD_UPDATE, FAQ_ADDITION, METADATA_REFRESH, LLMTXT_UPDATE, INTERNAL_LINK)
- **CompetitorSite**: User-configured competitor (competitor URL, site name, last crawled date, page count, user ID)
- **CompetitorPage**: Crawled competitor content (competitor ID, page URL, title, headings, keywords, topics, crawled date)
- **ContentGap**: Identified missing topic (gap description, competitor pages covering it, priority score, created from tracking data, user ID)
- **StagedChange**: Approved opportunity in staging (opportunity ID, staged URL, preview content, authentication token, expiration date, status)
- **OpportunityApproval**: User approval action (opportunity ID, user ID, approval date, approval method: dashboard/email/batch, feedback text)
- **InternalLinkSuggestion**: Link opportunity detail (source article ID, target article ID, anchor text, placement context, relevance score)
- **FAQDetection**: Identified question pattern (question text, frequency count, source prompts, matched article, draft answer, user ID)

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Scanner completes full analysis (20 articles, 3 competitors) in under 15 minutes on average
- **SC-002**: System detects 8-15 opportunities per scan for typical user (mix of quick wins and moderate)
- **SC-003**: Opportunity detection achieves 85%+ relevance (user finds recommendations useful, not spam)
- **SC-004**: Staged preview generates within 30 seconds of approval
- **SC-005**: Daily digest delivers within ±5 minutes of configured time
- **SC-006**: Competitor crawler successfully extracts content from 90%+ of added competitors (accounting for blocking/errors)
- **SC-007**: Users approve and publish 40%+ of detected opportunities (demonstrates usefulness)
- **SC-008**: Time from opportunity detection to live publish averages <24 hours (fast iteration)
- **SC-009**: LLMTXT generation completes within 60 seconds for sites with up to 100 pages
- **SC-010**: Internal link detection identifies 10-20 relevant link opportunities for sites with 20+ articles

### User Satisfaction Metrics

- Users report 70%+ of opportunities are "useful and actionable"
- 60% of users approve at least one opportunity within first week
- Users check Opportunity Dashboard 3+ times per week on average
- Daily digest email has 40%+ open rate, 15%+ click-through rate
- Competitor analysis leads to creation of 2+ new articles per month addressing gaps
- Users report saving 5+ hours per month on manual SEO audits

---

## Assumptions

1. Users have published at least 5 articles (Week 1+2) before scanner provides meaningful opportunities
2. Competitor websites are publicly accessible and don't block crawlers (robots.txt allows)
3. Generic keyword suggestions are acceptable for MVP; AI-generated rewrites are post-MVP enhancement
4. Platform-managed staging (staging.magnumopus.com) is acceptable; native platform staging (WordPress plugins) is future enhancement
5. Effort-based priority scoring is sufficient for MVP; impact-based scoring (predicted visibility improvement) is future enhancement using ML
6. LLMTXT standard is still emerging; format may evolve and require updates
7. Daily digest frequency is optimal; real-time notifications would cause fatigue
8. Users can manually implement recommendations if platform doesn't support automated publishing
9. Competitor analysis focuses on content gaps only; full SEO profile (backlinks, rankings) is future enhancement

---

## Dependencies

- **Week 1 Integration**: Published articles provide content to optimize
- **Week 2 Integration**: Publishing workflow applies approved changes to live sites
- **Week 3 Integration**: AI tracking data drives FAQ detection and keyword recommendations
- **Web Crawler**: Scraping library (Playwright, Cheerio) for competitor analysis
- **AI APIs**: GPT-4/Claude for FAQ answer generation, keyword extraction, content gap analysis
- **Staging Infrastructure**: Hosting environment for staging.magnumopus.com preview deployments
- **Background Jobs**: Inngest for scanner execution every 6 hours
- **Email Service**: SendGrid/Postmark for daily digest delivery
- **Database**: Storage for opportunities, scans, competitor data, staged changes, approvals

---

## Out of Scope (Week 5)

- AI-generated content rewrites (provide suggestions only, user implements)
- Impact-based priority scoring with ML (use effort-based for MVP)
- Native platform staging integration (WordPress staging plugins, Shopify drafts)
- Real-time notifications (use daily digest for MVP)
- Image optimization detection (focus on text content for MVP)
- Backlink analysis as part of competitor analysis (content only for MVP)
- Automated A/B testing of optimizations (track visibility changes, but no controlled experiments)
- Custom detection rules created by users (use 5 predefined rules for MVP)
- Mobile-specific optimization detection (focus on desktop/general for MVP)

---

## Technical Notes for Planning Phase

When creating the implementation plan (`/speckit.plan`), consider:

1. **Scanner Architecture**: Build as modular system where each detection rule is independent plugin/module; easy to add Rule #6, #7 in future
2. **Competitor Crawler**: Implement rate limiting, User-Agent rotation, error handling for 403/timeouts; consider headless browser (Playwright) for JS-heavy sites
3. **Staging Environment**: Docker-based preview containers for isolation; expire/cleanup after 7 days; authentication middleware for security
4. **Priority Scoring**: Start with simple rule-based scoring (metadata = Quick Win, content rewrite = Complex); collect data for ML-based scoring in future
5. **Testing Strategy**: Use test competitor sites (example.com), mock AI tracking data, verify opportunity detection accuracy with known issues
6. **Performance**: Cache competitor crawl results for 7 days to reduce repeated crawling; use database indexes for opportunity queries
7. **Error Handling**: Graceful degradation if one detection rule fails (still show results from other 4 rules); log errors for debugging
8. **Data Privacy**: Don't store full competitor page content (just metadata); respect copyright; add opt-out mechanism if competitors complain

---

*End of Week 5 Specification*

---

