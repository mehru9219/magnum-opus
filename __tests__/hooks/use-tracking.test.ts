import { describe, it, expect } from 'vitest'
import { useTrackedBrands, useVisibilityScores, useCompetitorComparison } from '@/lib/hooks/use-tracking'

describe('Tracking Hooks', () => {
  describe('useTrackedBrands', () => {
    it('should return initial state', () => {
      const result = useTrackedBrands()
      expect(result).toEqual({
        brands: [],
        isLoading: false,
        error: null,
      })
    })
  })

  describe('useVisibilityScores', () => {
    it('should return initial state', () => {
      const result = useVisibilityScores('brand-id')
      expect(result).toEqual({
        scores: [],
        isLoading: false,
        error: null,
      })
    })
  })

  describe('useCompetitorComparison', () => {
    it('should return initial state', () => {
      const result = useCompetitorComparison('brand-id')
      expect(result).toEqual({
        comparison: null,
        isLoading: false,
        error: null,
      })
    })
  })
})
