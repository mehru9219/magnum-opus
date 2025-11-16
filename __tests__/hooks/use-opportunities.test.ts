import { describe, it, expect } from 'vitest'
import { useOpportunities, useOpportunity, useOpportunityScanHistory } from '@/lib/hooks/use-opportunities'

describe('Opportunities Hooks', () => {
  describe('useOpportunities', () => {
    it('should return initial state', () => {
      const result = useOpportunities()
      expect(result).toEqual({
        opportunities: [],
        isLoading: false,
        error: null,
      })
    })

    it('should return initial state with priority filter', () => {
      const result = useOpportunities('quick-win')
      expect(result).toEqual({
        opportunities: [],
        isLoading: false,
        error: null,
      })
    })
  })

  describe('useOpportunity', () => {
    it('should return initial state', () => {
      const result = useOpportunity('opportunity-id')
      expect(result).toEqual({
        opportunity: null,
        isLoading: false,
        error: null,
      })
    })
  })

  describe('useOpportunityScanHistory', () => {
    it('should return initial state', () => {
      const result = useOpportunityScanHistory()
      expect(result).toEqual({
        scans: [],
        isLoading: false,
        error: null,
      })
    })
  })
})
