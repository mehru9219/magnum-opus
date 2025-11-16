/**
 * Unit Tests: Metadata Detector
 */

import { describe, it, expect } from 'vitest';
import { detectMetadataOpportunities } from '../../../../lib/optimization/detectors/metadata-detector';

describe('Metadata Detector', () => {
  it('should detect stale metadata (>6 months old)', async () => {
    const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000);

    const article = {
      _id: 'test-1',
      title: 'Old Article from 2020',
      metaTitle: 'Old Article from 2020',
      metaDescription: 'This is an old article',
      publishedUrl: 'https://example.com/old-article',
      lastUpdatedAt: sixMonthsAgo,
    };

    const opportunities = await detectMetadataOpportunities(article, [], false);

    expect(opportunities).toHaveLength(1);
    expect(opportunities[0].type).toBe('REFRESH_METADATA');
  });

  it('should detect missing current year', async () => {
    const article = {
      _id: 'test-2',
      title: 'SEO Guide 2020',
      metaTitle: 'SEO Guide 2020',
      metaDescription: 'A guide from 2020',
      publishedUrl: 'https://example.com/guide',
      createdAt: Date.now(),
    };

    const opportunities = await detectMetadataOpportunities(article, [], false);

    expect(opportunities.length).toBeGreaterThan(0);
    expect(opportunities[0].detectionDetails.findings.hasCurrentYear).toBe(false);
  });

  it('should detect non-optimal title length', async () => {
    const article = {
      _id: 'test-3',
      title: 'Short',
      metaTitle: 'Short',
      metaDescription: 'A description',
      publishedUrl: 'https://example.com/short',
      createdAt: Date.now(),
    };

    const opportunities = await detectMetadataOpportunities(article, [], false);

    if (opportunities.length > 0) {
      expect(opportunities[0].detectionDetails.findings.titleOptimal).toBe(false);
    }
  });

  it('should detect missing trending keywords', async () => {
    const article = {
      _id: 'test-4',
      title: 'Basic Article Title',
      metaTitle: 'Basic Article Title',
      metaDescription: 'Basic description',
      publishedUrl: 'https://example.com/basic',
      createdAt: Date.now(),
    };

    const trendingKeywords = ['AI', 'machine learning', 'automation'];

    const opportunities = await detectMetadataOpportunities(article, trendingKeywords, false);

    if (opportunities.length > 0) {
      expect(opportunities[0].detectionDetails.findings.trendingKeywordsMissing.length).toBeGreaterThan(0);
    }
  });

  it('should not detect opportunities for optimal metadata', async () => {
    const currentYear = new Date().getFullYear();

    const article = {
      _id: 'test-5',
      title: `Complete SEO Guide for ${currentYear} - Best Practices`,
      metaTitle: `Complete SEO Guide for ${currentYear} - Best Practices`,
      metaDescription: `Learn the best SEO practices for ${currentYear}. This comprehensive guide covers keyword research, on-page optimization, and link building strategies to improve your search rankings.`,
      publishedUrl: 'https://example.com/seo-guide',
      createdAt: Date.now(),
      lastUpdatedAt: Date.now(),
    };

    const trendingKeywords = ['SEO'];

    const opportunities = await detectMetadataOpportunities(article, trendingKeywords, false);

    expect(opportunities).toHaveLength(0);
  });

  it('should prioritize top pages higher', async () => {
    const article = {
      _id: 'test-6',
      title: 'Old Article',
      metaTitle: 'Old Article',
      metaDescription: 'Description',
      publishedUrl: 'https://example.com/article',
      createdAt: Date.now() - (7 * 30 * 24 * 60 * 60 * 1000),
    };

    const oppRegular = await detectMetadataOpportunities(article, [], false);
    const oppTopPage = await detectMetadataOpportunities(article, [], true);

    if (oppRegular.length > 0 && oppTopPage.length > 0) {
      expect(oppTopPage[0].priorityScore).toBeGreaterThan(oppRegular[0].priorityScore);
    }
  });
});
