import { describe, it, expect } from 'vitest'
import { useArticles, useArticle, useArticlesByStatus } from '@/lib/hooks/use-articles'

describe('Article Hooks', () => {
  describe('useArticles', () => {
    it('should return initial state', () => {
      const result = useArticles()
      expect(result).toEqual({
        articles: [],
        isLoading: false,
        error: null,
      })
    })
  })

  describe('useArticle', () => {
    it('should return initial state', () => {
      const result = useArticle('test-id')
      expect(result).toEqual({
        article: null,
        isLoading: false,
        error: null,
      })
    })
  })

  describe('useArticlesByStatus', () => {
    it('should return initial state', () => {
      const result = useArticlesByStatus('completed')
      expect(result).toEqual({
        articles: [],
        isLoading: false,
        error: null,
      })
    })
  })
})
