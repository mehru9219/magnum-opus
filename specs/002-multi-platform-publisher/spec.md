# Feature Specification: Multi-Platform Publishing System

**Feature Branch**: `002-multi-platform-publisher`
**Created**: 2025-11-15
**Status**: Draft
**Input**: Week 2 from 12-week roadmap - Multi-Platform Publishing System
**Dependencies**: Week 1 AI Content Generation Engine (001-ai-content-engine)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Core Multi-Platform Publishing (Priority: P1)

A content manager has 10 AI-generated articles from Week 1 content queue and needs to publish them simultaneously to WordPress (company blog), Medium (thought leadership), LinkedIn (professional network), and Dev.to (developer community) with one click.

**Why this priority**: Core value proposition delivering the "one-click publishing to 10+ platforms simultaneously" promise from the roadmap. Directly implements Constitutional Principle II (Universal Multi-Platform Distribution). This is the primary differentiator that unlocks the value of Week 1's bulk content generation - transforming generated content into distributed reach.

**Independent Test**: Can be fully tested by: (1) generating articles using Week 1 system, (2) configuring OAuth connections for 4 platforms (WordPress, Medium, LinkedIn, Dev.to), (3) selecting articles from Week 1 queue, (4) initiating one-click publish, and (5) validating content appears correctly on all 4 platforms within 2 minutes with proper formatting and attribution.

**Acceptance Scenarios**:

1. **Given** 10 articles in Week 1 content queue with status "scheduled", **When** user selects 5 articles and clicks "Publish to All Platforms" with 4 platforms configured (WordPress, Medium, LinkedIn, Dev.to), **Then** system initiates parallel publishing to all 4 platforms and completes within 2 minutes with status displayed for each platform (success/failure)
2. **Given** user has configured platform connections via fully managed OAuth (per user clarification), **When** user clicks "Connect WordPress" button, **Then** system initiates OAuth flow, redirects to WordPress authorization, captures access token upon return, and displays "Connected" status with site name/URL
3. **Given** publishing job in progress to 4 platforms, **When** user views real-time dashboard, **Then** system displays: total platforms (4), completed count, in-progress count, failed count, estimated time remaining, and per-platform status (✓ published, ⟳ publishing, ✗ failed)
4. **Given** successful publish to all 4 platforms, **When** publishing completes, **Then** system updates Week 1 Article.status from "scheduled" to "published", records Article.published_date timestamp, creates PublishResult record for each platform with platform_post_url, and displays success notification with links to published posts
5. **Given** published articles on platforms, **When** user views publishing history, **Then** system displays list of all published articles with: title, platforms published to (with status indicators), publish timestamp, platform-specific post URLs (clickable links to view live posts)

---

### User Story 2 - Platform-Specific Content Adaptation (Priority: P2)

A social media manager needs to publish a 3000-word ultimate guide from Week 1 to multiple platforms, but each platform has different requirements: LinkedIn (max 1300 characters for posts), Medium (long-form optimized), Dev.to (code-focused with Markdown), and Twitter threads (280 character segments).

**Why this priority**: Content adaptation is essential for multi-platform success. Without this, one-size-fits-all content performs poorly and violates platform constraints. Constitutional requirement for "automatically adapt content format, length, and style per platform requirements." Smart AI summarization (per user clarification) ensures quality while meeting platform limits.

**Independent Test**: Can be tested by: (1) selecting one 3000-word article from Week 1 queue, (2) configuring 4 platforms with different constraints (LinkedIn character limit, Medium long-form, Dev.to Markdown, Twitter threads), (3) running adaptation engine, and (4) validating each adapted version: LinkedIn ≤1300 chars with preserved key message, Medium full content with proper formatting, Dev.to Markdown with code highlighting, Twitter split into threaded tweets.

**Acceptance Scenarios**:

1. **Given** 3000-word article selected for publishing, **When** system generates platform-specific adaptations, **Then** LinkedIn version uses smart AI summarization (per user clarification) to create coherent 1250-character summary preserving key message + "Read full article" link, not abrupt truncation
2. **Given** article with HTML formatting, code blocks, and embedded media, **When** adaptation engine processes for Dev.to, **Then** system converts HTML to Markdown, preserves code blocks with syntax highlighting (using ```language notation), converts embedded videos to links, and maintains article structure
3. **Given** adapted content for all platforms, **When** user views adaptation preview, **Then** system displays side-by-side comparison showing: original content, LinkedIn adaptation (with character count 1250/1300), Medium adaptation (full content), Dev.to adaptation (Markdown), with highlighted differences and modification flags
4. **Given** AI-generated LinkedIn summary, **When** system validates adaptation quality, **Then** summary maintains readability score >60 (Flesch Reading Ease, reusing Week 1 quality checks), preserves GEO elements where possible (at least 1 quote or statistic), and includes attribution to original article
5. **Given** adaptation preview displayed, **When** user clicks "Edit Adaptation" for LinkedIn version, **Then** system opens editor allowing manual modification of adapted content before publishing, preserves edits across publishing attempts, and flags adaptation as "user_edited" in ContentAdaptation entity

---

### User Story 3 - Publishing Scheduler with Optimal Timing (Priority: P3)

A content strategist needs to schedule 30 articles generated in Week 1 to publish across 10 platforms over the next month, with each platform receiving content at its optimal engagement time based on audience behavior (e.g., LinkedIn Tuesday 9 AM EST for B2B engagement, Medium Sunday 7 PM EST for long-form reading, Dev.to weekdays 11 AM EST for developer lunch breaks).

**Why this priority**: Scheduling multiplies the value of bulk content generation and maximizes engagement through optimal timing. Constitutional Principle IV (Intelligent Automation) requires automated opportunity detection and optimization. Less critical than core publishing capability but essential for professional workflow and ROI optimization.

**Independent Test**: Can be tested by: (1) generating 30 articles in Week 1, (2) creating publishing schedule with platform-specific optimal times, (3) scheduling all articles with staggered distribution (5 per week over 6 weeks), (4) validating schedule persists correctly in database, and (5) confirming automated publishing triggers at correct times per platform timezone with 60-second accuracy.

**Acceptance Scenarios**:

1. **Given** 30 articles in Week 1 queue ready to publish, **When** user enables bulk scheduling with rule "5 articles per week, optimal times per platform", **Then** system automatically assigns: LinkedIn posts to Tuesdays 9 AM EST, Medium posts to Sundays 7 PM EST, Dev.to posts to weekday 11 AM EST, distributed evenly over 6 weeks
2. **Given** optimal timing enabled for LinkedIn (Tuesday 9 AM EST), **When** user schedules article for "next available optimal time", **Then** system calculates next Tuesday at 9 AM EST, accounts for timezone conversion (if user in different timezone), sets scheduled_time with correct timezone offset, and displays in user's local timezone in UI
3. **Given** publishing schedule created with 150 scheduled publishes (30 articles × 5 platforms), **When** scheduled time arrives within 60-second window, **Then** background job processor triggers publishing automatically, creates PublishingJob, executes publish to configured platforms, and updates Article.status upon completion
4. **Given** scheduled publish set for LinkedIn Tuesday 9 AM EST, **When** OAuth token expires before scheduled time, **Then** system detects expiration during pre-publish health check (runs 5 minutes before scheduled time), attempts automatic OAuth token refresh using refresh_token, continues with publish if refresh succeeds, or alerts user to re-authenticate if refresh fails and postpones publish
5. **Given** user in PST timezone (3 hours behind EST), **When** viewing publishing calendar with LinkedIn posts scheduled for "Tuesday 9 AM EST", **Then** system displays "Tuesday 6 AM PST" in calendar view, provides timezone selector to switch between user local time and platform optimal time, and clearly indicates timezone in tooltip

---

### User Story 4 - Syndication Network Management (Priority: P4)

An agency managing 5 client brands needs to create syndication networks where each client's content automatically publishes to their specific platform set: Client A publishes to WordPress + Medium + LinkedIn, Client B publishes to Shopify + Ghost + Dev.to + Twitter, with per-client credentials, branding, and one-click publishing to entire network.

**Why this priority**: Critical for enterprise/agency use cases per Constitutional Principle VII (Enterprise-Ready Architecture). Enables multi-brand management and scales platform value for high-value customers. Can be simplified in MVP but must support core multi-tenant credential isolation and network grouping for Week 2 deliverable.

**Independent Test**: Can be tested by: (1) creating 2 syndication networks with different platform sets, (2) configuring separate OAuth credentials for each network (Client A's WordPress vs Client B's WordPress), (3) assigning articles to networks, (4) publishing to each network, and (5) validating correct platform targeting, credential isolation (no cross-client publishing), and branding per network.

**Acceptance Scenarios**:

1. **Given** agency user managing multiple clients, **When** user creates syndication network named "Client A Tech Blog Network" and selects platforms (WordPress, Medium, LinkedIn), **Then** system creates SyndicationNetwork entity, prompts for OAuth connection to each platform (using Client A credentials), stores connections with network association, and displays network in dashboard with platform count (3 platforms)
2. **Given** 2 syndication networks configured (Client A: WordPress + Medium + LinkedIn, Client B: Shopify + Ghost + Dev.to), **When** user selects article and publishes to "Client A Network", **Then** system publishes only to Client A's 3 platforms using Client A credentials, never accesses Client B credentials (enforced via database-level credential isolation), and completes publishing with success status per platform
3. **Given** syndication network with default branding settings, **When** user sets network branding overrides (author_name: "Client A Marketing Team", author_bio: "Enterprise solutions...", profile_image_url: "https://clienta.com/logo.png"), **Then** system applies branding to all publishes via this network, overrides Week 1 Article author metadata when publishing to platforms supporting custom author (WordPress, Medium, Dev.to), and maintains consistent branding across all network platforms
4. **Given** user creates network from template, **When** user selects "Thought Leadership" template (predefined: Medium + LinkedIn + company blog), **Then** system pre-populates network with suggested platforms, prompts for OAuth connections, applies default adaptation rules (preserve long-form for Medium, summarize for LinkedIn), and saves as reusable network configuration
5. **Given** published content via syndication network, **When** user views network analytics, **Then** system displays aggregate metrics: total publishes via network (count), success rate per platform in network (percentage), total reach across network platforms (views sum), and per-platform breakdown with engagement metrics

---

### User Story 5 - Cross-Platform Publishing Analytics (Priority: P5)

A marketing director needs to track publishing performance across all platforms after distributing 50 articles: which platforms accepted content successfully, which failed, delivery times, engagement metrics (views, likes, shares where available via platform APIs), and ROI analysis to determine which platforms drive most value.

**Why this priority**: Analytics enable optimization and prove ROI but can start simple in Week 2. Detailed engagement tracking is less critical than successful publishing in MVP. Supports quality feedback loop per Constitutional Principle III (Comprehensive Tracking). Future correlation with Week 1 quality scores enables data-driven content improvement.

**Independent Test**: Can be tested by: (1) publishing 10 articles to 5 platforms (50 total publish operations), (2) capturing success/failure status and timestamps, (3) waiting 24 hours for engagement metrics to sync from platform APIs, (4) validating analytics dashboard displays per-platform breakdowns, aggregate metrics, and historical trends with accurate counts and percentages.

**Acceptance Scenarios**:

1. **Given** 50 articles published across 5 platforms (250 total publish operations), **When** user views publishing analytics dashboard, **Then** system displays: total publishes (250), success rate (95% = 238 successes, 12 failures), average publish time per platform (WordPress: 8s, Medium: 12s, LinkedIn: 6s, etc.), failure breakdown by error type (5 auth failures, 4 rate limits, 3 timeouts)
2. **Given** published articles with platform-specific post URLs, **When** system syncs engagement metrics from platform APIs (runs every 24 hours), **Then** system fetches: LinkedIn views/likes/shares/comments via LinkedIn API, Medium views/reads/claps via Medium Stats API, Dev.to reactions/comments via Dev.to API, WordPress page views (if analytics plugin available), and updates PublishResult.engagement_metrics for each post
3. **Given** engagement metrics synced for 30-day period, **When** user views cross-platform analytics, **Then** system displays aggregate metrics: total views across all platforms (sum), total likes/reactions (sum), total shares (sum), total comments (sum), and platform contribution breakdown (LinkedIn: 40% of views, Medium: 35%, Dev.to: 15%, WordPress: 10%)
4. **Given** publishing failures logged over 7-day period, **When** user views failure analytics, **Then** system displays: failures by platform (LinkedIn: 3 failures, Medium: 2), failures by error type (OAuth expiration: 4, rate limit: 2, timeout: 1), failure trends over time (line chart showing daily failure count), and actionable recommendations (e.g., "LinkedIn OAuth tokens expiring frequently - consider extending token lifetime")
5. **Given** article published to 4 platforms with engagement data, **When** user views article-specific analytics, **Then** system displays per-article performance: publish status on each platform (✓/✗), platform-specific URLs (clickable), engagement metrics per platform (views, likes, shares, comments), total reach (sum of views), and best-performing platform ranking

---

### Edge Cases

- **Platform API Failures During Multi-Platform Publish**: WordPress API returns 503 error, LinkedIn API rate limit exceeded, Medium OAuth token expired during one-click publish to 10 platforms. **Expected**: System publishes successfully to 7 working platforms, queues WordPress for automatic retry in 5/15/45 minutes (exponential backoff per user clarification), queues LinkedIn for retry when rate limit resets (reads retry-after header), alerts user to re-authenticate Medium (auth failures not auto-retried), displays "Published to 7/10 platforms. 2 retrying, 1 requires action" with clear next steps.

- **Content Adaptation Conflicts**: 5000-word article with complex HTML tables and embedded videos adapted for LinkedIn (1300 char limit, plain text only), Dev.to (Markdown, no HTML tables), Medium (full HTML supported). **Expected**: LinkedIn adaptation uses smart AI summarization (per user clarification) to create coherent summary extracting key points + "Read full article" link, strips formatting; Dev.to converts HTML tables to Markdown tables or code blocks, embeds videos as links; Medium preserves all HTML; user previews all 3 adaptations side-by-side before publishing, can manually edit any adaptation.

- **Simultaneous Publishing to Incompatible Platforms**: User attempts to publish highly technical developer tutorial with 20+ code blocks to both LinkedIn (professional business network) and Dev.to (developer community). **Expected**: System analyzes article using Week 1 AI models, detects code-heavy content, displays warning "This article is highly technical and may not be optimal for LinkedIn's business audience. Consider: (1) Accept smart summarization for LinkedIn (removes code blocks, emphasizes business benefits), (2) Publish to Dev.to only, (3) Manually edit LinkedIn version", allows user to choose approach before publishing.

- **Rate Limiting Across Platforms**: User bulk publishes 100 articles to LinkedIn (25 posts/day API limit), Medium (100 posts/day limit), WordPress (no rate limit). **Expected**: System checks per-platform rate limits before bulk job, displays warning "LinkedIn allows 25 publishes/day. Your 100 articles will take 4 days on LinkedIn. Medium and WordPress complete today.", offers auto-stagger (recommended): creates 4 LinkedIn publishing schedules (25 per day × 4 days) while publishing all 100 to other platforms immediately, tracks per-platform quota consumption in real-time, displays countdown "LinkedIn: 5/25 publishes used today, resets in 14 hours."

- **Duplicate Content Detection**: User accidentally double-clicks "Publish" button or scheduled + manual publish overlap for same article to same platform within 1 hour. **Expected**: System detects duplicate via database query (article_id + platform_connection_id + timestamp within 1 hour window), displays confirmation "This article was published to WordPress 15 minutes ago. Publish again? May create duplicate posts. Options: (1) Cancel (recommended), (2) Proceed anyway (for re-posts with edits), (3) Update existing post instead (if platform supports updates)", logs as intentional duplicate if user proceeds, automatically cancels duplicate scheduled publishes within 24-hour window on same platform.

- **Platform Post Capacity Limits**: Squarespace blog at 95/100 post capacity, user attempts to bulk publish 10 articles. **Expected**: System queries Squarespace API for current post count before bulk job, detects near-capacity (95/100), displays error "Squarespace blog near capacity (95/100). Bulk job (+10) would exceed limit. Please archive old posts first. Options: (1) Exclude Squarespace from bulk job, (2) Publish only 5 to Squarespace (up to limit), (3) View Squarespace posts for deletion", prevents exceeding platform limits proactively.

- **OAuth Token Refresh During Publishing**: Medium OAuth token expires in 2 minutes, user initiates bulk publish of 20 articles (5-minute job duration). **Expected**: System checks OAuth expiration before job start, detects expiration during job execution, automatically refreshes token using refresh_token before expiration, publishing continues uninterrupted, logs OAuth refresh in audit trail; if refresh fails (refresh_token also expired), pauses job, alerts user to re-authenticate, resumes after re-auth, displays "Publishing paused for Medium authentication. Other platforms continuing."

- **Network Connectivity Loss**: User initiates publish from mobile device, loses internet mid-publish. **Expected**: Publishing runs server-side as background job (not client-side), user connectivity doesn't affect job execution, user can close browser/lose connection/navigate away and job continues, when user reconnects dashboard updates with current status, displays "Publishing continues in background. You can safely close this window.", job state persists in database across user sessions.

## Requirements *(mandatory)*

### Functional Requirements

#### Platform Integration Requirements (Constitutional Principle II)

- **FR-001**: System MUST integrate with 10+ publishing platforms via official APIs with fully managed OAuth authentication (per user clarification):
  - **CMS Platforms**: WordPress (WP REST API with OAuth), Webflow (CMS API with OAuth), Ghost (Admin API with API key), Custom CMS (generic REST API with configurable auth)
  - **E-commerce**: Shopify (Blog API with OAuth for content marketing)
  - **Website Builders**: Wix (Corvid/Velo API with OAuth), Squarespace (blog import API/OAuth where available, may have limited API)
  - **Syndication Platforms**: Medium (OAuth 2.0), LinkedIn (Share API with OAuth 2.0), Dev.to (API key authentication)
  - Each platform must support "Connect [Platform]" button for managed OAuth flow (no manual API key entry by users)

- **FR-002**: System MUST implement fully managed OAuth authentication (per user clarification):
  - Register OAuth application with each platform provider (one-time setup during Week 2 development)
  - Implement OAuth 2.0 authorization code flow: (1) user clicks "Connect WordPress", (2) redirect to WordPress OAuth consent screen, (3) user authorizes, (4) WordPress redirects back with authorization code, (5) system exchanges code for access token + refresh token, (6) store tokens encrypted with AES-256
  - Support OAuth token refresh automatically when access token expires (use refresh token to obtain new access token without user interaction)
  - Display "Connected" status with platform site name/URL after successful OAuth, "Disconnected" if auth fails or token expires

- **FR-003**: Platform connection health monitoring:
  - Test connection capability before publishing via API health check endpoint (WordPress: GET /wp-json/, LinkedIn: GET /v2/me, etc.)
  - Display platform status in dashboard: connected (green checkmark), disconnected (red X), auth_expired (yellow warning "Re-authenticate required"), error (red with error message)
  - Automatic retry with exponential backoff for transient failures (per user clarification): 3 retry attempts at 5 minutes, 15 minutes, 45 minutes
  - Alert users via in-app notification + email when OAuth token expires or platform connection fails (actionable: "Click here to re-authenticate LinkedIn")

- **FR-004**: Platform credential security (Constitutional Requirement):
  - Store OAuth access tokens and refresh tokens encrypted at rest using AES-256 (consistent with Week 1 AI keys)
  - Credentials isolated per user/brand in database (user_id + brand_id foreign keys, enforced via row-level security or application logic)
  - Never expose tokens in API responses (return only masked/redacted versions: "tok_...abc123" showing first 3 and last 6 characters)
  - Never log tokens in application logs or error messages (log only connection success/failure status)

#### Content Adaptation Engine (Constitutional Principle II + V)

- **FR-005**: System MUST automatically adapt content format per platform requirements:
  - **WordPress/Ghost/Medium**: Preserve full HTML formatting (headings, bold, italic, lists, blockquotes), embed images inline with proper sizing, maintain article structure with table of contents if present
  - **LinkedIn**: Convert HTML to plain text with limited formatting (preserve bold via asterisks, links as URLs), use smart AI summarization for content >1300 characters (per user clarification), add line breaks for readability
  - **Dev.to**: Convert HTML to Markdown with frontmatter (add YAML: title, published, tags, canonical_url), preserve code blocks with syntax highlighting (detect language from ```language notation or infer from content), convert HTML tables to Markdown tables
  - **Twitter**: Split long content into threaded tweets (280 characters per tweet), preserve context between tweets (numbering: 1/5, 2/5), add "Read full article: [link]" in final tweet

- **FR-006**: System MUST use smart AI summarization for content adaptation (per user clarification):
  - When platform requires truncation (LinkedIn 1300 char limit), use Week 1 AI models (GPT-4 or Claude via AIModelConfig) to generate coherent summary instead of abrupt cut-off
  - Summarization prompt: "Summarize this article in <N> characters while preserving the key message, main points, and conclusion. Maintain professional tone appropriate for [platform]. Output only the summary text."
  - Cost per summarization: approximately $0.05-0.10 per article depending on length and model used (GPT-4: ~$0.10, Claude: ~$0.05)
  - Preserve GEO elements where possible in summary: include at least 1 quote or statistic from original to maintain authority signals
  - Validate summarized content meets readability threshold >60 (Flesch Reading Ease, reuse Week 1 quality check logic)

- **FR-007**: Content adaptation length adjustment per platform constraints:
  - **LinkedIn posts**: Truncate to 1300 characters using smart AI summarization (FR-006), add "Read the full article: [canonical_url]" link at end (doesn't count toward 1300 limit)
  - **Medium/Ghost/WordPress**: Publish full long-form content with no truncation (these platforms support unlimited length)
  - **Dev.to**: Optimize for developer audience readability (preserve all technical depth and code examples)
  - **Twitter threads**: Split content intelligently at sentence boundaries to maintain context, aim for 250-270 characters per tweet (leave room for numbering and handles), limit to max 10 tweets per thread (beyond that provide link to full article)
  - Configurable length rules stored in database per platform with user overrides allowed at network level

- **FR-008**: Content adaptation style modification per platform audience:
  - **LinkedIn**: Professional business tone (if original is casual, AI adjusts to business-appropriate language), emphasize business benefits and ROI in summary, add executive summary section at top if publishing full article
  - **Medium**: Thought leadership angle (storytelling emphasis, personal insights highlighted), optimize opening hook for engagement, ensure conclusion includes call-to-action or reflection
  - **Dev.to**: Technical deep-dive style (code examples prominent, technical jargon appropriate, step-by-step tutorials formatted with clear headings), add "Prerequisites" section if tutorial, include "What you'll learn" summary at top
  - **Twitter**: Conversational engagement-optimized tone (questions, CTAs like "What do you think?"), use emojis sparingly if original content includes them, hashtag recommendations (max 2-3 relevant hashtags)
  - Style adaptation uses Week 1 AI models via specific prompts per platform, runs as separate adaptation step after length adjustment

- **FR-009**: Adaptation preview and manual editing capability:
  - Display side-by-side preview: original content (left), adapted versions for each platform (right panels, one per selected platform)
  - Show character/word counts per adaptation: "LinkedIn: 1250/1300 characters", "Twitter: 5 tweets, 1245 total characters"
  - Highlight modifications: truncated sections (yellow highlight), AI-rewritten sections (blue highlight), format conversions (green highlight "HTML → Markdown")
  - Allow manual editing of adapted content: click "Edit LinkedIn Adaptation" opens text editor, changes persist in ContentAdaptation entity with user_edited flag, manual edits preserved across retries/reschedules
  - Preview updates in real-time as user edits, character counts update dynamically, validation warnings if exceeds platform limits

#### Publishing Scheduler (Constitutional Principle IV - Intelligent Automation)

- **FR-010**: System MUST support platform-specific optimal timing based on engagement research:
  - Database table storing optimal times per platform (platform_type, day_of_week enum, time_of_day time, timezone, rationale):
    - LinkedIn: Tuesday-Thursday 9-11 AM EST (B2B professional engagement peak during work hours)
    - Medium: Sunday 7-9 PM EST (long-form weekend reading time when users have leisure time)
    - Dev.to: Monday-Friday 11 AM - 2 PM EST (developer lunch breaks and mid-day context switching)
    - Twitter: Multiple daily windows (7-9 AM, 12-1 PM, 5-6 PM EST for commute/lunch/evening engagement)
    - WordPress/Ghost/Webflow: Tuesday-Thursday 10 AM EST (general blog readership peak)
  - User-customizable optimal times: override defaults per platform in Settings UI, set custom timezone for global audiences, define multiple optimal windows per platform
  - UI displays "Optimal Time" badge on calendar when scheduling aligns with platform recommendations

- **FR-011**: Bulk scheduling with intelligent distribution to avoid spam:
  - Accept scheduling rules via UI: "5 articles per week across 10 platforms for next 6 weeks" translates to 300 total scheduled publishes (5 articles × 10 platforms × 6 weeks)
  - Automatic spacing to avoid platform spam detection: minimum 2-hour gap between publishes to same platform, maximum 25 publishes per platform per day (conservative limit respecting most platform rate limits)
  - Priority queue support: mark articles as "urgent" (publish ASAP at next optimal time) vs "evergreen" (distribute evenly over timeframe), urgent articles scheduled before evergreen in each time window
  - Integration with Week 1 ContentQueue for unified calendar view: display both Week 1 article generation schedule + Week 2 publishing schedule in single calendar, allow drag-and-drop rescheduling across weeks

- **FR-012**: Automated publishing execution via background job processor:
  - Background job system (cron scheduler or queue-based like Bull/Sidekiq) polls database every minute for PublishingSchedule entries where scheduled_time ≤ current_time and status = "pending"
  - Execute publish at exact scheduled time with 60-second accuracy (tolerance: ±60 seconds to account for job polling interval)
  - Automatic retry with exponential backoff (per user clarification): if publish fails, retry 3 times at 5min, 15min, 45min intervals, mark as "failed" after 3 attempts and alert user
  - Update Week 1 Article.status after successful publish: "scheduled" → "published", set Article.published_date to actual publish timestamp (not scheduled time if delayed by retries)
  - Pre-publish health check: 5 minutes before scheduled time, verify OAuth tokens haven't expired, platform APIs are reachable, attempt automatic token refresh if needed, postpone publish and alert user if health check fails

- **FR-013**: Timezone support for global scheduling:
  - Store scheduled_time in database with timezone information (TIMESTAMP WITH TIME ZONE or store timezone string separately)
  - UI displays scheduled times in user's local timezone by default (detect via browser Intl.DateTimeFormat or user setting)
  - Toggle to view in "Platform Optimal Timezone" (EST for LinkedIn/Medium, user's choice for others)
  - Handle daylight saving time transitions: recalculate schedules during DST changes (e.g., "9 AM EST" shifts 1 hour during DST), display warnings for schedules affected by DST transitions
  - Calendar tooltip shows both user local time and platform optimal time: "Tuesday 6 AM PST (9 AM EST - LinkedIn optimal)"

#### Syndication Network Management (Constitutional Principle VII - Enterprise)

- **FR-014**: System MUST support syndication network configuration for multi-brand management:
  - Create SyndicationNetwork entity: user-defined name (e.g., "Client A Tech Blog Network"), optional description, array of PlatformConnection IDs (many-to-many relationship)
  - Network creation wizard: (1) name network, (2) select platforms from connected platforms list, (3) set default branding overrides, (4) test connections, (5) save network
  - Platform connections can belong to multiple networks: one WordPress connection can be in "Full Distribution" network and "Thought Leadership" network simultaneously
  - Set default content adaptation rules per network: auto_adapt boolean (enable/disable adaptation), preserve_formatting boolean, preferred_style enum (professional/technical/casual)

- **FR-015**: Multi-brand credential isolation and security:
  - Each PlatformConnection tied to user_id + optional brand_id (supports multi-tenant agency use case)
  - Database enforces credential isolation: user can only access PlatformConnections where user_id matches OR user has explicit permission to brand_id
  - Prevent cross-brand publishing: when publishing to "Client A Network", system validates user has access to all PlatformConnections in that network before proceeding, returns 403 Forbidden if unauthorized
  - Audit logging for network operations: log network creation, modification, publishing (with user_id, brand_id, network_id, timestamp, platforms affected)

- **FR-016**: Network branding customization per client:
  - Per-network branding overrides stored in SyndicationNetwork.default_adaptation_rules: custom_author_name (string), custom_author_bio (text), custom_profile_image_url (URL)
  - Apply branding during publishing: override Week 1 Article author metadata when platform supports custom author (WordPress: set post_author, Medium: set authorId, Dev.to: organization publishing)
  - Consistent branding across network: all platforms in "Client A Network" use Client A branding automatically, no manual per-platform configuration needed
  - Branding preview in network settings: displays how author byline will appear on each platform (e.g., "By Client A Marketing Team | Enterprise Solutions Expert")

- **FR-017**: Network templates for common publishing patterns:
  - Predefined templates stored in database with is_template flag:
    - "Full Distribution": all 10+ integrated platforms, auto-adapt enabled
    - "Thought Leadership": Medium + LinkedIn + WordPress, long-form style preserved
    - "Developer Outreach": Dev.to + GitHub (if integrated) + Twitter, technical style emphasized
    - "E-commerce Content": Shopify blog + Pinterest (if integrated) + Instagram (future), product-focused style
  - Template instantiation: user selects template, system creates new network pre-populated with template platforms, prompts for OAuth connections if not already configured, allows customization before saving
  - Users can save custom networks as templates for reuse: "Save as Template" button creates reusable network configuration for future projects

#### Publishing Analytics Tracking (Constitutional Principle III - Comprehensive Tracking)

- **FR-018**: System MUST track all publishing operations comprehensively:
  - Create PublishResult record for each publish attempt capturing: article_id (link to Week 1 Article), platform_connection_id, status (success/failure/pending/retrying), publish_timestamp, platform_post_id, platform_post_url, error_message (if failed), error_code, retry_count, publish_duration_ms
  - Audit trail in database: never delete PublishResult records (soft delete if needed), maintain complete history for compliance and debugging
  - Real-time status tracking: publish status updates propagate to UI via WebSocket or polling (refresh every 5 seconds during active publishing)
  - Link to Week 1 Article for correlation: PublishResult.article_id enables cross-week analytics (e.g., "Articles with readability >70 get 50% more LinkedIn engagement")

- **FR-019**: Cross-platform analytics dashboard with aggregate metrics:
  - Success rate calculation per platform: (successful_publishes / total_publishes) × 100 displayed as percentage with color coding (>95% green, 90-95% yellow, <90% red)
  - Average publish time per platform: AVG(publish_duration_ms) grouped by platform_type, displayed in seconds with bar chart visualization
  - Failure breakdown by error type: COUNT(*) grouped by error_code with categorization (auth_failures, rate_limit_errors, timeout_errors, api_errors, network_errors), Pareto chart showing top failure causes
  - Total articles published across all platforms: COUNT(DISTINCT article_id) where status = "success", cumulative count over time (line chart showing publishing velocity)
  - Platform health trends over time: 7-day and 30-day views showing success_rate per day, identify degrading platforms early

- **FR-020**: Basic engagement metrics synced from platform APIs where available:
  - **LinkedIn**: Fetch engagement via LinkedIn Share Statistics API (requires additional OAuth scope ugcpost:read): views, likes, shares, comments; sync frequency: every 24 hours via scheduled job
  - **Medium**: Fetch stats via Medium API (if user grants read:stats scope): views, reads (full article read), claps (reactions); sync frequency: every 24 hours
  - **Dev.to**: Fetch article stats via Dev.to API: reactions (heart/unicorn/bookmark counts), comments; sync frequency: every 12 hours
  - **WordPress**: Fetch page views if user has analytics plugin (e.g., Jetpack Stats API, Google Analytics integration); optional integration depending on plugin availability
  - Store engagement_metrics in PublishResult entity: views (integer), likes (integer), shares (integer), comments (integer), last_synced_at (timestamp)
  - Aggregate engagement view: SUM(engagement_metrics.views) across all platforms, display total reach per article and per time period

- **FR-021**: Publishing audit trail and reporting:
  - Complete history view: table/list of all PublishResult records filterable by article (dropdown), platform (checkboxes), date range (date picker), status (success/failure/pending)
  - Export capability for agency reporting: "Export to CSV" button generates CSV with columns (article_title, platform, publish_date, status, post_url, views, likes, shares, comments), "Export to JSON" for API integration
  - Links to published content: platform_post_url displayed as clickable link, "View on LinkedIn" button opens post in new tab, enables quick validation of published content
  - Performance reporting: "Top Performing Articles" view ranks articles by total engagement, "Top Performing Platforms" ranks platforms by average engagement per post, identify best channels for content distribution

#### Integration with Week 1 Dependencies

- **FR-022**: Week 1 Article Queue integration for seamless publishing workflow:
  - Publishing UI displays articles from Week 1 ContentQueue: fetch articles where status IN ("draft", "scheduled", "ready_to_publish")
  - Filter articles by status: dropdown with options "All", "Draft", "Scheduled", "Ready to Publish", updates article list dynamically
  - Bulk select articles for publishing: checkboxes for multi-select, "Select All" button, "Publish Selected" action button
  - Update Week 1 Article.status after publishing: "scheduled" → "published" on success, "scheduled" → "partially_published" on partial failure (some platforms succeeded, some failed), "scheduled" → "publish_failed" if all platforms failed

- **FR-023**: Week 1 Article content integration for publishing:
  - Read Article.body as source content: fetch full HTML/Markdown content from Week 1 Article entity
  - Preserve Week 1 GEO elements in adaptations: extract quotes/statistics/citations from Article.body, prioritize inclusion in adapted versions (especially LinkedIn summaries for authority signals), track GEO element preservation rate in analytics
  - Bidirectional linking: PublishResult.article_id references Week 1 Article, consider adding Article.publish_results (one-to-many relationship) for easier navigation, enables "View Publishing History" button on Article detail page

- **FR-024**: Week 1 AI Model integration for content adaptation:
  - Reuse Week 1 AIModelConfig: fetch user's configured AI models (primary/secondary/tertiary) from Week 1 system
  - Apply same fallback logic: if primary model (GPT-4) fails during summarization, attempt secondary model (Claude), then tertiary (Perplexity)
  - Consistent quality checks: reuse Week 1 readability score calculation (Flesch Reading Ease) to validate adapted content meets threshold >60
  - API cost tracking: aggregate Week 1 content generation costs + Week 2 adaptation costs in unified billing/analytics view, display total cost per article (generation + adaptation + publishing)

#### Security & Compliance (Constitutional Requirement)

- **FR-025**: Platform credential security and encryption:
  - Encrypt OAuth access tokens and refresh tokens at rest using AES-256 encryption (same encryption library and key management as Week 1)
  - Store encryption keys in secure vault (e.g., AWS KMS, HashiCorp Vault, not in application codebase or database)
  - Rotate encryption keys periodically: minimum annually, support re-encryption of all credentials with new key
  - Credential access logging: log every credential decryption operation (user_id, platform, timestamp, operation type) for security audit

- **FR-026**: Publishing authorization and access control:
  - Role-based access control (RBAC): users can only publish to platforms they've personally authenticated OR have been granted explicit permission (agency admin grants access to team members)
  - Prevent unauthorized publishing: validate user has access to all selected PlatformConnections before initiating PublishingJob, return 403 Forbidden with clear message if unauthorized
  - Cross-user/cross-brand boundary enforcement: database-level foreign key constraints ensure PlatformConnection.user_id matches authenticated user OR user has permission via brand_id association
  - Rate limiting to prevent abuse: max 100 publishes per user per day (soft limit, adjustable in admin panel), max 10 concurrent publishing jobs per user

- **FR-027**: Audit logging for compliance and debugging:
  - Log all publish operations: user_id, timestamp, operation type (publish/schedule/cancel), article_id, platforms (array), syndication_network_id (if applicable), success/failure status, IP address
  - Log OAuth operations: token refresh attempts, re-authentication events, connection health checks, with user_id and platform
  - Audit log retention: minimum 90 days for operational debugging, up to 7 years for compliance (GDPR, SOC 2 depending on requirements)
  - Audit log export: admins can export logs as CSV/JSON for security review, support filtering by user, platform, date range

- **FR-028**: Platform API security best practices:
  - HTTPS-only for all platform API calls: reject http:// URLs, enforce TLS 1.2+ for outbound connections
  - API call timeout limits: default 30 seconds per API call (configurable per platform), prevents hanging requests from blocking publishing queue
  - Input validation before platform API calls: sanitize article content to prevent injection attacks (escape special characters, validate URLs, strip malicious scripts), validate platform credentials format (API key regex, OAuth token format)
  - Webhook signature verification: if platforms support webhooks (e.g., WordPress sends notifications on post updates), verify webhook signatures using platform-provided secret, reject unsigned webhooks

#### Performance & Scalability (Constitutional Principle VI)

- **FR-029**: Multi-platform publishing performance optimization:
  - Parallel publishing to multiple platforms using asynchronous/concurrent execution: publish to 10 platforms simultaneously (non-blocking I/O), not sequential
  - Target performance: publish to 10 platforms within 2 minutes total (average 12 seconds per platform including API calls, adaptation, retry logic)
  - Connection pooling for platform APIs: reuse HTTP connections to reduce handshake overhead, maintain pool of 5-10 connections per frequently used platform
  - Queue system for high-volume publishing: background job processor (e.g., Bull for Node.js, Sidekiq for Ruby, Celery for Python) handles scheduling and execution, supports horizontal scaling by adding more worker processes

- **FR-030**: Scheduler scalability for large publishing volumes:
  - Support 1000+ scheduled publishes in queue simultaneously: database indexed on (scheduled_time, status) for efficient polling
  - Efficient job triggering: cron job runs every 1 minute, queries for scheduled publishes due in next 2 minutes, distributes to workers
  - Horizontal scaling of background workers: support multiple worker processes/containers processing publishing jobs in parallel, jobs claimed via database lock or queue system to prevent duplicate execution
  - Database query optimization: use composite index on (scheduled_time ASC, status, user_id) for fast lookup, LIMIT queries to 100 jobs per poll to prevent memory issues

- **FR-031**: Dashboard and analytics performance:
  - Publishing dashboard loads <200ms at p95 (constitutional requirement): cache frequently accessed data (platform status, recent publishes), use database indexes on (user_id, created_at DESC) for recent activity queries, paginate results (100 items per page)
  - Analytics queries optimized: aggregate metrics pre-calculated via scheduled job (runs hourly) and stored in summary tables (PlatformAnalytics entity), dashboard reads from summary tables instead of calculating on-demand
  - Caching strategy: platform connection status cached for 5 minutes (in-memory or Redis), optimal timing data cached for 1 hour, engagement metrics cached for 24 hours (sync frequency matches cache TTL)
  - Database indexing: indexes on (article_id, platform_connection_id, status, created_at) for PublishResult queries, enables fast filtering and sorting

### Constitutional Alignment Requirements

All features MUST address applicable constitutional principles. This feature specifically implements:

- **Universal Multi-Platform Distribution (Principle II)**: Implements 10+ platform integrations with fully managed OAuth (FR-001 to FR-004), automatic content adaptation for format/length/style (FR-005 to FR-009), enables one-click publishing to multiple platforms simultaneously with parallel execution (FR-029)

- **Intelligent Automation (Principle IV)**: Implements platform-specific optimal timing (FR-010), automated scheduling with intelligent distribution avoiding spam (FR-011), automated publishing execution with background job processor (FR-012), automatic retry with exponential backoff for failures (FR-003, FR-012)

- **Quality & GEO Optimization (Principle V)**: Smart AI summarization for content adaptation preserving quality (FR-006), preserves Week 1 GEO elements (quotes, statistics, citations) in adapted versions (FR-023), validates adapted content meets readability thresholds >60 (FR-006)

- **Comprehensive Tracking (Principle III)**: Tracks all publishing operations with detailed audit trail (FR-018), cross-platform analytics dashboard with success rates and engagement metrics (FR-019 to FR-021), syncs engagement data from platform APIs for visibility measurement (FR-020)

- **Performance (Principle VI)**: Publishes to 10 platforms within 2 minutes (FR-029), supports 1000+ scheduled publishes (FR-030), dashboard loads <200ms at p95 (FR-031), horizontal scaling via queue system (FR-029, FR-030)

- **Enterprise-Ready Architecture (Principle VII)**: Supports syndication networks for multi-brand management (FR-014), multi-brand credential isolation (FR-015), per-network branding customization (FR-016), network templates for common use cases (FR-017)

- **Security (Constitutional Requirement)**: AES-256 encryption for OAuth tokens (FR-025), role-based access control and authorization (FR-026), comprehensive audit logging (FR-027), platform API security best practices (FR-028)

### Key Entities *(include if feature involves data)*

- **PlatformConnection**: Configuration for publishing platform with OAuth credentials
  - `id`, `user_id`, `brand_id` (optional for multi-brand)
  - `platform_type` (enum: wordpress/shopify/webflow/wix/squarespace/ghost/medium/linkedin/devto/custom_cms)
  - `platform_name` (user-friendly label)
  - `credentials` (encrypted object): `access_token`, `refresh_token`, `site_url`, `oauth_expires_at`
  - `auth_type` (enum: oauth2/api_key), `status` (enum: connected/disconnected/auth_expired/error)
  - `last_health_check`, `health_check_message`, `created_at`, `updated_at`

- **ContentAdaptation**: Platform-specific adapted version of Week 1 Article
  - `id`, `article_id` (reference to Week 1 Article), `platform_type`
  - `adapted_content` (object): `title`, `body`, `excerpt`, `tags`
  - `adaptation_rules_applied` (array: "ai_summarize_1300_chars", "html_to_markdown", "code_highlighting")
  - `original_word_count`, `adapted_word_count`, `character_count`
  - `user_edited` (boolean), `created_at`, `updated_at`

- **PublishingJob**: Publishing operation for article to multiple platforms
  - `id`, `user_id`, `article_id`, `platform_connections` (array of IDs)
  - `total_platforms`, `successful_publishes`, `failed_publishes`, `pending_publishes`
  - `status` (enum: pending/in_progress/completed/partial_failure/failed)
  - `scheduled_time` (timestamp with timezone), `started_at`, `completed_at`
  - `publish_results` (array of PublishResult objects), `retry_count`, `created_at`

- **PublishResult**: Result of publishing to single platform within job
  - `id`, `publishing_job_id`, `platform_connection_id`, `content_adaptation_id`
  - `status` (success/failure/pending/retrying)
  - `platform_post_id`, `platform_post_url`, `publish_timestamp`
  - `error_message`, `error_code`, `retry_count`, `publish_duration_ms`
  - `engagement_metrics` (object): `views`, `likes`, `shares`, `comments`, `last_synced_at`

- **SyndicationNetwork**: Collection of platform connections for one-click distribution
  - `id`, `user_id`, `brand_id` (optional), `name`, `description`
  - `platform_connections` (array of PlatformConnection IDs)
  - `default_adaptation_rules` (object): `auto_adapt`, `preserve_formatting`, `custom_author_name`, `custom_author_bio`
  - `is_template` (boolean), `publish_count`, `created_at`, `updated_at`

- **PublishingSchedule**: Scheduled publishing entry integrated with Week 1 ContentQueue
  - `id`, `user_id`, `article_id`, `syndication_network_id` (optional)
  - `platform_connections` (array if not using network)
  - `scheduled_date`, `scheduled_time` (with timezone)
  - `optimal_timing_enabled` (boolean), `optimal_timing_overrides` (object)
  - `status` (pending/published/failed/cancelled), `publishing_job_id`, `executed_at`, `created_at`

- **PlatformAnalytics**: Aggregated analytics per platform (summary table)
  - `platform_connection_id` (primary key)
  - `total_publishes`, `successful_publishes`, `failed_publishes`, `success_rate_percentage`
  - `average_publish_time_ms`, `total_views`, `total_likes`, `total_shares`, `total_comments`
  - `last_published_at`, `last_failure_at`, `last_failure_message`, `updated_at`

## Success Criteria *(mandatory)*

### Measurable Outcomes

#### Publishing Performance Metrics

- **SC-001**: One-click publishing to 10 platforms completes within 2 minutes for single article (parallel execution, 12-second average per platform including API calls and adaptation)
- **SC-002**: Bulk publishing of 30 articles to 5 platforms (150 total operations) completes within 10 minutes (average 4 seconds per publish operation)
- **SC-003**: Publishing scheduler triggers scheduled publishes within 60 seconds of scheduled time with 99% accuracy during Week 2 testing (scheduled 9:00 AM, executes between 9:00:00-9:01:00)
- **SC-004**: System maintains 99.5% uptime for publishing service during Week 2 testing period (7 days), excluding platform API outages beyond system control

#### Platform Coverage & Reliability

- **SC-005**: Successfully integrates with 10+ platforms as specified: WordPress, Shopify, Webflow, Wix, Squarespace, Ghost, Medium, LinkedIn, Dev.to, and 1+ custom CMS with fully managed OAuth authentication
- **SC-006**: Platform connection success rate >95% during testing measured as (successful OAuth connections / total connection attempts), excluding platform API unavailability
- **SC-007**: Automatic retry with exponential backoff recovers 80% of transient publishing failures within 3 retry attempts (5min, 15min, 45min intervals)
- **SC-008**: OAuth tokens remain valid and automatically refresh throughout Week 2 testing with 0 manual re-authentication requests due to failed automatic refresh (auth failures due to user revocation acceptable)

#### Content Adaptation Quality

- **SC-009**: 100% of adapted content meets platform-specific constraints validated by automated tests (LinkedIn ≤1300 chars, Dev.to valid Markdown, Twitter ≤280 chars per tweet)
- **SC-010**: 90% of beta users rate adapted content quality as "good" or "excellent" in post-publishing survey (4-point scale: poor/fair/good/excellent, survey sent after first 10 publishes)
- **SC-011**: LinkedIn post adaptations using smart AI summarization preserve key message with readability scores >60 (Flesch Reading Ease) in 95% of adaptations
- **SC-012**: Dev.to adaptations correctly apply Markdown formatting and syntax highlighting for code blocks in 100% of test cases containing code (validated via automated tests parsing ``` notation)

#### User Workflow Efficiency

- **SC-013**: Users complete end-to-end workflow (select article from Week 1 queue → configure 3 platforms → preview adaptations → publish) in under 3 minutes measured via user session analytics
- **SC-014**: 80% of beta users successfully publish to 3+ platforms during their first week of Week 2 feature access (onboarding success metric)
- **SC-015**: Average time saved vs manual publishing is >85% measured via user survey (estimated 30 minutes manual per platform = 5 hours for 10 platforms, vs <45 minutes with system including adaptation review)
- **SC-016**: 70% of users who publish once return within 7 days to publish additional content (engagement/retention metric indicating perceived value)

#### Analytics Accuracy

- **SC-017**: Publishing status tracking has 100% accuracy with all publish attempts correctly recorded with success/failure status (no missing records, validated via database audit)
- **SC-018**: Platform-specific post URLs captured correctly for 95% of successful publishes (some platforms may not return URLs immediately, acceptable to capture later via webhook or polling)
- **SC-019**: Engagement metrics (views, likes) sync from platform APIs within 24 hours of publishing where APIs support it (LinkedIn, Medium, Dev.to), with sync success rate >90%
- **SC-020**: Analytics dashboard query performance <500ms for displaying 30-day publishing history with 1000+ operations measured at p95 (cache optimization and database indexing)

#### Business Metrics

- **SC-021**: Beta users collectively publish 100+ total articles across all platforms during Week 2 testing period (validates feature adoption and roadmap success metric)
- **SC-022**: Average cost per publish (API calls for adaptation + platform API calls) is <$0.10 per platform (AI summarization ~$0.05, platform API calls ~$0.02, overhead ~$0.03), validating economic viability
- **SC-023**: Multi-platform publishing increases content reach by 300% compared to single-platform publishing measured via aggregate views (e.g., WordPress-only: 1000 views, 10 platforms: 4000+ views)
- **SC-024**: 60% of users enable scheduling feature for future publishes (configure at least 1 scheduled publish), indicating perceived value of automation and optimal timing

## Assumptions

The following assumptions were made during specification to fill gaps in the roadmap description:

1. **OAuth Registration**: Platform OAuth applications will be registered during Week 2 development (one-time setup by development team) before user testing begins. Each platform requires separate app registration with redirect URLs, scopes, and credentials.

2. **Platform API Availability**: All 10+ platforms have public APIs supporting programmatic publishing. Squarespace and Wix may have limited API capabilities; specification assumes best-effort integration with manual fallback if APIs are restrictive.

3. **User OAuth Consent**: Users are willing to grant OAuth permissions to the platform for publishing on their behalf. Clear privacy policy and data usage explanation will be provided during OAuth consent flow.

4. **AI Cost Budget**: Smart AI summarization cost of ~$0.05-0.10 per article is acceptable for the economic model. Total cost per 10-platform publish: ~$1.00 (10 platforms × $0.10), acceptable given pricing target of $99-199/month for Growth tier.

5. **Engagement API Limitations**: Not all platforms provide engagement APIs (views, likes, shares). Specification assumes best-effort metric collection where APIs are available (LinkedIn, Medium, Dev.to have good API support; WordPress depends on analytics plugin; Wix/Squarespace may have limited engagement data).

6. **Publishing Frequency**: Users will not publish extremely high volumes (>100 articles/day) during Week 2 testing. Rate limiting of 100 publishes/user/day is sufficient for testing and early production use. Enterprise users needing higher limits can request increases in future.

7. **Content Ownership**: Users have rights to publish content to all selected platforms and accept responsibility for duplicate content SEO implications. System will provide warning about duplicate content but allows user to proceed.

8. **Scheduling Window**: Scheduled publishes are intended for near-term future (days to weeks), not years in advance. Scheduling UI will default to next 30 days with option to extend to 90 days maximum for Week 2 MVP.

9. **Platform Changes**: Platform APIs are relatively stable during Week 2 development and testing. If platforms make breaking API changes, system will detect failures via health checks and alert users, with fixes applied in future updates.

10. **Network Complexity**: Syndication networks will have reasonable size (5-10 platforms per network) during Week 2. Extremely large networks (20+ platforms) may require additional optimization for publishing performance in future releases.
