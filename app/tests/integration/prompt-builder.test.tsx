import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePromptStore } from '@/lib/store'
import { api } from '@/lib/api'
import { createMockFetch } from '../mocks/api.mock'
import { mockCategories, mockSections } from '../fixtures/mockData'

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
    store.setSections([])
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
    it('should load categories and sections, then compile prompt', async () => {
      const store = usePromptStore.getState()

      // Step 1: Load categories
      mockFetch.setupSuccess()
      const categories = await api.categories.getAll()
      store.setCategories(categories)

      expect(store.categories).toHaveLength(3)

      // Step 2: Load sections
      const sections = await api.sections.getAll()
      store.setSections(sections)

      expect(store.sections).toHaveLength(5)

      // Step 3: Select sections from different categories
      store.toggleSection('frag-1') // System Prompts
      store.toggleSection('frag-3') // Code Guidelines

      // Step 4: Compile prompt
      const compiled = store.getCompiledPrompt()

      expect(compiled.sectionCount).toBe(2)
      expect(compiled.compiledText).toContain(mockSections[0].content)
      expect(compiled.compiledText).toContain(mockSections[2].content)
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

    it('should handle full CRUD cycle for sections', async () => {
      mockFetch.setupSuccess()

      // Create section
      const newSection = {
        categoryId: 'cat-1',
        content: 'New section content',
        order: 1,
      }

      const created = await api.sections.create(newSection)
      expect(created).toHaveProperty('id')
      expect(created.content).toBe(newSection.content)

      // Update section
      const updated = await api.sections.update(created.id, {
        content: 'Updated content',
      })
      expect(updated.content).toBe('Updated content')

      // Delete section
      await api.sections.delete(created.id)
      expect(mockFetch.mock).toHaveBeenCalledWith(
        expect.stringContaining(`/sections/${created.id}`),
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('Custom Prompt Integration', () => {
    it('should add custom prompt to compilation', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      const sections = await api.sections.getAll()
      store.setSections(sections)

      // Select section
      store.toggleSection('frag-1')

      // Add custom prompt
      const customText = 'Custom instruction at the top'
      store.setCustomPrompt(customText)
      store.setCustomEnabled(true)

      // Compile
      const compiled = store.getCompiledPrompt()

      expect(compiled.customPrompt).toBe(customText)
      expect(compiled.compiledText).toStartWith(customText)
      expect(compiled.compiledText).toContain(mockSections[0].content)
    })

    it('should toggle custom prompt on/off', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      const sections = await api.sections.getAll()
      store.setSections(sections)

      store.toggleSection('frag-1')
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
    it('should select sections from multiple categories', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      const sections = await api.sections.getAll()
      store.setSections(sections)

      // Select from cat-1
      store.toggleSection('frag-1')
      store.toggleSection('frag-2')

      // Select from cat-2
      store.toggleSection('frag-3')

      // Select from cat-3
      store.toggleSection('frag-5')

      const compiled = store.getCompiledPrompt()

      expect(compiled.sectionCount).toBe(4)
      expect(compiled.sections.map(f => f.categoryId)).toEqual(
        expect.arrayContaining(['cat-1', 'cat-2', 'cat-3'])
      )
    })

    it('should maintain section order within compilation', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      const sections = await api.sections.getAll()
      store.setSections(sections)

      // Select in reverse order
      store.toggleSection('frag-3')
      store.toggleSection('frag-1')
      store.toggleSection('frag-2')

      const compiled = store.getCompiledPrompt()

      // Should be ordered by section.order, not selection order
      expect(compiled.sections[0].id).toBe('frag-1')
      expect(compiled.sections[1].id).toBe('frag-2')
      expect(compiled.sections[2].id).toBe('frag-3')
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

    it('should handle API errors during section creation', async () => {
      mockFetch.setupError(400, 'Invalid data')

      try {
        await api.sections.create({
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

      const [categories, sections] = await Promise.all([
        api.categories.getAll(),
        api.sections.getAll(),
      ])

      store.setCategories(categories)
      store.setSections(sections)
      store.setLoading(false)

      expect(store.categories).toHaveLength(3)
      expect(store.sections).toHaveLength(5)
      expect(store.loading).toBe(false)
    })
  })

  describe('Category Filtering', () => {
    it('should filter sections by category', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      const sections = await api.sections.getAll()
      store.setSections(sections)

      const cat1Sections = store.getSectionsByCategory('cat-1')
      const cat2Sections = store.getSectionsByCategory('cat-2')

      expect(cat1Sections).toHaveLength(2)
      expect(cat2Sections).toHaveLength(2)
      expect(cat1Sections.every(f => f.categoryId === 'cat-1')).toBe(true)
    })

    it('should use API to fetch category-specific sections', async () => {
      mockFetch.setupSuccess()

      const sections = await api.sections.getByCategory('cat-1')

      expect(sections.every(f => f.categoryId === 'cat-1')).toBe(true)
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
      const sections = await api.sections.getAll()
      store.setSections(sections)

      store.toggleSection('frag-1')
      store.toggleSection('frag-2')

      const compiled = store.getCompiledPrompt()

      // Simulate clipboard copy
      await navigator.clipboard.writeText(compiled.compiledText)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        compiled.compiledText
      )
    })
  })

  describe('State Persistence Scenarios', () => {
    it('should maintain selections after section reload', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      let sections = await api.sections.getAll()
      store.setSections(sections)

      // Make selections
      store.toggleSection('frag-1')
      store.toggleSection('frag-3')

      expect(store.selectedSectionIds.size).toBe(2)

      // Reload sections (simulating refresh)
      sections = await api.sections.getAll()
      store.setSections(sections)

      // Selections should persist
      expect(store.selectedSectionIds.size).toBe(2)
      expect(store.selectedSectionIds.has('frag-1')).toBe(true)
      expect(store.selectedSectionIds.has('frag-3')).toBe(true)
    })

    it('should clear invalid selections after sections update', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      const sections = await api.sections.getAll()
      store.setSections(sections)

      // Select sections
      store.toggleSection('frag-1')
      store.toggleSection('frag-2')
      store.toggleSection('deleted-section') // Doesn't exist

      // Get selected sections
      const selected = store.getSelectedSections()

      // Should only return existing sections
      expect(selected).toHaveLength(2)
      expect(selected.some(f => f.id === 'deleted-section')).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle compiling with no selections', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      const sections = await api.sections.getAll()
      store.setSections(sections)

      const compiled = store.getCompiledPrompt()

      expect(compiled.sectionCount).toBe(0)
      expect(compiled.compiledText).toBe('')
      expect(compiled.sections).toEqual([])
    })

    it('should handle empty categories list', async () => {
      mockFetch.mock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      const categories = await api.categories.getAll()
      expect(categories).toEqual([])
    })

    it('should handle deleting selected section', async () => {
      const store = usePromptStore.getState()

      mockFetch.setupSuccess()
      const sections = await api.sections.getAll()
      store.setSections(sections)

      // Select section
      store.toggleSection('frag-1')
      expect(store.selectedSectionIds.has('frag-1')).toBe(true)

      // Delete section
      await api.sections.delete('frag-1')

      // Reload sections (without deleted one)
      const updatedSections = sections.filter(f => f.id !== 'frag-1')
      store.setSections(updatedSections)

      // Compiled prompt should handle gracefully
      const compiled = store.getCompiledPrompt()
      expect(compiled.sections.some(f => f.id === 'frag-1')).toBe(false)
    })

    it('should handle very long compiled prompts', async () => {
      const store = usePromptStore.getState()

      // Create many sections
      const manySections = Array.from({ length: 100 }, (_, i) => ({
        id: `frag-${i}`,
        categoryId: 'cat-1',
        content: `Section ${i} with some longer content to make it realistic`,
        order: i,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      store.setSections(manySections)

      // Select all
      manySections.forEach(f => store.toggleSection(f.id))

      const compiled = store.getCompiledPrompt()

      expect(compiled.sectionCount).toBe(100)
      expect(compiled.compiledText.length).toBeGreaterThan(1000)
    })
  })
})
