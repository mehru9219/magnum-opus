/**
 * AI Prompt Templates
 * Reusable, optimized prompts for content generation
 */

import type {
  PromptTemplate,
  PromptVariables,
  ContentTemplate,
  AIModel,
} from "./types";

/**
 * System Prompts for Different AI Personas
 */
export const SYSTEM_PROMPTS = {
  CONTENT_WRITER: `You are an expert content writer specializing in SEO and GEO (Generative Engine Optimization) optimized content. Your content is:
- Well-researched and factually accurate
- Optimized for search engines and AI platforms (ChatGPT, Claude, Perplexity, Gemini)
- Engaging, clear, and reader-friendly
- Structured with proper headings, lists, and formatting
- Rich with relevant statistics, quotes, and citations when appropriate
- Tailored to the target audience and purpose`,

  SEO_EXPERT: `You are an SEO and GEO optimization expert. You write content that:
- Naturally incorporates target keywords without stuffing
- Uses semantic variations and LSI keywords
- Includes compelling meta titles and descriptions
- Structures content with H1, H2, H3 headings properly
- Optimizes for featured snippets and "People Also Ask" sections
- Maximizes visibility in AI-generated responses`,

  RESEARCH_ANALYST: `You are a research analyst creating data-driven content. You:
- Include relevant statistics and data points
- Cite credible sources (academic, industry reports, expert opinions)
- Present balanced, objective analysis
- Use quotes from industry experts
- Back claims with evidence
- Maintain high factual accuracy`,

  CREATIVE_WRITER: `You are a creative content writer who creates engaging, compelling narratives. You:
- Use storytelling techniques to captivate readers
- Create emotional connections with the audience
- Use vivid language and descriptive writing
- Maintain a unique, memorable voice
- Balance creativity with clarity
- Adapt tone to match the brand and audience`,
} as const;

/**
 * Prompt Templates Database
 */
export const PROMPT_TEMPLATES: Record<ContentTemplate, PromptTemplate> = {
  "blog-post": {
    name: "Blog Post",
    description: "General-purpose blog article with SEO/GEO optimization",
    systemPrompt: SYSTEM_PROMPTS.CONTENT_WRITER,
    userPromptTemplate: `Write a comprehensive blog post about: {{topic}}

Requirements:
- Target length: {{targetLength}} words
- Tone: {{tone}}
- Target audience: {{audience}}
{{#keywords}}
- Target keywords: {{keywords}}
{{/keywords}}
{{#includeStats}}
- Include relevant statistics and data points
{{/includeStats}}
{{#includeCitations}}
- Cite credible sources
{{/includeCitations}}
{{#seoOptimized}}
- Optimize for SEO with natural keyword placement
{{/seoOptimized}}
{{#geoOptimized}}
- Optimize for AI platforms (ChatGPT, Claude, Perplexity, Gemini) visibility
{{/geoOptimized}}

Structure:
1. Compelling introduction with hook
2. Well-organized body with clear H2/H3 headings
3. Actionable insights and practical advice
4. Strong conclusion with clear takeaways

{{#additionalContext}}
Additional context: {{additionalContext}}
{{/additionalContext}}`,
    requiredVariables: ["topic", "targetLength", "tone", "audience"],
    optionalVariables: [
      "keywords",
      "includeStats",
      "includeCitations",
      "seoOptimized",
      "geoOptimized",
      "additionalContext",
    ],
    recommendedModels: ["claude-3.5-sonnet", "gpt-4-turbo", "claude-3-sonnet"],
    estimatedTokens: 3000,
  },

  listicle: {
    name: "Listicle",
    description: "Numbered or bulleted list article",
    systemPrompt: SYSTEM_PROMPTS.CONTENT_WRITER,
    userPromptTemplate: `Write an engaging listicle: {{topic}}

Requirements:
- Format: Numbered list with {{listCount}} items
- Target length: {{targetLength}} words
- Tone: {{tone}}
- Target audience: {{audience}}
{{#keywords}}
- Target keywords: {{keywords}}
{{/keywords}}

Structure for EACH list item:
1. Clear, attention-grabbing subheading
2. 2-3 paragraphs of explanation
3. Practical example or use case
{{#includeStats}}
4. Supporting statistic or data point
{{/includeStats}}

Overall structure:
- Compelling intro explaining why this list matters
- {{listCount}} well-developed list items
- Brief conclusion with key takeaways

{{#additionalContext}}
Additional context: {{additionalContext}}
{{/additionalContext}}`,
    requiredVariables: ["topic", "listCount", "targetLength", "tone", "audience"],
    optionalVariables: ["keywords", "includeStats", "additionalContext"],
    recommendedModels: ["gpt-3.5-turbo", "claude-3-haiku", "gemini-1.5-flash"],
    estimatedTokens: 2500,
  },

  "how-to-guide": {
    name: "How-To Guide",
    description: "Step-by-step instructional content",
    systemPrompt: SYSTEM_PROMPTS.CONTENT_WRITER,
    userPromptTemplate: `Create a comprehensive how-to guide: {{topic}}

Requirements:
- Target length: {{targetLength}} words
- Tone: {{tone}} (clear, instructional)
- Target audience: {{audience}} (skill level: {{skillLevel}})
{{#keywords}}
- Target keywords: {{keywords}}
{{/keywords}}

Structure:
1. Introduction
   - What readers will learn
   - Prerequisites (if any)
   - Estimated time to complete

2. Step-by-step instructions
   - Numbered steps in logical order
   - Clear, actionable instructions for each step
   - Potential pitfalls or common mistakes to avoid
   - Visual descriptions where helpful

3. Conclusion
   - Summary of what was accomplished
   - Next steps or advanced tips
   - Related resources

Make instructions crystal clear and beginner-friendly.

{{#additionalContext}}
Additional context: {{additionalContext}}
{{/additionalContext}}`,
    requiredVariables: ["topic", "targetLength", "tone", "audience", "skillLevel"],
    optionalVariables: ["keywords", "additionalContext"],
    recommendedModels: ["claude-3-sonnet", "gpt-4", "claude-3.5-sonnet"],
    estimatedTokens: 3500,
  },

  "product-review": {
    name: "Product Review",
    description: "Detailed product analysis and review",
    systemPrompt: SYSTEM_PROMPTS.RESEARCH_ANALYST,
    userPromptTemplate: `Write a comprehensive, balanced product review for: {{productName}}

Requirements:
- Target length: {{targetLength}} words
- Tone: {{tone}} (objective, helpful)
- Target audience: {{audience}}
{{#keywords}}
- Target keywords: {{keywords}}
{{/keywords}}

Structure:
1. Introduction
   - Product overview
   - What problem it solves
   - First impressions

2. Key Features & Specifications
   - Main features breakdown
   - Technical specifications
   - What makes it unique

3. Performance Analysis
   - Real-world testing results
   - Pros (detailed)
   - Cons (honest assessment)

4. Comparison
   - How it compares to alternatives
   - Price/value analysis

5. Final Verdict
   - Overall rating
   - Who should buy it
   - Who should skip it

Be honest, balanced, and provide genuine value to readers.

{{#additionalContext}}
Additional product details: {{additionalContext}}
{{/additionalContext}}`,
    requiredVariables: [
      "productName",
      "targetLength",
      "tone",
      "audience",
    ],
    optionalVariables: ["keywords", "additionalContext"],
    recommendedModels: ["gpt-4-turbo", "claude-3.5-sonnet", "claude-3-opus"],
    estimatedTokens: 4000,
  },

  comparison: {
    name: "Comparison Article",
    description: "Side-by-side comparison of options",
    systemPrompt: SYSTEM_PROMPTS.RESEARCH_ANALYST,
    userPromptTemplate: `Write a detailed comparison article: {{topic}}

Comparing: {{optionA}} vs {{optionB}}{{#optionC}} vs {{optionC}}{{/optionC}}

Requirements:
- Target length: {{targetLength}} words
- Tone: {{tone}} (objective, analytical)
- Target audience: {{audience}}
{{#keywords}}
- Target keywords: {{keywords}}
{{/keywords}}

Structure:
1. Introduction
   - Why this comparison matters
   - Who this comparison is for

2. Overview of each option
   - Brief introduction to each

3. Feature-by-feature comparison
   - Create comparison table or sections
   - Compare: features, pricing, performance, ease of use, support, etc.

4. Use case scenarios
   - Best for beginners
   - Best for professionals
   - Best for budget
   - Best for specific needs

5. Final recommendation
   - Clear guidance on which to choose when
   - Summary comparison table

Be fair, data-driven, and help readers make informed decisions.

{{#additionalContext}}
Additional context: {{additionalContext}}
{{/additionalContext}}`,
    requiredVariables: [
      "topic",
      "optionA",
      "optionB",
      "targetLength",
      "tone",
      "audience",
    ],
    optionalVariables: ["optionC", "keywords", "additionalContext"],
    recommendedModels: ["claude-3.5-sonnet", "gpt-4-turbo", "perplexity-sonar-pro"],
    estimatedTokens: 3500,
  },

  "case-study": {
    name: "Case Study",
    description: "Detailed analysis of a specific example or success story",
    systemPrompt: SYSTEM_PROMPTS.RESEARCH_ANALYST,
    userPromptTemplate: `Write a compelling case study: {{topic}}

Requirements:
- Company/Subject: {{subject}}
- Target length: {{targetLength}} words
- Tone: {{tone}} (professional, analytical)
- Target audience: {{audience}}
{{#keywords}}
- Target keywords: {{keywords}}
{{/keywords}}

Structure:
1. Executive Summary
   - Key challenge
   - Solution implemented
   - Results achieved

2. Background
   - Company/subject overview
   - Industry context
   - Initial situation

3. Challenge
   - Detailed problem description
   - Why it mattered
   - Previous attempts to solve

4. Solution
   - Approach taken
   - Implementation process
   - Timeline and resources

5. Results
   - Quantifiable outcomes
   - ROI or key metrics
   - Testimonials or quotes

6. Key Takeaways
   - Lessons learned
   - Recommendations for others

Use specific data and quotes to make it credible and compelling.

{{#additionalContext}}
Additional information: {{additionalContext}}
{{/additionalContext}}`,
    requiredVariables: ["topic", "subject", "targetLength", "tone", "audience"],
    optionalVariables: ["keywords", "includeStats", "additionalContext"],
    recommendedModels: ["gpt-4-turbo", "claude-3-opus", "claude-3.5-sonnet"],
    estimatedTokens: 4500,
  },

  "news-article": {
    name: "News Article",
    description: "Timely news content with citations",
    systemPrompt: SYSTEM_PROMPTS.RESEARCH_ANALYST,
    userPromptTemplate: `Write a news article about: {{topic}}

Requirements:
- Target length: {{targetLength}} words
- Tone: {{tone}} (objective, journalistic)
- Target audience: {{audience}}
- Publishing date: {{publishDate}}

Structure (inverted pyramid):
1. Lead paragraph
   - Who, What, When, Where, Why, How
   - Most important information first

2. Supporting details
   - Additional context
   - Background information
   - Expert quotes or statements
   - Related facts and data

3. Additional context
   - Historical background
   - Future implications
   - Related developments

Maintain journalistic objectivity and cite all sources.

{{#additionalContext}}
Additional context: {{additionalContext}}
{{/additionalContext}}`,
    requiredVariables: [
      "topic",
      "targetLength",
      "tone",
      "audience",
      "publishDate",
    ],
    optionalVariables: ["additionalContext"],
    recommendedModels: ["perplexity-sonar", "perplexity-sonar-pro", "gpt-4-turbo"],
    estimatedTokens: 2500,
  },

  tutorial: {
    name: "Tutorial",
    description: "Detailed educational content with examples",
    systemPrompt: SYSTEM_PROMPTS.CONTENT_WRITER,
    userPromptTemplate: `Create a comprehensive tutorial: {{topic}}

Requirements:
- Target length: {{targetLength}} words
- Tone: {{tone}} (educational, friendly)
- Skill level: {{skillLevel}}
- Target audience: {{audience}}
{{#keywords}}
- Target keywords: {{keywords}}
{{/keywords}}

Structure:
1. Introduction
   - What you'll learn
   - Prerequisites
   - Why this matters

2. Conceptual overview
   - Key concepts explained
   - Terminology defined

3. Step-by-step tutorial
   - Hands-on examples
   - Code snippets or detailed procedures
   - Explanations of each step
   - Common errors and solutions

4. Practice exercises
   - Try-it-yourself challenges
   - Solutions or hints

5. Next steps
   - Advanced topics to explore
   - Resources for further learning

Make it practical, hands-on, and beginner-friendly.

{{#additionalContext}}
Additional context: {{additionalContext}}
{{/additionalContext}}`,
    requiredVariables: [
      "topic",
      "targetLength",
      "tone",
      "skillLevel",
      "audience",
    ],
    optionalVariables: ["keywords", "additionalContext"],
    recommendedModels: ["claude-3-sonnet", "gpt-4", "claude-3.5-sonnet"],
    estimatedTokens: 4000,
  },

  faq: {
    name: "FAQ",
    description: "Frequently Asked Questions format",
    systemPrompt: SYSTEM_PROMPTS.CONTENT_WRITER,
    userPromptTemplate: `Create a comprehensive FAQ about: {{topic}}

Requirements:
- Number of Q&A pairs: {{questionCount}}
- Target length: {{targetLength}} words total
- Tone: {{tone}} (helpful, clear)
- Target audience: {{audience}}
{{#keywords}}
- Target keywords: {{keywords}}
{{/keywords}}

Structure:
1. Brief introduction
   - What this FAQ covers

2. Questions and Answers
   - {{questionCount}} common questions
   - Clear, concise answers (2-4 paragraphs each)
   - Organized by category if applicable
   - Use natural language questions people actually ask

3. Additional resources
   - Where to learn more
   - Contact information if needed

Make answers thorough but scannable. Optimize for voice search and AI platforms.

{{#additionalContext}}
Additional context: {{additionalContext}}
{{/additionalContext}}`,
    requiredVariables: [
      "topic",
      "questionCount",
      "targetLength",
      "tone",
      "audience",
    ],
    optionalVariables: ["keywords", "additionalContext"],
    recommendedModels: ["gpt-3.5-turbo", "claude-3-haiku", "gemini-1.5-flash"],
    estimatedTokens: 2000,
  },

  "landing-page": {
    name: "Landing Page Copy",
    description: "Conversion-focused landing page content",
    systemPrompt: SYSTEM_PROMPTS.CREATIVE_WRITER,
    userPromptTemplate: `Write compelling landing page copy for: {{productOrService}}

Requirements:
- Target length: {{targetLength}} words
- Tone: {{tone}} (persuasive, benefit-focused)
- Target audience: {{audience}}
- Primary CTA: {{callToAction}}
{{#keywords}}
- Target keywords: {{keywords}}
{{/keywords}}

Structure:
1. Hero Section
   - Attention-grabbing headline
   - Compelling subheadline
   - Clear value proposition
   - Primary CTA

2. Problem/Solution
   - Pain points addressed
   - How product/service solves them

3. Benefits & Features
   - Key benefits (not just features)
   - Social proof or testimonials
   - Trust signals

4. How It Works
   - Simple 3-step process
   - Remove friction

5. Pricing/Offer (if applicable)
   - Clear pricing
   - Value justification
   - Urgency or scarcity if appropriate

6. Final CTA
   - Strong, action-oriented
   - Risk reversal (guarantee, free trial, etc.)

Focus on benefits, clarity, and conversion.

{{#additionalContext}}
Additional details: {{additionalContext}}
{{/additionalContext}}`,
    requiredVariables: [
      "productOrService",
      "targetLength",
      "tone",
      "audience",
      "callToAction",
    ],
    optionalVariables: ["keywords", "additionalContext"],
    recommendedModels: ["gpt-4", "claude-3-opus", "gpt-4-turbo"],
    estimatedTokens: 2500,
  },
};

/**
 * Build a prompt from a template with variable substitution
 */
export function buildPrompt(
  template: ContentTemplate,
  variables: PromptVariables
): { systemPrompt: string; userPrompt: string } {
  const promptTemplate = PROMPT_TEMPLATES[template];

  if (!promptTemplate) {
    throw new Error(`Unknown template: ${template}`);
  }

  // Validate required variables
  const missingVars = promptTemplate.requiredVariables.filter(
    (varName) => !(varName in variables)
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required variables for ${template} template: ${missingVars.join(", ")}`
    );
  }

  // Simple template variable substitution (Mustache-style)
  let userPrompt = promptTemplate.userPromptTemplate;

  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Handle arrays (e.g., keywords)
      const valueStr = Array.isArray(value) ? value.join(", ") : String(value);

      // Replace {{variable}}
      userPrompt = userPrompt.replace(
        new RegExp(`{{${key}}}`, "g"),
        valueStr
      );

      // Handle conditional blocks {{#variable}}...{{/variable}}
      const conditionalRegex = new RegExp(
        `{{#${key}}}([\\s\\S]*?){{\\/${key}}}`,
        "g"
      );
      userPrompt = userPrompt.replace(conditionalRegex, "$1");
    } else {
      // Remove conditional blocks if variable is not set
      const conditionalRegex = new RegExp(
        `{{#${key}}}[\\s\\S]*?{{\\/${key}}}`,
        "g"
      );
      userPrompt = userPrompt.replace(conditionalRegex, "");
    }
  });

  // Clean up any remaining unreplaced variables
  userPrompt = userPrompt.replace(/{{#\w+}}[\s\S]*?{{\/\w+}}/g, "");
  userPrompt = userPrompt.replace(/{{\w+}}/g, "");

  return {
    systemPrompt: promptTemplate.systemPrompt,
    userPrompt: userPrompt.trim(),
  };
}

/**
 * Get template by name
 */
export function getTemplate(template: ContentTemplate): PromptTemplate {
  const promptTemplate = PROMPT_TEMPLATES[template];
  if (!promptTemplate) {
    throw new Error(`Unknown template: ${template}`);
  }
  return promptTemplate;
}

/**
 * Get recommended model for a template
 */
export function getRecommendedModelForTemplate(
  template: ContentTemplate
): AIModel {
  const promptTemplate = PROMPT_TEMPLATES[template];
  return promptTemplate.recommendedModels[0];
}

/**
 * List all available templates
 */
export function getAllTemplates(): ContentTemplate[] {
  return Object.keys(PROMPT_TEMPLATES) as ContentTemplate[];
}

/**
 * Validate template variables
 */
export function validateTemplateVariables(
  template: ContentTemplate,
  variables: PromptVariables
): { valid: boolean; errors: string[] } {
  const promptTemplate = PROMPT_TEMPLATES[template];
  const errors: string[] = [];

  // Check required variables
  promptTemplate.requiredVariables.forEach((varName) => {
    if (!(varName in variables) || variables[varName] === undefined) {
      errors.push(`Missing required variable: ${varName}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
