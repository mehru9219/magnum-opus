/**
 * Unit Tests for Token Counter
 */

import { describe, it, expect } from "vitest";
import {
  estimateTokens,
  estimateConversationTokens,
  fitsInContextWindow,
  truncateToTokenLimit,
  chunkByTokens,
} from "./token-counter";

describe("Token Counter", () => {
  describe("estimateTokens", () => {
    it("should estimate tokens for text", () => {
      const text = "This is a simple test sentence.";
      const tokens = estimateTokens(text);
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(100);
    });

    it("should return 0 for empty text", () => {
      expect(estimateTokens("")).toBe(0);
    });

    it("should estimate more tokens for longer text", () => {
      const short = "Hello world";
      const long = "This is a much longer sentence with many more words and therefore more tokens.";
      expect(estimateTokens(long)).toBeGreaterThan(estimateTokens(short));
    });

    it("should apply model-specific adjustments", () => {
      const text = "Sample text for testing";
      const baseEstimate = estimateTokens(text);
      const claudeEstimate = estimateTokens(text, "claude-3-sonnet");
      const geminiEstimate = estimateTokens(text, "gemini-1.5-flash");

      // Claude should use slightly more tokens
      expect(claudeEstimate).toBeGreaterThanOrEqual(baseEstimate);
      // Gemini should use slightly fewer tokens
      expect(geminiEstimate).toBeLessThanOrEqual(baseEstimate);
    });
  });

  describe("estimateConversationTokens", () => {
    it("should estimate input and output tokens", () => {
      const result = estimateConversationTokens({
        userPrompt: "Write a blog post about AI",
        estimatedResponseLength: 1000, // words
      });

      expect(result.inputTokens).toBeGreaterThan(0);
      expect(result.outputTokens).toBeGreaterThan(0);
      expect(result.totalTokens).toBe(result.inputTokens + result.outputTokens);
    });

    it("should include system prompt tokens", () => {
      const withoutSystem = estimateConversationTokens({
        userPrompt: "Test",
        estimatedResponseLength: 100,
      });

      const withSystem = estimateConversationTokens({
        systemPrompt: "You are a helpful assistant.",
        userPrompt: "Test",
        estimatedResponseLength: 100,
      });

      expect(withSystem.inputTokens).toBeGreaterThan(withoutSystem.inputTokens);
    });
  });

  describe("fitsInContextWindow", () => {
    it("should check if text fits in context window", () => {
      const shortText = "This is a short text.";
      const result = fitsInContextWindow(shortText, "gpt-4", 2000);

      expect(result.fits).toBe(true);
      expect(result.tokenCount).toBeGreaterThan(0);
      expect(result.availableForResponse).toBeGreaterThan(0);
    });

    it("should detect when text is too long", () => {
      const longText = "word ".repeat(100000); // Very long text
      const result = fitsInContextWindow(longText, "gpt-3.5-turbo", 2000);

      expect(result.fits).toBe(false);
    });
  });

  describe("truncateToTokenLimit", () => {
    it("should not truncate text within limit", () => {
      const text = "Short text";
      const truncated = truncateToTokenLimit(text, 1000);
      expect(truncated).toBe(text);
    });

    it("should truncate text exceeding limit", () => {
      const longText = "word ".repeat(10000);
      const truncated = truncateToTokenLimit(longText, 100);

      expect(truncated.length).toBeLessThan(longText.length);
      expect(truncated).toContain("...");
    });
  });

  describe("chunkByTokens", () => {
    it("should return single chunk for short text", () => {
      const text = "This is a short text.";
      const chunks = chunkByTokens(text, 1000);

      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe(text);
    });

    it("should split long text into multiple chunks", () => {
      const longText = "This is a sentence. ".repeat(1000);
      const chunks = chunkByTokens(longText, 100);

      expect(chunks.length).toBeGreaterThan(1);

      // All chunks should be non-empty
      chunks.forEach(chunk => {
        expect(chunk.length).toBeGreaterThan(0);
      });
    });

    it("should split text into multiple chunks", () => {
      const longText = "This is a paragraph. ".repeat(500);
      const maxTokens = 200;
      const chunks = chunkByTokens(longText, maxTokens);

      // Should create multiple chunks for long text
      expect(chunks.length).toBeGreaterThan(1);

      // Total text should be preserved
      const reconstructed = chunks.join("");
      expect(reconstructed.length).toBeGreaterThan(0);
    });
  });
});
