// Custom hooks for tracking-related Convex queries
// These will be connected to actual Convex queries in Phase 2

export function useTrackedBrands() {
  // This will use useQuery(api.tracking.getTrackedBrands) when Convex is connected
  return {
    brands: [],
    isLoading: false,
    error: null,
  };
}

export function useVisibilityScores(brandId: string) {
  // This will use useQuery(api.tracking.getVisibilityScores, { brandId }) when Convex is connected
  return {
    scores: [],
    isLoading: false,
    error: null,
  };
}

export function useCompetitorComparison(brandId: string) {
  // This will use useQuery(api.tracking.getCompetitorComparison, { brandId }) when Convex is connected
  return {
    comparison: null,
    isLoading: false,
    error: null,
  };
}
