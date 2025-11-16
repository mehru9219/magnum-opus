/**
 * Tests for citation insertion
 */

import { describe, it, expect, vi } from 'vitest';
import {
  insertCitations,
  validateCitationCount,
  extractExistingCitations,
} from '../citation-inserter';
import type { Citation } from '../citation-finder';

describe('Citation Inserter', () => {
  const sampleContent = `
# Article Title

This is the introduction paragraph. It sets the context for the article.

## Section 1

Here is some factual information. According to research, 75% of users prefer simple content. This is an important statistic.

## Section 2

More content here with additional claims. Studies show that readability matters.

## Conclusion

Summary of the main points.
  `.trim();

  const sampleCitations: Citation[] = [
    {
      url: 'https://example.com/study1',
      title: 'Research Study on User Preferences',
      snippet: 'Study about user preferences...',
      domain: 'example.com',
      authorityScore: 85,
      relevanceScore: 90,
      type: 'research',
    },
    {
      url: 'https://research.edu/readability',
      title: 'The Importance of Readability',
      snippet: 'Academic research on readability...',
      domain: 'research.edu',
      authorityScore: 95,
      relevanceScore: 88,
      author: 'Dr. Smith',
      type: 'research',
    },
    {
      url: 'https://example.org/content-guide',
      title: 'Content Writing Best Practices',
      snippet: 'Guide to content writing...',
      domain: 'example.org',
      authorityScore: 80,
      relevanceScore: 85,
      type: 'article',
    },
  ];

  describe('insertCitations', () => {
    it('should insert citations into content', () => {
      const result = insertCitations(sampleContent, sampleCitations);

      expect(result.citationsAdded).toBeGreaterThan(0);
      expect(result.content).toContain('[');
      expect(result.referencesSection).toContain('References');
    });

    it('should insert minimum 3 citations', () => {
      const result = insertCitations(sampleContent, sampleCitations, {
        minCitations: 3,
      });

      expect(result.citationsAdded).toBeGreaterThanOrEqual(3);
    });

    it('should respect max citations limit', () => {
      const result = insertCitations(sampleContent, sampleCitations, {
        maxCitations: 2,
      });

      expect(result.citationsAdded).toBeLessThanOrEqual(2);
    });

    it('should generate references section', () => {
      const result = insertCitations(sampleContent, sampleCitations, {
        includeReferencesSection: true,
      });

      expect(result.referencesSection).toContain('## References');
      expect(result.referencesSection).toContain('https://');
    });

    it('should support different insertion styles', () => {
      const inlineResult = insertCitations(sampleContent, sampleCitations, {
        insertionStyle: 'inline',
      });

      const footnoteResult = insertCitations(sampleContent, sampleCitations, {
        insertionStyle: 'footnote',
      });

      const referenceResult = insertCitations(sampleContent, sampleCitations, {
        insertionStyle: 'reference',
      });

      expect(inlineResult.content).toBeDefined();
      expect(footnoteResult.content).toBeDefined();
      expect(referenceResult.content).toBeDefined();
    });

    it('should track citation placements', () => {
      const result = insertCitations(sampleContent, sampleCitations);

      expect(result.citationsPlacements).toHaveLength(result.citationsAdded);
      result.citationsPlacements.forEach(placement => {
        expect(placement).toHaveProperty('citation');
        expect(placement).toHaveProperty('position');
        expect(placement).toHaveProperty('context');
        expect(placement).toHaveProperty('insertionMethod');
      });
    });
  });

  describe('validateCitationCount', () => {
    it('should validate sufficient citations', () => {
      const contentWithCitations = 'Content [1] more content [2] and [3] final.';
      const result = validateCitationCount(contentWithCitations, 3);

      expect(result.valid).toBe(true);
      expect(result.count).toBeGreaterThanOrEqual(3);
    });

    it('should fail with insufficient citations', () => {
      const contentWithFewCitations = 'Content [1] more content.';
      const result = validateCitationCount(contentWithFewCitations, 3);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should count different citation formats', () => {
      const contentMixed = 'Content [1] and [[2]] and [^3]';
      const result = validateCitationCount(contentMixed);

      expect(result.count).toBeGreaterThan(0);
    });
  });

  describe('extractExistingCitations', () => {
    it('should extract URLs from references section', () => {
      const contentWithRefs = `
Article content here.

## References

1. Source One. Retrieved from (https://example.com/source1)
2. Source Two. Retrieved from (https://example.org/source2)
      `.trim();

      const citations = extractExistingCitations(contentWithRefs);

      expect(citations).toContain('https://example.com/source1');
      expect(citations).toContain('https://example.org/source2');
    });

    it('should extract inline citations', () => {
      const contentInline = 'Text [source](https://example.com "Title") more text.';
      const citations = extractExistingCitations(contentInline);

      expect(citations).toContain('https://example.com');
    });

    it('should not duplicate citations', () => {
      const contentDupes = `
Text (https://example.com) more text.

## References
1. (https://example.com)
      `.trim();

      const citations = extractExistingCitations(contentDupes);

      const uniqueCitations = new Set(citations);
      expect(uniqueCitations.size).toBe(citations.length);
    });
  });

  describe('Edge cases', () => {
    it('should throw error for empty content', () => {
      expect(() => insertCitations('', sampleCitations)).toThrow('Content is required');
    });

    it('should throw error for no citations', () => {
      expect(() => insertCitations(sampleContent, [])).toThrow('At least one citation is required');
    });

    it('should handle very short content', () => {
      const result = insertCitations('Short content.', sampleCitations.slice(0, 1));

      expect(result.citationsAdded).toBe(1);
    });

    it('should warn when fewer citations than minimum', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      insertCitations(sampleContent, sampleCitations.slice(0, 1), {
        minCitations: 3,
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
