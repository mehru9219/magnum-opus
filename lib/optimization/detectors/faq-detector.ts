/**
 * FAQ Detector
 *
 * Detects opportunities to add FAQ sections to pages based on tracking prompts.
 * Extracts questions from AI visibility tracking and clusters similar questions.
 *
 * Part of Week 5 - Smart Optimization Scanner
 */

/**
 * FAQ Opportunity
 */
export interface FAQOpportunity {
  type: "ADD_FAQ";
  pageUrl: string;
  pageTitle: string;
  priorityScore: number;
  estimatedImpact: "high" | "medium" | "low";
  detectionDetails: {
    rule: "missing_faq_section";
    findings: {
      currentHasFAQ: boolean;
      relatedQuestions: string[];
      questionClusters: Array<{
        theme: string;
        questions: string[];
      }>;
      topRankingPage: boolean;
    };
    suggestedFix: {
      faqQuestions: Array<{
        question: string;
        suggestedAnswer?: string;
      }>;
      addSchemaMarkup: boolean;
    };
  };
}

/**
 * Extract questions from tracking prompts
 */
function extractQuestionsFromPrompts(prompts: string[]): string[] {
  const questions: string[] = [];

  const questionPatterns = [
    /what\s+is\s+.+\?/i,
    /how\s+(?:does|do|to)\s+.+\?/i,
    /why\s+.+\?/i,
    /when\s+.+\?/i,
    /where\s+.+\?/i,
    /who\s+.+\?/i,
    /which\s+.+\?/i,
    /can\s+.+\?/i,
    /should\s+.+\?/i,
  ];

  prompts.forEach((prompt) => {
    questionPatterns.forEach((pattern) => {
      const match = prompt.match(pattern);
      if (match) {
        questions.push(match[0]);
      }
    });

    // If prompt is a question (ends with ?)
    if (prompt.trim().endsWith("?")) {
      questions.push(prompt.trim());
    }
  });

  // Deduplicate
  return Array.from(new Set(questions));
}

/**
 * Cluster similar questions by theme
 */
function clusterQuestions(questions: string[]): Array<{ theme: string; questions: string[] }> {
  // Simplified clustering based on question keywords
  // In production, use more sophisticated NLP (embeddings, cosine similarity)

  const clusters: Map<string, string[]> = new Map();

  questions.forEach((question) => {
    const lowerQuestion = question.toLowerCase();

    // Identify theme based on keywords
    let theme = "general";

    if (lowerQuestion.includes("what is") || lowerQuestion.includes("definition")) {
      theme = "definitions";
    } else if (lowerQuestion.includes("how to") || lowerQuestion.includes("how do")) {
      theme = "how-to";
    } else if (lowerQuestion.includes("why") || lowerQuestion.includes("reason")) {
      theme = "reasons";
    } else if (lowerQuestion.includes("when") || lowerQuestion.includes("time")) {
      theme = "timing";
    } else if (lowerQuestion.includes("where") || lowerQuestion.includes("location")) {
      theme = "location";
    } else if (lowerQuestion.includes("cost") || lowerQuestion.includes("price") || lowerQuestion.includes("expensive")) {
      theme = "pricing";
    } else if (lowerQuestion.includes("best") || lowerQuestion.includes("top")) {
      theme = "recommendations";
    } else if (lowerQuestion.includes("vs") || lowerQuestion.includes("difference")) {
      theme = "comparisons";
    }

    if (!clusters.has(theme)) {
      clusters.set(theme, []);
    }

    clusters.get(theme)!.push(question);
  });

  return Array.from(clusters.entries()).map(([theme, questions]) => ({
    theme,
    questions,
  }));
}

/**
 * Detect FAQ opportunities
 *
 * @param article - Published article to analyze
 * @param trackingPrompts - Prompts used for AI visibility tracking
 * @param pageRanking - Optional ranking data (is this a top-performing page?)
 * @returns Array of FAQ opportunities detected
 */
export async function detectFAQOpportunities(
  article: any, // Doc<"articles">
  trackingPrompts: string[],
  pageRanking?: { isTopPage: boolean; ranking?: number }
): Promise<FAQOpportunity[]> {
  const opportunities: FAQOpportunity[] = [];

  if (!article.publishedUrl) {
    return opportunities;
  }

  // Check if article already has FAQ
  const currentHasFAQ = article.hasFAQ || false;

  // If already has FAQ, skip
  if (currentHasFAQ) {
    return opportunities;
  }

  // Extract questions from tracking prompts
  const relatedQuestions = extractQuestionsFromPrompts(trackingPrompts);

  // If no questions found, no opportunity
  if (relatedQuestions.length < 3) {
    return opportunities;
  }

  // Cluster questions by theme
  const questionClusters = clusterQuestions(relatedQuestions);

  // Calculate priority score
  let priorityScore = 60; // Base score

  // More questions = higher priority
  priorityScore += Math.min(relatedQuestions.length * 2, 20);

  // Top-ranking page = higher priority
  const isTopPage = pageRanking?.isTopPage || false;
  if (isTopPage) {
    priorityScore += 15;
  }

  // Multiple clusters = higher priority (diverse questions)
  if (questionClusters.length >= 3) {
    priorityScore += 10;
  }

  // Cap at 100
  priorityScore = Math.min(priorityScore, 100);

  // Determine estimated impact
  let estimatedImpact: "high" | "medium" | "low" = "medium";
  if (isTopPage && relatedQuestions.length >= 5) {
    estimatedImpact = "high";
  } else if (relatedQuestions.length <= 3) {
    estimatedImpact = "low";
  }

  // Select top questions for FAQ (max 5-7)
  const topQuestions = relatedQuestions.slice(0, 7);

  // Create opportunity
  opportunities.push({
    type: "ADD_FAQ",
    pageUrl: article.publishedUrl,
    pageTitle: article.title || "Untitled",
    priorityScore,
    estimatedImpact,
    detectionDetails: {
      rule: "missing_faq_section",
      findings: {
        currentHasFAQ,
        relatedQuestions,
        questionClusters,
        topRankingPage: isTopPage,
      },
      suggestedFix: {
        faqQuestions: topQuestions.map((q) => ({
          question: q,
          // Answer will be generated by AI in auto-fix step
          suggestedAnswer: undefined,
        })),
        addSchemaMarkup: true, // Always add FAQPage schema
      },
    },
  });

  return opportunities;
}

/**
 * Batch detect FAQ opportunities for multiple articles
 */
export async function batchDetectFAQOpportunities(
  articles: any[],
  trackingData: Map<string, { prompts: string[]; isTopPage: boolean }>
): Promise<FAQOpportunity[]> {
  const allOpportunities: FAQOpportunity[] = [];

  for (const article of articles) {
    const articleTracking = trackingData.get(article.publishedUrl || article._id);

    if (articleTracking) {
      const opportunities = await detectFAQOpportunities(
        article,
        articleTracking.prompts,
        { isTopPage: articleTracking.isTopPage }
      );
      allOpportunities.push(...opportunities);
    }
  }

  return allOpportunities;
}

/**
 * Generate FAQ schema markup (JSON-LD)
 */
export function generateFAQSchema(
  faqItems: Array<{ question: string; answer: string }>
): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return JSON.stringify(schema, null, 2);
}
