/**
 * Plagiarism Detection Service
 *
 * Integrates with plagiarism detection APIs to ensure content originality.
 * Target: < 2% plagiarism threshold for all published content.
 *
 * @module lib/quality-check/plagiarism
 */

/**
 * Plagiarism check result
 */
export interface PlagiarismResult {
  passed: boolean;
  score: number; // 0-100, where 0 = no plagiarism, 100 = completely plagiarized
  threshold: number; // The threshold used (default 2%)
  matchedSources: PlagiarismMatch[];
  checkedAt: number; // timestamp
  provider: string; // which API was used
}

/**
 * Individual plagiarism match
 */
export interface PlagiarismMatch {
  url: string;
  title?: string;
  matchPercentage: number;
  matchedText: string[];
  severity: 'low' | 'medium' | 'high';
}

/**
 * Configuration for plagiarism checking
 */
export interface PlagiarismCheckConfig {
  threshold?: number; // percentage (default 2)
  provider?: 'copyscape' | 'plagiarism-check' | 'mock'; // API provider
  excludeDomains?: string[]; // domains to exclude from checking
  minMatchLength?: number; // minimum words for a match
}

/**
 * Check content for plagiarism using external API
 *
 * @param content - Text content to check
 * @param config - Configuration options
 * @returns Plagiarism check result
 */
export async function checkPlagiarism(
  content: string,
  config: PlagiarismCheckConfig = {}
): Promise<PlagiarismResult> {
  const {
    threshold = 2,
    provider = process.env.PLAGIARISM_PROVIDER as 'copyscape' | 'plagiarism-check' | 'mock' || 'mock',
    excludeDomains = [],
    minMatchLength = 20,
  } = config;

  // Validate input
  if (!content || content.trim().length === 0) {
    throw new Error('Content is required for plagiarism checking');
  }

  if (content.split(/\s+/).length < 50) {
    // Too short to meaningfully check
    return {
      passed: true,
      score: 0,
      threshold,
      matchedSources: [],
      checkedAt: Date.now(),
      provider,
    };
  }

  try {
    let result: PlagiarismResult;

    switch (provider) {
      case 'copyscape':
        result = await checkWithCopyscape(content, excludeDomains, minMatchLength);
        break;
      case 'plagiarism-check':
        result = await checkWithPlagiarismCheck(content, excludeDomains, minMatchLength);
        break;
      case 'mock':
      default:
        result = await mockPlagiarismCheck(content, excludeDomains, minMatchLength);
        break;
    }

    // Apply threshold
    result.threshold = threshold;
    result.passed = result.score <= threshold;

    return result;
  } catch (error) {
    console.error('Plagiarism check failed:', error);
    throw new Error(`Plagiarism check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check plagiarism using Copyscape API
 */
async function checkWithCopyscape(
  content: string,
  excludeDomains: string[],
  minMatchLength: number
): Promise<PlagiarismResult> {
  const apiKey = process.env.COPYSCAPE_API_KEY;
  const username = process.env.COPYSCAPE_USERNAME;

  if (!apiKey || !username) {
    throw new Error('Copyscape API credentials not configured');
  }

  // Copyscape API integration
  const response = await fetch('https://www.copyscape.com/api/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      u: username,
      k: apiKey,
      o: 'csearch',
      t: content,
      e: 'UTF-8',
    }),
  });

  if (!response.ok) {
    throw new Error(`Copyscape API error: ${response.statusText}`);
  }

  const data = await response.text();
  // Parse Copyscape XML response
  const matches = parseCopyscapeResponse(data, excludeDomains, minMatchLength);
  const totalWords = content.split(/\s+/).length;
  const matchedWords = matches.reduce((sum, match) => sum + match.matchedText.join(' ').split(/\s+/).length, 0);
  const score = (matchedWords / totalWords) * 100;

  return {
    passed: false, // Will be set by caller based on threshold
    score: Math.round(score * 100) / 100,
    threshold: 2,
    matchedSources: matches,
    checkedAt: Date.now(),
    provider: 'copyscape',
  };
}

/**
 * Check plagiarism using Plagiarism-Check API
 */
async function checkWithPlagiarismCheck(
  content: string,
  excludeDomains: string[],
  minMatchLength: number
): Promise<PlagiarismResult> {
  const apiKey = process.env.PLAGIARISM_CHECK_API_KEY;

  if (!apiKey) {
    throw new Error('Plagiarism-Check API key not configured');
  }

  // Plagiarism-Check API integration
  const response = await fetch('https://plagiarismcheck.org/api/v1/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({
      text: content,
      language: 'en',
      excludeDomains,
    }),
  });

  if (!response.ok) {
    throw new Error(`Plagiarism-Check API error: ${response.statusText}`);
  }

  const data = await response.json();
  const matches = parsePlagiarismCheckResponse(data, minMatchLength);
  const score = data.percentPlagiarized || 0;

  return {
    passed: false,
    score: Math.round(score * 100) / 100,
    threshold: 2,
    matchedSources: matches,
    checkedAt: Date.now(),
    provider: 'plagiarism-check',
  };
}

/**
 * Mock plagiarism checker for development/testing
 */
async function mockPlagiarismCheck(
  content: string,
  excludeDomains: string[],
  minMatchLength: number
): Promise<PlagiarismResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Generate realistic mock score (0-5% typically)
  const score = Math.random() * 5;

  const matchedSources: PlagiarismMatch[] = [];

  // Occasionally add a mock match
  if (score > 1) {
    matchedSources.push({
      url: 'https://example.com/similar-article',
      title: 'Similar Article Found',
      matchPercentage: Math.round(score * 10) / 10,
      matchedText: ['Example matched phrase from the content'],
      severity: score > 3 ? 'medium' : 'low',
    });
  }

  return {
    passed: false,
    score: Math.round(score * 100) / 100,
    threshold: 2,
    matchedSources,
    checkedAt: Date.now(),
    provider: 'mock',
  };
}

/**
 * Parse Copyscape XML response
 */
function parseCopyscapeResponse(
  xml: string,
  excludeDomains: string[],
  minMatchLength: number
): PlagiarismMatch[] {
  // Simplified XML parsing - in production, use proper XML parser
  const matches: PlagiarismMatch[] = [];

  // This is a placeholder - implement proper XML parsing in production
  // For now, return empty array
  return matches;
}

/**
 * Parse Plagiarism-Check JSON response
 */
function parsePlagiarismCheckResponse(
  data: any,
  minMatchLength: number
): PlagiarismMatch[] {
  const matches: PlagiarismMatch[] = [];

  if (data.sources && Array.isArray(data.sources)) {
    for (const source of data.sources) {
      const matchedText = source.matches || [];

      // Filter by minimum length
      const validMatches = matchedText.filter(
        (text: string) => text.split(/\s+/).length >= minMatchLength
      );

      if (validMatches.length > 0) {
        matches.push({
          url: source.url,
          title: source.title,
          matchPercentage: source.percent || 0,
          matchedText: validMatches,
          severity: source.percent > 10 ? 'high' : source.percent > 5 ? 'medium' : 'low',
        });
      }
    }
  }

  return matches;
}

/**
 * Get detailed explanation of plagiarism result for user
 */
export function getPlagiarismExplanation(result: PlagiarismResult): string {
  if (result.passed) {
    return `✅ Plagiarism check passed! Content is ${100 - result.score}% original (${result.score}% similarity detected, threshold: ${result.threshold}%).`;
  }

  const matchCount = result.matchedSources.length;
  const highSeverityCount = result.matchedSources.filter(m => m.severity === 'high').length;

  return `❌ Plagiarism check failed. ${result.score}% similarity detected (threshold: ${result.threshold}%). Found ${matchCount} matching source${matchCount !== 1 ? 's' : ''}${highSeverityCount > 0 ? `, including ${highSeverityCount} high-severity match${highSeverityCount !== 1 ? 'es' : ''}` : ''}. Please revise the content to improve originality.`;
}
