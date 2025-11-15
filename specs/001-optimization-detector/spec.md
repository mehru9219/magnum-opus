# Feature Specification: Smart Optimization Detector

**Feature Branch**: `001-optimization-detector`
**Created**: 2025-11-15
**Status**: Draft
**Input**: User description: "Smart Optimization Detector - Automatically detect and fix SEO/GEO optimization opportunities including headings, FAQs, metadata, LLMTXT, and internal links. Runs every 6 hours with auto-fix functionality, priority scoring, batch optimization, dashboard UI, progress tracking, and notifications (email, Slack, in-app)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatic Opportunity Detection (Priority: P1)

As a content manager, I need the system to automatically scan my website every 6 hours and identify SEO/GEO optimization opportunities so that I can improve my AI visibility without manual analysis.

**Why this priority**: Core value proposition - without automatic detection, there's no product. This is the foundation that all other features build upon.

**Independent Test**: Can be fully tested by running the scanner on a test website with known optimization gaps (e.g., pages missing FAQs, outdated metadata, broken internal links) and verifying that all expected opportunities are detected and scored correctly.

**Acceptance Scenarios**:

1. **Given** a website with 10 published articles, **When** the scanner runs its 6-hour cycle, **Then** the system detects all optimization opportunities across 5 categories (headings/keywords, FAQs, metadata, LLMTXT, internal links)
2. **Given** a page with outdated H1 tags missing target keywords, **When** the scanner analyzes the page, **Then** the system creates an opportunity record with type "Update headings & intro keywords" and calculates a priority score
3. **Given** a top-performing page without FAQ schema, **When** the scanner identifies the page in top 10 rankings, **Then** the system generates an "Add new FAQs to site" opportunity with high priority
4. **Given** pages with stale metadata (last updated >6 months), **When** the scanner runs, **Then** the system flags "Refresh metadata for top pages" opportunities for each affected page
5. **Given** a website without LLMTXT file or with outdated LLMTXT, **When** the scanner checks site-wide settings, **Then** the system creates an "Upload latest LLMTXT" opportunity with urgent priority
6. **Given** articles with low internal link density (<3 links per 1000 words), **When** the scanner analyzes content, **Then** the system suggests "Add internal links" opportunities with recommended anchor texts and target pages

---

### User Story 2 - One-Click Auto-Fix (Priority: P2)

As a content manager, I want to apply optimization fixes with one click so that I can quickly implement improvements without manual editing.

**Why this priority**: This is what differentiates the product from simple analysis tools - automated remediation is the killer feature. However, detection must work first (hence P2 after P1).

**Independent Test**: Can be tested by selecting an opportunity from the dashboard and clicking "Apply Fix", then verifying the change is applied correctly to the live site (or staging, depending on user settings).

**Acceptance Scenarios**:

1. **Given** an opportunity to "Update headings & intro keywords", **When** I click "Apply Fix", **Then** the system automatically updates the H1, H2 tags and first paragraph with optimized keywords without changing the content meaning
2. **Given** an "Add new FAQs to site" opportunity, **When** I click "Apply Fix", **Then** the system generates AI-written FAQ content based on user search intent and adds it to the page with proper schema markup
3. **Given** a "Refresh metadata" opportunity, **When** I click "Apply Fix", **Then** the system updates the meta title and description with current year, trending keywords, and optimized copy length
4. **Given** an "Upload latest LLMTXT" opportunity, **When** I click "Apply Fix", **Then** the system generates an up-to-date LLMTXT file with all current site content and uploads it to the site root
5. **Given** an "Add internal links" opportunity, **When** I click "Apply Fix", **Then** the system inserts 3-5 contextually relevant internal links with natural anchor text into the article content
6. **Given** 10 pending opportunities, **When** I select all and click "Batch Apply", **Then** the system processes all fixes sequentially with progress updates and error handling for any failures

---

### User Story 3 - Opportunity Dashboard & Progress Tracking (Priority: P3)

As a content manager, I need a dashboard showing all detected opportunities with priority scores, status tracking, and filtering options so that I can prioritize and manage optimization work effectively.

**Why this priority**: Provides visibility and control over the optimization process. Essential for users managing large sites, but the underlying detection and fix capabilities (P1, P2) must exist first.

**Independent Test**: Can be tested by navigating to the dashboard with a database containing 50+ opportunities across different types, statuses, and priority levels, then verifying all filtering, sorting, and status update features work correctly.

**Acceptance Scenarios**:

1. **Given** 50 detected opportunities, **When** I open the dashboard, **Then** I see a prioritized list showing opportunity type, affected page, priority score, status (pending/in-progress/completed), and estimated impact
2. **Given** opportunities with different priority scores, **When** I view the dashboard, **Then** opportunities are sorted by priority score (highest first) with visual indicators (red=urgent, orange=high, yellow=medium, green=low)
3. **Given** opportunities across 5 categories, **When** I apply filters, **Then** I can filter by type, status, date range, affected page, and priority level
4. **Given** an opportunity in "pending" status, **When** I start working on it manually, **Then** I can mark it as "in-progress" to track my work
5. **Given** a completed opportunity, **When** the next scan runs, **Then** the system verifies the fix is still applied and either marks it "verified" or re-opens if the issue recurs
6. **Given** the dashboard view, **When** I view summary statistics, **Then** I see total opportunities, completion rate, average time to fix, and estimated SEO impact of completed optimizations

---

### User Story 4 - Multi-Channel Notifications (Priority: P4)

As a content manager, I want to receive notifications via email, Slack, or in-app alerts when new high-priority opportunities are detected so that I can act quickly on important optimizations.

**Why this priority**: Nice-to-have feature that improves user engagement but not critical for core functionality. Users can still check the dashboard manually (P3).

**Independent Test**: Can be tested by configuring notification preferences, triggering a scan that detects high-priority opportunities, and verifying notifications are delivered to the correct channels within expected timeframes.

**Acceptance Scenarios**:

1. **Given** notification preferences set to email, **When** the scanner detects 5 new high-priority opportunities, **Then** I receive an email digest within 15 minutes listing all opportunities with direct links to the dashboard
2. **Given** Slack integration configured, **When** an urgent opportunity is detected (priority score >90), **Then** a Slack message is posted to the configured channel with opportunity details and a "Quick Fix" button
3. **Given** in-app notifications enabled, **When** I'm logged into the platform and new opportunities are detected, **Then** I see a notification badge with the count of new opportunities and can view them in a dropdown
4. **Given** notification frequency set to "daily digest", **When** 20 opportunities accumulate over 24 hours, **Then** I receive one consolidated email at my preferred time (default 9 AM local time) instead of individual notifications
5. **Given** an opportunity I previously dismissed, **When** the same opportunity is re-detected, **Then** the system does not send duplicate notifications unless the priority score increases significantly

---

### Edge Cases

- **What happens when a fix fails to apply?** System logs the error, marks opportunity as "failed", sends error notification, and allows manual retry or rollback
- **How does the system handle pages that are being actively edited?** Scanner detects edit locks or recent changes (within last 30 minutes) and skips those pages, re-queuing them for the next scan cycle
- **What if multiple opportunities conflict on the same page?** System applies priority scoring and either processes highest priority first or groups compatible changes into a single batch operation
- **How does the system handle deleted pages?** Automatically archives opportunities for deleted pages and removes them from active dashboard
- **What if a user manually reverts an auto-fix?** Next scan detects the reversion, marks the opportunity as "user-rejected", and stops suggesting the same fix unless the page context changes significantly
- **How does batching handle rate limits?** Batch processor respects platform API rate limits (e.g., WordPress REST API) with exponential backoff and queuing
- **What if the site uses a custom CMS not in the platform list?** Scanner can still analyze content via web scraping, but auto-fix requires manual implementation or custom API integration
- **How does the system avoid over-optimization?** Tracks optimization frequency per page (max 1 fix per page per 7 days) and maintains natural language quality scores to prevent keyword stuffing

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST run automated scans every 6 hours to detect optimization opportunities across all connected sites
- **FR-002**: System MUST detect opportunities in 5 categories: "Update headings & intro keywords", "Add new FAQs to site", "Refresh metadata for top pages", "Upload latest LLMTXT", and "Add internal links"
- **FR-003**: System MUST calculate a priority score (0-100) for each detected opportunity based on page importance, potential impact, and recency
- **FR-004**: System MUST support one-click auto-fix functionality for each opportunity type, automatically applying changes to the connected CMS
- **FR-005**: System MUST support batch processing of multiple opportunities with progress tracking and error handling
- **FR-006**: System MUST provide a dashboard showing all opportunities with filters for type, status, priority, and date range
- **FR-007**: System MUST track opportunity status lifecycle: pending → in-progress → completed → verified OR pending → failed
- **FR-008**: System MUST send notifications via email, Slack, and in-app channels when high-priority opportunities are detected (priority score ≥80)
- **FR-009**: System MUST verify fixes on subsequent scans and re-open opportunities if issues recur
- **FR-010**: System MUST allow users to dismiss opportunities, with dismissed items excluded from future notifications unless context changes
- **FR-011**: System MUST generate audit logs for all auto-fix operations including timestamp, user approval, changes made, and results
- **FR-012**: System MUST respect CMS API rate limits and implement retry logic with exponential backoff for failed operations
- **FR-013**: System MUST analyze page content using AI (GPT-4 or Claude) to ensure fix quality maintains natural language and avoids over-optimization
- **FR-014**: System MUST integrate with existing content generation system to leverage AI models, prompt templates, and quality checks
- **FR-015**: System MUST provide rollback functionality to undo auto-fixes within 24 hours of application

### Constitutional Alignment Requirements

**Automation (Principle #4)**:
- **FR-016**: Scanner MUST run automatically every 6 hours without manual intervention
- **FR-017**: Detection rules MUST identify opportunities based on predefined criteria (missing keywords, stale metadata, link density, FAQ gaps, LLMTXT freshness)
- **FR-018**: Auto-fix functionality MUST apply changes automatically with user approval (one-click or batch)
- **FR-019**: Priority scoring MUST be automated using algorithm combining page traffic, current ranking, opportunity type weight, and time sensitivity

**Quality & GEO Optimization (Principle #5)**:
- **FR-020**: Keyword updates MUST maintain readability scores above 60 (Flesch Reading Ease) and avoid keyword density exceeding 2%
- **FR-021**: Generated FAQs MUST include schema markup (FAQPage schema.org) and answer user search intent based on People Also Ask data
- **FR-022**: Metadata refresh MUST optimize for current year, trending keywords, and stay within character limits (title: 50-60 chars, description: 150-160 chars)
- **FR-023**: LLMTXT generation MUST include all published content with proper structure, updated citations, and current statistics
- **FR-024**: Internal link suggestions MUST use natural anchor text, link to contextually relevant pages, and maintain 3-5 links per 1000 words

**Multi-Model AI (Principle #1)**:
- **FR-025**: Opportunity detection MUST use AI analysis (GPT-4 or Claude 3.5 Sonnet) to evaluate content quality, identify gaps, and suggest improvements
- **FR-026**: Auto-fix content generation MUST support fallback between AI models (GPT-4 → Claude → Perplexity) if primary model fails or rate-limited
- **FR-027**: System MUST track AI costs per opportunity type and optimize model selection based on task complexity (GPT-3.5 for simple fixes, GPT-4 for complex rewrites)

**Performance (Principle #6)**:
- **FR-028**: Dashboard MUST load opportunity list (100 items) in under 2 seconds
- **FR-029**: Opportunity scanner MUST process 100 pages in under 5 minutes using parallel processing
- **FR-030**: Auto-fix operations MUST complete within 30 seconds per opportunity (excluding CMS API latency)
- **FR-031**: System MUST cache scan results for 6 hours and use incremental updates for changed pages only

**Enterprise (Principle #7)**:
- **FR-032**: Multi-brand users MUST see opportunities segregated by site/brand with separate notification settings
- **FR-033**: Team members MUST have role-based permissions: Viewer (see opportunities), Editor (apply fixes), Admin (configure scanner settings)
- **FR-034**: System MUST provide API endpoints for external integrations to query opportunities and trigger fixes programmatically

**Security**:
- **FR-035**: All CMS API credentials MUST be encrypted at rest and in transit
- **FR-036**: Auto-fix operations MUST require explicit user permission (one-click approval or batch approval) before applying changes
- **FR-037**: Audit logs MUST retain all fix operations for 90 days for compliance and rollback purposes
- **FR-038**: System MUST validate AI-generated content for potential security issues (XSS, script injection) before publishing

### Key Entities

- **OpportunityRecord**: Represents a detected optimization opportunity with attributes: unique ID, site/page affected, opportunity type (enum: headings, faqs, metadata, llmtxt, links), priority score (0-100), status (pending/in-progress/completed/failed/dismissed), detected timestamp, fix applied timestamp, AI model used, estimated impact, fix details (JSON with specific changes)

- **ScanSession**: Represents a scanner run with attributes: session ID, site scanned, start/end timestamp, pages analyzed count, opportunities detected count, errors encountered, scan duration, next scheduled scan

- **FixOperation**: Represents an auto-fix execution with attributes: operation ID, opportunity ID, user who approved, timestamp, changes applied (JSON diff), result (success/failed), error message if failed, rollback available (boolean), AI model used, tokens consumed

- **NotificationPreference**: Represents user notification settings with attributes: user ID, site ID, channels enabled (email/Slack/in-app), frequency (immediate/daily digest/weekly), priority threshold (only notify if score ≥X), opportunity types subscribed

- **PriorityRule**: Represents scoring algorithm configuration with attributes: rule ID, opportunity type, base weight, page traffic multiplier, ranking position multiplier, time decay factor (fresher issues score higher), custom adjustments per site

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Scanner successfully detects 90% of known optimization opportunities in test sites within one 6-hour cycle
- **SC-002**: Users can apply auto-fixes to 80% of opportunity types with one click, with fixes taking less than 30 seconds per opportunity
- **SC-003**: Batch processing handles 50 opportunities simultaneously without errors or timeouts, completing all fixes within 10 minutes
- **SC-004**: Dashboard loads 100 opportunities in under 2 seconds with all filters and sorting options functional
- **SC-005**: Notifications are delivered within 15 minutes of high-priority opportunity detection across all channels (email, Slack, in-app)
- **SC-006**: Auto-fixes maintain content quality with 95% of fixes scoring "natural language" quality above 60/100 (Flesch Reading Ease) and 0% keyword stuffing violations
- **SC-007**: System reduces manual optimization time by 70% compared to manual analysis and editing (measured by user time tracking)
- **SC-008**: 85% of auto-fixed opportunities remain resolved after 30 days without recurrence
- **SC-009**: Users successfully complete the workflow (scan → review dashboard → apply fix → verify) in under 5 minutes for their first opportunity
- **SC-010**: System handles 1000+ sites scanning simultaneously without performance degradation (p95 dashboard response time remains <2s)
- **SC-011**: AI cost per opportunity detection and fix averages under $0.10 (target: $0.05) through model optimization and caching
- **SC-012**: Zero unauthorized content changes - all auto-fixes require explicit user approval and are logged in audit trail
