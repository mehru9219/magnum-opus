/**
 * How-To Content Template
 *
 * Generates step-by-step instructional articles optimized for GEO visibility.
 * These articles teach readers how to accomplish specific tasks or goals.
 *
 * @module lib/content-templates/how-to
 */

export interface HowToTemplateParams {
  topic: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  tone?: 'professional' | 'casual' | 'technical' | 'conversational';
  targetLength?: number; // words
  audience?: string;
  estimatedTime?: string; // e.g., "30 minutes", "2 hours"
  includePrerequisites?: boolean;
  includeTroubleshooting?: boolean;
}

export interface TemplateResult {
  prompt: string;
  systemPrompt: string;
  estimatedTokens: number;
}

/**
 * Builds a how-to article prompt optimized for AI generation
 *
 * @param params - Template parameters for how-to article
 * @returns Formatted prompt for AI model
 */
export function buildHowToPrompt(params: HowToTemplateParams): TemplateResult {
  const {
    topic,
    skillLevel = 'all-levels',
    tone = 'conversational',
    targetLength = 1200,
    audience = 'general readers',
    estimatedTime,
    includePrerequisites = true,
    includeTroubleshooting = true,
  } = params;

  const systemPrompt = `You are an expert instructional content writer. Your how-to guides are:
- Clear and actionable with numbered steps
- Optimized for AI search engines (ChatGPT, Claude, Perplexity, Gemini)
- Written for ${skillLevel} skill level
- ${tone} in tone, accessible to ${audience}
- Structured to answer common "how to" queries directly

Focus on practical, executable instructions that readers can follow immediately.`;

  const prompt = `Write a comprehensive how-to guide: "${topic}"

Article Structure:

1. **Introduction** (100-150 words)
   - What this guide will teach
   - Why this skill/task is valuable
   - Who this guide is for (${skillLevel})
   ${estimatedTime ? `- Time required: ${estimatedTime}` : ''}

${includePrerequisites ? `2. **What You'll Need** (Prerequisites)
   - Tools, software, or materials required
   - Background knowledge needed
   - Links to prerequisite guides if applicable` : ''}

3. **Step-by-Step Instructions**
   - Break down into 5-10 clear, numbered steps
   - Each step should be a single, focused action
   - Include **why** you're doing each step (builds understanding)
   - Add helpful tips or warnings where relevant
   - Use sub-steps (3.1, 3.2) for complex steps

   Format each step as:
   **Step X: [Action-oriented title]**
   - Detailed instructions
   - Expected outcome
   - [Optional: Screenshot placeholder or visual description]

4. **Best Practices & Pro Tips**
   - 5-7 expert tips to improve results
   - Common mistakes to avoid
   - Time-saving shortcuts
   - Quality optimization tips

${includeTroubleshooting ? `5. **Troubleshooting Common Issues**
   - List 3-5 common problems and solutions
   - Format: "Problem: [issue] → Solution: [fix]"
   - Include preventive measures` : ''}

6. **Conclusion & Next Steps**
   - Summary of what was accomplished
   - Expected results
   - Recommended next steps or related guides
   - Encouragement to take action

Requirements:
- Target length: ${targetLength} words
- Write for ${skillLevel} skill level
- Use ${tone} tone for ${audience}
- Include 3-5 specific examples or scenarios
- Add 3+ authoritative citations (will be added automatically)
- Use markdown formatting with clear headings
- Optimize for "how to [topic]" queries in AI search
- Make instructions concrete and testable
- Include success criteria for each major step

Tone: ${tone}
Skill Level: ${skillLevel}
Audience: ${audience}

Write the complete how-to guide now:`;

  // Estimate tokens (rough: 1 token ≈ 0.75 words)
  const estimatedTokens = Math.ceil((prompt.length + systemPrompt.length) * 0.75);

  return {
    prompt,
    systemPrompt,
    estimatedTokens,
  };
}

/**
 * Validates how-to template parameters
 */
export function validateHowToParams(params: HowToTemplateParams): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!params.topic || params.topic.trim().length === 0) {
    errors.push('topic is required');
  }

  if (params.targetLength && (params.targetLength < 300 || params.targetLength > 5000)) {
    errors.push('targetLength must be between 300 and 5000 words');
  }

  const validSkillLevels = ['beginner', 'intermediate', 'advanced', 'all-levels'];
  if (params.skillLevel && !validSkillLevels.includes(params.skillLevel)) {
    errors.push(`skillLevel must be one of: ${validSkillLevels.join(', ')}`);
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
