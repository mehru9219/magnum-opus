import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('px-4', 'py-2')
      expect(result).toBe('px-4 py-2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base-class', false && 'conditional-class', 'always-present')
      expect(result).toBe('base-class always-present')
    })

    it('should merge Tailwind classes without conflicts', () => {
      const result = cn('px-4 py-2', 'px-6')
      expect(result).toBe('py-2 px-6')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'other-class')
      expect(result).toBe('base-class other-class')
    })
  })
})
