/**
 * AI Services - Main Export
 * Centralized exports for all AI functionality
 */

// Types
export type {
  AIModel,
  AIProvider,
  ContentTemplate,
  GenerationStatus,
  ModelConfig,
  GenerationRequest,
  GenerationResponse,
  PromptVariables,
  PromptTemplate,
  CostCalculation,
  TokenUsage,
  BulkGenerationRequest,
  BulkGenerationResponse,
  AIServiceError,
  RetryConfig,
  ModelSelectionCriteria,
  QualityMetrics,
  EnhancementOptions,
} from "./types";

// Model Configuration
export {
  MODEL_CONFIGS,
  getModelConfig,
  getModelsByProvider,
  getModelsByTier,
  selectBestModel,
  getDefaultModelForTask,
  estimateGenerationCost,
  getFallbackModel,
  supportsFeature,
  getAllModels,
  isValidModel,
} from "./models";

// Prompt Templates
export {
  SYSTEM_PROMPTS,
  PROMPT_TEMPLATES,
  buildPrompt,
  getTemplate,
  getRecommendedModelForTemplate,
  getAllTemplates,
  validateTemplateVariables,
} from "./prompts";

// Cost Calculator
export {
  calculateCost,
  estimateCost,
  calculateBulkCost,
  formatCost,
  formatTokens,
  calculateCacheSavings,
  estimateArticleCost,
  compareCosts,
  calculateContentROI,
  TokenTracker,
  globalTokenTracker,
  COST_ALERTS,
  checkCostAlert,
  selectModelForBudget,
} from "./cost-calculator";

// Token Counter
export {
  estimateTokens,
  estimateConversationTokens,
  fitsInContextWindow,
  truncateToTokenLimit,
  chunkByTokens,
  countMessageTokens,
  optimizePrompt,
  calculateTokenEfficiency,
  TOKEN_ESTIMATES,
  getEstimatedTokensForContentType,
  batchEstimateTokens,
} from "./token-counter";

// Content Generator
export {
  generateContent,
  generateBulk,
  generateStreaming,
  testConnection,
  validateAPIKeys,
} from "./generator";

// Configuration
export {
  loadAIConfig,
  validateEnvironment,
  isProviderAvailable,
  getAvailableProviders,
  printConfigSummary,
  assertValidConfig,
  initializeAIServices,
  aiConfig,
} from "./config";

export type { AIConfig, ValidationResult } from "./config";
