/**
 * Visibility Scoring System for AI Tracking (Week 3)
 *
 * Calculates visibility scores per platform and aggregate scores.
 * Tracks score changes over time with trend analysis.
 *
 * References:
 * - FR-034: Calculate visibility score: (Prompts with mentions / Total prompts) × 100
 * - FR-035: Separate scores per platform
 * - FR-036: Overall aggregate score
 * - FR-037: Display scores with context
 * - FR-038: Track score changes (+5%, -12%, etc.)
 */

import { ExtractionResult } from './citation-extractor';

export type Platform = 'chatgpt' | 'claude' | 'perplexity' | 'gemini';

export interface PlatformScore {
  platform: Platform;
  score: number; // Percentage (0-100)
  totalPrompts: number;
  promptsWithMentions: number;
  totalMentions: number;
  averagePosition: number; // Average position when mentioned (1st, 2nd, etc.)
  contextBreakdown: Record<string, number>; // e.g., {"recommendation": 5, "comparison": 3}
}

export interface AggregateScore {
  overallScore: number; // Average across all platforms
  totalPrompts: number; // Sum across all platforms
  promptsWithMentions: number; // Sum across all platforms
  totalMentions: number; // Sum across all platforms
  bestPlatform: Platform | null; // Platform with highest score
  worstPlatform: Platform | null; // Platform with lowest score
  platformScores: PlatformScore[];
}

export interface ScoreChange {
  currentScore: number;
  previousScore: number;
  absoluteChange: number; // e.g., +5.0, -12.5
  percentageChange: number; // e.g., +50% (if went from 10% to 15%)
  trend: 'up' | 'down' | 'stable';
  description: string; // Human-readable: "+5% from yesterday"
}

export interface HistoricalScore {
  date: Date;
  score: number;
  platform?: Platform; // Optional: for platform-specific history
}

export interface TrendAnalysis {
  period: '7d' | '30d' | '90d';
  startDate: Date;
  endDate: Date;
  startScore: number;
  endScore: number;
  change: ScoreChange;
  highestScore: number;
  lowestScore: number;
  volatility: number; // Standard deviation
  dataPoints: HistoricalScore[];
}

/**
 * Calculate visibility score for a single platform
 *
 * @param extractionResults - Results from citation extraction for each prompt
 * @param platform - AI platform name
 * @returns Platform-specific visibility score
 */
export function calculatePlatformScore(
  extractionResults: ExtractionResult[],
  platform: Platform
): PlatformScore {
  const totalPrompts = extractionResults.length;
  const promptsWithMentions = extractionResults.filter(r => r.hasMentions).length;
  const totalMentions = extractionResults.reduce((sum, r) => sum + r.totalMentions, 0);

  // Calculate visibility score: (prompts with mentions / total prompts) × 100
  const score = totalPrompts > 0 ? (promptsWithMentions / totalPrompts) * 100 : 0;

  // Calculate average position across all mentions
  const allPositions = extractionResults
    .filter(r => r.hasMentions)
    .flatMap(r => r.citations.map(c => c.position));

  const averagePosition =
    allPositions.length > 0
      ? allPositions.reduce((sum, pos) => sum + pos, 0) / allPositions.length
      : 0;

  // Context breakdown
  const contextBreakdown: Record<string, number> = {};

  extractionResults.forEach(result => {
    Object.entries(result.mentionsByContext).forEach(([context, count]) => {
      contextBreakdown[context] = (contextBreakdown[context] || 0) + count;
    });
  });

  return {
    platform,
    score: Math.round(score * 10) / 10, // Round to 1 decimal
    totalPrompts,
    promptsWithMentions,
    totalMentions,
    averagePosition: Math.round(averagePosition * 10) / 10,
    contextBreakdown
  };
}

/**
 * Calculate aggregate score across all platforms
 *
 * @param platformScores - Scores for each platform
 * @returns Aggregate score with summary statistics
 */
export function calculateAggregateScore(
  platformScores: PlatformScore[]
): AggregateScore {
  if (platformScores.length === 0) {
    return {
      overallScore: 0,
      totalPrompts: 0,
      promptsWithMentions: 0,
      totalMentions: 0,
      bestPlatform: null,
      worstPlatform: null,
      platformScores: []
    };
  }

  // Calculate overall score as average of platform scores
  const overallScore =
    platformScores.reduce((sum, ps) => sum + ps.score, 0) / platformScores.length;

  // Sum totals across platforms
  const totalPrompts = platformScores.reduce((sum, ps) => sum + ps.totalPrompts, 0);
  const promptsWithMentions = platformScores.reduce((sum, ps) => sum + ps.promptsWithMentions, 0);
  const totalMentions = platformScores.reduce((sum, ps) => sum + ps.totalMentions, 0);

  // Find best and worst platforms
  const sortedByScore = [...platformScores].sort((a, b) => b.score - a.score);
  const bestPlatform = sortedByScore[0]?.platform || null;
  const worstPlatform = sortedByScore[sortedByScore.length - 1]?.platform || null;

  return {
    overallScore: Math.round(overallScore * 10) / 10,
    totalPrompts,
    promptsWithMentions,
    totalMentions,
    bestPlatform,
    worstPlatform,
    platformScores
  };
}

/**
 * Calculate score change between two periods
 *
 * @param currentScore - Current score value
 * @param previousScore - Previous score value
 * @param period - Description of period (e.g., "yesterday", "last week")
 * @returns Score change with trend and description
 */
export function calculateScoreChange(
  currentScore: number,
  previousScore: number,
  period: string = 'previous period'
): ScoreChange {
  const absoluteChange = currentScore - previousScore;

  // Calculate percentage change relative to previous score
  // e.g., 10% -> 15% is +50% change
  const percentageChange =
    previousScore > 0 ? ((absoluteChange / previousScore) * 100) : 0;

  // Determine trend (stable if change < 0.5%)
  let trend: 'up' | 'down' | 'stable';
  if (Math.abs(absoluteChange) < 0.5) {
    trend = 'stable';
  } else if (absoluteChange > 0) {
    trend = 'up';
  } else {
    trend = 'down';
  }

  // Generate human-readable description
  const sign = absoluteChange > 0 ? '+' : '';
  const description =
    trend === 'stable'
      ? `No significant change from ${period}`
      : `${sign}${absoluteChange.toFixed(1)}% from ${period}`;

  return {
    currentScore,
    previousScore,
    absoluteChange: Math.round(absoluteChange * 10) / 10,
    percentageChange: Math.round(percentageChange * 10) / 10,
    trend,
    description
  };
}

/**
 * Analyze trends over a historical period
 *
 * @param historicalScores - Array of historical scores with dates
 * @param period - Period to analyze ('7d', '30d', '90d')
 * @returns Trend analysis with statistics
 */
export function analyzeTrend(
  historicalScores: HistoricalScore[],
  period: '7d' | '30d' | '90d'
): TrendAnalysis | null {
  if (historicalScores.length < 2) {
    return null; // Need at least 2 data points
  }

  // Sort by date
  const sorted = [...historicalScores].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  const endDate = sorted[sorted.length - 1].date;
  const endScore = sorted[sorted.length - 1].score;

  // Determine start date based on period
  const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - daysBack);

  // Filter data points within period
  const dataPoints = sorted.filter(s => s.date >= startDate);

  if (dataPoints.length === 0) {
    return null;
  }

  const startScore = dataPoints[0].score;

  // Calculate change
  const change = calculateScoreChange(endScore, startScore, `${daysBack} days ago`);

  // Calculate highest and lowest scores in period
  const scores = dataPoints.map(d => d.score);
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);

  // Calculate volatility (standard deviation)
  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const variance =
    scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const volatility = Math.sqrt(variance);

  return {
    period,
    startDate,
    endDate,
    startScore,
    endScore,
    change,
    highestScore: Math.round(highestScore * 10) / 10,
    lowestScore: Math.round(lowestScore * 10) / 10,
    volatility: Math.round(volatility * 10) / 10,
    dataPoints
  };
}

/**
 * Generate score context description
 *
 * @param score - Platform or aggregate score
 * @returns Human-readable context string
 */
export function generateScoreContext(score: PlatformScore | AggregateScore): string {
  const isAggregate = 'platformScores' in score;

  if (isAggregate) {
    const aggScore = score as AggregateScore;
    return `${aggScore.overallScore}% visibility - Your brand appeared in ${aggScore.promptsWithMentions} out of ${aggScore.totalPrompts} prompts tested across all platforms`;
  } else {
    const platScore = score as PlatformScore;
    return `${platScore.score}% visibility on ${platScore.platform} - Your brand appeared in ${platScore.promptsWithMentions} out of ${platScore.totalPrompts} prompts tested`;
  }
}

/**
 * Compare visibility across multiple brands (for competitor analysis)
 *
 * @param brandScores - Map of brand name to aggregate score
 * @returns Comparison summary
 */
export function compareBrandVisibility(
  brandScores: Record<string, AggregateScore>
): {
  brandRankings: Array<{ brand: string; score: number; rank: number }>;
  topBrand: string;
  userPosition?: number; // If user brand is specified
} {
  const rankings = Object.entries(brandScores)
    .map(([brand, score]) => ({ brand, score: score.overallScore }))
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return {
    brandRankings: rankings,
    topBrand: rankings[0]?.brand || ''
  };
}

/**
 * Identify gap opportunities (prompts where competitors appear but user doesn't)
 *
 * @param userResults - User's extraction results
 * @param competitorResults - Competitor's extraction results
 * @returns Gap analysis
 */
export function identifyGapOpportunities(
  userResults: ExtractionResult[],
  competitorResults: ExtractionResult[]
): {
  gapCount: number;
  gapPromptIndices: number[]; // Indices of prompts where competitor mentioned but user not
  opportunityScore: number; // Percentage of prompts that are gaps
} {
  const gapPromptIndices: number[] = [];

  userResults.forEach((userResult, index) => {
    const competitorResult = competitorResults[index];

    if (competitorResult && competitorResult.hasMentions && !userResult.hasMentions) {
      gapPromptIndices.push(index);
    }
  });

  const gapCount = gapPromptIndices.length;
  const opportunityScore =
    userResults.length > 0 ? (gapCount / userResults.length) * 100 : 0;

  return {
    gapCount,
    gapPromptIndices,
    opportunityScore: Math.round(opportunityScore * 10) / 10
  };
}

/**
 * Calculate weighted visibility score
 * (Higher weight for top positions, recommendations, etc.)
 *
 * @param extractionResults - Results from citation extraction
 * @param platform - AI platform name
 * @returns Weighted visibility score
 */
export function calculateWeightedScore(
  extractionResults: ExtractionResult[],
  platform: Platform
): PlatformScore & { weightedScore: number } {
  const baseScore = calculatePlatformScore(extractionResults, platform);

  // Calculate weighted score based on:
  // - Position (1st position = 1.0x, 2nd = 0.8x, 3rd = 0.6x, 4th+ = 0.4x)
  // - Context (recommendation = 1.2x, comparison = 1.0x, alternative = 0.8x, other = 0.6x)

  let totalWeight = 0;
  let weightedSum = 0;

  extractionResults.forEach(result => {
    result.citations.forEach(citation => {
      // Position weight
      let positionWeight = 1.0;
      if (citation.position === 1) positionWeight = 1.0;
      else if (citation.position === 2) positionWeight = 0.8;
      else if (citation.position === 3) positionWeight = 0.6;
      else positionWeight = 0.4;

      // Context weight
      let contextWeight = 1.0;
      if (citation.mentionContext === 'recommendation') contextWeight = 1.2;
      else if (citation.mentionContext === 'comparison') contextWeight = 1.0;
      else if (citation.mentionContext === 'alternative') contextWeight = 0.8;
      else contextWeight = 0.6;

      const weight = positionWeight * contextWeight;
      weightedSum += weight;
      totalWeight += 1; // Each citation counts as 1 in denominator
    });
  });

  // Weighted score: apply the weight multiplier to base score
  const weightMultiplier =
    totalWeight > 0 ? weightedSum / totalWeight : 1.0;
  const weightedScore = baseScore.score * weightMultiplier;

  return {
    ...baseScore,
    weightedScore: Math.round(weightedScore * 10) / 10
  };
}
