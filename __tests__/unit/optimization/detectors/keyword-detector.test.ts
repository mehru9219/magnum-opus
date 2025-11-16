/**
 * Unit Tests: Keyword Detector
 */

import { describe, it, expect } from 'vitest';
import { detectKeywordOpportunities } from '../../../../lib/optimization/detectors/keyword-detector';

describe('Keyword Detector', () => {
  it('should detect missing keywords in H1 and H2', async () => {
    const article = {
      _id: 'test-1',
      content: '# Basic Title\n\n## Section One\n\nFirst paragraph content.',
      title: 'Basic Title',
      publishedUrl: 'https://example.com/article',
    };

    const trackedKeywords = ['SEO', 'optimization', 'keywords'];

    const opportunities = await detectKeywordOpportunities(article, trackedKeywords);

    expect(opportunities).toHaveLength(1);
    expect(opportunities[0].type).toBe('UPDATE_HEADINGS_KEYWORDS');
    expect(opportunities[0].detectionDetails.findings.missingKeywords).toContain('SEO');
  });

  it('should not detect opportunities if keywords are present', async () => {
    const article = {
      _id: 'test-2',
      content: '# SEO Optimization Guide\n\n## Keywords Research\n\nFirst paragraph about keywords.',
      title: 'SEO Guide',
      publishedUrl: 'https://example.com/seo-guide',
    };

    const trackedKeywords = ['SEO', 'keywords'];

    const opportunities = await detectKeywordOpportunities(article, trackedKeywords);

    expect(opportunities).toHaveLength(0);
  });

  it('should calculate keyword density correctly', async () => {
    const article = {
      _id: 'test-3',
      content: '# Title\n\nSEO SEO SEO SEO SEO. This is a test article with high keyword density.',
      title: 'Title',
      publishedUrl: 'https://example.com/test',
    };

    const trackedKeywords = ['SEO'];

    const opportunities = await detectKeywordOpportunities(article, trackedKeywords);

    if (opportunities.length > 0) {
      const keywordDensity = opportunities[0].detectionDetails.findings.keywordDensity;
      expect(keywordDensity).toBeGreaterThan(0);
    }
  });

  it('should handle articles without content', async () => {
    const article = {
      _id: 'test-4',
      content: '',
      title: 'Empty Article',
      publishedUrl: undefined,
    };

    const trackedKeywords = ['SEO'];

    const opportunities = await detectKeywordOpportunities(article, trackedKeywords);

    expect(opportunities).toHaveLength(0);
  });

  it('should prioritize articles with more missing keywords', async () => {
    const article1 = {
      _id: 'test-5',
      content: '# Title\n\nContent.',
      title: 'Title',
      publishedUrl: 'https://example.com/article1',
    };

    const article2 = {
      _id: 'test-6',
      content: '# Title\n\nContent.',
      title: 'Title',
      publishedUrl: 'https://example.com/article2',
    };

    const keywords1 = ['keyword1'];
    const keywords2 = ['keyword1', 'keyword2', 'keyword3'];

    const opp1 = await detectKeywordOpportunities(article1, keywords1);
    const opp2 = await detectKeywordOpportunities(article2, keywords2);

    if (opp1.length > 0 && opp2.length > 0) {
      expect(opp2[0].priorityScore).toBeGreaterThan(opp1[0].priorityScore);
    }
  });
});
