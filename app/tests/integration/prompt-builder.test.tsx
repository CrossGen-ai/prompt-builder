import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePromptStore } from '@/lib/store'
import { api } from '@/lib/api'
import { createMockFetch } from '../mocks/api.mock'
import { mockCategories, mockPromptFragments } from '../fixtures/mockData'

// Mock the API module
// Mock removed - using direct mock

describe('Prompt Builder Integration Tests', () => {
  let mockFetch: ReturnType<typeof createMockFetch>

  beforeEach(() => {
    mockFetch = createMockFetch()
    mockFetch.setupSuccess()
    global.fetch = mockFetch.mock as any

    // Reset store
    const store = usePromptStore.getState()
    store.setCategories([])
    store.setPromptFragments([])
    store.clearSelection()
    store.setCustomPrompt('')
    store.setCustomEnabled(false)
    store.setError(null)
    store.setLoading(false)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Workflow - Category to Prompt', () => {
    it('should load categories and promptFragments, then compile prompt', async () => {
      const store = usePromptStore.getState()

      // Step 1: Load categories
      mockFetch.setupSuccess()
      const categories = await api.categories.getAll()
      store.setCategories(categories)

      expect(store.categories).toHaveLength(3)

      // Step 2: Load promptFragments
      const promptFragments = await api.promptFragments.getAll()
      store.setPromptFragments(promptFragments)

      expect(store.promptFragments).toHaveLength(5)

      // Step 3: Select promptFragments from different categories
      store.togglePromptFragment('frag-1') // System Prompts
      store.togglePromptFragment('frag-3') // Code Guidelines

      // Step 4: Compile prompt
      const compiled = store.getCompiledPrompt()

      expect(compiled.promptFragmentCount).toBe(2)
      expect(compiled.compiledText).toContain(mockPromptFragments[0].content)
      expect(compiled.compiledText).toContain(mockPromptFragments[2].content)
    })

    it('should handle full CRUD cycle for categories', async () => {
      mockFetch.setupSuccess()

      // Create category
      const newCategory = {
        name: 'New Category',
        description: 'Test category',
        order: 4,
      }

      const created = await api.categories.create(newCategory)
      expect(created).toHaveProperty('id')
      expect(created.name).toBe(newCategory.name)

      // Update category
      const updated = await api.categories.update(created.id, {
        name: 'Updated Category',
      })
      expect(updated.name).toBe('Updated Category')

      // Delete category
      await api.categories.delete(created.id)
      expect(mockFetch.mock).toHaveBeenCalledWith(
        expect.stringContaining(`/categories/${created.id}`),
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('should handle full CRUD cycle for promptFragments', async () => {
      mockFetch.setupSuccess()

      // Create promptFragment
      const newPromptFragment = {
        categoryId: 'cat-1',
        content: 'New promptFragment content',
        order: 1,
      }

      const created = await api.promptFragments.create(newPromptFragment)
      expect(created).toHaveProperty('id')
      expect(created.content).toBe(newPromptFragment.content)

      // Update promptFragment
      const updated = await api.promptFragments.update(created.id, {
        content: 'Updated content',
      })
      expect(updated.content).toBe('Updated content')

      // Delete promptFragment
      await api.promptFragments.delete(created.id)
      expect(mockFetch.mock).toHaveBeenCalledWith(
        expect.stringContaining(`/promptFragments/${created.id}`),
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('Custom Prompt Integration', () => {
    it('should add custom prompt to compilation', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      const promptFragments = await api.promptFragments.getAll()
      store.setPromptFragments(promptFragments)

      // Select promptFragment
      store.togglePromptFragment('frag-1')

      // Add custom prompt
      const customText = 'Custom instruction at the top'
      store.setCustomPrompt(customText)
      store.setCustomEnabled(true)

      // Compile
      const compiled = store.getCompiledPrompt()

      expect(compiled.customPrompt).toBe(customText)
      expect(compiled.compiledText).toStartWith(customText)
      expect(compiled.compiledText).toContain(mockPromptFragments[0].content)
    })

    it('should toggle custom prompt on/off', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      const promptFragments = await api.promptFragments.getAll()
      store.setPromptFragments(promptFragments)

      store.togglePromptFragment('frag-1')
      store.setCustomPrompt('Custom text')

      // With custom enabled
      store.setCustomEnabled(true)
      let compiled = store.getCompiledPrompt()
      expect(compiled.customPrompt).toBe('Custom text')

      // With custom disabled
      store.setCustomEnabled(false)
      compiled = store.getCompiledPrompt()
      expect(compiled.customPrompt).toBeUndefined()
    })
  })

  describe('Multi-Category Selection', () => {
    it('should select promptFragments from multiple categories', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      const promptFragments = await api.promptFragments.getAll()
      store.setPromptFragments(promptFragments)

      // Select from cat-1
      store.togglePromptFragment('frag-1')
      store.togglePromptFragment('frag-2')

      // Select from cat-2
      store.togglePromptFragment('frag-3')

      // Select from cat-3
      store.togglePromptFragment('frag-5')

      const compiled = store.getCompiledPrompt()

      expect(compiled.promptFragmentCount).toBe(4)
      expect(compiled.promptFragments.map(f => f.categoryId)).toEqual(
        expect.arrayContaining(['cat-1', 'cat-2', 'cat-3'])
      )
    })

    it('should maintain promptFragment order within compilation', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      const promptFragments = await api.promptFragments.getAll()
      store.setPromptFragments(promptFragments)

      // Select in reverse order
      store.togglePromptFragment('frag-3')
      store.togglePromptFragment('frag-1')
      store.togglePromptFragment('frag-2')

      const compiled = store.getCompiledPrompt()

      // Should be ordered by promptFragment.order, not selection order
      expect(compiled.promptFragments[0].id).toBe('frag-1')
      expect(compiled.promptFragments[1].id).toBe('frag-2')
      expect(compiled.promptFragments[2].id).toBe('frag-3')
    })
  })

  describe('Error Recovery', () => {
    it('should handle API errors during category loading', async () => {
      mockFetch.setupError(500, 'Server error')

      const store = usePromptStore.getState()
      store.setLoading(true)

      try {
        await api.categories.getAll()
      } catch (error: any) {
        store.setError(error.message)
        store.setLoading(false)
      }

      expect(store.loading).toBe(false)
      expect(store.error).toBe('Server error')
    })

    it('should handle API errors during promptFragment creation', async () => {
      mockFetch.setupError(400, 'Invalid data')

      try {
        await api.promptFragments.create({
          categoryId: '',
          content: '',
          order: 1,
        })
      } catch (error: any) {
        expect(error.message).toBe('Invalid data')
      }
    })

    it('should recover from network errors', async () => {
      mockFetch.setupNetworkError()

      const store = usePromptStore.getState()

      try {
        await api.categories.getAll()
      } catch (error: any) {
        store.setError('Network error')
      }

      expect(store.error).toBe('Network error')

      // Recovery: Clear error and retry
      mockFetch.setupSuccess()
      store.setError(null)

      const categories = await api.categories.getAll()
      expect(categories).toEqual(mockCategories)
      expect(store.error).toBe(null)
    })
  })

  describe('Loading States', () => {
    it('should track loading state during data fetching', async () => {
      const store = usePromptStore.getState()

      store.setLoading(true)
      expect(store.loading).toBe(true)

      mockFetch.setupSuccess()
      await api.categories.getAll()

      store.setLoading(false)
      expect(store.loading).toBe(false)
    })

    it('should handle concurrent loading operations', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()

      store.setLoading(true)

      const [categories, promptFragments] = await Promise.all([
        api.categories.getAll(),
        api.promptFragments.getAll(),
      ])

      store.setCategories(categories)
      store.setPromptFragments(promptFragments)
      store.setLoading(false)

      expect(store.categories).toHaveLength(3)
      expect(store.promptFragments).toHaveLength(5)
      expect(store.loading).toBe(false)
    })
  })

  describe('Category Filtering', () => {
    it('should filter promptFragments by category', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      const promptFragments = await api.promptFragments.getAll()
      store.setPromptFragments(promptFragments)

      const cat1PromptFragments = store.getPromptFragmentsByCategory('cat-1')
      const cat2PromptFragments = store.getPromptFragmentsByCategory('cat-2')

      expect(cat1PromptFragments).toHaveLength(2)
      expect(cat2PromptFragments).toHaveLength(2)
      expect(cat1PromptFragments.every(f => f.categoryId === 'cat-1')).toBe(true)
    })

    it('should use API to fetch category-specific promptFragments', async () => {
      mockFetch.setupSuccess()

      const promptFragments = await api.promptFragments.getByCategory('cat-1')

      expect(promptFragments.every(f => f.categoryId === 'cat-1')).toBe(true)
      expect(mockFetch.mock).toHaveBeenCalledWith(
        expect.stringContaining('categoryId=cat-1'),
        expect.any(Object)
      )
    })
  })

  describe('Clipboard Integration', () => {
    it('should prepare prompt for clipboard', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      const promptFragments = await api.promptFragments.getAll()
      store.setPromptFragments(promptFragments)

      store.togglePromptFragment('frag-1')
      store.togglePromptFragment('frag-2')

      const compiled = store.getCompiledPrompt()

      // Simulate clipboard copy
      await navigator.clipboard.writeText(compiled.compiledText)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        compiled.compiledText
      )
    })
  })

  describe('State Persistence Scenarios', () => {
    it('should maintain selections after promptFragment reload', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      let promptFragments = await api.promptFragments.getAll()
      store.setPromptFragments(promptFragments)

      // Make selections
      store.togglePromptFragment('frag-1')
      store.togglePromptFragment('frag-3')

      expect(store.selectedPromptFragmentIds.size).toBe(2)

      // Reload promptFragments (simulating refresh)
      promptFragments = await api.promptFragments.getAll()
      store.setPromptFragments(promptFragments)

      // Selections should persist
      expect(store.selectedPromptFragmentIds.size).toBe(2)
      expect(store.selectedPromptFragmentIds.has('frag-1')).toBe(true)
      expect(store.selectedPromptFragmentIds.has('frag-3')).toBe(true)
    })

    it('should clear invalid selections after promptFragments update', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      const promptFragments = await api.promptFragments.getAll()
      store.setPromptFragments(promptFragments)

      // Select promptFragments
      store.togglePromptFragment('frag-1')
      store.togglePromptFragment('frag-2')
      store.togglePromptFragment('deleted-promptFragment') // Doesn't exist

      // Get selected promptFragments
      const selected = store.getSelectedPromptFragments()

      // Should only return existing promptFragments
      expect(selected).toHaveLength(2)
      expect(selected.some(f => f.id === 'deleted-promptFragment')).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle compiling with no selections', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      const promptFragments = await api.promptFragments.getAll()
      store.setPromptFragments(promptFragments)

      const compiled = store.getCompiledPrompt()

      expect(compiled.promptFragmentCount).toBe(0)
      expect(compiled.compiledText).toBe('')
      expect(compiled.promptFragments).toEqual([])
    })

    it('should handle empty categories list', async () => {
      mockFetch.mock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      const categories = await api.categories.getAll()
      expect(categories).toEqual([])
    })

    it('should handle deleting selected promptFragment', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      const promptFragments = await api.promptFragments.getAll()
      store.setPromptFragments(promptFragments)

      // Select promptFragment
      store.togglePromptFragment('frag-1')
      expect(store.selectedPromptFragmentIds.has('frag-1')).toBe(true)

      // Delete promptFragment
      await api.promptFragments.delete('frag-1')

      // Reload promptFragments (without deleted one)
      const updatedPromptFragments = promptFragments.filter(f => f.id !== 'frag-1')
      store.setPromptFragments(updatedPromptFragments)

      // Compiled prompt should handle gracefully
      const compiled = store.getCompiledPrompt()
      expect(compiled.promptFragments.some(f => f.id === 'frag-1')).toBe(false)
    })

    it('should handle very long compiled prompts', async () => {
      const store = usePromptStore.getState()

      // Create many promptFragments
      const manyPromptFragments = Array.from({ length: 100 }, (_, i) => ({
        id: `frag-${i}`,
        categoryId: 'cat-1',
        content: `PromptFragment ${i} with some longer content to make it realistic`,
        order: i,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      store.setPromptFragments(manyPromptFragments)

      // Select all
      manyPromptFragments.forEach(f => store.togglePromptFragment(f.id))

      const compiled = store.getCompiledPrompt()

      expect(compiled.promptFragmentCount).toBe(100)
      expect(compiled.compiledText.length).toBeGreaterThan(1000)
    })
  })
})
