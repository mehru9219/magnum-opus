/**
 * AI Cost Calculator
 * Track and calculate costs for AI API usage
 */

import type { AIModel, CostCalculation, TokenUsage } from "./types";
import { getModelConfig } from "./models";

/**
 * Calculate cost for a completed generation
 */
export function calculateCost(
  model: AIModel,
  inputTokens: number,
  outputTokens: number
): CostCalculation {
  const config = getModelConfig(model);

  const inputCost = (inputTokens / 1000) * config.costPer1kInputTokens;
  const outputCost = (outputTokens / 1000) * config.costPer1kOutputTokens;
  const totalCost = inputCost + outputCost;
  const totalTokens = inputTokens + outputTokens;

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    inputCost,
    outputCost,
    totalCost,
    model,
  };
}

/**
 * Estimate cost before generation
 */
export function estimateCost(
  model: AIModel,
  estimatedInputTokens: number,
  estimatedOutputTokens: number
): CostCalculation {
  return calculateCost(model, estimatedInputTokens, estimatedOutputTokens);
}

/**
 * Calculate total cost for multiple generations
 */
export function calculateBulkCost(calculations: CostCalculation[]): {
  totalTokens: number;
  totalCost: number;
  breakdown: { [model: string]: { tokens: number; cost: number } };
} {
  const breakdown: { [model: string]: { tokens: number; cost: number } } = {};
  let totalTokens = 0;
  let totalCost = 0;

  calculations.forEach((calc) => {
    totalTokens += calc.totalTokens;
    totalCost += calc.totalCost;

    if (!breakdown[calc.model]) {
      breakdown[calc.model] = { tokens: 0, cost: 0 };
    }

    breakdown[calc.model].tokens += calc.totalTokens;
    breakdown[calc.model].cost += calc.totalCost;
  });

  return { totalTokens, totalCost, breakdown };
}

/**
 * Format cost for display (USD)
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${(cost * 100).toFixed(4)}¢`;
  }
  return `$${cost.toFixed(4)}`;
}

/**
 * Format token count for display
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(2)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(2)}K`;
  }
  return tokens.toString();
}

/**
 * Calculate cost savings from caching
 */
export function calculateCacheSavings(
  model: AIModel,
  cachedTokens: number,
  originalTokens: number
): {
  tokensSaved: number;
  costSaved: number;
  savingsPercentage: number;
} {
  const config = getModelConfig(model);

  const tokensSaved = originalTokens - cachedTokens;
  const costSaved =
    (tokensSaved / 1000) *
    (config.costPer1kInputTokens + config.costPer1kOutputTokens) /
    2;
  const savingsPercentage = (tokensSaved / originalTokens) * 100;

  return {
    tokensSaved,
    costSaved,
    savingsPercentage,
  };
}

/**
 * Get cost per article estimate
 */
export function estimateArticleCost(
  model: AIModel,
  targetWordCount: number
): CostCalculation {
  // Rough estimate: 1 token ≈ 0.75 words
  // Input: prompt + context (~500 tokens average)
  // Output: target word count / 0.75
  const estimatedInputTokens = 500;
  const estimatedOutputTokens = Math.ceil(targetWordCount / 0.75);

  return calculateCost(model, estimatedInputTokens, estimatedOutputTokens);
}

/**
 * Compare costs across models for same task
 */
export function compareCosts(
  models: AIModel[],
  estimatedInputTokens: number,
  estimatedOutputTokens: number
): Array<CostCalculation & { model: AIModel }> {
  return models
    .map((model) => ({
      ...calculateCost(model, estimatedInputTokens, estimatedOutputTokens),
      model,
    }))
    .sort((a, b) => a.totalCost - b.totalCost);
}

/**
 * Calculate ROI for content generation
 */
export function calculateContentROI(params: {
  generationCost: number;
  estimatedTrafficValue: number;
  conversionRate?: number;
  averageOrderValue?: number;
}): {
  roi: number;
  roiPercentage: number;
  netProfit: number;
} {
  const { generationCost, estimatedTrafficValue, conversionRate, averageOrderValue } = params;

  let totalValue = estimatedTrafficValue;

  // If conversion data provided, calculate potential revenue
  if (conversionRate && averageOrderValue) {
    const estimatedRevenue = estimatedTrafficValue * conversionRate * averageOrderValue;
    totalValue = estimatedRevenue;
  }

  const netProfit = totalValue - generationCost;
  const roi = generationCost > 0 ? netProfit / generationCost : 0;
  const roiPercentage = roi * 100;

  return {
    roi,
    roiPercentage,
    netProfit,
  };
}

/**
 * Track token usage for billing/limits
 */
export class TokenTracker {
  private usage: TokenUsage[] = [];

  track(usage: Omit<TokenUsage, "timestamp">): void {
    this.usage.push({
      ...usage,
      timestamp: Date.now(),
    });
  }

  getTotalUsage(userId: string, timeRangeMs?: number): {
    totalTokens: number;
    totalCost: number;
    byModel: { [model: string]: { tokens: number; cost: number } };
  } {
    const cutoff = timeRangeMs ? Date.now() - timeRangeMs : 0;
    const filtered = this.usage.filter(
      (u) => u.userId === userId && u.timestamp >= cutoff
    );

    const byModel: { [model: string]: { tokens: number; cost: number } } = {};
    let totalTokens = 0;
    let totalCost = 0;

    filtered.forEach((u) => {
      totalTokens += u.totalTokens;
      totalCost += u.cost;

      if (!byModel[u.model]) {
        byModel[u.model] = { tokens: 0, cost: 0 };
      }

      byModel[u.model].tokens += u.totalTokens;
      byModel[u.model].cost += u.cost;
    });

    return { totalTokens, totalCost, byModel };
  }

  checkLimit(
    userId: string,
    limitTokens: number,
    timeRangeMs: number
  ): {
    withinLimit: boolean;
    used: number;
    remaining: number;
    percentage: number;
  } {
    const { totalTokens } = this.getTotalUsage(userId, timeRangeMs);
    const remaining = Math.max(0, limitTokens - totalTokens);
    const percentage = (totalTokens / limitTokens) * 100;

    return {
      withinLimit: totalTokens <= limitTokens,
      used: totalTokens,
      remaining,
      percentage,
    };
  }

  getUsageHistory(userId: string, limit = 100): TokenUsage[] {
    return this.usage
      .filter((u) => u.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  clear(userId?: string): void {
    if (userId) {
      this.usage = this.usage.filter((u) => u.userId !== userId);
    } else {
      this.usage = [];
    }
  }
}

/**
 * Cost alert thresholds
 */
export const COST_ALERTS = {
  WARNING_THRESHOLD: 0.5, // $0.50 per article
  CRITICAL_THRESHOLD: 1.0, // $1.00 per article
  DAILY_BUDGET_WARNING: 50, // $50/day
  DAILY_BUDGET_CRITICAL: 100, // $100/day
  MONTHLY_BUDGET_WARNING: 1000, // $1000/month
  MONTHLY_BUDGET_CRITICAL: 2000, // $2000/month
} as const;

/**
 * Check if cost exceeds alert threshold
 */
export function checkCostAlert(cost: number, type: "article" | "daily" | "monthly"): {
  level: "ok" | "warning" | "critical";
  message: string;
} {
  let warningThreshold: number;
  let criticalThreshold: number;

  switch (type) {
    case "article":
      warningThreshold = COST_ALERTS.WARNING_THRESHOLD;
      criticalThreshold = COST_ALERTS.CRITICAL_THRESHOLD;
      break;
    case "daily":
      warningThreshold = COST_ALERTS.DAILY_BUDGET_WARNING;
      criticalThreshold = COST_ALERTS.DAILY_BUDGET_CRITICAL;
      break;
    case "monthly":
      warningThreshold = COST_ALERTS.MONTHLY_BUDGET_WARNING;
      criticalThreshold = COST_ALERTS.MONTHLY_BUDGET_CRITICAL;
      break;
  }

  if (cost >= criticalThreshold) {
    return {
      level: "critical",
      message: `Cost ${formatCost(cost)} exceeds critical threshold ${formatCost(criticalThreshold)}`,
    };
  }

  if (cost >= warningThreshold) {
    return {
      level: "warning",
      message: `Cost ${formatCost(cost)} exceeds warning threshold ${formatCost(warningThreshold)}`,
    };
  }

  return {
    level: "ok",
    message: `Cost ${formatCost(cost)} is within acceptable range`,
  };
}

/**
 * Optimize model selection for budget
 */
export function selectModelForBudget(
  maxCostPerArticle: number,
  targetWordCount: number,
  quality: "economy" | "balanced" | "premium"
): AIModel | null {
  const models: AIModel[] =
    quality === "economy"
      ? ["gpt-3.5-turbo", "claude-3-haiku", "gemini-1.5-flash"]
      : quality === "balanced"
      ? ["claude-3-sonnet", "gpt-4-turbo", "gemini-1.5-pro"]
      : ["gpt-4", "claude-3.5-sonnet", "claude-3-opus"];

  for (const model of models) {
    const estimate = estimateArticleCost(model, targetWordCount);
    if (estimate.totalCost <= maxCostPerArticle) {
      return model;
    }
  }

  return null; // No model fits budget
}

/**
 * Global token tracker instance
 */
export const globalTokenTracker = new TokenTracker();
