/**
 * Readability Scoring Service
 *
 * Analyzes content readability using multiple metrics including Flesch Reading Ease.
 * Target: 70+ Flesch Reading Ease score for all published content.
 *
 * @module lib/quality-check/readability
 */

/**
 * Readability analysis result
 */
export interface ReadabilityResult {
  passed: boolean;
  fleschScore: number; // 0-100, higher = easier to read
  fleschKincaidGrade: number; // US grade level
  threshold: number; // The threshold used (default 70)
  readingLevel: string; // e.g., "Easy", "Fairly Easy", "Standard", etc.
  metrics: ReadabilityMetrics;
  suggestions: string[];
  checkedAt: number;
}

/**
 * Detailed readability metrics
 */
export interface ReadabilityMetrics {
  totalWords: number;
  totalSentences: number;
  totalSyllables: number;
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  longSentences: number; // sentences > 20 words
  complexWords: number; // words > 3 syllables
  paragraphs: number;
  averageSentencesPerParagraph: number;
}

/**
 * Configuration for readability checking
 */
export interface ReadabilityCheckConfig {
  threshold?: number; // Flesch Reading Ease threshold (default 70)
  targetGradeLevel?: number; // Target Flesch-Kincaid grade level
  strictMode?: boolean; // Fail if any metric is suboptimal
}

/**
 * Analyze content readability
 *
 * @param content - Text content to analyze
 * @param config - Configuration options
 * @returns Readability analysis result
 */
export function analyzeReadability(
  content: string,
  config: ReadabilityCheckConfig = {}
): ReadabilityResult {
  const { threshold = 70, targetGradeLevel = 8, strictMode = false } = config;

  // Validate input
  if (!content || content.trim().length === 0) {
    throw new Error('Content is required for readability analysis');
  }

  // Calculate metrics
  const metrics = calculateMetrics(content);

  // Calculate Flesch Reading Ease score
  // Formula: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const fleschScore =
    206.835 -
    1.015 * metrics.averageWordsPerSentence -
    84.6 * metrics.averageSyllablesPerWord;

  // Ensure score is within 0-100 range
  const normalizedFleschScore = Math.max(0, Math.min(100, fleschScore));

  // Calculate Flesch-Kincaid Grade Level
  // Formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
  const fleschKincaidGrade =
    0.39 * metrics.averageWordsPerSentence +
    11.8 * metrics.averageSyllablesPerWord -
    15.59;

  // Determine reading level
  const readingLevel = getReadingLevel(normalizedFleschScore);

  // Generate suggestions
  const suggestions = generateSuggestions(metrics, normalizedFleschScore, targetGradeLevel);

  // Determine if passed
  let passed = normalizedFleschScore >= threshold;

  if (strictMode) {
    // In strict mode, also check other criteria
    passed =
      passed &&
      metrics.averageWordsPerSentence <= 20 &&
      fleschKincaidGrade <= targetGradeLevel &&
      (metrics.complexWords / metrics.totalWords) * 100 <= 15; // Max 15% complex words
  }

  return {
    passed,
    fleschScore: Math.round(normalizedFleschScore * 100) / 100,
    fleschKincaidGrade: Math.round(fleschKincaidGrade * 100) / 100,
    threshold,
    readingLevel,
    metrics,
    suggestions,
    checkedAt: Date.now(),
  };
}

/**
 * Calculate all readability metrics from content
 */
function calculateMetrics(content: string): ReadabilityMetrics {
  // Remove markdown and HTML tags for accurate counting
  const cleanContent = content
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[#*_`~]/g, '') // Remove markdown formatting
    .trim();

  // Count paragraphs
  const paragraphs = cleanContent
    .split(/\n\s*\n/)
    .filter(p => p.trim().length > 0).length;

  // Count sentences (split on . ! ?)
  const sentences = cleanContent
    .split(/[.!?]+/)
    .filter(s => s.trim().length > 0);

  const totalSentences = sentences.length;

  // Count words
  const words = cleanContent.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;

  // Count syllables
  let totalSyllables = 0;
  let complexWords = 0;

  for (const word of words) {
    const syllableCount = countSyllables(word);
    totalSyllables += syllableCount;
    if (syllableCount > 3) {
      complexWords++;
    }
  }

  // Count long sentences (> 20 words)
  const longSentences = sentences.filter(s => s.split(/\s+/).length > 20).length;

  // Calculate averages
  const averageWordsPerSentence = totalWords / totalSentences || 0;
  const averageSyllablesPerWord = totalSyllables / totalWords || 0;
  const averageSentencesPerParagraph = totalSentences / paragraphs || 0;

  return {
    totalWords,
    totalSentences,
    totalSyllables,
    averageWordsPerSentence: Math.round(averageWordsPerSentence * 100) / 100,
    averageSyllablesPerWord: Math.round(averageSyllablesPerWord * 100) / 100,
    longSentences,
    complexWords,
    paragraphs,
    averageSentencesPerParagraph: Math.round(averageSentencesPerParagraph * 100) / 100,
  };
}

/**
 * Count syllables in a word
 * Uses simplified algorithm - not 100% accurate but good enough
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().trim();

  // Remove non-letter characters
  word = word.replace(/[^a-z]/g, '');

  if (word.length <= 3) return 1;

  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  let syllables = vowelGroups ? vowelGroups.length : 1;

  // Adjust for silent 'e' at end
  if (word.endsWith('e') && syllables > 1) {
    syllables--;
  }

  // Adjust for 'le' ending
  if (word.endsWith('le') && word.length > 2 && !/[aeiouy]/.test(word[word.length - 3])) {
    syllables++;
  }

  return Math.max(syllables, 1);
}

/**
 * Map Flesch score to reading level description
 */
function getReadingLevel(score: number): string {
  if (score >= 90) return 'Very Easy (5th grade)';
  if (score >= 80) return 'Easy (6th grade)';
  if (score >= 70) return 'Fairly Easy (7th grade)';
  if (score >= 60) return 'Standard (8th-9th grade)';
  if (score >= 50) return 'Fairly Difficult (10th-12th grade)';
  if (score >= 30) return 'Difficult (College level)';
  return 'Very Difficult (College graduate)';
}

/**
 * Generate improvement suggestions based on metrics
 */
function generateSuggestions(
  metrics: ReadabilityMetrics,
  fleschScore: number,
  targetGrade: number
): string[] {
  const suggestions: string[] = [];

  // Check Flesch score
  if (fleschScore < 70) {
    suggestions.push(
      `Improve readability score from ${fleschScore.toFixed(1)} to 70+. Simplify language and shorten sentences.`
    );
  }

  // Check sentence length
  if (metrics.averageWordsPerSentence > 20) {
    suggestions.push(
      `Reduce average sentence length from ${metrics.averageWordsPerSentence.toFixed(1)} to under 20 words. Break up long sentences.`
    );
  }

  // Check long sentences
  if (metrics.longSentences > metrics.totalSentences * 0.2) {
    suggestions.push(
      `Too many long sentences (${metrics.longSentences} out of ${metrics.totalSentences}). Aim for less than 20% long sentences.`
    );
  }

  // Check complex words
  const complexWordPercentage = (metrics.complexWords / metrics.totalWords) * 100;
  if (complexWordPercentage > 15) {
    suggestions.push(
      `Reduce complex words from ${complexWordPercentage.toFixed(1)}% to under 15%. Use simpler alternatives.`
    );
  }

  // Check syllables per word
  if (metrics.averageSyllablesPerWord > 1.6) {
    suggestions.push(
      `Use shorter words. Current average: ${metrics.averageSyllablesPerWord.toFixed(2)} syllables/word.`
    );
  }

  // Check paragraph structure
  if (metrics.averageSentencesPerParagraph > 6) {
    suggestions.push(
      `Break up long paragraphs. Current average: ${metrics.averageSentencesPerParagraph.toFixed(1)} sentences/paragraph.`
    );
  }

  // If no suggestions, add positive feedback
  if (suggestions.length === 0) {
    suggestions.push('✅ Excellent readability! Content is clear and accessible.');
  }

  return suggestions;
}

/**
 * Get detailed explanation of readability result for user
 */
export function getReadabilityExplanation(result: ReadabilityResult): string {
  if (result.passed) {
    return `✅ Readability check passed! Flesch score: ${result.fleschScore} (${result.readingLevel}). Target: ${result.threshold}+`;
  }

  return `❌ Readability check failed. Flesch score: ${result.fleschScore} (${result.readingLevel}). Target: ${result.threshold}+. ${result.suggestions[0] || 'Improve content clarity.'}`;
}

/**
 * Format readability report for display
 */
export function formatReadabilityReport(result: ReadabilityResult): string {
  const { metrics, fleschScore, fleschKincaidGrade, readingLevel, suggestions } = result;

  return `
**Readability Analysis**

**Overall Score**: ${fleschScore.toFixed(1)} / 100 (${readingLevel})
**Grade Level**: ${fleschKincaidGrade.toFixed(1)}
**Status**: ${result.passed ? '✅ Passed' : '❌ Needs Improvement'}

**Metrics**:
- Words: ${metrics.totalWords}
- Sentences: ${metrics.totalSentences}
- Paragraphs: ${metrics.paragraphs}
- Avg words/sentence: ${metrics.averageWordsPerSentence}
- Avg syllables/word: ${metrics.averageSyllablesPerWord}
- Long sentences: ${metrics.longSentences}
- Complex words: ${metrics.complexWords}

**Suggestions**:
${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}
  `.trim();
}
