/**
 * Comparison Content Template
 *
 * Generates "X vs Y" style comparison articles optimized for GEO visibility.
 * These articles compare two products, services, or concepts in detail.
 *
 * @module lib/content-templates/comparison
 */

export interface ComparisonTemplateParams {
  itemA: string;
  itemB: string;
  topic: string;
  tone?: 'professional' | 'casual' | 'technical' | 'conversational';
  targetLength?: number; // words
  audience?: string;
  includeConclusion?: boolean;
}

export interface TemplateResult {
  prompt: string;
  systemPrompt: string;
  estimatedTokens: number;
}

/**
 * Builds a comparison article prompt optimized for AI generation
 *
 * @param params - Template parameters for comparison article
 * @returns Formatted prompt for AI model
 */
export function buildComparisonPrompt(params: ComparisonTemplateParams): TemplateResult {
  const {
    itemA,
    itemB,
    topic,
    tone = 'professional',
    targetLength = 1500,
    audience = 'general audience',
    includeConclusion = true,
  } = params;

  const systemPrompt = `You are an expert content writer specializing in comparison articles. Your writing is:
- Objective and balanced, presenting both options fairly
- Data-driven with specific facts and statistics
- Optimized for AI search engines (ChatGPT, Claude, Perplexity, Gemini)
- Structured for clarity with clear sections and comparisons
- ${tone} in tone, appropriate for ${audience}

Focus on providing actionable insights that help readers make informed decisions.`;

  const prompt = `Write a comprehensive comparison article: "${topic}"

Compare: ${itemA} vs ${itemB}

Structure:
1. **Introduction** (100-150 words)
   - Brief overview of ${itemA} and ${itemB}
   - Why this comparison matters
   - What readers will learn

2. **Quick Comparison Table**
   - Create a markdown table comparing 5-7 key features/aspects
   - Include metrics, pricing, or other quantifiable data

3. **Detailed Comparison Sections** (organize by feature/aspect, not by product)
   - Feature/Aspect 1: How ${itemA} and ${itemB} differ
   - Feature/Aspect 2: Performance comparison with data
   - Feature/Aspect 3: User experience differences
   - Feature/Aspect 4: Pricing and value analysis
   - Feature/Aspect 5: Use case scenarios
   - (Add 2-3 more relevant sections)

4. **Pros and Cons**
   - ${itemA}: 3-4 pros, 3-4 cons
   - ${itemB}: 3-4 pros, 3-4 cons

5. **Use Case Recommendations**
   - "Choose ${itemA} if..." (3-4 specific scenarios)
   - "Choose ${itemB} if..." (3-4 specific scenarios)

${includeConclusion ? `6. **Conclusion** (100-150 words)
   - Summary of key differences
   - Final recommendation framework
   - No single "winner" - guide based on use case` : ''}

Requirements:
- Target length: ${targetLength} words
- Include 5-8 specific statistics or data points with sources
- Use clear headings (##, ###) for structure
- Write in ${tone} tone for ${audience}
- Avoid bias - present both options objectively
- Include 3+ authoritative citations (will be added automatically)
- Use markdown formatting throughout
- Optimize for featured snippets in AI responses

Tone: ${tone}
Audience: ${audience}

Write the complete article now:`;

  // Estimate tokens (rough: 1 token ≈ 0.75 words)
  const estimatedTokens = Math.ceil((prompt.length + systemPrompt.length) * 0.75);

  return {
    prompt,
    systemPrompt,
    estimatedTokens,
  };
}

/**
 * Validates comparison template parameters
 */
export function validateComparisonParams(params: ComparisonTemplateParams): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!params.itemA || params.itemA.trim().length === 0) {
    errors.push('itemA is required');
  }

  if (!params.itemB || params.itemB.trim().length === 0) {
    errors.push('itemB is required');
  }

  if (!params.topic || params.topic.trim().length === 0) {
    errors.push('topic is required');
  }

  if (params.targetLength && (params.targetLength < 300 || params.targetLength > 5000)) {
    errors.push('targetLength must be between 300 and 5000 words');
  }

  const validTones = ['professional', 'casual', 'technical', 'conversational'];
  if (params.tone && !validTones.includes(params.tone)) {
    errors.push(`tone must be one of: ${validTones.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
