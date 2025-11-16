/**
 * Unit Tests for AI Models Configuration
 */

import { describe, it, expect } from "vitest";
import {
  getModelConfig,
  selectBestModel,
  getFallbackModel,
  getModelsByProvider,
  getModelsByTier,
  isValidModel,
  getAllModels,
} from "./models";

describe("AI Models Configuration", () => {
  describe("getModelConfig", () => {
    it("should return config for valid model", () => {
      const config = getModelConfig("gpt-4");
      expect(config).toBeDefined();
      expect(config.model).toBe("gpt-4");
      expect(config.provider).toBe("openai");
      expect(config.tier).toBe("premium");
    });

    it("should throw error for invalid model", () => {
      expect(() => getModelConfig("invalid-model" as any)).toThrow();
    });
  });

  describe("selectBestModel", () => {
    it("should select economy model for simple task", () => {
      const model = selectBestModel({
        task: "simple",
        quality: "economy",
      });
      expect(model).toBeDefined();
      const config = getModelConfig(model);
      expect(config.tier).toBe("economy");
    });

    it("should select premium model for complex task", () => {
      const model = selectBestModel({
        task: "complex",
        quality: "premium",
      });
      expect(model).toBeDefined();
      const config = getModelConfig(model);
      expect(["premium", "standard"]).toContain(config.tier);
    });

    it("should respect provider preference", () => {
      const model = selectBestModel({
        task: "simple",
        quality: "balanced",
        provider: "anthropic",
      });
      expect(model).toBeDefined();
      const config = getModelConfig(model);
      expect(config.provider).toBe("anthropic");
    });
  });

  describe("getFallbackModel", () => {
    it("should return different model than primary", () => {
      const primary = "gpt-4";
      const fallback = getFallbackModel(primary);
      expect(fallback).toBeDefined();
      expect(fallback).not.toBe(primary);
    });

    it("should return a valid fallback model", () => {
      const fallback = getFallbackModel("gpt-4");
      expect(fallback).toBeDefined();
      expect(isValidModel(fallback)).toBe(true);
      // Should eventually fall back to gpt-3.5-turbo if no other options
      const fallback2 = getFallbackModel(fallback);
      expect(isValidModel(fallback2)).toBe(true);
    });
  });

  describe("getModelsByProvider", () => {
    it("should return OpenAI models", () => {
      const models = getModelsByProvider("openai");
      expect(models.length).toBeGreaterThan(0);
      expect(models.every((m) => m.provider === "openai")).toBe(true);
    });

    it("should return Anthropic models", () => {
      const models = getModelsByProvider("anthropic");
      expect(models.length).toBeGreaterThan(0);
      expect(models.every((m) => m.provider === "anthropic")).toBe(true);
    });
  });

  describe("getModelsByTier", () => {
    it("should return economy tier models", () => {
      const models = getModelsByTier("economy");
      expect(models.length).toBeGreaterThan(0);
      expect(models.every((m) => m.tier === "economy")).toBe(true);
    });

    it("should return premium tier models", () => {
      const models = getModelsByTier("premium");
      expect(models.length).toBeGreaterThan(0);
      expect(models.every((m) => m.tier === "premium")).toBe(true);
    });
  });

  describe("isValidModel", () => {
    it("should return true for valid models", () => {
      expect(isValidModel("gpt-4")).toBe(true);
      expect(isValidModel("claude-3.5-sonnet")).toBe(true);
      expect(isValidModel("gemini-1.5-flash")).toBe(true);
    });

    it("should return false for invalid models", () => {
      expect(isValidModel("invalid-model")).toBe(false);
      expect(isValidModel("")).toBe(false);
    });
  });

  describe("getAllModels", () => {
    it("should return all configured models", () => {
      const models = getAllModels();
      expect(models.length).toBe(11); // We configured 11 models
      expect(models).toContain("gpt-4");
      expect(models).toContain("claude-3.5-sonnet");
      expect(models).toContain("gemini-1.5-pro");
    });
  });

  describe("Model Pricing", () => {
    it("should have positive costs for all models", () => {
      const models = getAllModels();
      models.forEach((modelName) => {
        const config = getModelConfig(modelName);
        expect(config.costPer1kInputTokens).toBeGreaterThan(0);
        expect(config.costPer1kOutputTokens).toBeGreaterThan(0);
      });
    });

    it("should have economy models cheaper than premium", () => {
      const economyModels = getModelsByTier("economy");
      const premiumModels = getModelsByTier("premium");

      const avgEconomyCost =
        economyModels.reduce((sum, m) => sum + m.costPer1kOutputTokens, 0) /
        economyModels.length;
      const avgPremiumCost =
        premiumModels.reduce((sum, m) => sum + m.costPer1kOutputTokens, 0) /
        premiumModels.length;

      expect(avgEconomyCost).toBeLessThan(avgPremiumCost);
    });
  });
});
