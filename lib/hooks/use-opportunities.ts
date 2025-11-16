// Custom hooks for optimization opportunities Convex queries
// These will be connected to actual Convex queries in Phase 2

export function useOpportunities(priority?: string) {
  // This will use useQuery(api.optimization.getPriorityOpportunities, { priority }) when Convex is connected
  return {
    opportunities: [],
    isLoading: false,
    error: null,
  };
}

export function useOpportunity(id: string) {
  // This will use useQuery(api.optimization.getOpportunity, { id }) when Convex is connected
  return {
    opportunity: null,
    isLoading: false,
    error: null,
  };
}

export function useOpportunityScanHistory() {
  // This will use useQuery(api.optimization.getOpportunityScanHistory) when Convex is connected
  return {
    scans: [],
    isLoading: false,
    error: null,
  };
}
