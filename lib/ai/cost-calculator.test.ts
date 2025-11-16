/**
 * Unit Tests for Cost Calculator
 */

import { describe, it, expect } from "vitest";
import {
  calculateCost,
  estimateCost,
  formatCost,
  formatTokens,
  estimateArticleCost,
  checkCostAlert,
} from "./cost-calculator";

describe("Cost Calculator", () => {
  describe("calculateCost", () => {
    it("should calculate cost for GPT-4", () => {
      const cost = calculateCost("gpt-4", 1000, 2000);
      expect(cost.inputTokens).toBe(1000);
      expect(cost.outputTokens).toBe(2000);
      expect(cost.totalTokens).toBe(3000);
      expect(cost.totalCost).toBeGreaterThan(0);
      expect(cost.model).toBe("gpt-4");
    });

    it("should calculate different costs for different models", () => {
      const gpt4Cost = calculateCost("gpt-4", 1000, 1000);
      const gpt35Cost = calculateCost("gpt-3.5-turbo", 1000, 1000);
      expect(gpt4Cost.totalCost).toBeGreaterThan(gpt35Cost.totalCost);
    });
  });

  describe("estimateCost", () => {
    it("should estimate cost before generation", () => {
      const estimate = estimateCost("claude-3.5-sonnet", 500, 1500);
      expect(estimate.inputTokens).toBe(500);
      expect(estimate.outputTokens).toBe(1500);
      expect(estimate.totalCost).toBeGreaterThan(0);
    });
  });

  describe("formatCost", () => {
    it("should format small costs in cents", () => {
      expect(formatCost(0.005)).toContain("¢");
    });

    it("should format larger costs in dollars", () => {
      const formatted = formatCost(0.5);
      expect(formatted).toContain("$");
      expect(formatted).toContain("0.5");
    });
  });

  describe("formatTokens", () => {
    it("should format small token counts", () => {
      expect(formatTokens(500)).toBe("500");
    });

    it("should format thousands with K", () => {
      const formatted = formatTokens(5000);
      expect(formatted).toContain("K");
    });

    it("should format millions with M", () => {
      const formatted = formatTokens(5000000);
      expect(formatted).toContain("M");
    });
  });

  describe("estimateArticleCost", () => {
    it("should estimate cost for different word counts", () => {
      const short = estimateArticleCost("gpt-3.5-turbo", 500);
      const long = estimateArticleCost("gpt-3.5-turbo", 2000);
      expect(long.totalCost).toBeGreaterThan(short.totalCost);
    });

    it("should estimate reasonable costs", () => {
      const cost = estimateArticleCost("gpt-3.5-turbo", 1000);
      expect(cost.totalCost).toBeLessThan(1); // Should be less than $1
      expect(cost.totalCost).toBeGreaterThan(0);
    });
  });

  describe("checkCostAlert", () => {
    it("should return ok for low costs", () => {
      const alert = checkCostAlert(0.05, "article");
      expect(alert.level).toBe("ok");
    });

    it("should return warning for medium costs", () => {
      const alert = checkCostAlert(0.6, "article");
      expect(alert.level).toBe("warning");
    });

    it("should return critical for high costs", () => {
      const alert = checkCostAlert(1.5, "article");
      expect(alert.level).toBe("critical");
    });
  });
});
