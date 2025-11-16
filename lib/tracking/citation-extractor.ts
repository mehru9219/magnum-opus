/**
 * Citation Extractor for AI Visibility Tracking (Week 3)
 *
 * Detects and extracts brand mentions, URLs, and context from AI platform responses.
 * Supports position tracking, context categorization, and false positive detection.
 *
 * References:
 * - FR-027: Detect direct brand mentions (exact match + variations)
 * - FR-028: Detect URL mentions (brand website + specific pages)
 * - FR-029: Extract exact quote/context (±50 words around mention)
 * - FR-030: Identify position of mention (1st, 2nd, 3rd, etc.)
 * - FR-031: Categorize mention context
 * - FR-033: Flag potential false positives
 */

export type MentionType = 'direct' | 'url' | 'both';

export type MentionContext =
  | 'recommendation'
  | 'comparison'
  | 'case_study'
  | 'data_source'
  | 'alternative'
  | 'unknown';

export interface BrandConfig {
  brandName: string;
  brandVariations: string[]; // e.g., ["ProjectHub", "Project Hub", "projecthub.com"]
  websiteUrl: string; // e.g., "projecthub.com"
  contextClues?: string[]; // Optional clues to filter false positives, e.g., ["project management", "SaaS"]
}

export interface Citation {
  mentionType: MentionType;
  brandName: string;
  mentionedText: string; // Exact text found (e.g., "ProjectHub" or "projecthub.com/features")
  position: number; // 1st, 2nd, 3rd mention in response
  quoteExcerpt: string; // ±50 words around mention
  fullContext: string; // Full sentence or paragraph containing mention
  mentionContext: MentionContext; // Categorized context
  isFalsePosibleFalsePositive: boolean; // Flag for manual review
  characterOffset: number; // Character position in original response
}

export interface ExtractionResult {
  citations: Citation[];
  totalMentions: number;
  directMentions: number;
  urlMentions: number;
  averagePosition: number;
  mentionsByContext: Record<MentionContext, number>;
  hasMentions: boolean;
}

/**
 * Extract context window around a mention (±50 words)
 */
function extractContextWindow(
  text: string,
  startIndex: number,
  endIndex: number,
  wordWindow: number = 50
): string {
  // Split text into words
  const words = text.split(/\s+/);
  let currentPos = 0;
  let startWordIndex = 0;
  let endWordIndex = words.length - 1;

  // Find word indices for start and end positions
  for (let i = 0; i < words.length; i++) {
    const wordStart = currentPos;
    const wordEnd = currentPos + words[i].length;

    if (wordStart <= startIndex && wordEnd >= startIndex) {
      startWordIndex = Math.max(0, i - wordWindow);
    }

    if (wordStart <= endIndex && wordEnd >= endIndex) {
      endWordIndex = Math.min(words.length - 1, i + wordWindow);
      break;
    }

    currentPos = wordEnd + 1; // +1 for space
  }

  // Extract window
  const contextWords = words.slice(startWordIndex, endWordIndex + 1);
  let excerpt = contextWords.join(' ');

  // Add ellipsis if truncated
  if (startWordIndex > 0) excerpt = '...' + excerpt;
  if (endWordIndex < words.length - 1) excerpt = excerpt + '...';

  return excerpt;
}

/**
 * Extract full context (sentence or paragraph) around mention
 */
function extractFullContext(text: string, startIndex: number, endIndex: number): string {
  // Find sentence boundaries
  const sentenceRegex = /[.!?]+\s+/g;
  const sentences: { start: number; end: number; text: string }[] = [];

  let lastEnd = 0;
  let match;

  while ((match = sentenceRegex.exec(text)) !== null) {
    sentences.push({
      start: lastEnd,
      end: match.index + match[0].length,
      text: text.substring(lastEnd, match.index + match[0].length).trim()
    });
    lastEnd = match.index + match[0].length;
  }

  // Add final sentence
  if (lastEnd < text.length) {
    sentences.push({
      start: lastEnd,
      end: text.length,
      text: text.substring(lastEnd).trim()
    });
  }

  // Find sentence containing mention
  for (const sentence of sentences) {
    if (sentence.start <= startIndex && sentence.end >= endIndex) {
      return sentence.text;
    }
  }

  // Fallback: return paragraph (use double newline as delimiter)
  const paragraphs = text.split(/\n\n+/);
  let currentPos = 0;

  for (const para of paragraphs) {
    const paraEnd = currentPos + para.length;
    if (currentPos <= startIndex && paraEnd >= endIndex) {
      return para.trim();
    }
    currentPos = paraEnd + 2; // +2 for \n\n
  }

  // Final fallback: return excerpt
  return extractContextWindow(text, startIndex, endIndex, 25);
}

/**
 * Categorize mention context based on surrounding text
 */
function categorizeMentionContext(context: string, mentionedText: string): MentionContext {
  const lowerContext = context.toLowerCase();

  // Recommendation indicators
  const recommendationKeywords = [
    'recommend',
    'best',
    'top',
    'should use',
    'great for',
    'excellent',
    'ideal',
    'perfect for',
    'try',
    'check out'
  ];

  // Comparison indicators
  const comparisonKeywords = [
    'vs',
    'versus',
    'compared to',
    'alternative',
    'instead of',
    'similar to',
    'different from',
    'or',
    'between'
  ];

  // Case study indicators
  const caseStudyKeywords = [
    'case study',
    'example',
    'success story',
    'used by',
    'implemented',
    'deployed',
    'customer',
    'client'
  ];

  // Data source indicators
  const dataSourceKeywords = [
    'according to',
    'data from',
    'study by',
    'research shows',
    'statistics from',
    'reported by',
    'found that'
  ];

  // Alternative indicators
  const alternativeKeywords = [
    'alternative',
    'option',
    'choice',
    'another',
    'also consider',
    'alternatively',
    'instead'
  ];

  // Check each category
  if (recommendationKeywords.some(kw => lowerContext.includes(kw))) {
    return 'recommendation';
  }

  if (comparisonKeywords.some(kw => lowerContext.includes(kw))) {
    return 'comparison';
  }

  if (caseStudyKeywords.some(kw => lowerContext.includes(kw))) {
    return 'case_study';
  }

  if (dataSourceKeywords.some(kw => lowerContext.includes(kw))) {
    return 'data_source';
  }

  if (alternativeKeywords.some(kw => lowerContext.includes(kw))) {
    return 'alternative';
  }

  return 'unknown';
}

/**
 * Detect potential false positives using context clues
 */
function isPossibleFalsePositive(
  mentionedText: string,
  context: string,
  brandConfig: BrandConfig
): boolean {
  // If no context clues provided, can't determine false positives
  if (!brandConfig.contextClues || brandConfig.contextClues.length === 0) {
    return false;
  }

  const lowerContext = context.toLowerCase();

  // Check if any context clue appears near the mention
  const hasContextClue = brandConfig.contextClues.some(clue =>
    lowerContext.includes(clue.toLowerCase())
  );

  // If no context clue found, might be false positive
  if (!hasContextClue) {
    // Additional check: very short brand names (<4 chars) are more likely false positives
    if (mentionedText.length < 4) {
      return true;
    }

    // Common word check (basic implementation)
    const commonWords = ['app', 'web', 'tool', 'site', 'page', 'link', 'com', 'net', 'org'];
    if (commonWords.includes(mentionedText.toLowerCase())) {
      return true;
    }
  }

  return false;
}

/**
 * Find all direct brand mentions in text
 */
function findDirectMentions(
  text: string,
  brandConfig: BrandConfig
): Array<{ text: string; start: number; end: number }> {
  const mentions: Array<{ text: string; start: number; end: number }> = [];

  // Create regex for each variation (case-insensitive, word boundaries)
  const variations = [brandConfig.brandName, ...brandConfig.brandVariations];

  variations.forEach(variation => {
    // Escape special regex characters
    const escaped = variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Match whole words (with word boundaries)
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    let match;

    while ((match = regex.exec(text)) !== null) {
      mentions.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }
  });

  // Sort by position
  mentions.sort((a, b) => a.start - b.start);

  return mentions;
}

/**
 * Find all URL mentions in text
 */
function findUrlMentions(
  text: string,
  brandConfig: BrandConfig
): Array<{ text: string; start: number; end: number }> {
  const mentions: Array<{ text: string; start: number; end: number }> = [];

  // URL regex pattern (matches http://, https://, or domain.com)
  const urlRegex = /(https?:\/\/[^\s]+|(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];

    // Check if URL contains brand website
    if (url.toLowerCase().includes(brandConfig.websiteUrl.toLowerCase())) {
      mentions.push({
        text: url,
        start: match.index,
        end: match.index + url.length
      });
    }
  }

  return mentions;
}

/**
 * Main extraction function: Extract all citations from AI response
 *
 * @param responseText - Full AI platform response text
 * @param brandConfig - Brand configuration with name, variations, website
 * @returns Extraction result with all citations and summary
 */
export function extractCitations(
  responseText: string,
  brandConfig: BrandConfig
): ExtractionResult {
  const citations: Citation[] = [];

  // Find direct brand mentions
  const directMentions = findDirectMentions(responseText, brandConfig);

  // Find URL mentions
  const urlMentions = findUrlMentions(responseText, brandConfig);

  // Combine and deduplicate mentions
  const allMentions = [
    ...directMentions.map(m => ({ ...m, type: 'direct' as const })),
    ...urlMentions.map(m => ({ ...m, type: 'url' as const }))
  ];

  // Sort by position
  allMentions.sort((a, b) => a.start - b.start);

  // Process each mention
  allMentions.forEach((mention, index) => {
    const quoteExcerpt = extractContextWindow(
      responseText,
      mention.start,
      mention.end,
      50
    );

    const fullContext = extractFullContext(
      responseText,
      mention.start,
      mention.end
    );

    const mentionContext = categorizeMentionContext(fullContext, mention.text);

    const isFalsePositive = isPossibleFalsePositive(
      mention.text,
      fullContext,
      brandConfig
    );

    citations.push({
      mentionType: mention.type,
      brandName: brandConfig.brandName,
      mentionedText: mention.text,
      position: index + 1, // 1-indexed position
      quoteExcerpt,
      fullContext,
      mentionContext,
      isFalsePosibleFalsePositive: isFalsePositive,
      characterOffset: mention.start
    });
  });

  // Calculate summary statistics
  const directCount = citations.filter(c => c.mentionType === 'direct').length;
  const urlCount = citations.filter(c => c.mentionType === 'url').length;

  const averagePosition =
    citations.length > 0
      ? citations.reduce((sum, c) => sum + c.position, 0) / citations.length
      : 0;

  const mentionsByContext: Record<MentionContext, number> = {
    recommendation: 0,
    comparison: 0,
    case_study: 0,
    data_source: 0,
    alternative: 0,
    unknown: 0
  };

  citations.forEach(c => {
    mentionsByContext[c.mentionContext]++;
  });

  return {
    citations,
    totalMentions: citations.length,
    directMentions: directCount,
    urlMentions: urlCount,
    averagePosition: Math.round(averagePosition * 10) / 10,
    mentionsByContext,
    hasMentions: citations.length > 0
  };
}

/**
 * Extract citations from multiple responses (batch processing)
 */
export function extractCitationsBatch(
  responses: Array<{ id: string; text: string; platform: string }>,
  brandConfig: BrandConfig
): Array<{ responseId: string; platform: string; result: ExtractionResult }> {
  return responses.map(response => ({
    responseId: response.id,
    platform: response.platform,
    result: extractCitations(response.text, brandConfig)
  }));
}

/**
 * Compare citations across multiple brands (for competitor analysis)
 */
export function compareMultipleBrands(
  responseText: string,
  brandConfigs: BrandConfig[]
): Array<{ brandName: string; result: ExtractionResult }> {
  return brandConfigs.map(config => ({
    brandName: config.brandName,
    result: extractCitations(responseText, config)
  }));
}

/**
 * Calculate overall mention rate from extraction results
 */
export function calculateMentionRate(
  results: ExtractionResult[],
  totalResponses: number
): {
  mentionRate: number; // Percentage (0-100)
  responsesWithMentions: number;
  totalResponses: number;
} {
  const responsesWithMentions = results.filter(r => r.hasMentions).length;
  const mentionRate = totalResponses > 0 ? (responsesWithMentions / totalResponses) * 100 : 0;

  return {
    mentionRate: Math.round(mentionRate * 10) / 10,
    responsesWithMentions,
    totalResponses
  };
}
