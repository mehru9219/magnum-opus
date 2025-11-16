/**
 * AI Model Configurations
 * Centralized configuration for all supported AI models
 */

import type { AIModel, ModelConfig, ModelSelectionCriteria, AIProvider } from "./types";

/**
 * Model Configuration Database
 * Pricing as of January 2025 (verify current pricing in production)
 */
export const MODEL_CONFIGS: Record<AIModel, ModelConfig> = {
  // OpenAI Models
  "gpt-4": {
    model: "gpt-4",
    provider: "openai",
    displayName: "GPT-4",
    contextWindow: 8192,
    maxTokens: 4096,
    costPer1kInputTokens: 0.03,
    costPer1kOutputTokens: 0.06,
    supportsStreaming: true,
    recommendedFor: ["complex analysis", "creative writing", "code generation"],
    tier: "premium",
  },
  "gpt-4-turbo": {
    model: "gpt-4-turbo",
    provider: "openai",
    displayName: "GPT-4 Turbo",
    contextWindow: 128000,
    maxTokens: 4096,
    costPer1kInputTokens: 0.01,
    costPer1kOutputTokens: 0.03,
    supportsStreaming: true,
    recommendedFor: [
      "long-form content",
      "research articles",
      "comprehensive guides",
    ],
    tier: "premium",
  },
  "gpt-3.5-turbo": {
    model: "gpt-3.5-turbo",
    provider: "openai",
    displayName: "GPT-3.5 Turbo",
    contextWindow: 16385,
    maxTokens: 4096,
    costPer1kInputTokens: 0.0005,
    costPer1kOutputTokens: 0.0015,
    supportsStreaming: true,
    recommendedFor: ["simple articles", "social media", "quick summaries"],
    tier: "economy",
  },

  // Anthropic Claude Models
  "claude-3.5-sonnet": {
    model: "claude-3.5-sonnet",
    provider: "anthropic",
    displayName: "Claude 3.5 Sonnet",
    contextWindow: 200000,
    maxTokens: 8192,
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
    supportsStreaming: true,
    recommendedFor: [
      "long-form content",
      "detailed analysis",
      "technical writing",
    ],
    tier: "premium",
  },
  "claude-3-opus": {
    model: "claude-3-opus",
    provider: "anthropic",
    displayName: "Claude 3 Opus",
    contextWindow: 200000,
    maxTokens: 4096,
    costPer1kInputTokens: 0.015,
    costPer1kOutputTokens: 0.075,
    supportsStreaming: true,
    recommendedFor: [
      "highest quality content",
      "complex reasoning",
      "research papers",
    ],
    tier: "premium",
  },
  "claude-3-sonnet": {
    model: "claude-3-sonnet",
    provider: "anthropic",
    displayName: "Claude 3 Sonnet",
    contextWindow: 200000,
    maxTokens: 4096,
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
    supportsStreaming: true,
    recommendedFor: ["balanced quality/cost", "blog posts", "articles"],
    tier: "standard",
  },
  "claude-3-haiku": {
    model: "claude-3-haiku",
    provider: "anthropic",
    displayName: "Claude 3 Haiku",
    contextWindow: 200000,
    maxTokens: 4096,
    costPer1kInputTokens: 0.00025,
    costPer1kOutputTokens: 0.00125,
    supportsStreaming: true,
    recommendedFor: ["fast generation", "simple content", "social posts"],
    tier: "economy",
  },

  // Perplexity Models
  "perplexity-sonar": {
    model: "perplexity-sonar",
    provider: "perplexity",
    displayName: "Perplexity Sonar",
    contextWindow: 127072,
    maxTokens: 4096,
    costPer1kInputTokens: 0.001,
    costPer1kOutputTokens: 0.001,
    supportsStreaming: true,
    recommendedFor: ["research-backed content", "fact-checking", "news"],
    tier: "standard",
  },
  "perplexity-sonar-pro": {
    model: "perplexity-sonar-pro",
    provider: "perplexity",
    displayName: "Perplexity Sonar Pro",
    contextWindow: 127072,
    maxTokens: 4096,
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
    supportsStreaming: true,
    recommendedFor: [
      "deep research",
      "citation-heavy content",
      "academic writing",
    ],
    tier: "premium",
  },

  // Google Gemini Models
  "gemini-1.5-pro": {
    model: "gemini-1.5-pro",
    provider: "google",
    displayName: "Gemini 1.5 Pro",
    contextWindow: 1000000,
    maxTokens: 8192,
    costPer1kInputTokens: 0.00125,
    costPer1kOutputTokens: 0.005,
    supportsStreaming: true,
    recommendedFor: [
      "massive context",
      "long documents",
      "comprehensive analysis",
    ],
    tier: "premium",
  },
  "gemini-1.5-flash": {
    model: "gemini-1.5-flash",
    provider: "google",
    displayName: "Gemini 1.5 Flash",
    contextWindow: 1000000,
    maxTokens: 8192,
    costPer1kInputTokens: 0.000075,
    costPer1kOutputTokens: 0.0003,
    supportsStreaming: true,
    recommendedFor: ["fast generation", "cost-effective", "high volume"],
    tier: "economy",
  },
};

/**
 * Get model configuration by model name
 */
export function getModelConfig(model: AIModel): ModelConfig {
  const config = MODEL_CONFIGS[model];
  if (!config) {
    throw new Error(`Unknown model: ${model}`);
  }
  return config;
}

/**
 * Get all models by provider
 */
export function getModelsByProvider(provider: AIProvider): ModelConfig[] {
  return Object.values(MODEL_CONFIGS).filter((config) => config.provider === provider);
}

/**
 * Get all models by tier
 */
export function getModelsByTier(tier: "premium" | "standard" | "economy"): ModelConfig[] {
  return Object.values(MODEL_CONFIGS).filter((config) => config.tier === tier);
}

/**
 * Intelligent model selection based on criteria
 */
export function selectBestModel(criteria: ModelSelectionCriteria): AIModel {
  let candidates = Object.values(MODEL_CONFIGS);

  // Filter by provider if specified
  if (criteria.provider) {
    candidates = candidates.filter((c) => c.provider === criteria.provider);
  }

  // Filter by quality tier
  switch (criteria.quality) {
    case "economy":
      candidates = candidates.filter((c) => c.tier === "economy");
      break;
    case "balanced":
      candidates = candidates.filter(
        (c) => c.tier === "standard" || c.tier === "economy"
      );
      break;
    case "premium":
      candidates = candidates.filter(
        (c) => c.tier === "premium" || c.tier === "standard"
      );
      break;
  }

  // Task-based selection
  switch (criteria.task) {
    case "simple":
      // Prefer economy models for simple tasks
      candidates.sort((a, b) => {
        const costA = a.costPer1kOutputTokens;
        const costB = b.costPer1kOutputTokens;
        return costA - costB;
      });
      break;

    case "complex":
      // Prefer premium models for complex tasks
      candidates.sort((a, b) => {
        const tierWeight = { premium: 3, standard: 2, economy: 1 };
        return tierWeight[b.tier] - tierWeight[a.tier];
      });
      break;

    case "creative":
      // Prefer GPT-4 or Claude for creative tasks
      candidates.sort((a, b) => {
        const creativeScore = (model: ModelConfig) => {
          if (model.model.startsWith("gpt-4") || model.model.includes("claude")) {
            return 2;
          }
          return 1;
        };
        return creativeScore(b) - creativeScore(a);
      });
      break;

    case "analytical":
      // Prefer Claude or Perplexity for analytical tasks
      candidates.sort((a, b) => {
        const analyticalScore = (model: ModelConfig) => {
          if (model.provider === "anthropic" || model.provider === "perplexity") {
            return 2;
          }
          return 1;
        };
        return analyticalScore(b) - analyticalScore(a);
      });
      break;
  }

  // Filter by max cost if specified
  if (criteria.maxCost !== undefined) {
    candidates = candidates.filter(
      (c) => c.costPer1kOutputTokens <= criteria.maxCost!
    );
  }

  // Return best candidate
  if (candidates.length === 0) {
    // Fallback to GPT-3.5 Turbo if no candidates match
    return "gpt-3.5-turbo";
  }

  return candidates[0].model;
}

/**
 * Get default model for a specific task
 */
export function getDefaultModelForTask(task: string): AIModel {
  const taskMapping: Record<string, AIModel> = {
    "blog-post": "claude-3.5-sonnet",
    "listicle": "gpt-3.5-turbo",
    "how-to-guide": "claude-3-sonnet",
    "product-review": "gpt-4-turbo",
    "comparison": "claude-3.5-sonnet",
    "case-study": "gpt-4-turbo",
    "news-article": "perplexity-sonar",
    "tutorial": "claude-3-sonnet",
    "faq": "gpt-3.5-turbo",
    "landing-page": "gpt-4",
  };

  return taskMapping[task] || "gpt-3.5-turbo";
}

/**
 * Estimate cost for a generation request
 */
export function estimateGenerationCost(
  model: AIModel,
  estimatedInputTokens: number,
  estimatedOutputTokens: number
): number {
  const config = getModelConfig(model);
  const inputCost = (estimatedInputTokens / 1000) * config.costPer1kInputTokens;
  const outputCost = (estimatedOutputTokens / 1000) * config.costPer1kOutputTokens;
  return inputCost + outputCost;
}

/**
 * Get recommended fallback model if primary fails
 */
export function getFallbackModel(primaryModel: AIModel): AIModel {
  const config = getModelConfig(primaryModel);

  // Fallback within same provider first
  const sameProviderModels = getModelsByProvider(config.provider);
  const fallback = sameProviderModels.find(
    (m) => m.model !== primaryModel && m.tier === config.tier
  );

  if (fallback) {
    return fallback.model;
  }

  // Cross-provider fallback by tier
  const sameTierModels = getModelsByTier(config.tier);
  const crossProviderFallback = sameTierModels.find(
    (m) => m.model !== primaryModel && m.provider !== config.provider
  );

  if (crossProviderFallback) {
    return crossProviderFallback.model;
  }

  // Ultimate fallback
  return "gpt-3.5-turbo";
}

/**
 * Check if model supports a specific feature
 */
export function supportsFeature(
  model: AIModel,
  feature: "streaming" | "large-context"
): boolean {
  const config = getModelConfig(model);

  switch (feature) {
    case "streaming":
      return config.supportsStreaming;
    case "large-context":
      return config.contextWindow >= 100000;
    default:
      return false;
  }
}

/**
 * Get all available models
 */
export function getAllModels(): AIModel[] {
  return Object.keys(MODEL_CONFIGS) as AIModel[];
}

/**
 * Validate if model name is supported
 */
export function isValidModel(model: string): model is AIModel {
  return model in MODEL_CONFIGS;
}
