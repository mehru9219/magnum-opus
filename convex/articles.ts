/**
 * Convex Articles Module
 *
 * Mutations and queries for article management in Magnum Opus.
 * Handles article creation, generation, retrieval, and updates.
 *
 * @module convex/articles
 */

// NOTE: This file will need proper imports from convex/_generated once Agent 1 completes schema
// For now, using placeholder types to define the structure

/**
 * Article status enum
 */
export type ArticleStatus =
  | 'queued'       // Waiting for generation
  | 'generating'   // Currently being generated
  | 'checking'     // Running quality checks
  | 'failed'       // Generation or quality check failed
  | 'completed'    // Successfully generated and passed quality checks
  | 'published';   // Published to platforms

/**
 * Article model (matches schema from Agent 1)
 */
export interface Article {
  _id: string;
  _creationTime: number;
  userId: string;
  title: string;
  content: string;
  status: ArticleStatus;
  template: 'comparison' | 'how-to' | 'listicle' | 'problem-solver' | 'ultimate-guide';
  topic: string;
  generatedBy: string; // AI model used (e.g., 'gpt-4', 'claude-3.5-sonnet')
  tokensUsed: number;
  estimatedCost: number; // in USD
  qualityScores?: {
    plagiarism: number;
    readability: number;
    factCheck: number;
    overall: number;
  };
  citations?: string[]; // URLs of citations added
  errorMessage?: string;
  metadata?: {
    tone?: string;
    targetLength?: number;
    audience?: string;
  };
}

/**
 * MUTATIONS
 */

/**
 * Create a new article (queued for generation)
 *
 * This is a Convex mutation.
 */
export const createArticle = async (
  ctx: any, // Will be: MutationCtx from convex/_generated
  args: {
    title: string;
    topic: string;
    template: Article['template'];
    metadata?: Article['metadata'];
  }
): Promise<{ success: boolean; articleId?: string; error?: string }> => {
  try {
    // Get current user (from Clerk auth)
    // const user = await ctx.auth.getUserIdentity();
    // if (!user) {
    //   return { success: false, error: 'User not authenticated' };
    // }

    // Create article in database
    // const articleId = await ctx.db.insert('articles', {
    //   userId: user.subject,
    //   title: args.title,
    //   topic: args.topic,
    //   template: args.template,
    //   content: '',
    //   status: 'queued',
    //   generatedBy: '',
    //   tokensUsed: 0,
    //   estimatedCost: 0,
    //   metadata: args.metadata,
    // });

    // Placeholder return
    return {
      success: true,
      articleId: 'placeholder-id',
    };
  } catch (error) {
    console.error('Failed to create article:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Generate a single article
 *
 * This mutation triggers the generation pipeline.
 * It will be called by frontend, which will then trigger Inngest job for actual generation.
 */
export const generateArticle = async (
  ctx: any,
  args: {
    articleId: string;
    model?: string; // AI model to use (default: gpt-4)
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { articleId, model = 'gpt-4' } = args;

    // Get article
    // const article = await ctx.db.get(articleId);
    // if (!article) {
    //   return { success: false, error: 'Article not found' };
    // }

    // Update status to generating
    // await ctx.db.patch(articleId, { status: 'generating' });

    // Trigger Inngest job for actual generation
    // This will be implemented by Agent 8
    // await ctx.scheduler.runAfter(0, 'inngest/functions/generate-article', {
    //   articleId,
    //   model,
    // });

    return { success: true };
  } catch (error) {
    console.error('Failed to start article generation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Generate multiple articles in bulk
 *
 * Target: 30 articles in 30 minutes
 */
export const generateBulk = async (
  ctx: any,
  args: {
    articles: Array<{
      title: string;
      topic: string;
      template: Article['template'];
      metadata?: Article['metadata'];
    }>;
    model?: string;
  }
): Promise<{ success: boolean; articleIds?: string[]; error?: string }> => {
  try {
    const { articles, model = 'gpt-4' } = args;

    // Validate bulk size
    if (articles.length > 100) {
      return {
        success: false,
        error: 'Bulk generation limited to 100 articles at a time',
      };
    }

    const articleIds: string[] = [];

    // Create all articles in database
    for (const articleData of articles) {
      const result = await createArticle(ctx, articleData);
      if (result.success && result.articleId) {
        articleIds.push(result.articleId);
      }
    }

    // Trigger bulk generation Inngest job
    // Agent 8 will implement: inngest/functions/generate-articles-bulk.ts
    // await ctx.scheduler.runAfter(0, 'inngest/functions/generate-articles-bulk', {
    //   articleIds,
    //   model,
    // });

    return {
      success: true,
      articleIds,
    };
  } catch (error) {
    console.error('Failed to start bulk generation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Update article content
 */
export const updateArticleContent = async (
  ctx: any,
  args: {
    articleId: string;
    content: string;
    citations?: string[];
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Update article in database
    // await ctx.db.patch(args.articleId, {
    //   content: args.content,
    //   citations: args.citations,
    // });

    return { success: true };
  } catch (error) {
    console.error('Failed to update article:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Update article status
 */
export const updateArticleStatus = async (
  ctx: any,
  args: {
    articleId: string;
    status: ArticleStatus;
    errorMessage?: string;
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    // await ctx.db.patch(args.articleId, {
    //   status: args.status,
    //   errorMessage: args.errorMessage,
    // });

    return { success: true };
  } catch (error) {
    console.error('Failed to update article status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Update article quality scores
 */
export const updateQualityScores = async (
  ctx: any,
  args: {
    articleId: string;
    scores: {
      plagiarism: number;
      readability: number;
      factCheck: number;
      overall: number;
    };
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    // await ctx.db.patch(args.articleId, {
    //   qualityScores: args.scores,
    // });

    return { success: true };
  } catch (error) {
    console.error('Failed to update quality scores:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Delete article
 */
export const deleteArticle = async (
  ctx: any,
  args: { articleId: string }
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verify ownership
    // const article = await ctx.db.get(args.articleId);
    // const user = await ctx.auth.getUserIdentity();
    // if (article.userId !== user.subject) {
    //   return { success: false, error: 'Unauthorized' };
    // }

    // Delete article
    // await ctx.db.delete(args.articleId);

    return { success: true };
  } catch (error) {
    console.error('Failed to delete article:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * QUERIES
 */

/**
 * Get single article by ID
 */
export const getArticle = async (
  ctx: any,
  args: { articleId: string }
): Promise<Article | null> => {
  try {
    // const article = await ctx.db.get(args.articleId);
    // return article;

    // Placeholder
    return null;
  } catch (error) {
    console.error('Failed to get article:', error);
    return null;
  }
};

/**
 * List articles by user
 */
export const listArticlesByUser = async (
  ctx: any,
  args: {
    userId?: string; // If not provided, use current user
    status?: ArticleStatus;
    limit?: number;
    offset?: number;
  }
): Promise<Article[]> => {
  try {
    // const user = await ctx.auth.getUserIdentity();
    // const userId = args.userId || user.subject;

    // let query = ctx.db.query('articles').filter(q => q.eq(q.field('userId'), userId));

    // if (args.status) {
    //   query = query.filter(q => q.eq(q.field('status'), args.status));
    // }

    // query = query.order('desc').take(args.limit || 50);

    // if (args.offset) {
    //   query = query.skip(args.offset);
    // }

    // const articles = await query.collect();
    // return articles;

    // Placeholder
    return [];
  } catch (error) {
    console.error('Failed to list articles:', error);
    return [];
  }
};

/**
 * List articles by status
 */
export const listByStatus = async (
  ctx: any,
  args: { status: ArticleStatus; limit?: number }
): Promise<Article[]> => {
  try {
    // const articles = await ctx.db
    //   .query('articles')
    //   .filter(q => q.eq(q.field('status'), args.status))
    //   .order('desc')
    //   .take(args.limit || 50)
    //   .collect();

    // return articles;

    // Placeholder
    return [];
  } catch (error) {
    console.error('Failed to list articles by status:', error);
    return [];
  }
};

/**
 * Get quality scores for an article
 */
export const getQualityScores = async (
  ctx: any,
  args: { articleId: string }
): Promise<Article['qualityScores'] | null> => {
  try {
    // const article = await ctx.db.get(args.articleId);
    // return article?.qualityScores || null;

    // Placeholder
    return null;
  } catch (error) {
    console.error('Failed to get quality scores:', error);
    return null;
  }
};

/**
 * Get article statistics for user
 */
export const getUserArticleStats = async (
  ctx: any,
  args: { userId?: string }
): Promise<{
  total: number;
  byStatus: Record<ArticleStatus, number>;
  averageQuality: number;
  totalTokensUsed: number;
  totalCost: number;
}> => {
  try {
    // const user = await ctx.auth.getUserIdentity();
    // const userId = args.userId || user.subject;

    // const articles = await ctx.db
    //   .query('articles')
    //   .filter(q => q.eq(q.field('userId'), userId))
    //   .collect();

    // Calculate statistics
    // const byStatus = articles.reduce((acc, article) => {
    //   acc[article.status] = (acc[article.status] || 0) + 1;
    //   return acc;
    // }, {} as Record<ArticleStatus, number>);

    // Placeholder
    return {
      total: 0,
      byStatus: {} as Record<ArticleStatus, number>,
      averageQuality: 0,
      totalTokensUsed: 0,
      totalCost: 0,
    };
  } catch (error) {
    console.error('Failed to get article stats:', error);
    throw error;
  }
};

/**
 * INTEGRATION NOTES FOR OTHER AGENTS:
 *
 * Agent 1 (Database): Create schema for 'articles' table with:
 * - All fields from Article interface
 * - Indexes: by_user (userId), by_status (status), by_user_status (userId, status)
 *
 * Agent 2 (AI Services): Provide in lib/ai/models.ts:
 * - generateText(model, prompt, systemPrompt): Promise<string>
 * - estimateTokens(text): number
 * - calculateCost(model, tokens): number
 *
 * Agent 8 (Background Jobs): Create Inngest jobs:
 * - inngest/functions/generate-article.ts - Single article generation
 * - inngest/functions/generate-articles-bulk.ts - Bulk generation (30 in 30min)
 * - These jobs will call the generation logic from convex/generation.ts
 *
 * Agent 7 (Frontend): Create UI components:
 * - ArticleCard to display article with status
 * - GenerationForm to create new articles
 * - BulkUploadForm for bulk generation
 * - QualityScoreDisplay to show quality metrics
 */
