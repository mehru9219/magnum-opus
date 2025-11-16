/**
 * Prompt Generator for AI Visibility Tracking (Week 3)
 *
 * Generates 50-100 prompt variations per keyword using template system.
 * Covers 5 template categories: Questions, Comparisons, Use Cases, Audience-Specific, Problem-Solving
 *
 * References:
 * - FR-013: Generate 50-100 prompt variations per keyword
 * - FR-014: Cover 5 template categories
 * - FR-018: Support prompt variables: {keyword}, {audience}, {use_case}, {industry}
 */

export type PromptCategory =
  | 'question'
  | 'comparison'
  | 'use_case'
  | 'audience_specific'
  | 'problem_solving';

export interface PromptTemplate {
  id: string;
  category: PromptCategory;
  template: string;
  variables: string[]; // e.g., ['keyword', 'audience', 'use_case']
  description: string;
}

export interface PromptVariation {
  prompt: string;
  category: PromptCategory;
  templateId: string;
  variables: Record<string, string>;
}

export interface GeneratePromptsOptions {
  keyword: string;
  audiences?: string[];
  useCases?: string[];
  industries?: string[];
  competitors?: string[];
  customPrompts?: string[];
  maxVariations?: number; // Default: 75 (target 50-100 range)
}

/**
 * Question Templates (T052)
 * Pattern: "What is...", "How to...", "Why...", "When...", "Who..."
 */
const QUESTION_TEMPLATES: PromptTemplate[] = [
  {
    id: 'q1',
    category: 'question',
    template: 'What is {keyword}?',
    variables: ['keyword'],
    description: 'Basic definition question'
  },
  {
    id: 'q2',
    category: 'question',
    template: 'What is the best {keyword}?',
    variables: ['keyword'],
    description: 'Best-of query'
  },
  {
    id: 'q3',
    category: 'question',
    template: 'How does {keyword} work?',
    variables: ['keyword'],
    description: 'Mechanism explanation'
  },
  {
    id: 'q4',
    category: 'question',
    template: 'How to choose {keyword}?',
    variables: ['keyword'],
    description: 'Selection guidance'
  },
  {
    id: 'q5',
    category: 'question',
    template: 'How to use {keyword}?',
    variables: ['keyword'],
    description: 'Usage instructions'
  },
  {
    id: 'q6',
    category: 'question',
    template: 'Why use {keyword}?',
    variables: ['keyword'],
    description: 'Value proposition'
  },
  {
    id: 'q7',
    category: 'question',
    template: 'When to use {keyword}?',
    variables: ['keyword'],
    description: 'Timing/context question'
  },
  {
    id: 'q8',
    category: 'question',
    template: 'Who needs {keyword}?',
    variables: ['keyword'],
    description: 'Target audience identification'
  },
  {
    id: 'q9',
    category: 'question',
    template: 'What are the benefits of {keyword}?',
    variables: ['keyword'],
    description: 'Benefits listing'
  },
  {
    id: 'q10',
    category: 'question',
    template: 'What are the top {keyword}?',
    variables: ['keyword'],
    description: 'Top options list'
  },
  {
    id: 'q11',
    category: 'question',
    template: 'How much does {keyword} cost?',
    variables: ['keyword'],
    description: 'Pricing question'
  },
  {
    id: 'q12',
    category: 'question',
    template: 'Is {keyword} worth it?',
    variables: ['keyword'],
    description: 'Value assessment'
  }
];

/**
 * Comparison Templates (T053)
 * Pattern: "X vs Y", "X or Y", "difference between X and Y"
 */
const COMPARISON_TEMPLATES: PromptTemplate[] = [
  {
    id: 'c1',
    category: 'comparison',
    template: '{keyword} vs {competitor}',
    variables: ['keyword', 'competitor'],
    description: 'Direct comparison'
  },
  {
    id: 'c2',
    category: 'comparison',
    template: '{keyword} or {competitor}',
    variables: ['keyword', 'competitor'],
    description: 'Alternative framing'
  },
  {
    id: 'c3',
    category: 'comparison',
    template: 'Difference between {keyword} and {competitor}',
    variables: ['keyword', 'competitor'],
    description: 'Difference query'
  },
  {
    id: 'c4',
    category: 'comparison',
    template: 'Compare {keyword} and {competitor}',
    variables: ['keyword', 'competitor'],
    description: 'Explicit comparison request'
  },
  {
    id: 'c5',
    category: 'comparison',
    template: 'Which is better: {keyword} or {competitor}?',
    variables: ['keyword', 'competitor'],
    description: 'Better-than query'
  },
  {
    id: 'c6',
    category: 'comparison',
    template: '{keyword} versus {competitor} comparison',
    variables: ['keyword', 'competitor'],
    description: 'Formal comparison'
  },
  {
    id: 'c7',
    category: 'comparison',
    template: 'Alternatives to {keyword}',
    variables: ['keyword'],
    description: 'Alternative seeking'
  },
  {
    id: 'c8',
    category: 'comparison',
    template: '{keyword} compared to competitors',
    variables: ['keyword'],
    description: 'General competitive comparison'
  }
];

/**
 * Use Case Templates (T054)
 * Pattern: "X for Y", "X to solve Y", "using X for Y"
 */
const USE_CASE_TEMPLATES: PromptTemplate[] = [
  {
    id: 'u1',
    category: 'use_case',
    template: '{keyword} for {use_case}',
    variables: ['keyword', 'use_case'],
    description: 'Purpose-specific query'
  },
  {
    id: 'u2',
    category: 'use_case',
    template: 'Best {keyword} for {use_case}',
    variables: ['keyword', 'use_case'],
    description: 'Best option for use case'
  },
  {
    id: 'u3',
    category: 'use_case',
    template: 'How to use {keyword} for {use_case}?',
    variables: ['keyword', 'use_case'],
    description: 'Application instructions'
  },
  {
    id: 'u4',
    category: 'use_case',
    template: 'Using {keyword} to solve {use_case}',
    variables: ['keyword', 'use_case'],
    description: 'Solution framing'
  },
  {
    id: 'u5',
    category: 'use_case',
    template: '{keyword} to improve {use_case}',
    variables: ['keyword', 'use_case'],
    description: 'Improvement goal'
  },
  {
    id: 'u6',
    category: 'use_case',
    template: 'Top {keyword} for {use_case} in {industry}',
    variables: ['keyword', 'use_case', 'industry'],
    description: 'Industry-specific use case'
  }
];

/**
 * Audience-Specific Templates (T055)
 * Pattern: "X for [audience]", "X for [team size]", "X for [company type]"
 */
const AUDIENCE_TEMPLATES: PromptTemplate[] = [
  {
    id: 'a1',
    category: 'audience_specific',
    template: '{keyword} for {audience}',
    variables: ['keyword', 'audience'],
    description: 'Audience-targeted query'
  },
  {
    id: 'a2',
    category: 'audience_specific',
    template: 'Best {keyword} for {audience}',
    variables: ['keyword', 'audience'],
    description: 'Best option for audience'
  },
  {
    id: 'a3',
    category: 'audience_specific',
    template: '{keyword} recommendations for {audience}',
    variables: ['keyword', 'audience'],
    description: 'Recommendation request'
  },
  {
    id: 'a4',
    category: 'audience_specific',
    template: 'Top {keyword} for {audience} in {industry}',
    variables: ['keyword', 'audience', 'industry'],
    description: 'Industry + audience specific'
  },
  {
    id: 'a5',
    category: 'audience_specific',
    template: '{keyword} suitable for {audience}',
    variables: ['keyword', 'audience'],
    description: 'Suitability query'
  },
  {
    id: 'a6',
    category: 'audience_specific',
    template: 'How {audience} use {keyword}',
    variables: ['keyword', 'audience'],
    description: 'Usage by audience'
  }
];

/**
 * Problem-Solving Templates
 * Pattern: "solve X with Y", "fix X using Y", "overcome X with Y"
 */
const PROBLEM_SOLVING_TEMPLATES: PromptTemplate[] = [
  {
    id: 'p1',
    category: 'problem_solving',
    template: 'How to solve {use_case} with {keyword}?',
    variables: ['keyword', 'use_case'],
    description: 'Solution-focused query'
  },
  {
    id: 'p2',
    category: 'problem_solving',
    template: 'Fix {use_case} using {keyword}',
    variables: ['keyword', 'use_case'],
    description: 'Fix-oriented query'
  },
  {
    id: 'p3',
    category: 'problem_solving',
    template: 'Overcome {use_case} with {keyword}',
    variables: ['keyword', 'use_case'],
    description: 'Challenge overcoming'
  },
  {
    id: 'p4',
    category: 'problem_solving',
    template: '{keyword} to address {use_case}',
    variables: ['keyword', 'use_case'],
    description: 'Addressing challenge'
  },
  {
    id: 'p5',
    category: 'problem_solving',
    template: 'Troubleshooting {use_case} with {keyword}',
    variables: ['keyword', 'use_case'],
    description: 'Troubleshooting focus'
  }
];

// Combine all templates
const ALL_TEMPLATES: PromptTemplate[] = [
  ...QUESTION_TEMPLATES,
  ...COMPARISON_TEMPLATES,
  ...USE_CASE_TEMPLATES,
  ...AUDIENCE_TEMPLATES,
  ...PROBLEM_SOLVING_TEMPLATES
];

// Default audience variations if not provided
const DEFAULT_AUDIENCES = [
  'small businesses',
  'enterprises',
  'startups',
  'remote teams',
  'agencies',
  'freelancers',
  'developers',
  'marketers'
];

// Default use case variations if not provided
const DEFAULT_USE_CASES = [
  'team collaboration',
  'project management',
  'productivity',
  'automation',
  'reporting',
  'analytics',
  'content creation',
  'customer management'
];

// Default industry variations if not provided
const DEFAULT_INDUSTRIES = [
  'technology',
  'marketing',
  'healthcare',
  'education',
  'finance',
  'e-commerce',
  'manufacturing'
];

/**
 * Replace variables in template string
 */
function replaceVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  return result;
}

/**
 * Check if template can be generated with available variables
 */
function canGenerateTemplate(
  template: PromptTemplate,
  availableVars: Set<string>
): boolean {
  return template.variables.every(v => availableVars.has(v));
}

/**
 * Generate all possible combinations for a template
 */
function generateCombinations(
  template: PromptTemplate,
  options: GeneratePromptsOptions
): PromptVariation[] {
  const variations: PromptVariation[] = [];
  const { keyword, audiences, useCases, industries, competitors } = options;

  // Build variable value sets
  const varValues: Record<string, string[]> = {
    keyword: [keyword],
    audience: audiences || DEFAULT_AUDIENCES.slice(0, 4), // Use 4 audiences
    use_case: useCases || DEFAULT_USE_CASES.slice(0, 4), // Use 4 use cases
    industry: industries || DEFAULT_INDUSTRIES.slice(0, 3), // Use 3 industries
    competitor: competitors || []
  };

  // Generate combinations based on template variables
  if (template.variables.length === 1) {
    // Single variable templates
    const varName = template.variables[0];
    const values = varValues[varName] || [];

    values.forEach(value => {
      variations.push({
        prompt: replaceVariables(template.template, { [varName]: value }),
        category: template.category,
        templateId: template.id,
        variables: { [varName]: value }
      });
    });
  } else if (template.variables.length === 2) {
    // Two variable templates
    const [var1, var2] = template.variables;
    const values1 = varValues[var1] || [];
    const values2 = varValues[var2] || [];

    // Generate combinations (limit to avoid explosion)
    const maxCombinations = 6; // Limit combinations per template
    let count = 0;

    for (const val1 of values1) {
      for (const val2 of values2) {
        if (count >= maxCombinations) break;

        variations.push({
          prompt: replaceVariables(template.template, { [var1]: val1, [var2]: val2 }),
          category: template.category,
          templateId: template.id,
          variables: { [var1]: val1, [var2]: val2 }
        });

        count++;
      }
      if (count >= maxCombinations) break;
    }
  } else if (template.variables.length === 3) {
    // Three variable templates (very limited)
    const [var1, var2, var3] = template.variables;
    const values1 = varValues[var1] || [];
    const values2 = varValues[var2] || [];
    const values3 = varValues[var3] || [];

    // Only generate a few combinations to avoid explosion
    const maxCombinations = 3;
    let count = 0;

    for (let i = 0; i < Math.min(values1.length, 2); i++) {
      for (let j = 0; j < Math.min(values2.length, 2); j++) {
        for (let k = 0; k < Math.min(values3.length, 1); k++) {
          if (count >= maxCombinations) break;

          variations.push({
            prompt: replaceVariables(template.template, {
              [var1]: values1[i],
              [var2]: values2[j],
              [var3]: values3[k]
            }),
            category: template.category,
            templateId: template.id,
            variables: { [var1]: values1[i], [var2]: values2[j], [var3]: values3[k] }
          });

          count++;
        }
        if (count >= maxCombinations) break;
      }
      if (count >= maxCombinations) break;
    }
  }

  return variations;
}

/**
 * Main function to generate prompt variations
 *
 * @param options - Configuration for prompt generation
 * @returns Array of 50-100 prompt variations
 */
export function generatePromptVariations(
  options: GeneratePromptsOptions
): PromptVariation[] {
  const maxVariations = options.maxVariations || 75;
  const variations: PromptVariation[] = [];

  // Determine which variables are available
  const availableVars = new Set<string>(['keyword']);
  if (options.audiences && options.audiences.length > 0) availableVars.add('audience');
  if (options.useCases && options.useCases.length > 0) availableVars.add('use_case');
  if (options.industries && options.industries.length > 0) availableVars.add('industry');
  if (options.competitors && options.competitors.length > 0) availableVars.add('competitor');

  // Always add defaults for core variables
  availableVars.add('audience');
  availableVars.add('use_case');
  availableVars.add('industry');

  // Filter templates that can be generated
  const applicableTemplates = ALL_TEMPLATES.filter(template =>
    canGenerateTemplate(template, availableVars)
  );

  // Generate variations from templates
  for (const template of applicableTemplates) {
    const templateVariations = generateCombinations(template, options);
    variations.push(...templateVariations);

    // Stop if we've reached max variations
    if (variations.length >= maxVariations) {
      break;
    }
  }

  // Add custom prompts if provided
  if (options.customPrompts) {
    options.customPrompts.forEach(prompt => {
      variations.push({
        prompt,
        category: 'question', // Default category for custom prompts
        templateId: 'custom',
        variables: { keyword: options.keyword }
      });
    });
  }

  // Limit to max variations
  const finalVariations = variations.slice(0, maxVariations);

  return finalVariations;
}

/**
 * Get all available templates
 */
export function getAllTemplates(): PromptTemplate[] {
  return ALL_TEMPLATES;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: PromptCategory): PromptTemplate[] {
  return ALL_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get summary of generated prompts
 */
export function getPromptSummary(variations: PromptVariation[]): {
  total: number;
  byCategory: Record<PromptCategory, number>;
} {
  const byCategory: Record<PromptCategory, number> = {
    question: 0,
    comparison: 0,
    use_case: 0,
    audience_specific: 0,
    problem_solving: 0
  };

  variations.forEach(v => {
    byCategory[v.category]++;
  });

  return {
    total: variations.length,
    byCategory
  };
}
