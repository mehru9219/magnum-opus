/**
 * Content Templates - Central Export
 *
 * Provides unified interface for all content templates in the Magnum Opus platform.
 * Each template generates optimized prompts for AI content generation.
 *
 * @module lib/content-templates
 */

import {
  buildComparisonPrompt,
  validateComparisonParams,
  type ComparisonTemplateParams,
} from './comparison';

import {
  buildHowToPrompt,
  validateHowToParams,
  type HowToTemplateParams,
} from './how-to';

import {
  buildListiclePrompt,
  validateListicleParams,
  type ListicleTemplateParams,
} from './listicle';

import {
  buildProblemSolverPrompt,
  validateProblemSolverParams,
  type ProblemSolverTemplateParams,
} from './problem-solver';

import {
  buildUltimateGuidePrompt,
  validateUltimateGuideParams,
  type UltimateGuideTemplateParams,
} from './ultimate-guide';

export type {
  ComparisonTemplateParams,
  HowToTemplateParams,
  ListicleTemplateParams,
  ProblemSolverTemplateParams,
  UltimateGuideTemplateParams,
};

/**
 * Template types available in the system
 */
export type ContentTemplateType =
  | 'comparison'
  | 'how-to'
  | 'listicle'
  | 'problem-solver'
  | 'ultimate-guide';

/**
 * Common result structure from all templates
 */
export interface TemplateResult {
  prompt: string;
  systemPrompt: string;
  estimatedTokens: number;
}

/**
 * Union type for all template parameters
 */
export type TemplateParams =
  | ComparisonTemplateParams
  | HowToTemplateParams
  | ListicleTemplateParams
  | ProblemSolverTemplateParams
  | UltimateGuideTemplateParams;

/**
 * Template metadata for UI display
 */
export interface TemplateMetadata {
  id: ContentTemplateType;
  name: string;
  description: string;
  icon: string;
  defaultLength: number;
  estimatedTime: string; // Time to generate
  bestFor: string[];
  geoScore: number; // 1-10, how well optimized for GEO
}

/**
 * Template registry with metadata
 */
export const TEMPLATE_METADATA: Record<ContentTemplateType, TemplateMetadata> = {
  'comparison': {
    id: 'comparison',
    name: 'Comparison Article',
    description: 'Compare two products, services, or concepts in detail',
    icon: '⚖️',
    defaultLength: 1500,
    estimatedTime: '2-3 minutes',
    bestFor: ['Product reviews', 'Alternative analysis', 'Decision guides'],
    geoScore: 9,
  },
  'how-to': {
    id: 'how-to',
    name: 'How-To Guide',
    description: 'Step-by-step instructional content for achieving a goal',
    icon: '📝',
    defaultLength: 1200,
    estimatedTime: '2 minutes',
    bestFor: ['Tutorials', 'Instructions', 'Learning content'],
    geoScore: 10,
  },
  'listicle': {
    id: 'listicle',
    name: 'Listicle',
    description: 'Numbered list article (e.g., "10 Ways to...")',
    icon: '📋',
    defaultLength: 1500,
    estimatedTime: '2-3 minutes',
    bestFor: ['Tips & tricks', 'Resource lists', 'Recommendations'],
    geoScore: 8,
  },
  'problem-solver': {
    id: 'problem-solver',
    name: 'Problem-Solver',
    description: 'Address a specific problem with actionable solutions',
    icon: '🔧',
    defaultLength: 1400,
    estimatedTime: '2 minutes',
    bestFor: ['Troubleshooting', 'Pain point content', 'Solution guides'],
    geoScore: 10,
  },
  'ultimate-guide': {
    id: 'ultimate-guide',
    name: 'Ultimate Guide',
    description: 'Comprehensive, authoritative long-form pillar content',
    icon: '📚',
    defaultLength: 3000,
    estimatedTime: '4-5 minutes',
    bestFor: ['Pillar content', 'Topic clusters', 'Authority building'],
    geoScore: 10,
  },
};

/**
 * Build prompt for any template type
 *
 * @param templateType - Type of template to use
 * @param params - Template-specific parameters
 * @returns Template result with prompts and token estimate
 */
export function buildPrompt(
  templateType: ContentTemplateType,
  params: TemplateParams
): TemplateResult {
  switch (templateType) {
    case 'comparison':
      return buildComparisonPrompt(params as ComparisonTemplateParams);
    case 'how-to':
      return buildHowToPrompt(params as HowToTemplateParams);
    case 'listicle':
      return buildListiclePrompt(params as ListicleTemplateParams);
    case 'problem-solver':
      return buildProblemSolverPrompt(params as ProblemSolverTemplateParams);
    case 'ultimate-guide':
      return buildUltimateGuidePrompt(params as UltimateGuideTemplateParams);
    default:
      throw new Error(`Unknown template type: ${templateType}`);
  }
}

/**
 * Validate parameters for any template type
 *
 * @param templateType - Type of template
 * @param params - Template-specific parameters
 * @returns Validation result with errors if invalid
 */
export function validateTemplateParams(
  templateType: ContentTemplateType,
  params: TemplateParams
): { valid: boolean; errors: string[] } {
  switch (templateType) {
    case 'comparison':
      return validateComparisonParams(params as ComparisonTemplateParams);
    case 'how-to':
      return validateHowToParams(params as HowToTemplateParams);
    case 'listicle':
      return validateListicleParams(params as ListicleTemplateParams);
    case 'problem-solver':
      return validateProblemSolverParams(params as ProblemSolverTemplateParams);
    case 'ultimate-guide':
      return validateUltimateGuideParams(params as UltimateGuideTemplateParams);
    default:
      return { valid: false, errors: [`Unknown template type: ${templateType}`] };
  }
}

/**
 * Get list of all available templates
 */
export function getAvailableTemplates(): TemplateMetadata[] {
  return Object.values(TEMPLATE_METADATA);
}

/**
 * Get template metadata by ID
 */
export function getTemplateMetadata(templateType: ContentTemplateType): TemplateMetadata {
  return TEMPLATE_METADATA[templateType];
}

/**
 * Recommend template based on topic keywords
 *
 * @param topic - Article topic or title
 * @returns Recommended template type
 */
export function recommendTemplate(topic: string): ContentTemplateType {
  const lowerTopic = topic.toLowerCase();

  // Ultimate guide indicators (check first - most specific)
  if (lowerTopic.match(/complete|ultimate|comprehensive|everything|master|definitive/)) {
    return 'ultimate-guide';
  }

  // Problem-solver indicators (check before how-to to catch "how to fix")
  if (lowerTopic.match(/fix|solve|troubleshoot|error|problem|issue|not working/)) {
    return 'problem-solver';
  }

  // Comparison indicators
  if (lowerTopic.match(/vs|versus|compare|difference between|or /)) {
    return 'comparison';
  }

  // Listicle indicators
  if (lowerTopic.match(/^\d+|best|top|ways to|reasons|tips|ideas/)) {
    return 'listicle';
  }

  // How-to indicators (check later to avoid false positives)
  if (lowerTopic.match(/how to|step by step|tutorial|guide to/)) {
    return 'how-to';
  }

  // Default to how-to as it's most versatile
  return 'how-to';
}

// Re-export individual template functions for direct use
export {
  buildComparisonPrompt,
  validateComparisonParams,
  buildHowToPrompt,
  validateHowToParams,
  buildListiclePrompt,
  validateListicleParams,
  buildProblemSolverPrompt,
  validateProblemSolverParams,
  buildUltimateGuidePrompt,
  validateUltimateGuideParams,
};
