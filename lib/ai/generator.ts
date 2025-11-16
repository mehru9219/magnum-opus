/**
 * AI Content Generator
 * Main interface for generating content with AI models
 * Includes retry logic, error handling, and caching
 */

import type {
  AIModel,
  GenerationRequest,
  GenerationResponse,
  AIServiceError,
  RetryConfig,
  BulkGenerationRequest,
  BulkGenerationResponse,
} from "./types";
import { getModelConfig, getFallbackModel } from "./models";
import { calculateCost } from "./cost-calculator";
import { estimateTokens } from "./token-counter";

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableStatusCodes: [429, 500, 502, 503, 504],
};

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Create AI service error
 */
function createAIError(
  model: AIModel,
  message: string,
  originalError?: any
): AIServiceError {
  const config = getModelConfig(model);

  return {
    code: originalError?.code || "GENERATION_ERROR",
    message,
    provider: config.provider,
    model,
    retryable: isRetryableError(originalError),
    originalError,
  };
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;

  const status = error.status || error.statusCode;
  if (status && DEFAULT_RETRY_CONFIG.retryableStatusCodes.includes(status)) {
    return true;
  }

  // Check for rate limit errors
  if (
    error.message?.includes("rate limit") ||
    error.message?.includes("too many requests")
  ) {
    return true;
  }

  // Check for timeout errors
  if (
    error.message?.includes("timeout") ||
    error.code === "ETIMEDOUT" ||
    error.code === "ECONNABORTED"
  ) {
    return true;
  }

  return false;
}

/**
 * Generate content with OpenAI
 */
async function generateWithOpenAI(request: GenerationRequest): Promise<GenerationResponse> {
  const config = getModelConfig(request.model);
  const startTime = Date.now();

  try {
    // This would use the actual OpenAI SDK in production
    // For now, this is a placeholder that shows the structure
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: [
          ...(request.systemPrompt
            ? [{ role: "system", content: request.systemPrompt }]
            : []),
          { role: "user", content: request.prompt },
        ],
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? config.maxTokens,
        top_p: request.topP,
        frequency_penalty: request.frequencyPenalty,
        presence_penalty: request.presencePenalty,
        stop: request.stopSequences,
        stream: request.stream ?? false,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    const usage = data.usage;

    const tokensUsed = {
      input: usage?.prompt_tokens || 0,
      output: usage?.completion_tokens || 0,
      total: usage?.total_tokens || 0,
    };

    const cost = calculateCost(
      request.model,
      tokensUsed.input,
      tokensUsed.output
    ).totalCost;

    return {
      content,
      model: request.model,
      tokensUsed,
      cost,
      finishReason: data.choices[0]?.finish_reason || "stop",
      cached: false,
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    throw createAIError(request.model, `OpenAI generation failed`, error);
  }
}

/**
 * Generate content with Anthropic Claude
 */
async function generateWithAnthropic(
  request: GenerationRequest
): Promise<GenerationResponse> {
  const config = getModelConfig(request.model);
  const startTime = Date.now();

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: request.model,
        messages: [{ role: "user", content: request.prompt }],
        system: request.systemPrompt,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? config.maxTokens,
        top_p: request.topP,
        stop_sequences: request.stopSequences,
        stream: request.stream ?? false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || "";
    const usage = data.usage;

    const tokensUsed = {
      input: usage?.input_tokens || 0,
      output: usage?.output_tokens || 0,
      total: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
    };

    const cost = calculateCost(
      request.model,
      tokensUsed.input,
      tokensUsed.output
    ).totalCost;

    return {
      content,
      model: request.model,
      tokensUsed,
      cost,
      finishReason: data.stop_reason || "stop",
      cached: false,
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    throw createAIError(request.model, `Anthropic generation failed`, error);
  }
}

/**
 * Generate content with Perplexity
 */
async function generateWithPerplexity(
  request: GenerationRequest
): Promise<GenerationResponse> {
  const config = getModelConfig(request.model);
  const startTime = Date.now();

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: [
          ...(request.systemPrompt
            ? [{ role: "system", content: request.systemPrompt }]
            : []),
          { role: "user", content: request.prompt },
        ],
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? config.maxTokens,
        top_p: request.topP,
        stream: request.stream ?? false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    const usage = data.usage;

    const tokensUsed = {
      input: usage?.prompt_tokens || estimateTokens(request.prompt),
      output: usage?.completion_tokens || estimateTokens(content),
      total: usage?.total_tokens || estimateTokens(request.prompt + content),
    };

    const cost = calculateCost(
      request.model,
      tokensUsed.input,
      tokensUsed.output
    ).totalCost;

    return {
      content,
      model: request.model,
      tokensUsed,
      cost,
      finishReason: data.choices[0]?.finish_reason || "stop",
      cached: false,
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    throw createAIError(request.model, `Perplexity generation failed`, error);
  }
}

/**
 * Generate content with Google Gemini
 */
async function generateWithGemini(
  request: GenerationRequest
): Promise<GenerationResponse> {
  const config = getModelConfig(request.model);
  const startTime = Date.now();

  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: request.systemPrompt
                    ? `${request.systemPrompt}\n\n${request.prompt}`
                    : request.prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: request.temperature ?? 0.7,
            maxOutputTokens: request.maxTokens ?? config.maxTokens,
            topP: request.topP,
            stopSequences: request.stopSequences,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const usage = data.usageMetadata;

    const tokensUsed = {
      input: usage?.promptTokenCount || estimateTokens(request.prompt),
      output: usage?.candidatesTokenCount || estimateTokens(content),
      total: usage?.totalTokenCount || estimateTokens(request.prompt + content),
    };

    const cost = calculateCost(
      request.model,
      tokensUsed.input,
      tokensUsed.output
    ).totalCost;

    return {
      content,
      model: request.model,
      tokensUsed,
      cost,
      finishReason: data.candidates?.[0]?.finishReason?.toLowerCase() || "stop",
      cached: false,
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    throw createAIError(request.model, `Gemini generation failed`, error);
  }
}

/**
 * Route request to appropriate provider
 */
async function routeToProvider(
  request: GenerationRequest
): Promise<GenerationResponse> {
  const config = getModelConfig(request.model);

  switch (config.provider) {
    case "openai":
      return generateWithOpenAI(request);
    case "anthropic":
      return generateWithAnthropic(request);
    case "perplexity":
      return generateWithPerplexity(request);
    case "google":
      return generateWithGemini(request);
    default:
      throw createAIError(
        request.model,
        `Unsupported provider: ${config.provider}`
      );
  }
}

/**
 * Generate content with automatic retry and fallback
 */
export async function generateContent(
  request: GenerationRequest,
  options?: {
    retryConfig?: Partial<RetryConfig>;
    enableFallback?: boolean;
  }
): Promise<GenerationResponse> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...options?.retryConfig };
  let lastError: AIServiceError | null = null;

  // Try primary model with retries
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await routeToProvider(request);
    } catch (error) {
      lastError = error as AIServiceError;

      if (!lastError.retryable || attempt === retryConfig.maxRetries) {
        break;
      }

      // Wait before retry
      const delay = calculateBackoffDelay(attempt, retryConfig);
      console.warn(
        `Generation failed (attempt ${attempt + 1}/${retryConfig.maxRetries + 1}), retrying in ${delay}ms...`
      );
      await sleep(delay);
    }
  }

  // Try fallback model if enabled
  if (options?.enableFallback) {
    const fallbackModel = getFallbackModel(request.model);
    console.warn(
      `Primary model ${request.model} failed, trying fallback ${fallbackModel}`
    );

    try {
      return await routeToProvider({ ...request, model: fallbackModel });
    } catch (fallbackError) {
      console.error("Fallback model also failed:", fallbackError);
    }
  }

  // All attempts failed
  throw lastError || createAIError(request.model, "Generation failed");
}

/**
 * Generate content in bulk with concurrency control
 */
export async function generateBulk(
  bulkRequest: BulkGenerationRequest
): Promise<BulkGenerationResponse> {
  const startTime = Date.now();
  const { requests, concurrency = 5, stopOnError = false } = bulkRequest;

  const results: (GenerationResponse | AIServiceError)[] = [];
  let successCount = 0;
  let failureCount = 0;
  let totalTokensUsed = 0;
  let totalCost = 0;

  // Process in batches for concurrency control
  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency);

    const batchPromises = batch.map((request) =>
      generateContent(request, { enableFallback: true })
        .then((response) => {
          successCount++;
          totalTokensUsed += response.tokensUsed.total;
          totalCost += response.cost;
          return response;
        })
        .catch((error) => {
          failureCount++;
          if (stopOnError) {
            throw error;
          }
          return error as AIServiceError;
        })
    );

    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    } catch (error) {
      // stopOnError was triggered
      throw error;
    }
  }

  return {
    results,
    totalTokensUsed,
    totalCost,
    successCount,
    failureCount,
    durationMs: Date.now() - startTime,
  };
}

/**
 * Generate with streaming support (placeholder for future implementation)
 */
export async function generateStreaming(
  request: GenerationRequest,
  onChunk: (chunk: string) => void
): Promise<GenerationResponse> {
  // TODO: Implement streaming for supported models
  // For now, fall back to non-streaming
  const response = await generateContent({ ...request, stream: false });
  onChunk(response.content);
  return response;
}

/**
 * Test connection to AI provider
 */
export async function testConnection(model: AIModel): Promise<{
  success: boolean;
  latencyMs: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const response = await generateContent({
      model,
      prompt: "Say 'OK' if you can read this.",
      maxTokens: 10,
    });

    return {
      success: true,
      latencyMs: response.latencyMs,
    };
  } catch (error) {
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      error: (error as AIServiceError).message,
    };
  }
}

/**
 * Validate API keys are configured
 */
export function validateAPIKeys(): {
  valid: boolean;
  missing: string[];
} {
  const required = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
    GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  return {
    valid: missing.length === 0,
    missing,
  };
}
