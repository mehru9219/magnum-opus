/**
 * Token Counting Utilities
 * Estimate token counts for AI API usage
 */

import type { AIModel, AIProvider } from "./types";
import { getModelConfig } from "./models";

/**
 * Rough token estimation (fallback method)
 * Based on OpenAI's rule of thumb: ~4 characters per token for English text
 */
function estimateTokensSimple(text: string): number {
  // Average: 1 token ≈ 4 characters or 0.75 words
  const charCount = text.length;
  return Math.ceil(charCount / 4);
}

/**
 * More accurate token estimation
 * Considers spaces, punctuation, and common patterns
 */
function estimateTokensAdvanced(text: string): number {
  if (!text || text.length === 0) return 0;

  // Split by whitespace and punctuation
  const words = text.split(/\s+/);
  let tokenCount = 0;

  for (const word of words) {
    if (!word) continue;

    // Short words (1-4 chars) usually = 1 token
    if (word.length <= 4) {
      tokenCount += 1;
    }
    // Medium words (5-8 chars) usually = 1-2 tokens
    else if (word.length <= 8) {
      tokenCount += 1.5;
    }
    // Longer words = ~3 chars per token
    else {
      tokenCount += Math.ceil(word.length / 3);
    }

    // Add extra tokens for punctuation
    const punctuationCount = (word.match(/[.,!?;:()'"]/g) || []).length;
    tokenCount += punctuationCount * 0.5;
  }

  return Math.ceil(tokenCount);
}

/**
 * Estimate tokens for a given text and model
 */
export function estimateTokens(text: string, model?: AIModel): number {
  if (!text) return 0;

  // Use advanced estimation for better accuracy
  const estimate = estimateTokensAdvanced(text);

  // Apply model-specific adjustments
  if (model) {
    const config = getModelConfig(model);

    // Claude models tend to use slightly more tokens
    if (config.provider === "anthropic") {
      return Math.ceil(estimate * 1.1);
    }

    // Gemini models tend to use slightly fewer tokens
    if (config.provider === "google") {
      return Math.ceil(estimate * 0.95);
    }
  }

  return estimate;
}

/**
 * Estimate tokens for prompt + completion
 */
export function estimateConversationTokens(params: {
  systemPrompt?: string;
  userPrompt: string;
  estimatedResponseLength?: number;
  model?: AIModel;
}): {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
} {
  const { systemPrompt = "", userPrompt, estimatedResponseLength = 1000, model } = params;

  const systemTokens = estimateTokens(systemPrompt, model);
  const userTokens = estimateTokens(userPrompt, model);
  const inputTokens = systemTokens + userTokens;

  // If response length is in words, convert to tokens
  const outputTokens =
    estimatedResponseLength > 10000
      ? Math.ceil(estimatedResponseLength / 4) // Assume it's characters
      : Math.ceil(estimatedResponseLength / 0.75); // Assume it's words

  return {
    inputTokens,
    outputTokens: outputTokens,
    totalTokens: inputTokens + outputTokens,
  };
}

/**
 * Check if content fits within model's context window
 */
export function fitsInContextWindow(
  text: string,
  model: AIModel,
  reservedForResponse = 2000
): {
  fits: boolean;
  tokenCount: number;
  maxTokens: number;
  availableForResponse: number;
} {
  const config = getModelConfig(model);
  const tokenCount = estimateTokens(text, model);
  const maxTokens = config.contextWindow;
  const availableForResponse = Math.max(0, maxTokens - tokenCount);

  return {
    fits: tokenCount + reservedForResponse <= maxTokens,
    tokenCount,
    maxTokens,
    availableForResponse,
  };
}

/**
 * Truncate text to fit within token limit
 */
export function truncateToTokenLimit(
  text: string,
  maxTokens: number,
  model?: AIModel
): string {
  const currentTokens = estimateTokens(text, model);

  if (currentTokens <= maxTokens) {
    return text;
  }

  // Estimate characters per token for this text
  const charsPerToken = text.length / currentTokens;

  // Calculate target character count
  const targetChars = Math.floor(maxTokens * charsPerToken);

  // Truncate and add ellipsis
  return text.substring(0, targetChars - 3) + "...";
}

/**
 * Split text into chunks that fit within token limit
 */
export function chunkByTokens(
  text: string,
  maxTokensPerChunk: number,
  model?: AIModel
): string[] {
  const totalTokens = estimateTokens(text, model);

  if (totalTokens <= maxTokensPerChunk) {
    return [text];
  }

  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = "";
  let currentTokens = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph, model);

    // If single paragraph exceeds limit, split by sentences
    if (paragraphTokens > maxTokensPerChunk) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
        currentTokens = 0;
      }

      const sentences = paragraph.split(/[.!?]+\s/);
      for (const sentence of sentences) {
        const sentenceTokens = estimateTokens(sentence, model);

        if (currentTokens + sentenceTokens <= maxTokensPerChunk) {
          currentChunk += sentence + ". ";
          currentTokens += sentenceTokens;
        } else {
          if (currentChunk) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = sentence + ". ";
          currentTokens = sentenceTokens;
        }
      }
    }
    // Normal paragraph processing
    else if (currentTokens + paragraphTokens <= maxTokensPerChunk) {
      currentChunk += paragraph + "\n\n";
      currentTokens += paragraphTokens;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = paragraph + "\n\n";
      currentTokens = paragraphTokens;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Count tokens in messages array (for chat format)
 */
export function countMessageTokens(
  messages: Array<{ role: string; content: string }>,
  model?: AIModel
): number {
  // Base tokens for message formatting (~3 tokens per message)
  const formattingTokens = messages.length * 3;

  // Count content tokens
  const contentTokens = messages.reduce((total, msg) => {
    return total + estimateTokens(msg.content, model);
  }, 0);

  return formattingTokens + contentTokens;
}

/**
 * Optimize prompt to reduce token usage
 */
export function optimizePrompt(prompt: string, targetReduction = 0.2): {
  optimized: string;
  originalTokens: number;
  optimizedTokens: number;
  reduction: number;
} {
  const originalTokens = estimateTokens(prompt);

  let optimized = prompt;

  // Remove extra whitespace
  optimized = optimized.replace(/\s+/g, " ").trim();

  // Remove redundant punctuation
  optimized = optimized.replace(/[!]{2,}/g, "!");
  optimized = optimized.replace(/[?]{2,}/g, "?");
  optimized = optimized.replace(/[.]{3,}/g, "...");

  // Remove common filler words if significant reduction needed
  if (targetReduction > 0.1) {
    const fillerWords = [
      "very",
      "really",
      "quite",
      "rather",
      "somewhat",
      "just",
      "actually",
      "basically",
      "literally",
    ];

    fillerWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b\\s?`, "gi");
      optimized = optimized.replace(regex, "");
    });
  }

  // Clean up any double spaces created
  optimized = optimized.replace(/\s+/g, " ").trim();

  const optimizedTokens = estimateTokens(optimized);
  const reduction = 1 - optimizedTokens / originalTokens;

  return {
    optimized,
    originalTokens,
    optimizedTokens,
    reduction,
  };
}

/**
 * Calculate token efficiency (content quality per token)
 */
export function calculateTokenEfficiency(params: {
  outputTokens: number;
  wordCount: number;
  qualityScore?: number; // 0-100
}): {
  wordsPerToken: number;
  tokensPerWord: number;
  efficiency: number; // quality-adjusted efficiency
} {
  const { outputTokens, wordCount, qualityScore = 100 } = params;

  const wordsPerToken = wordCount / outputTokens;
  const tokensPerWord = outputTokens / wordCount;

  // Efficiency score: more words per token is better, adjusted by quality
  const baseEfficiency = wordsPerToken * 100;
  const efficiency = (baseEfficiency * qualityScore) / 100;

  return {
    wordsPerToken,
    tokensPerWord,
    efficiency,
  };
}

/**
 * Estimate tokens for common content lengths
 */
export const TOKEN_ESTIMATES = {
  SHORT_FORM: {
    socialPost: { words: 50, tokens: 67 }, // ~280 chars
    email: { words: 150, tokens: 200 },
    productDescription: { words: 100, tokens: 133 },
  },
  MEDIUM_FORM: {
    blogPost: { words: 1000, tokens: 1333 },
    article: { words: 1500, tokens: 2000 },
    pressRelease: { words: 500, tokens: 667 },
  },
  LONG_FORM: {
    guide: { words: 2500, tokens: 3333 },
    whitepaper: { words: 5000, tokens: 6667 },
    ebook: { words: 10000, tokens: 13333 },
  },
} as const;

/**
 * Get estimated tokens for content type
 */
export function getEstimatedTokensForContentType(
  contentType: keyof typeof TOKEN_ESTIMATES.SHORT_FORM |
    keyof typeof TOKEN_ESTIMATES.MEDIUM_FORM |
    keyof typeof TOKEN_ESTIMATES.LONG_FORM
): number {
  const allEstimates = {
    ...TOKEN_ESTIMATES.SHORT_FORM,
    ...TOKEN_ESTIMATES.MEDIUM_FORM,
    ...TOKEN_ESTIMATES.LONG_FORM,
  };

  return allEstimates[contentType]?.tokens || 1000;
}

/**
 * Batch token estimation for multiple texts
 */
export function batchEstimateTokens(
  texts: string[],
  model?: AIModel
): {
  total: number;
  perText: number[];
  average: number;
} {
  const perText = texts.map((text) => estimateTokens(text, model));
  const total = perText.reduce((sum, count) => sum + count, 0);
  const average = total / texts.length;

  return { total, perText, average };
}
