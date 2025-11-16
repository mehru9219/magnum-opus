import { describe, it, expect } from 'vitest'
import { usePlatformConnections, usePublishHistory, usePublishResults } from '@/lib/hooks/use-publishing'

describe('Publishing Hooks', () => {
  describe('usePlatformConnections', () => {
    it('should return initial state', () => {
      const result = usePlatformConnections()
      expect(result).toEqual({
        connections: [],
        isLoading: false,
        error: null,
      })
    })
  })

  describe('usePublishHistory', () => {
    it('should return initial state', () => {
      const result = usePublishHistory()
      expect(result).toEqual({
        history: [],
        isLoading: false,
        error: null,
      })
    })
  })

  describe('usePublishResults', () => {
    it('should return initial state', () => {
      const result = usePublishResults('job-id')
      expect(result).toEqual({
        results: [],
        isLoading: false,
        error: null,
      })
    })
  })
})
