/**
 * Tests for readability scoring
 */

import { describe, it, expect } from 'vitest';
import {
  analyzeReadability,
  getReadabilityExplanation,
  formatReadabilityReport,
} from '../readability';

describe('Readability Analysis', () => {
  const easyContent = `This is easy to read. The sentences are short. Words are simple. Everyone can understand this.`;

  const difficultContent = `The implementation of sophisticated methodologies necessitates comprehensive understanding of multifaceted interdisciplinary approaches, incorporating paradigmatic frameworks that facilitate synergistic optimization of organizational infrastructures.`;

  const standardContent = `
Content marketing is an important strategy for businesses. It helps build trust with customers.
Good content provides value to readers. This can include blog posts, videos, and infographics.
When creating content, focus on your audience's needs. Use clear language and helpful examples.
Quality content can improve search rankings and drive traffic to your website.
  `.trim();

  describe('analyzeReadability', () => {
    it('should analyze content and return readability metrics', () => {
      const result = analyzeReadability(standardContent);

      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('fleschScore');
      expect(result).toHaveProperty('fleschKincaidGrade');
      expect(result).toHaveProperty('readingLevel');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('suggestions');
    });

    it('should pass easy content', () => {
      const result = analyzeReadability(easyContent);

      expect(result.passed).toBe(true);
      expect(result.fleschScore).toBeGreaterThan(70);
    });

    it('should fail very difficult content', () => {
      const result = analyzeReadability(difficultContent, { threshold: 70 });

      expect(result.passed).toBe(false);
      expect(result.fleschScore).toBeLessThan(70);
    });

    it('should calculate correct metrics', () => {
      const result = analyzeReadability(standardContent);

      expect(result.metrics.totalWords).toBeGreaterThan(0);
      expect(result.metrics.totalSentences).toBeGreaterThan(0);
      expect(result.metrics.averageWordsPerSentence).toBeGreaterThan(0);
    });

    it('should respect custom threshold', () => {
      const result = analyzeReadability(standardContent, { threshold: 90 });

      expect(result.threshold).toBe(90);
    });

    it('should provide helpful suggestions', () => {
      const result = analyzeReadability(difficultContent);

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.some(s => s.includes('readability'))).toBe(true);
    });

    it('should handle strict mode', () => {
      const longSentencesContent = Array(10).fill('This is a very long sentence with many words that goes on and on and should be broken up into smaller, more digestible pieces for better readability').join('. ');

      const strictResult = analyzeReadability(longSentencesContent, {
        strictMode: true,
        threshold: 70,
      });

      expect(strictResult.passed).toBe(false);
    });
  });

  describe('getReadabilityExplanation', () => {
    it('should provide passing explanation', () => {
      const result = analyzeReadability(easyContent);
      const explanation = getReadabilityExplanation(result);

      expect(explanation).toContain('✅');
      expect(explanation).toContain('passed');
    });

    it('should provide failing explanation', () => {
      const result = analyzeReadability(difficultContent, { threshold: 70 });
      const explanation = getReadabilityExplanation(result);

      expect(explanation).toContain('❌');
      expect(explanation).toContain('failed');
    });
  });

  describe('formatReadabilityReport', () => {
    it('should format complete report', () => {
      const result = analyzeReadability(standardContent);
      const report = formatReadabilityReport(result);

      expect(report).toContain('Readability Analysis');
      expect(report).toContain('Overall Score');
      expect(report).toContain('Metrics');
      expect(report).toContain('Suggestions');
    });
  });

  describe('Edge cases', () => {
    it('should throw error for empty content', () => {
      expect(() => analyzeReadability('')).toThrow('Content is required');
    });

    it('should handle very short content', () => {
      const result = analyzeReadability('Short.');

      expect(result).toHaveProperty('fleschScore');
      expect(result.metrics.totalWords).toBeGreaterThan(0);
    });

    it('should handle content with markdown', () => {
      const markdownContent = `# Title\n\n**Bold text** and *italic text*. [Link](url).`;
      const result = analyzeReadability(markdownContent);

      expect(result.metrics.totalWords).toBeGreaterThan(0);
    });
  });
});
