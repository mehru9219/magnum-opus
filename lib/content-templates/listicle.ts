/**
 * Listicle Content Template
 *
 * Generates numbered list articles optimized for GEO visibility.
 * These articles present information as a numbered or bulleted list (e.g., "10 Ways to...").
 *
 * @module lib/content-templates/listicle
 */

export interface ListicleTemplateParams {
  topic: string;
  itemCount?: number; // number of items in the list
  tone?: 'professional' | 'casual' | 'technical' | 'conversational';
  targetLength?: number; // words
  audience?: string;
  listType?: 'numbered' | 'ranked' | 'unranked';
  includeConclusion?: boolean;
}

export interface TemplateResult {
  prompt: string;
  systemPrompt: string;
  estimatedTokens: number;
}

/**
 * Builds a listicle article prompt optimized for AI generation
 *
 * @param params - Template parameters for listicle article
 * @returns Formatted prompt for AI model
 */
export function buildListiclePrompt(params: ListicleTemplateParams): TemplateResult {
  const {
    topic,
    itemCount = 10,
    tone = 'conversational',
    targetLength = 1500,
    audience = 'general readers',
    listType = 'numbered',
    includeConclusion = true,
  } = params;

  const systemPrompt = `You are an expert content writer specializing in listicle articles. Your writing is:
- Engaging and scannable with clear numbered/bulleted items
- Optimized for AI search engines (ChatGPT, Claude, Perplexity, Gemini)
- ${tone} in tone, resonating with ${audience}
- Backed by data and specific examples
- Structured for quick comprehension and shareability

Focus on providing valuable, actionable information in an easily digestible format.`;

  const rankingGuidance = listType === 'ranked'
    ? 'Items should be ranked from best to least-best (or most to least important). Explain the ranking criteria.'
    : listType === 'numbered'
    ? 'Items should be presented in a logical sequence or order.'
    : 'Items can be in any order - focus on comprehensive coverage.';

  const prompt = `Write a comprehensive listicle article: "${topic}"

Article Structure:

1. **Introduction** (100-150 words)
   - Hook: Why this topic matters to ${audience}
   - What readers will discover in this list
   - Brief context or background
   - ${listType === 'ranked' ? 'Explain your ranking methodology' : ''}

2. **The List: ${itemCount} Items**

   ${rankingGuidance}

   For EACH of the ${itemCount} items, use this structure:

   **#[Number]. [Catchy, Descriptive Title]**

   - **What it is**: Clear explanation (2-3 sentences)
   - **Why it matters**: Benefits, importance, or impact (2-3 sentences)
   - **How to use/apply it**: Practical tips or action steps (2-4 sentences)
   - **Example**: Real-world example or scenario (1-2 sentences)
   - ${listType === 'ranked' ? '**Ranking reason**: Why this ranks here (1-2 sentences)' : ''}

   Each item should be 100-150 words.

3. **Quick Reference Summary**
   - Create a concise bullet-point summary of all ${itemCount} items
   - One line per item highlighting the key takeaway

${includeConclusion ? `4. **Conclusion** (100-150 words)
   - Recap the main theme
   - Encourage readers to take action
   - Suggest which items to start with
   - Call-to-action or next steps` : ''}

Requirements:
- Total ${itemCount} items in the list
- Target length: ${targetLength} words (~${Math.floor(targetLength / itemCount)} words per item)
- Write in ${tone} tone for ${audience}
- ${listType === 'ranked' ? 'Rank items from #1 (best) to #' + itemCount + ' (still good, but less optimal)' : 'Present items in logical order'}
- Include specific data, statistics, or research for at least ${Math.ceil(itemCount / 2)} items
- Use concrete examples for each item
- Add 3+ authoritative citations (will be added automatically)
- Use markdown formatting with clear headings
- Make titles specific and benefit-focused
- Optimize for "[number] [topic]" queries in AI search
- Ensure each item provides unique, non-overlapping value

Tone: ${tone}
List Type: ${listType}
Audience: ${audience}

Write the complete listicle now:`;

  // Estimate tokens (rough: 1 token ≈ 0.75 words)
  const estimatedTokens = Math.ceil((prompt.length + systemPrompt.length) * 0.75);

  return {
    prompt,
    systemPrompt,
    estimatedTokens,
  };
}

/**
 * Validates listicle template parameters
 */
export function validateListicleParams(params: ListicleTemplateParams): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!params.topic || params.topic.trim().length === 0) {
    errors.push('topic is required');
  }

  if (params.itemCount && (params.itemCount < 3 || params.itemCount > 100)) {
    errors.push('itemCount must be between 3 and 100');
  }

  if (params.targetLength && (params.targetLength < 300 || params.targetLength > 10000)) {
    errors.push('targetLength must be between 300 and 10000 words');
  }

  const validTones = ['professional', 'casual', 'technical', 'conversational'];
  if (params.tone && !validTones.includes(params.tone)) {
    errors.push(`tone must be one of: ${validTones.join(', ')}`);
  }

  const validListTypes = ['numbered', 'ranked', 'unranked'];
  if (params.listType && !validListTypes.includes(params.listType)) {
    errors.push(`listType must be one of: ${validListTypes.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
