/**
 * AI Services Configuration & Environment Validation
 * Validates API keys and environment setup
 */

import type { AIProvider } from "./types";

/**
 * Environment configuration
 */
export interface AIConfig {
  openai: {
    apiKey: string;
    enabled: boolean;
  };
  anthropic: {
    apiKey: string;
    enabled: boolean;
  };
  perplexity: {
    apiKey: string;
    enabled: boolean;
  };
  google: {
    apiKey: string;
    enabled: boolean;
  };
  redis: {
    url?: string;
    token?: string;
    enabled: boolean;
  };
  cache: {
    enabled: boolean;
    ttl: number;
  };
  retry: {
    maxRetries: number;
    enableFallback: boolean;
  };
  monitoring: {
    enabled: boolean;
    logLevel: "debug" | "info" | "warn" | "error";
  };
}

/**
 * Load and validate environment configuration
 */
export function loadAIConfig(): AIConfig {
  return {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      enabled: !!process.env.OPENAI_API_KEY,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || "",
      enabled: !!process.env.ANTHROPIC_API_KEY,
    },
    perplexity: {
      apiKey: process.env.PERPLEXITY_API_KEY || "",
      enabled: !!process.env.PERPLEXITY_API_KEY,
    },
    google: {
      apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
      enabled: !!process.env.GOOGLE_GEMINI_API_KEY,
    },
    redis: {
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN,
      enabled: !!(
        process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN
      ),
    },
    cache: {
      enabled: process.env.ENABLE_AI_CACHE !== "false",
      ttl: parseInt(process.env.AI_CACHE_TTL || "86400", 10),
    },
    retry: {
      maxRetries: parseInt(process.env.AI_MAX_RETRIES || "3", 10),
      enableFallback: process.env.AI_ENABLE_FALLBACK !== "false",
    },
    monitoring: {
      enabled: process.env.NODE_ENV === "production",
      logLevel: (process.env.AI_LOG_LEVEL as any) || "info",
    },
  };
}

/**
 * Validate API keys are configured
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  providersAvailable: AIProvider[];
  providersMissing: AIProvider[];
}

export function validateEnvironment(): ValidationResult {
  const config = loadAIConfig();
  const errors: string[] = [];
  const warnings: string[] = [];
  const providersAvailable: AIProvider[] = [];
  const providersMissing: AIProvider[] = [];

  // Check each provider
  if (config.openai.enabled) {
    providersAvailable.push("openai");
  } else {
    providersMissing.push("openai");
    warnings.push("OPENAI_API_KEY not configured - OpenAI models unavailable");
  }

  if (config.anthropic.enabled) {
    providersAvailable.push("anthropic");
  } else {
    providersMissing.push("anthropic");
    warnings.push(
      "ANTHROPIC_API_KEY not configured - Claude models unavailable"
    );
  }

  if (config.perplexity.enabled) {
    providersAvailable.push("perplexity");
  } else {
    providersMissing.push("perplexity");
    warnings.push(
      "PERPLEXITY_API_KEY not configured - Perplexity models unavailable"
    );
  }

  if (config.google.enabled) {
    providersAvailable.push("google");
  } else {
    providersMissing.push("google");
    warnings.push(
      "GOOGLE_GEMINI_API_KEY not configured - Gemini models unavailable"
    );
  }

  // At least one provider must be available
  if (providersAvailable.length === 0) {
    errors.push(
      "No AI providers configured - at least one API key is required"
    );
  }

  // Check Redis configuration (optional but recommended)
  if (!config.redis.enabled) {
    warnings.push(
      "Redis not configured - caching disabled (higher costs, slower performance)"
    );
  }

  // Production-specific checks
  if (process.env.NODE_ENV === "production") {
    if (!config.redis.enabled) {
      errors.push("Redis is required in production for caching");
    }

    if (providersAvailable.length < 2) {
      warnings.push(
        "Only one AI provider configured - consider adding fallback providers"
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    providersAvailable,
    providersMissing,
  };
}

/**
 * Check if a specific provider is available
 */
export function isProviderAvailable(provider: AIProvider): boolean {
  const config = loadAIConfig();

  switch (provider) {
    case "openai":
      return config.openai.enabled;
    case "anthropic":
      return config.anthropic.enabled;
    case "perplexity":
      return config.perplexity.enabled;
    case "google":
      return config.google.enabled;
    default:
      return false;
  }
}

/**
 * Get available providers
 */
export function getAvailableProviders(): AIProvider[] {
  const validation = validateEnvironment();
  return validation.providersAvailable;
}

/**
 * Get API key for provider (internal use only)
 */
export function getProviderAPIKey(provider: AIProvider): string | null {
  const config = loadAIConfig();

  switch (provider) {
    case "openai":
      return config.openai.apiKey || null;
    case "anthropic":
      return config.anthropic.apiKey || null;
    case "perplexity":
      return config.perplexity.apiKey || null;
    case "google":
      return config.google.apiKey || null;
    default:
      return null;
  }
}

/**
 * Print configuration summary to console
 */
export function printConfigSummary(): void {
  const validation = validateEnvironment();
  const config = loadAIConfig();

  console.log("\n=== AI Services Configuration ===\n");

  console.log("Available Providers:");
  validation.providersAvailable.forEach((provider) => {
    console.log(`  ✓ ${provider}`);
  });

  if (validation.providersMissing.length > 0) {
    console.log("\nMissing Providers:");
    validation.providersMissing.forEach((provider) => {
      console.log(`  ✗ ${provider}`);
    });
  }

  console.log("\nCache Configuration:");
  console.log(`  Enabled: ${config.cache.enabled}`);
  console.log(`  Redis: ${config.redis.enabled ? "Connected" : "Disabled"}`);
  console.log(`  TTL: ${config.cache.ttl}s`);

  console.log("\nRetry Configuration:");
  console.log(`  Max Retries: ${config.retry.maxRetries}`);
  console.log(`  Fallback: ${config.retry.enableFallback ? "Enabled" : "Disabled"}`);

  if (validation.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    validation.warnings.forEach((warning) => {
      console.log(`  - ${warning}`);
    });
  }

  if (validation.errors.length > 0) {
    console.log("\n❌ Errors:");
    validation.errors.forEach((error) => {
      console.log(`  - ${error}`);
    });
  }

  if (validation.valid) {
    console.log("\n✅ Configuration valid\n");
  } else {
    console.log("\n❌ Configuration invalid - please fix errors above\n");
  }
}

/**
 * Assert configuration is valid (throws if not)
 */
export function assertValidConfig(): void {
  const validation = validateEnvironment();

  if (!validation.valid) {
    const errorMessage = [
      "AI Services configuration invalid:",
      ...validation.errors,
      "",
      "Please configure the required environment variables:",
      "- At least one AI provider API key (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.)",
      validation.errors.includes("Redis is required in production")
        ? "- UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN (required in production)"
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    throw new Error(errorMessage);
  }
}

/**
 * Development mode helper - validates and prints config on startup
 */
export function initializeAIServices(): void {
  if (process.env.NODE_ENV !== "production") {
    printConfigSummary();
  } else {
    // In production, just validate silently
    const validation = validateEnvironment();
    if (!validation.valid) {
      console.error("AI Services configuration errors:", validation.errors);
      throw new Error("Invalid AI Services configuration");
    }
  }
}

/**
 * Export config singleton
 */
export const aiConfig = loadAIConfig();
