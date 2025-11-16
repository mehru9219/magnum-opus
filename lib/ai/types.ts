/**
 * AI Services Type Definitions
 * Core types for multi-model AI content generation
 */

/**
 * Supported AI Models
 */
export type AIModel =
  | "gpt-4"
  | "gpt-4-turbo"
  | "gpt-3.5-turbo"
  | "claude-3.5-sonnet"
  | "claude-3-opus"
  | "claude-3-sonnet"
  | "claude-3-haiku"
  | "perplexity-sonar"
  | "perplexity-sonar-pro"
  | "gemini-1.5-pro"
  | "gemini-1.5-flash";

/**
 * AI Model Provider
 */
export type AIProvider = "openai" | "anthropic" | "perplexity" | "google";

/**
 * Content Template Types
 */
export type ContentTemplate =
  | "blog-post"
  | "listicle"
  | "how-to-guide"
  | "product-review"
  | "comparison"
  | "case-study"
  | "news-article"
  | "tutorial"
  | "faq"
  | "landing-page";

/**
 * Content Generation Status
 */
export type GenerationStatus =
  | "queued"
  | "generating"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * Model Configuration
 */
export interface ModelConfig {
  model: AIModel;
  provider: AIProvider;
  displayName: string;
  contextWindow: number;
  maxTokens: number;
  costPer1kInputTokens: number; // in USD
  costPer1kOutputTokens: number; // in USD
  supportsStreaming: boolean;
  recommendedFor: string[];
  tier: "premium" | "standard" | "economy";
}

/**
 * Generation Request Parameters
 */
export interface GenerationRequest {
  model: AIModel;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  stream?: boolean;
}

/**
 * Generation Response
 */
export interface GenerationResponse {
  content: string;
  model: AIModel;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  cost: number; // in USD
  finishReason: "stop" | "length" | "content_filter" | "error";
  cached?: boolean;
  latencyMs: number;
}

/**
 * Prompt Template Variables
 */
export interface PromptVariables {
  topic?: string;
  keywords?: string[];
  targetLength?: number;
  tone?: "professional" | "casual" | "friendly" | "authoritative" | "conversational";
  audience?: string;
  template?: ContentTemplate;
  additionalContext?: string;
  includeStats?: boolean;
  includeCitations?: boolean;
  includeQuotes?: boolean;
  seoOptimized?: boolean;
  geoOptimized?: boolean;
  [key: string]: any;
}

/**
 * Prompt Template Definition
 */
export interface PromptTemplate {
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  requiredVariables: string[];
  optionalVariables: string[];
  recommendedModels: AIModel[];
  estimatedTokens: number;
}

/**
 * Cost Calculation Result
 */
export interface CostCalculation {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  model: AIModel;
}

/**
 * Cache Entry
 */
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  ttl: number; // seconds
  createdAt: number;
  expiresAt: number;
}

/**
 * AI Service Error
 */
export interface AIServiceError {
  code: string;
  message: string;
  provider: AIProvider;
  model: AIModel;
  retryable: boolean;
  originalError?: any;
}

/**
 * Retry Configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
}

/**
 * Model Selection Criteria
 */
export interface ModelSelectionCriteria {
  task: "simple" | "complex" | "creative" | "analytical";
  maxCost?: number;
  maxLatency?: number;
  quality: "economy" | "balanced" | "premium";
  provider?: AIProvider;
}

/**
 * Token Usage Tracking
 */
export interface TokenUsage {
  userId: string;
  model: AIModel;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  timestamp: number;
  operation: string;
}

/**
 * Bulk Generation Request
 */
export interface BulkGenerationRequest {
  requests: GenerationRequest[];
  concurrency?: number;
  stopOnError?: boolean;
  priority?: "high" | "normal" | "low";
}

/**
 * Bulk Generation Response
 */
export interface BulkGenerationResponse {
  results: (GenerationResponse | AIServiceError)[];
  totalTokensUsed: number;
  totalCost: number;
  successCount: number;
  failureCount: number;
  durationMs: number;
}

/**
 * Content Quality Metrics
 */
export interface QualityMetrics {
  readabilityScore: number; // 0-100
  plagiarismScore: number; // 0-100 (lower is better)
  seoScore: number; // 0-100
  geoScore: number; // 0-100
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  keywordDensity: { [keyword: string]: number };
  hasCitations: boolean;
  hasStatistics: boolean;
  hasQuotes: boolean;
}

/**
 * Content Enhancement Options
 */
export interface EnhancementOptions {
  addCitations?: boolean;
  addStatistics?: boolean;
  addQuotes?: boolean;
  improveReadability?: boolean;
  optimizeForSEO?: boolean;
  optimizeForGEO?: boolean;
  targetKeywords?: string[];
}
