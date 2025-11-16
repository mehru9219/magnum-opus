/**
 * Problem-Solver Content Template
 *
 * Generates solution-focused articles that address specific problems or pain points.
 * These articles are optimized to answer "how to fix", "solve", or "troubleshoot" queries.
 *
 * @module lib/content-templates/problem-solver
 */

export interface ProblemSolverTemplateParams {
  problem: string;
  topic: string;
  tone?: 'professional' | 'casual' | 'technical' | 'conversational';
  targetLength?: number; // words
  audience?: string;
  urgency?: 'critical' | 'important' | 'moderate';
  includePreventionTips?: boolean;
  includeAlternatives?: boolean;
}

export interface TemplateResult {
  prompt: string;
  systemPrompt: string;
  estimatedTokens: number;
}

/**
 * Builds a problem-solver article prompt optimized for AI generation
 *
 * @param params - Template parameters for problem-solver article
 * @returns Formatted prompt for AI model
 */
export function buildProblemSolverPrompt(params: ProblemSolverTemplateParams): TemplateResult {
  const {
    problem,
    topic,
    tone = 'conversational',
    targetLength = 1400,
    audience = 'people experiencing this problem',
    urgency = 'important',
    includePreventionTips = true,
    includeAlternatives = true,
  } = params;

  const urgencyContext =
    urgency === 'critical'
      ? 'This is a critical issue requiring immediate action. Prioritize quick, effective solutions.'
      : urgency === 'important'
      ? 'This is an important issue that needs resolution. Balance speed with thoroughness.'
      : 'This is a common issue. Provide comprehensive, well-researched solutions.';

  const systemPrompt = `You are an expert problem-solving content writer. Your articles:
- Directly address the reader's pain points with empathy
- Provide clear, actionable solutions that actually work
- Are optimized for AI search engines (ChatGPT, Claude, Perplexity, Gemini)
- ${tone} in tone, speaking directly to ${audience}
- Focus on practical problem-resolution over theory

${urgencyContext}`;

  const prompt = `Write a comprehensive problem-solving article: "${topic}"

Core Problem to Solve: ${problem}

Article Structure:

1. **Problem Overview** (150-200 words)
   - Clearly state the problem: "${problem}"
   - Why this problem occurs (root causes)
   - Who is typically affected
   - Impact/consequences if left unsolved
   - Reassurance: "You're not alone, and this is solvable"

2. **Quick Fix (TL;DR Solution)** (100-150 words)
   - Provide the fastest, most effective solution upfront
   - 3-5 step quick fix for readers who need immediate help
   - When to use this quick fix vs. more thorough solutions

3. **Comprehensive Solutions**

   Present 3-5 different solution approaches:

   **Solution 1: [Method Name]** (Recommended)
   - **What it is**: Brief explanation
   - **When to use**: Best scenarios for this solution
   - **Step-by-step process**:
     1. Step one with specifics
     2. Step two with details
     3. Step three with context
     (Add more steps as needed)
   - **Expected results**: What success looks like
   - **Pros & cons**: Honest assessment
   - **Time/effort required**: Set realistic expectations

   **Solution 2: [Alternative Method]**
   (Same structure as Solution 1)

   **Solution 3: [Another Approach]**
   (Same structure as Solution 1)

   ${includeAlternatives ? '**Solutions 4-5**: Brief descriptions of additional alternatives' : ''}

4. **Troubleshooting**
   - "Solution didn't work? Try this..."
   - Common obstacles and how to overcome them
   - When to seek professional help
   - Warning signs of deeper issues

${includePreventionTips ? `5. **Prevention Tips**
   - How to avoid this problem in the future
   - 5-7 proactive measures
   - Best practices for long-term success
   - Maintenance routines or habits` : ''}

6. **Conclusion** (100-150 words)
   - Recap the recommended solution
   - Encouragement to take action
   - What to do if problems persist
   - Related issues to watch for

Requirements:
- Target length: ${targetLength} words
- Write in ${tone} tone for ${audience}
- Lead with empathy - acknowledge the frustration of "${problem}"
- Prioritize solutions by effectiveness and ease
- Include specific, actionable steps (no vague advice)
- Provide 3-5 real examples or case studies
- Add 3+ authoritative citations (will be added automatically)
- Use markdown formatting with clear headings
- Optimize for "how to fix [problem]" and "solve [problem]" queries
- Address both symptoms and root causes
- Set realistic expectations for time/effort

Tone: ${tone}
Urgency: ${urgency}
Audience: ${audience}

Write the complete problem-solving article now:`;

  // Estimate tokens (rough: 1 token ≈ 0.75 words)
  const estimatedTokens = Math.ceil((prompt.length + systemPrompt.length) * 0.75);

  return {
    prompt,
    systemPrompt,
    estimatedTokens,
  };
}

/**
 * Validates problem-solver template parameters
 */
export function validateProblemSolverParams(
  params: ProblemSolverTemplateParams
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!params.problem || params.problem.trim().length === 0) {
    errors.push('problem is required');
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

  const validUrgency = ['critical', 'important', 'moderate'];
  if (params.urgency && !validUrgency.includes(params.urgency)) {
    errors.push(`urgency must be one of: ${validUrgency.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
