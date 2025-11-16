/**
 * Unit Tests: Optimization Scanner
 */

import { describe, it, expect } from 'vitest';
import {
  OpportunityScanner,
  calculatePriorityLevel,
  adjustPriorityScore,
  estimateScanDuration,
  estimateOpportunityCount,
} from '../../../lib/optimization/scanner';

describe('Optimization Scanner', () => {
  describe('Priority Level Calculation', () => {
    it('should calculate urgent for score >= 90', () => {
      expect(calculatePriorityLevel(95)).toBe('urgent');
      expect(calculatePriorityLevel(90)).toBe('urgent');
    });

    it('should calculate high for score >= 70', () => {
      expect(calculatePriorityLevel(85)).toBe('high');
      expect(calculatePriorityLevel(70)).toBe('high');
    });

    it('should calculate medium for score >= 40', () => {
      expect(calculatePriorityLevel(55)).toBe('medium');
      expect(calculatePriorityLevel(40)).toBe('medium');
    });

    it('should calculate low for score < 40', () => {
      expect(calculatePriorityLevel(30)).toBe('low');
      expect(calculatePriorityLevel(10)).toBe('low');
    });
  });

  describe('Priority Score Adjustment', () => {
    it('should increase score for high traffic pages', () => {
      const baseScore = 50;
      const adjusted = adjustPriorityScore(baseScore, { hasHighTraffic: true });
      expect(adjusted).toBeGreaterThan(baseScore);
    });

    it('should increase score for top ranking pages', () => {
      const baseScore = 50;
      const adjusted = adjustPriorityScore(baseScore, { isTopRanking: true });
      expect(adjusted).toBeGreaterThan(baseScore);
    });

    it('should increase score for stale pages', () => {
      const baseScore = 50;
      const adjusted = adjustPriorityScore(baseScore, { isStale: true });
      expect(adjusted).toBeGreaterThan(baseScore);
    });

    it('should cap score at 100', () => {
      const baseScore = 95;
      const adjusted = adjustPriorityScore(baseScore, {
        hasHighTraffic: true,
        isTopRanking: true,
        isStale: true,
      });
      expect(adjusted).toBeLessThanOrEqual(100);
    });

    it('should apply multiple multipliers correctly', () => {
      const baseScore = 50;
      const adjusted = adjustPriorityScore(baseScore, {
        hasHighTraffic: true,
        isTopRanking: true,
      });
      expect(adjusted).toBeGreaterThan(adjustPriorityScore(baseScore, { hasHighTraffic: true }));
    });
  });

  describe('Scan Duration Estimation', () => {
    it('should estimate duration for full scan', () => {
      const duration = estimateScanDuration(100, 'full');
      expect(duration).toBeGreaterThan(0);
    });

    it('should estimate lower duration for incremental scan', () => {
      const fullDuration = estimateScanDuration(100, 'full');
      const incrementalDuration = estimateScanDuration(100, 'incremental');
      expect(incrementalDuration).toBeLessThan(fullDuration);
    });

    it('should scale with article count', () => {
      const small = estimateScanDuration(10, 'full');
      const large = estimateScanDuration(100, 'full');
      expect(large).toBeGreaterThan(small);
    });
  });

  describe('Opportunity Count Estimation', () => {
    it('should estimate opportunities for published articles', () => {
      const articles = [
        { _id: '1', status: 'published' },
        { _id: '2', status: 'published' },
        { _id: '3', status: 'draft' },
      ];

      const estimate = estimateOpportunityCount(articles);

      expect(estimate.total).toBeGreaterThan(0);
      expect(estimate.byType.keywords).toBeGreaterThan(0);
      expect(estimate.byType.faq).toBeGreaterThan(0);
      expect(estimate.byType.metadata).toBeGreaterThan(0);
      expect(estimate.byType.llmtxt).toBe(1);
      expect(estimate.byType.internalLinks).toBeGreaterThan(0);
    });

    it('should return zero for no published articles', () => {
      const articles = [
        { _id: '1', status: 'draft' },
        { _id: '2', status: 'draft' },
      ];

      const estimate = estimateOpportunityCount(articles);

      expect(estimate.total).toBe(1); // Only LLMTXT opportunity
      expect(estimate.byType.keywords).toBe(0);
    });
  });

  describe('Scanner Execution', () => {
    it('should create scanner with config', () => {
      const scanner = new OpportunityScanner({
        userId: 'user-1',
        scanType: 'full',
        detectRules: {
          keywords: true,
          faq: true,
          metadata: true,
          llmtxt: true,
          internalLinks: true,
        },
      });

      expect(scanner).toBeDefined();
    });

    it('should run scan and return results', async () => {
      const scanner = new OpportunityScanner({
        userId: 'user-1',
        scanType: 'full',
        detectRules: {
          keywords: true,
          faq: false,
          metadata: false,
          llmtxt: false,
          internalLinks: false,
        },
      });

      const articles = [
        {
          _id: 'article-1',
          content: '# Title\n\nContent here.',
          title: 'Test Article',
          publishedUrl: 'https://example.com/test',
          status: 'published',
        },
      ];

      const result = await scanner.scan(articles, ['SEO', 'optimization']);

      expect(result.success).toBe(true);
      expect(result.pagesAnalyzed).toBe(1);
      expect(result.duration).toBeGreaterThan(0);
      expect(Array.isArray(result.opportunities)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should filter by priority threshold', async () => {
      const scanner = new OpportunityScanner({
        userId: 'user-1',
        scanType: 'full',
        detectRules: {
          keywords: true,
          faq: false,
          metadata: false,
          llmtxt: false,
          internalLinks: false,
        },
        priorityThreshold: 80,
      });

      const articles = [
        {
          _id: 'article-1',
          content: '# Title\n\nContent.',
          title: 'Test',
          publishedUrl: 'https://example.com/test',
          status: 'published',
        },
      ];

      const result = await scanner.scan(articles, ['keyword1']);

      // All returned opportunities should have score >= 80
      result.opportunities.forEach((opp) => {
        expect(opp.priorityScore).toBeGreaterThanOrEqual(80);
      });
    });

    it('should handle empty article list', async () => {
      const scanner = new OpportunityScanner({
        userId: 'user-1',
        scanType: 'full',
        detectRules: {
          keywords: true,
          faq: true,
          metadata: true,
          llmtxt: true,
          internalLinks: true,
        },
      });

      const result = await scanner.scan([]);

      expect(result.success).toBe(true);
      expect(result.pagesAnalyzed).toBe(0);
      expect(result.opportunities).toHaveLength(0);
    });
  });
});
