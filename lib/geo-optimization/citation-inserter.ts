/**
 * Citation Inserter Service
 *
 * Intelligently inserts citations into content for GEO optimization.
 * Minimum 3 authoritative citations per article.
 *
 * @module lib/geo-optimization/citation-inserter
 */

import type { Citation } from './citation-finder';

/**
 * Citation insertion result
 */
export interface CitationInsertionResult {
  content: string; // content with citations inserted
  citationsAdded: number;
  citationsPlacements: CitationPlacement[];
  referencesSection: string; // formatted references for end of article
}

/**
 * Where a citation was placed
 */
export interface CitationPlacement {
  citation: Citation;
  position: number; // character position in content
  context: string; // surrounding text
  insertionMethod: 'inline' | 'footnote' | 'reference';
}

/**
 * Configuration for citation insertion
 */
export interface CitationInsertionConfig {
  minCitations?: number; // minimum citations to insert (default 3)
  maxCitations?: number; // maximum citations to insert (default 10)
  insertionStyle?: 'inline' | 'footnote' | 'reference' | 'mixed';
  preferredPositions?: 'balanced' | 'early' | 'claims-only';
  includeReferencesSection?: boolean; // add references section at end
}

/**
 * Insert citations into content
 *
 * @param content - Original content
 * @param citations - Available citations to insert
 * @param config - Configuration options
 * @returns Content with citations inserted
 */
export function insertCitations(
  content: string,
  citations: Citation[],
  config: CitationInsertionConfig = {}
): CitationInsertionResult {
  const {
    minCitations = 3,
    maxCitations = 10,
    insertionStyle = 'mixed',
    preferredPositions = 'balanced',
    includeReferencesSection = true,
  } = config;

  // Validate input
  if (!content || content.trim().length === 0) {
    throw new Error('Content is required for citation insertion');
  }

  if (!citations || citations.length === 0) {
    throw new Error('At least one citation is required');
  }

  // Select best citations to use
  const selectedCitations = citations
    .sort((a, b) => b.authorityScore - a.authorityScore)
    .slice(0, maxCitations);

  // Ensure minimum citations
  if (selectedCitations.length < minCitations) {
    console.warn(
      `Only ${selectedCitations.length} citations available, but ${minCitations} requested`
    );
  }

  // Find optimal insertion points
  const insertionPoints = findInsertionPoints(content, selectedCitations, preferredPositions);

  // Insert citations
  const result = applyCitations(content, insertionPoints, insertionStyle);

  // Generate references section
  const referencesSection = includeReferencesSection
    ? generateReferencesSection(selectedCitations)
    : '';

  return {
    content: result.content + (referencesSection ? `\n\n${referencesSection}` : ''),
    citationsAdded: result.placements.length,
    citationsPlacements: result.placements,
    referencesSection,
  };
}

/**
 * Find optimal points in content to insert citations
 */
function findInsertionPoints(
  content: string,
  citations: Citation[],
  preferredPositions: string
): Map<number, Citation> {
  const insertionPoints = new Map<number, Citation>();

  // Split content into paragraphs
  const paragraphs = content.split(/\n\s*\n/);
  let currentPosition = 0;
  const paragraphPositions: Array<{ start: number; end: number; text: string }> = [];

  for (const paragraph of paragraphs) {
    const start = currentPosition;
    const end = currentPosition + paragraph.length;
    paragraphPositions.push({ start, end, text: paragraph });
    currentPosition = end + 2; // +2 for newlines
  }

  // Strategy based on preferred positions
  if (preferredPositions === 'balanced') {
    // Distribute evenly throughout content
    const spacing = Math.floor(paragraphPositions.length / citations.length);
    citations.forEach((citation, index) => {
      const paragraphIndex = Math.min(
        index * spacing,
        paragraphPositions.length - 1
      );
      const paragraph = paragraphPositions[paragraphIndex];
      // Insert at end of paragraph
      insertionPoints.set(paragraph.end, citation);
    });
  } else if (preferredPositions === 'early') {
    // Front-load citations in first few paragraphs
    const firstParagraphs = paragraphPositions.slice(0, Math.min(5, paragraphPositions.length));
    citations.slice(0, firstParagraphs.length).forEach((citation, index) => {
      insertionPoints.set(firstParagraphs[index].end, citation);
    });
  } else if (preferredPositions === 'claims-only') {
    // Insert near factual claims (sentences with numbers, stats, etc.)
    const claimPositions = findFactualClaims(content);
    citations.forEach((citation, index) => {
      if (index < claimPositions.length) {
        insertionPoints.set(claimPositions[index], citation);
      }
    });
  }

  return insertionPoints;
}

/**
 * Find positions of factual claims in content
 */
function findFactualClaims(content: string): number[] {
  const positions: number[] = [];
  const sentences = content.split(/[.!?]+/);
  let currentPos = 0;

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    currentPos = content.indexOf(trimmed, currentPos);

    // Check if sentence contains factual indicators
    const hasNumber = /\d/.test(trimmed);
    const hasPercentage = /%/.test(trimmed);
    const hasStatistic = /\b(study|research|report|according to|found that)\b/i.test(trimmed);

    if ((hasNumber || hasPercentage) && trimmed.split(/\s+/).length > 5) {
      // Mark end of sentence as insertion point
      positions.push(currentPos + trimmed.length);
    }

    currentPos += trimmed.length + 1;
  }

  return positions;
}

/**
 * Apply citations to content at insertion points
 */
function applyCitations(
  content: string,
  insertionPoints: Map<number, Citation>,
  insertionStyle: string
): { content: string; placements: CitationPlacement[] } {
  const placements: CitationPlacement[] = [];
  let modifiedContent = content;
  let offset = 0; // Track offset due to insertions

  // Sort insertion points by position
  const sortedPoints = Array.from(insertionPoints.entries()).sort((a, b) => a[0] - b[0]);

  sortedPoints.forEach(([position, citation], index) => {
    const citationNumber = index + 1;
    let citationText = '';
    let method: 'inline' | 'footnote' | 'reference' = 'reference';

    if (insertionStyle === 'inline' || (insertionStyle === 'mixed' && index % 2 === 0)) {
      // Inline citation: [Source Name](URL)
      citationText = ` [[${citationNumber}]](${citation.url} "${citation.title}")`;
      method = 'inline';
    } else if (insertionStyle === 'footnote') {
      // Footnote style: [^1]
      citationText = `[^${citationNumber}]`;
      method = 'footnote';
    } else {
      // Reference style: [1]
      citationText = `[${citationNumber}]`;
      method = 'reference';
    }

    // Insert citation at position (with offset)
    const insertPosition = position + offset;
    modifiedContent =
      modifiedContent.slice(0, insertPosition) +
      citationText +
      modifiedContent.slice(insertPosition);

    // Update offset
    offset += citationText.length;

    // Record placement
    placements.push({
      citation,
      position: insertPosition,
      context: extractContext(content, position, 50),
      insertionMethod: method,
    });
  });

  return { content: modifiedContent, placements };
}

/**
 * Extract context around a position in text
 */
function extractContext(content: string, position: number, radius: number): string {
  const start = Math.max(0, position - radius);
  const end = Math.min(content.length, position + radius);
  return content.slice(start, end).trim();
}

/**
 * Generate references section for end of article
 */
function generateReferencesSection(citations: Citation[]): string {
  let referencesSection = '## References\n\n';

  citations.forEach((citation, index) => {
    const citationNumber = index + 1;
    const author = citation.author ? `${citation.author}. ` : '';
    const date = citation.publishedDate
      ? `(${new Date(citation.publishedDate).getFullYear()}). `
      : '';
    const title = citation.title;
    const url = citation.url;

    referencesSection += `${citationNumber}. ${author}${date}*${title}*. Retrieved from [${citation.domain}](${url})\n`;
  });

  return referencesSection;
}

/**
 * Validate that content has minimum required citations
 */
export function validateCitationCount(
  content: string,
  minRequired: number = 3
): { valid: boolean; count: number; error?: string } {
  // Count citation markers in content
  const inlineCitations = (content.match(/\[\[?\d+\]?\]/g) || []).length;
  const footnoteCitations = (content.match(/\[\^\d+\]/g) || []).length;

  const totalCitations = inlineCitations + footnoteCitations;

  if (totalCitations < minRequired) {
    return {
      valid: false,
      count: totalCitations,
      error: `Content has ${totalCitations} citation(s), but ${minRequired} are required.`,
    };
  }

  return { valid: true, count: totalCitations };
}

/**
 * Extract existing citations from content
 */
export function extractExistingCitations(content: string): string[] {
  const citations: string[] = [];

  // Find reference section
  const referencesMatch = content.match(/##\s*References\s*([\s\S]*?)(?=\n##|\n\n##|$)/i);
  if (referencesMatch) {
    const referencesSection = referencesMatch[1];
    // Extract URLs from references
    const urlMatches = referencesSection.matchAll(/\((https?:\/\/[^\)]+)\)/g);
    for (const match of urlMatches) {
      citations.push(match[1]);
    }
  }

  // Also find inline citations
  const inlineMatches = content.matchAll(/\]\((https?:\/\/[^\)]+)\s*"?[^"]*"?\)/g);
  for (const match of inlineMatches) {
    if (!citations.includes(match[1])) {
      citations.push(match[1]);
    }
  }

  return citations;
}

/**
 * Smart citation insertion that analyzes content semantically
 * Uses AI to determine best citation placement (optional advanced feature)
 */
export async function insertCitationsWithAI(
  content: string,
  citations: Citation[],
  config: CitationInsertionConfig = {}
): Promise<CitationInsertionResult> {
  // This would use AI to analyze content and determine optimal citation placement
  // For MVP, fall back to rule-based insertion
  return insertCitations(content, citations, config);
}
