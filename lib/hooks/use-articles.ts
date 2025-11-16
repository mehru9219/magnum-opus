// Custom hooks for article-related Convex queries
// These will be connected to actual Convex queries in Phase 2

export function useArticles() {
  // This will use useQuery(api.articles.listByUser) when Convex is connected
  return {
    articles: [],
    isLoading: false,
    error: null,
  };
}

export function useArticle(id: string) {
  // This will use useQuery(api.articles.getArticle, { id }) when Convex is connected
  return {
    article: null,
    isLoading: false,
    error: null,
  };
}

export function useArticlesByStatus(status: string) {
  // This will use useQuery(api.articles.listByStatus, { status }) when Convex is connected
  return {
    articles: [],
    isLoading: false,
    error: null,
  };
}
