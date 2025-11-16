/**
 * AI Services Usage Examples
 * Practical examples for common use cases
 */

import {
  generateContent,
  generateBulk,
  buildPrompt,
  selectBestModel,
  estimateArticleCost,
  calculateCost,
  globalTokenTracker,
} from "./index";
import { getCachedAIResponse, cacheAIResponse } from "../cache/redis";

/**
 * Example 1: Generate a simple blog post
 */
export async function example1_SimpleBlogPost() {
  console.log("Example 1: Simple Blog Post Generation\n");

  const response = await generateContent({
    model: "gpt-4",
    prompt: "Write a 500-word blog post about the benefits of TypeScript",
    systemPrompt: "You are an expert technical writer",
    temperature: 0.7,
    maxTokens: 1500,
  });

  console.log("Generated Content:");
  console.log(response.content);
  console.log(`\nCost: $${response.cost.toFixed(4)}`);
  console.log(`Tokens Used: ${response.tokensUsed.total}`);
  console.log(`Latency: ${response.latencyMs}ms`);
}

/**
 * Example 2: Use template-based generation
 */
export async function example2_TemplateBasedGeneration() {
  console.log("Example 2: Template-Based Generation\n");

  // Build prompt from template
  const { systemPrompt, userPrompt } = buildPrompt("listicle", {
    topic: "10 Best Practices for Next.js Development",
    listCount: 10,
    targetLength: 1200,
    tone: "professional",
    audience: "web developers",
    keywords: ["Next.js", "React", "performance"],
    includeStats: true,
    seoOptimized: true,
  });

  console.log("Generated Prompt:");
  console.log(userPrompt.substring(0, 200) + "...\n");

  // Generate with recommended model for this template
  const response = await generateContent({
    model: "claude-3.5-sonnet",
    prompt: userPrompt,
    systemPrompt,
  });

  console.log("Article generated successfully!");
  console.log(`Cost: $${response.cost.toFixed(4)}`);
  console.log(`Word count: ~${response.content.split(/\s+/).length} words`);
}

/**
 * Example 3: Cost-optimized generation
 */
export async function example3_CostOptimization() {
  console.log("Example 3: Cost Optimization\n");

  const topic = "Introduction to Quantum Computing";
  const targetWords = 2000;

  // Compare costs across models
  console.log("Cost comparison for 2000-word article:");
  const models = ["gpt-4", "gpt-4-turbo", "claude-3.5-sonnet", "gpt-3.5-turbo"];

  models.forEach((model) => {
    const estimate = estimateArticleCost(model as any, targetWords);
    console.log(`${model}: $${estimate.totalCost.toFixed(4)}`);
  });

  // Select best model for budget
  const bestModel = selectBestModel({
    task: "complex",
    quality: "balanced",
    maxCost: 0.15,
  });

  console.log(`\nSelected model: ${bestModel}`);

  // Generate with cost tracking
  const response = await generateContent({
    model: bestModel,
    prompt: `Write a comprehensive 2000-word article about ${topic}`,
    systemPrompt: "You are a science writer specializing in emerging technologies",
  });

  console.log(`\nActual cost: $${response.cost.toFixed(4)}`);
  console.log(`Tokens: ${response.tokensUsed.total}`);
}

/**
 * Example 4: Bulk generation with concurrency
 */
export async function example4_BulkGeneration() {
  console.log("Example 4: Bulk Generation\n");

  const topics = [
    "Artificial Intelligence in Healthcare",
    "The Future of Renewable Energy",
    "Blockchain Beyond Cryptocurrency",
    "5G Technology and IoT",
    "Cybersecurity Best Practices",
  ];

  console.log(`Generating ${topics.length} articles...\n`);

  const requests = topics.map((topic) => ({
    model: "gpt-3.5-turbo" as const,
    prompt: `Write a concise 300-word article about: ${topic}`,
    systemPrompt: "You are a technology journalist",
    maxTokens: 500,
  }));

  const startTime = Date.now();

  const results = await generateBulk({
    requests,
    concurrency: 3, // Process 3 at a time
    stopOnError: false,
  });

  const duration = Date.now() - startTime;

  console.log("Bulk Generation Results:");
  console.log(`Success: ${results.successCount}/${topics.length}`);
  console.log(`Failed: ${results.failureCount}`);
  console.log(`Total Cost: $${results.totalCost.toFixed(4)}`);
  console.log(`Total Tokens: ${results.totalTokensUsed}`);
  console.log(`Duration: ${duration}ms`);
  console.log(`Average: ${(duration / topics.length).toFixed(0)}ms per article`);
}

/**
 * Example 5: Caching for cost reduction
 */
export async function example5_Caching() {
  console.log("Example 5: Caching for Cost Reduction\n");

  const prompt = "Explain the concept of serverless computing in 200 words";
  const model = "gpt-4";

  // First request - not cached
  console.log("First request (no cache):");
  let cached = await getCachedAIResponse(prompt, model);

  if (!cached) {
    const response = await generateContent({ model, prompt });
    await cacheAIResponse(prompt, model, response.content);

    console.log(`Generated fresh content`);
    console.log(`Cost: $${response.cost.toFixed(4)}`);
    console.log(`Latency: ${response.latencyMs}ms\n`);
  }

  // Second request - cached
  console.log("Second request (cached):");
  const startTime = Date.now();
  cached = await getCachedAIResponse(prompt, model);

  if (cached) {
    const latency = Date.now() - startTime;
    console.log(`Retrieved from cache`);
    console.log(`Cost: $0.0000 (100% savings!)`);
    console.log(`Latency: ${latency}ms (much faster!)`);
  }
}

/**
 * Example 6: Smart model selection
 */
export async function example6_SmartModelSelection() {
  console.log("Example 6: Smart Model Selection\n");

  const scenarios = [
    { task: "simple" as const, quality: "economy" as const },
    { task: "complex" as const, quality: "balanced" as const },
    { task: "creative" as const, quality: "premium" as const },
    { task: "analytical" as const, quality: "premium" as const },
  ];

  console.log("Recommended models for different scenarios:");

  scenarios.forEach((criteria) => {
    const model = selectBestModel(criteria);
    console.log(`${criteria.task} + ${criteria.quality} → ${model}`);
  });
}

/**
 * Example 7: Usage tracking and limits
 */
export async function example7_UsageTracking() {
  console.log("Example 7: Usage Tracking\n");

  const userId = "user_demo_123";

  // Simulate some usage
  console.log("Simulating content generation...");

  for (let i = 0; i < 3; i++) {
    const response = await generateContent({
      model: "gpt-3.5-turbo",
      prompt: `Write a short paragraph about topic ${i + 1}`,
      maxTokens: 200,
    });

    // Track usage
    globalTokenTracker.track({
      userId,
      model: response.model,
      inputTokens: response.tokensUsed.input,
      outputTokens: response.tokensUsed.output,
      totalTokens: response.tokensUsed.total,
      cost: response.cost,
      operation: `demo-generation-${i + 1}`,
    });

    console.log(`Article ${i + 1}: ${response.tokensUsed.total} tokens, $${response.cost.toFixed(4)}`);
  }

  // Check total usage
  const usage = globalTokenTracker.getTotalUsage(userId);
  console.log(`\nTotal Usage for ${userId}:`);
  console.log(`Total Tokens: ${usage.totalTokens}`);
  console.log(`Total Cost: $${usage.totalCost.toFixed(4)}`);

  // Check against limit
  const limit = globalTokenTracker.checkLimit(
    userId,
    10000, // 10K tokens limit
    3600000 // 1 hour window
  );

  console.log(`\nLimit Check:`);
  console.log(`Within Limit: ${limit.withinLimit}`);
  console.log(`Used: ${limit.used}/${limit.used + limit.remaining}`);
  console.log(`Remaining: ${limit.remaining} tokens`);
}

/**
 * Example 8: Error handling and retry
 */
export async function example8_ErrorHandling() {
  console.log("Example 8: Error Handling and Retry\n");

  try {
    // This will retry on transient errors
    const response = await generateContent(
      {
        model: "gpt-4",
        prompt: "Generate content...",
      },
      {
        retryConfig: {
          maxRetries: 3,
          initialDelayMs: 1000,
          maxDelayMs: 10000,
          backoffMultiplier: 2,
        },
        enableFallback: true, // Auto-fallback to Claude if GPT-4 fails
      }
    );

    console.log("Generation successful!");
    console.log(`Model used: ${response.model}`);
  } catch (error: any) {
    console.error("Generation failed after retries:");
    console.error(`Error: ${error.message}`);
    console.error(`Retryable: ${error.retryable}`);
    console.error(`Provider: ${error.provider}`);
  }
}

/**
 * Example 9: Multi-model content generation
 */
export async function example9_MultiModelGeneration() {
  console.log("Example 9: Multi-Model Generation\n");

  const prompt = "Explain machine learning in simple terms (150 words)";

  const models: Array<any> = [
    "gpt-4",
    "claude-3.5-sonnet",
    "perplexity-sonar",
    "gemini-1.5-flash",
  ];

  console.log("Generating same prompt with different models:\n");

  for (const model of models) {
    try {
      const response = await generateContent({
        model,
        prompt,
        maxTokens: 300,
      });

      console.log(`${model}:`);
      console.log(`- Cost: $${response.cost.toFixed(4)}`);
      console.log(`- Tokens: ${response.tokensUsed.total}`);
      console.log(`- Latency: ${response.latencyMs}ms`);
      console.log(`- Content length: ${response.content.length} chars\n`);
    } catch (error: any) {
      console.log(`${model}: Failed - ${error.message}\n`);
    }
  }
}

/**
 * Example 10: Complete workflow (template → generate → cache → track)
 */
export async function example10_CompleteWorkflow() {
  console.log("Example 10: Complete Workflow\n");

  const userId = "user_workflow_demo";

  // Step 1: Build prompt from template
  console.log("Step 1: Building prompt from template...");
  const { systemPrompt, userPrompt } = buildPrompt("blog-post", {
    topic: "The Impact of AI on Software Development",
    targetLength: 1500,
    tone: "professional",
    audience: "software engineers",
    keywords: ["AI", "automation", "productivity"],
    seoOptimized: true,
    geoOptimized: true,
    includeStats: true,
  });

  // Step 2: Select optimal model
  console.log("Step 2: Selecting optimal model...");
  const model = selectBestModel({
    task: "complex",
    quality: "premium",
    maxCost: 0.20,
  });
  console.log(`Selected: ${model}\n`);

  // Step 3: Check cache
  console.log("Step 3: Checking cache...");
  let content = await getCachedAIResponse(userPrompt, model);

  if (content) {
    console.log("Cache hit! Using cached content.\n");
  } else {
    // Step 4: Generate content
    console.log("Step 4: Generating content...");
    const response = await generateContent({
      model,
      prompt: userPrompt,
      systemPrompt,
    });

    content = response.content;

    // Step 5: Cache response
    console.log("Step 5: Caching response...");
    await cacheAIResponse(userPrompt, model, content);

    // Step 6: Track usage
    console.log("Step 6: Tracking usage...");
    globalTokenTracker.track({
      userId,
      model: response.model,
      inputTokens: response.tokensUsed.input,
      outputTokens: response.tokensUsed.output,
      totalTokens: response.tokensUsed.total,
      cost: response.cost,
      operation: "blog-post-generation",
    });

    console.log(`\nGeneration complete!`);
    console.log(`Cost: $${response.cost.toFixed(4)}`);
    console.log(`Tokens: ${response.tokensUsed.total}`);
    console.log(`Word count: ${content.split(/\s+/).length}`);
  }

  // Step 7: Check user limits
  const usage = globalTokenTracker.getTotalUsage(userId);
  console.log(`\nUser total usage: ${usage.totalTokens} tokens, $${usage.totalCost.toFixed(4)}`);
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  const examples = [
    example1_SimpleBlogPost,
    example2_TemplateBasedGeneration,
    example3_CostOptimization,
    example4_BulkGeneration,
    example5_Caching,
    example6_SmartModelSelection,
    example7_UsageTracking,
    example8_ErrorHandling,
    example9_MultiModelGeneration,
    example10_CompleteWorkflow,
  ];

  for (const example of examples) {
    try {
      await example();
      console.log("\n" + "=".repeat(60) + "\n");
    } catch (error) {
      console.error(`Example failed: ${error}`);
    }
  }
}

// Uncomment to run examples:
// runAllExamples().catch(console.error);
