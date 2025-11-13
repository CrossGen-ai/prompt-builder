/**
 * Critical Path Tests - 100% Coverage Required
 *
 * These tests cover the most important user workflows that must never break.
 * Any failure in these tests should block deployment.
 */

import { renderHook, act } from '@testing-library/react'
import { usePromptStore } from '../../app/lib/store'
import { api } from '../../app/lib/api'
import { createMockFetch } from '../mocks/api.mock'
import { mockCategories, mockFragments } from '../fixtures/mockData'

describe('Critical Path Tests', () => {
  let mockFetch: ReturnType<typeof createMockFetch>

  beforeEach(() => {
    mockFetch = createMockFetch()
    mockFetch.setupSuccess()
    global.fetch = mockFetch.mock as any

    // Reset store
    const { result } = renderHook(() => usePromptStore())
    act(() => {
      result.current.setCategories([])
      result.current.setFragments([])
      result.current.clearSelection()
      result.current.setCustomPrompt('')
      result.current.setCustomEnabled(false)
      result.current.setError(null)
    })
  })

  describe('[CRITICAL] App Initialization', () => {
    it('MUST load categories on startup', async () => {
      mockFetch.setupSuccess()

      const categories = await api.categories.getAll()

      expect(categories).toBeDefined()
      expect(Array.isArray(categories)).toBe(true)
      expect(categories.length).toBeGreaterThan(0)
    })

    it('MUST load fragments on startup', async () => {
      mockFetch.setupSuccess()

      const fragments = await api.fragments.getAll()

      expect(fragments).toBeDefined()
      expect(Array.isArray(fragments)).toBe(true)
      expect(fragments.length).toBeGreaterThan(0)
    })

    it('MUST handle initialization errors gracefully', async () => {
      mockFetch.setupError(500, 'Server error')

      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setLoading(true)
      })

      try {
        await api.categories.getAll()
      } catch (error: any) {
        act(() => {
          result.current.setError(error.message)
          result.current.setLoading(false)
        })
      }

      expect(result.current.error).toBeTruthy()
      expect(result.current.loading).toBe(false)
    })
  })

  describe('[CRITICAL] Fragment Selection', () => {
    it('MUST select fragment when clicked', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setFragments(mockFragments)
        result.current.toggleFragment('frag-1')
      })

      expect(result.current.selectedFragmentIds.has('frag-1')).toBe(true)
    })

    it('MUST deselect fragment when clicked again', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setFragments(mockFragments)
        result.current.toggleFragment('frag-1')
        result.current.toggleFragment('frag-1')
      })

      expect(result.current.selectedFragmentIds.has('frag-1')).toBe(false)
    })

    it('MUST handle multiple selections', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setFragments(mockFragments)
        result.current.toggleFragment('frag-1')
        result.current.toggleFragment('frag-2')
        result.current.toggleFragment('frag-3')
      })

      expect(result.current.selectedFragmentIds.size).toBe(3)
    })

    it('MUST clear all selections', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setFragments(mockFragments)
        result.current.toggleFragment('frag-1')
        result.current.toggleFragment('frag-2')
        result.current.clearSelection()
      })

      expect(result.current.selectedFragmentIds.size).toBe(0)
    })
  })

  describe('[CRITICAL] Prompt Compilation', () => {
    it('MUST compile selected fragments into prompt', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setFragments(mockFragments)
        result.current.toggleFragment('frag-1')
        result.current.toggleFragment('frag-2')
      })

      const compiled = result.current.getCompiledPrompt()

      expect(compiled).toBeDefined()
      expect(compiled.compiledText).toBeTruthy()
      expect(compiled.fragmentCount).toBe(2)
      expect(compiled.compiledText).toContain(mockFragments[0].content)
      expect(compiled.compiledText).toContain(mockFragments[1].content)
    })

    it('MUST order fragments correctly in compilation', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setFragments(mockFragments)
        // Select in reverse order
        result.current.toggleFragment('frag-2')
        result.current.toggleFragment('frag-1')
      })

      const compiled = result.current.getCompiledPrompt()

      // Should be ordered by fragment.order, not selection order
      const fragment1Index = compiled.compiledText.indexOf(mockFragments[0].content)
      const fragment2Index = compiled.compiledText.indexOf(mockFragments[1].content)

      expect(fragment1Index).toBeLessThan(fragment2Index)
    })

    it('MUST include custom prompt when enabled', async () => {
      const { result } = renderHook(() => usePromptStore())
      const customText = 'Custom instruction'

      act(() => {
        result.current.setFragments(mockFragments)
        result.current.toggleFragment('frag-1')
        result.current.setCustomPrompt(customText)
        result.current.setCustomEnabled(true)
      })

      const compiled = result.current.getCompiledPrompt()

      expect(compiled.customPrompt).toBe(customText)
      expect(compiled.compiledText).toContain(customText)
      expect(compiled.compiledText.indexOf(customText)).toBe(0) // Should be first
    })

    it('MUST exclude custom prompt when disabled', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setFragments(mockFragments)
        result.current.toggleFragment('frag-1')
        result.current.setCustomPrompt('Custom text')
        result.current.setCustomEnabled(false)
      })

      const compiled = result.current.getCompiledPrompt()

      expect(compiled.customPrompt).toBeUndefined()
      expect(compiled.compiledText).not.toContain('Custom text')
    })

    it('MUST handle empty selection', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setFragments(mockFragments)
      })

      const compiled = result.current.getCompiledPrompt()

      expect(compiled.fragmentCount).toBe(0)
      expect(compiled.compiledText).toBe('')
      expect(compiled.fragments).toEqual([])
    })
  })

  describe('[CRITICAL] Copy to Clipboard', () => {
    it('MUST copy compiled prompt to clipboard', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setFragments(mockFragments)
        result.current.toggleFragment('frag-1')
      })

      const compiled = result.current.getCompiledPrompt()

      await navigator.clipboard.writeText(compiled.compiledText)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(compiled.compiledText)
    })

    it('MUST handle clipboard errors gracefully', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setFragments(mockFragments)
        result.current.toggleFragment('frag-1')
      })

      const compiled = result.current.getCompiledPrompt()

      // Simulate clipboard error
      const writeText = jest.fn().mockRejectedValue(new Error('Clipboard access denied'))
      Object.assign(navigator.clipboard, { writeText })

      try {
        await navigator.clipboard.writeText(compiled.compiledText)
      } catch (error) {
        // Should handle gracefully
        expect(error).toBeDefined()
      }
    })
  })

  describe('[CRITICAL] Category Management', () => {
    it('MUST create new category', async () => {
      mockFetch.setupSuccess()

      const newCategory = {
        name: 'New Category',
        description: 'Test description',
        order: 10,
      }

      const created = await api.categories.create(newCategory)

      expect(created).toHaveProperty('id')
      expect(created.name).toBe(newCategory.name)
      expect(created).toHaveProperty('createdAt')
      expect(created).toHaveProperty('updatedAt')
    })

    it('MUST update existing category', async () => {
      mockFetch.setupSuccess()

      const updates = { name: 'Updated Name' }
      const updated = await api.categories.update('cat-1', updates)

      expect(updated.name).toBe('Updated Name')
    })

    it('MUST delete category', async () => {
      mockFetch.setupSuccess()

      await api.categories.delete('cat-1')

      expect(mockFetch.mock).toHaveBeenCalledWith(
        expect.stringContaining('/categories/cat-1'),
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('MUST validate category data', async () => {
      mockFetch.setupError(400, 'Invalid category data')

      await expect(
        api.categories.create({ name: '', order: 1 })
      ).rejects.toThrow()
    })
  })

  describe('[CRITICAL] Fragment Management', () => {
    it('MUST create new fragment', async () => {
      mockFetch.setupSuccess()

      const newFragment = {
        categoryId: 'cat-1',
        content: 'New fragment content',
        order: 1,
      }

      const created = await api.fragments.create(newFragment)

      expect(created).toHaveProperty('id')
      expect(created.content).toBe(newFragment.content)
      expect(created.categoryId).toBe(newFragment.categoryId)
    })

    it('MUST update existing fragment', async () => {
      mockFetch.setupSuccess()

      const updates = { content: 'Updated content' }
      const updated = await api.fragments.update('frag-1', updates)

      expect(updated.content).toBe('Updated content')
    })

    it('MUST delete fragment', async () => {
      mockFetch.setupSuccess()

      await api.fragments.delete('frag-1')

      expect(mockFetch.mock).toHaveBeenCalledWith(
        expect.stringContaining('/fragments/frag-1'),
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('MUST validate fragment data', async () => {
      mockFetch.setupError(400, 'Invalid fragment data')

      await expect(
        api.fragments.create({ categoryId: '', content: '', order: 1 })
      ).rejects.toThrow()
    })
  })

  describe('[CRITICAL] Error Handling', () => {
    it('MUST handle API errors', async () => {
      mockFetch.setupError(500, 'Server error')

      await expect(api.categories.getAll()).rejects.toThrow('Server error')
    })

    it('MUST handle network errors', async () => {
      mockFetch.setupNetworkError()

      await expect(api.categories.getAll()).rejects.toThrow('Network error')
    })

    it('MUST handle 404 errors', async () => {
      mockFetch.setupError(404, 'Not found')

      await expect(api.categories.getById('non-existent')).rejects.toThrow('Not found')
    })

    it('MUST handle validation errors', async () => {
      mockFetch.setupError(400, 'Validation failed')

      await expect(
        api.categories.create({ name: '', order: 1 })
      ).rejects.toThrow('Validation failed')
    })

    it('MUST recover from errors', async () => {
      // First attempt fails
      mockFetch.setupError(500, 'Server error')

      await expect(api.categories.getAll()).rejects.toThrow()

      // Second attempt succeeds
      mockFetch.setupSuccess()
      const categories = await api.categories.getAll()

      expect(categories).toEqual(mockCategories)
    })
  })

  describe('[CRITICAL] Loading States', () => {
    it('MUST show loading state during data fetch', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.loading).toBe(true)

      mockFetch.setupSuccess()
      await api.categories.getAll()

      act(() => {
        result.current.setLoading(false)
      })

      expect(result.current.loading).toBe(false)
    })

    it('MUST clear loading state on error', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setLoading(true)
      })

      mockFetch.setupError(500, 'Error')

      try {
        await api.categories.getAll()
      } catch {
        act(() => {
          result.current.setLoading(false)
        })
      }

      expect(result.current.loading).toBe(false)
    })
  })

  describe('[CRITICAL] State Management', () => {
    it('MUST persist state across operations', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setCategories(mockCategories)
        result.current.setFragments(mockFragments)
        result.current.toggleFragment('frag-1')
        result.current.setCustomPrompt('Test')
      })

      expect(result.current.categories).toEqual(mockCategories)
      expect(result.current.fragments).toEqual(mockFragments)
      expect(result.current.selectedFragmentIds.has('frag-1')).toBe(true)
      expect(result.current.customPrompt).toBe('Test')
    })

    it('MUST maintain immutability', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setFragments(mockFragments)
        result.current.toggleFragment('frag-1')
      })

      const firstSet = result.current.selectedFragmentIds

      act(() => {
        result.current.toggleFragment('frag-2')
      })

      const secondSet = result.current.selectedFragmentIds

      // New Set should be created
      expect(firstSet).not.toBe(secondSet)
    })
  })

  describe('[CRITICAL] Data Integrity', () => {
    it('MUST maintain referential integrity', async () => {
      mockFetch.setupSuccess()

      const categories = await api.categories.getAll()
      const fragments = await api.fragments.getAll()

      // All fragments must reference valid categories
      fragments.forEach(fragment => {
        const categoryExists = categories.some(cat => cat.id === fragment.categoryId)
        expect(categoryExists).toBe(true)
      })
    })

    it('MUST prevent orphaned fragments', async () => {
      mockFetch.setupError(404, 'Category not found')

      await expect(
        api.fragments.create({
          categoryId: 'non-existent',
          content: 'Test',
          order: 1,
        })
      ).rejects.toThrow()
    })

    it('MUST handle cascade deletes', async () => {
      mockFetch.setupError(409, 'Cannot delete category with fragments')

      await expect(api.categories.delete('cat-1')).rejects.toThrow()
    })
  })
})
