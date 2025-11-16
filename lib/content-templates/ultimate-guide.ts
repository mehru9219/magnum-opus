/**
 * Ultimate Guide Content Template
 *
 * Generates comprehensive, authoritative long-form articles covering a topic exhaustively.
 * These pillar content pieces are designed to be the definitive resource on a subject.
 *
 * @module lib/content-templates/ultimate-guide
 */

export interface UltimateGuideTemplateParams {
  topic: string;
  tone?: 'professional' | 'casual' | 'technical' | 'conversational';
  targetLength?: number; // words - typically 2500-5000
  audience?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  includeTOC?: boolean;
  includeFAQ?: boolean;
  includeResources?: boolean;
}

export interface TemplateResult {
  prompt: string;
  systemPrompt: string;
  estimatedTokens: number;
}

/**
 * Builds an ultimate guide prompt optimized for AI generation
 *
 * @param params - Template parameters for ultimate guide
 * @returns Formatted prompt for AI model
 */
export function buildUltimateGuidePrompt(params: UltimateGuideTemplateParams): TemplateResult {
  const {
    topic,
    tone = 'professional',
    targetLength = 3000,
    audience = 'readers seeking comprehensive knowledge',
    skillLevel = 'all-levels',
    includeTOC = true,
    includeFAQ = true,
    includeResources = true,
  } = params;

  const systemPrompt = `You are an expert content strategist writing authoritative pillar content. Your ultimate guides:
- Cover topics comprehensively with depth and breadth
- Are optimized for AI search engines (ChatGPT, Claude, Perplexity, Gemini)
- Serve as the definitive resource readers bookmark and share
- ${tone} in tone, authoritative yet accessible to ${audience}
- Structured for both scanning and deep reading
- Written for ${skillLevel} readers

This is cornerstone content - make it exceptional and comprehensive.`;

  const prompt = `Write THE ultimate guide to: "${topic}"

This should be the most comprehensive, authoritative resource on this topic.

Article Structure:

1. **Introduction** (200-300 words)
   - Hook: Why this topic is critically important
   - What makes this guide "ultimate" (comprehensive coverage promise)
   - Who this guide is for: ${skillLevel} ${audience}
   - What readers will master after reading
   - Credibility statement (research, expertise, data used)

${includeTOC ? `2. **Table of Contents**
   - List all major sections with brief descriptions
   - Make it scannable for readers seeking specific information` : ''}

3. **Fundamentals & Foundation** (400-600 words)
   - **What is [topic]?**: Comprehensive definition
   - **Core Concepts**: 5-8 fundamental principles
   - **Why it matters**: Real-world impact and applications
   - **Common misconceptions**: Debunk 3-5 myths
   - **Brief history or evolution**: Context and background

4. **Deep Dive Sections** (The Heart of the Guide)

   Create 5-8 comprehensive sections covering all aspects of the topic:

   **Section A: [Major Subtopic 1]**
   - In-depth explanation (200-400 words)
   - Key principles and frameworks
   - Practical applications
   - Examples and case studies
   - Data and research findings

   **Section B: [Major Subtopic 2]**
   (Same structure, different aspect)

   **Section C: [Major Subtopic 3]**
   (Continue for 5-8 sections total)

   Each section should:
   - Stand alone while connecting to the whole
   - Include specific, actionable insights
   - Cite research or data points
   - Provide real-world examples

5. **Step-by-Step Implementation**
   - How to apply this knowledge practically
   - Detailed action plan or roadmap
   - 7-12 concrete steps
   - Timeline and milestones
   - Success metrics and KPIs

6. **Advanced Strategies** (300-400 words)
   - Expert-level techniques
   - Optimization tips
   - Common pitfalls and how to avoid them
   - Advanced best practices
   - Cutting-edge developments

7. **Tools, Resources & Ecosystem** (${includeResources ? '300-400' : '100-150'} words)
   - Essential tools and platforms
   - ${includeResources ? 'Recommended books, courses, communities' : 'Key tools to know about'}
   - Where to learn more
   - Industry leaders to follow
   - Useful frameworks and methodologies

8. **Real-World Case Studies**
   - 2-4 detailed case studies showing success
   - Different scenarios or industries
   - Specific results and outcomes
   - Lessons learned from each

9. **Comparison & Alternatives**
   - How this compares to related approaches
   - When to use this vs. alternatives
   - Pros and cons analysis
   - Decision framework

${includeFAQ ? `10. **Frequently Asked Questions (FAQ)**
    - Answer 10-15 common questions
    - Address objections and concerns
    - Provide quick, scannable answers
    - Cover beginner to advanced questions` : ''}

11. **Conclusion & Next Steps** (200-250 words)
    - Comprehensive recap of key insights
    - Recommended action plan for beginners
    - Recommended action plan for advanced users
    - Final encouragement and motivation
    - What to do next

Requirements:
- Target length: ${targetLength} words (comprehensive pillar content)
- Write in ${tone} tone for ${audience}
- For ${skillLevel} readers - adjust complexity accordingly
- Include 15-25 specific data points, statistics, or research findings
- Provide 10+ concrete examples across the guide
- Add 8+ authoritative citations (will be added automatically)
- Use extensive markdown formatting (##, ###, ####, lists, tables, quotes)
- Create at least 2 comparison tables or frameworks
- Optimize for broad "[topic]" and "guide to [topic]" queries
- Make this skimmable with clear headings and bullet points
- But also valuable for deep reading with rich detail
- Include practical, actionable advice in every section
- Balance theory with practice
- Write with authority - this is THE definitive guide

Tone: ${tone}
Skill Level: ${skillLevel}
Audience: ${audience}
Depth: Comprehensive - leave nothing important uncovered

Write the complete ultimate guide now:`;

  // Estimate tokens (rough: 1 token ≈ 0.75 words)
  const estimatedTokens = Math.ceil((prompt.length + systemPrompt.length) * 0.75);

  return {
    prompt,
    systemPrompt,
    estimatedTokens,
  };
}

/**
 * Validates ultimate guide template parameters
 */
export function validateUltimateGuideParams(
  params: UltimateGuideTemplateParams
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!params.topic || params.topic.trim().length === 0) {
    errors.push('topic is required');
  }

  if (params.targetLength && (params.targetLength < 1000 || params.targetLength > 10000)) {
    errors.push('targetLength must be between 1000 and 10000 words for ultimate guides');
  }

  const validTones = ['professional', 'casual', 'technical', 'conversational'];
  if (params.tone && !validTones.includes(params.tone)) {
    errors.push(`tone must be one of: ${validTones.join(', ')}`);
  }

  const validSkillLevels = ['beginner', 'intermediate', 'advanced', 'all-levels'];
  if (params.skillLevel && !validSkillLevels.includes(params.skillLevel)) {
    errors.push(`skillLevel must be one of: ${validSkillLevels.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
