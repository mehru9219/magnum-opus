/**
 * Tests for content template system
 */

import { describe, it, expect } from 'vitest';
import {
  buildPrompt,
  validateTemplateParams,
  getAvailableTemplates,
  recommendTemplate,
  TEMPLATE_METADATA,
} from '../index';

describe('Content Templates', () => {
  describe('buildPrompt', () => {
    it('should build comparison prompt', () => {
      const result = buildPrompt('comparison', {
        itemA: 'Product A',
        itemB: 'Product B',
        topic: 'Product A vs Product B',
      });

      expect(result).toHaveProperty('prompt');
      expect(result).toHaveProperty('systemPrompt');
      expect(result).toHaveProperty('estimatedTokens');
      expect(result.prompt).toContain('Product A');
      expect(result.prompt).toContain('Product B');
    });

    it('should build how-to prompt', () => {
      const result = buildPrompt('how-to', {
        topic: 'How to Build a Website',
      });

      expect(result.prompt).toContain('How to Build a Website');
      expect(result.systemPrompt).toContain('instructional');
    });

    it('should build listicle prompt', () => {
      const result = buildPrompt('listicle', {
        topic: '10 Best Practices',
        itemCount: 10,
      });

      expect(result.prompt).toContain('10');
    });
  });

  describe('validateTemplateParams', () => {
    it('should validate comparison params', () => {
      const valid = validateTemplateParams('comparison', {
        itemA: 'A',
        itemB: 'B',
        topic: 'A vs B',
      });

      expect(valid.valid).toBe(true);
      expect(valid.errors).toHaveLength(0);
    });

    it('should reject invalid comparison params', () => {
      const invalid = validateTemplateParams('comparison', {
        itemA: '',
        itemB: 'B',
        topic: 'Test',
      });

      expect(invalid.valid).toBe(false);
      expect(invalid.errors.length).toBeGreaterThan(0);
    });

    it('should validate target length constraints', () => {
      const tooShort = validateTemplateParams('how-to', {
        topic: 'Test',
        targetLength: 100,
      });

      expect(tooShort.valid).toBe(false);
      expect(tooShort.errors).toContain('targetLength must be between 300 and 5000 words');
    });
  });

  describe('getAvailableTemplates', () => {
    it('should return all 5 templates', () => {
      const templates = getAvailableTemplates();

      expect(templates).toHaveLength(5);
      expect(templates.map(t => t.id)).toEqual([
        'comparison',
        'how-to',
        'listicle',
        'problem-solver',
        'ultimate-guide',
      ]);
    });

    it('should include metadata for each template', () => {
      const templates = getAvailableTemplates();

      templates.forEach(template => {
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('defaultLength');
        expect(template).toHaveProperty('geoScore');
      });
    });
  });

  describe('recommendTemplate', () => {
    it('should recommend how-to for tutorial topics', () => {
      expect(recommendTemplate('How to build a website')).toBe('how-to');
      expect(recommendTemplate('Step by step guide')).toBe('how-to');
    });

    it('should recommend comparison for vs topics', () => {
      expect(recommendTemplate('React vs Vue')).toBe('comparison');
      expect(recommendTemplate('Difference between X and Y')).toBe('comparison');
    });

    it('should recommend listicle for numbered topics', () => {
      expect(recommendTemplate('10 best practices')).toBe('listicle');
      expect(recommendTemplate('Top 5 ways to improve')).toBe('listicle');
    });

    it('should recommend problem-solver for troubleshooting', () => {
      expect(recommendTemplate('How to fix error X')).toBe('problem-solver');
      expect(recommendTemplate('Troubleshooting guide')).toBe('problem-solver');
    });

    it('should recommend ultimate-guide for comprehensive topics', () => {
      expect(recommendTemplate('Ultimate guide to JavaScript')).toBe('ultimate-guide');
      expect(recommendTemplate('Complete guide to SEO')).toBe('ultimate-guide');
    });
  });

  describe('TEMPLATE_METADATA', () => {
    it('should have GEO scores for all templates', () => {
      Object.values(TEMPLATE_METADATA).forEach(template => {
        expect(template.geoScore).toBeGreaterThanOrEqual(1);
        expect(template.geoScore).toBeLessThanOrEqual(10);
      });
    });

    it('should have how-to, problem-solver, and ultimate-guide with max GEO score', () => {
      expect(TEMPLATE_METADATA['how-to'].geoScore).toBe(10);
      expect(TEMPLATE_METADATA['problem-solver'].geoScore).toBe(10);
      expect(TEMPLATE_METADATA['ultimate-guide'].geoScore).toBe(10);
    });
  });
});
