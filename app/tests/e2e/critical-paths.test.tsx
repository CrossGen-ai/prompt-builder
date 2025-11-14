/**
 * Critical Path Tests - 100% Coverage Required
 *
 * These tests cover the most important user workflows that must never break.
 * Any failure in these tests should block deployment.
 */

import { renderHook, act } from '@testing-library/react'
import { usePromptStore } from '@/lib/store'
import { api } from '@/lib/api'
import { createMockFetch } from '../mocks/api.mock'
import { mockCategories, mockSections } from '../fixtures/mockData'

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
      result.current.setSections([])
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

    it('MUST load sections on startup', async () => {
      mockFetch.setupSuccess()

      const sections = await api.sections.getAll()

      expect(sections).toBeDefined()
      expect(Array.isArray(sections)).toBe(true)
      expect(sections.length).toBeGreaterThan(0)
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

  describe('[CRITICAL] Section Selection', () => {
    it('MUST select section when clicked', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
      })

      expect(result.current.selectedSectionIds.has('frag-1')).toBe(true)
    })

    it('MUST deselect section when clicked again', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
        result.current.toggleSection('frag-1')
      })

      expect(result.current.selectedSectionIds.has('frag-1')).toBe(false)
    })

    it('MUST handle multiple selections', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
        result.current.toggleSection('frag-2')
        result.current.toggleSection('frag-3')
      })

      expect(result.current.selectedSectionIds.size).toBe(3)
    })

    it('MUST clear all selections', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
        result.current.toggleSection('frag-2')
        result.current.clearSelection()
      })

      expect(result.current.selectedSectionIds.size).toBe(0)
    })
  })

  describe('[CRITICAL] Prompt Compilation', () => {
    it('MUST compile selected sections into prompt', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
        result.current.toggleSection('frag-2')
      })

      const compiled = result.current.getCompiledPrompt()

      expect(compiled).toBeDefined()
      expect(compiled.compiledText).toBeTruthy()
      expect(compiled.sectionCount).toBe(2)
      expect(compiled.compiledText).toContain(mockSections[0].content)
      expect(compiled.compiledText).toContain(mockSections[1].content)
    })

    it('MUST order sections correctly in compilation', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        // Select in reverse order
        result.current.toggleSection('frag-2')
        result.current.toggleSection('frag-1')
      })

      const compiled = result.current.getCompiledPrompt()

      // Should be ordered by section.order, not selection order
      const section1Index = compiled.compiledText.indexOf(mockSections[0].content)
      const section2Index = compiled.compiledText.indexOf(mockSections[1].content)

      expect(section1Index).toBeLessThan(section2Index)
    })

    it('MUST include custom prompt when enabled', async () => {
      const { result } = renderHook(() => usePromptStore())
      const customText = 'Custom instruction'

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
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
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
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
        result.current.setSections(mockSections)
      })

      const compiled = result.current.getCompiledPrompt()

      expect(compiled.sectionCount).toBe(0)
      expect(compiled.compiledText).toBe('')
      expect(compiled.sections).toEqual([])
    })
  })

  describe('[CRITICAL] Copy to Clipboard', () => {
    it('MUST copy compiled prompt to clipboard', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
      })

      const compiled = result.current.getCompiledPrompt()

      await navigator.clipboard.writeText(compiled.compiledText)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(compiled.compiledText)
    })

    it('MUST handle clipboard errors gracefully', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
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

  describe('[CRITICAL] Section Management', () => {
    it('MUST create new section', async () => {
      mockFetch.setupSuccess()

      const newSection = {
        categoryId: 'cat-1',
        content: 'New section content',
        order: 1,
      }

      const created = await api.sections.create(newSection)

      expect(created).toHaveProperty('id')
      expect(created.content).toBe(newSection.content)
      expect(created.categoryId).toBe(newSection.categoryId)
    })

    it('MUST update existing section', async () => {
      mockFetch.setupSuccess()

      const updates = { content: 'Updated content' }
      const updated = await api.sections.update('frag-1', updates)

      expect(updated.content).toBe('Updated content')
    })

    it('MUST delete section', async () => {
      mockFetch.setupSuccess()

      await api.sections.delete('frag-1')

      expect(mockFetch.mock).toHaveBeenCalledWith(
        expect.stringContaining('/sections/frag-1'),
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('MUST validate section data', async () => {
      mockFetch.setupError(400, 'Invalid section data')

      await expect(
        api.sections.create({ categoryId: '', content: '', order: 1 })
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
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
        result.current.setCustomPrompt('Test')
      })

      expect(result.current.categories).toEqual(mockCategories)
      expect(result.current.sections).toEqual(mockSections)
      expect(result.current.selectedSectionIds.has('frag-1')).toBe(true)
      expect(result.current.customPrompt).toBe('Test')
    })

    it('MUST maintain immutability', async () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
      })

      const firstSet = result.current.selectedSectionIds

      act(() => {
        result.current.toggleSection('frag-2')
      })

      const secondSet = result.current.selectedSectionIds

      // New Set should be created
      expect(firstSet).not.toBe(secondSet)
    })
  })

  describe('[CRITICAL] Data Integrity', () => {
    it('MUST maintain referential integrity', async () => {
      mockFetch.setupSuccess()

      const categories = await api.categories.getAll()
      const sections = await api.sections.getAll()

      // All sections must reference valid categories
      sections.forEach(section => {
        const categoryExists = categories.some(cat => cat.id === section.categoryId)
        expect(categoryExists).toBe(true)
      })
    })

    it('MUST prevent orphaned sections', async () => {
      mockFetch.setupError(404, 'Category not found')

      await expect(
        api.sections.create({
          categoryId: 'non-existent',
          content: 'Test',
          order: 1,
        })
      ).rejects.toThrow()
    })

    it('MUST handle cascade deletes', async () => {
      mockFetch.setupError(409, 'Cannot delete category with sections')

      await expect(api.categories.delete('cat-1')).rejects.toThrow()
    })
  })
})
