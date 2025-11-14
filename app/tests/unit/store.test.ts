import { renderHook, act } from '@testing-library/react'
import { usePromptStore } from '@/lib/store'
import { mockCategories, mockSections, createMockSection } from '../fixtures/mockData'

describe('Zustand Store - usePromptStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => usePromptStore())
    act(() => {
      result.current.setCategories([])
      result.current.setSections([])
      result.current.clearSelection()
      result.current.setCustomPrompt('')
      result.current.setCustomEnabled(false)
      result.current.setError(null)
      result.current.setLoading(false)
    })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => usePromptStore())

      expect(result.current.categories).toEqual([])
      expect(result.current.sections).toEqual([])
      expect(result.current.selectedSectionIds).toEqual(new Set())
      expect(result.current.customPrompt).toBe('')
      expect(result.current.customEnabled).toBe(false)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })
  })

  describe('setCategories', () => {
    it('should set categories', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setCategories(mockCategories)
      })

      expect(result.current.categories).toEqual(mockCategories)
      expect(result.current.categories).toHaveLength(3)
    })

    it('should replace existing categories', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setCategories(mockCategories)
        result.current.setCategories([mockCategories[0]])
      })

      expect(result.current.categories).toHaveLength(1)
      expect(result.current.categories[0]).toEqual(mockCategories[0])
    })
  })

  describe('setSections', () => {
    it('should set sections', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
      })

      expect(result.current.sections).toEqual(mockSections)
      expect(result.current.sections).toHaveLength(5)
    })

    it('should replace existing sections', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.setSections([mockSections[0]])
      })

      expect(result.current.sections).toHaveLength(1)
    })
  })

  describe('toggleSection', () => {
    it('should add section to selection when not selected', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
      })

      expect(result.current.selectedSectionIds.has('frag-1')).toBe(true)
      expect(result.current.selectedSectionIds.size).toBe(1)
    })

    it('should remove section from selection when already selected', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
        result.current.toggleSection('frag-1')
      })

      expect(result.current.selectedSectionIds.has('frag-1')).toBe(false)
      expect(result.current.selectedSectionIds.size).toBe(0)
    })

    it('should handle multiple section selections', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
        result.current.toggleSection('frag-2')
        result.current.toggleSection('frag-3')
      })

      expect(result.current.selectedSectionIds.size).toBe(3)
      expect(result.current.selectedSectionIds.has('frag-1')).toBe(true)
      expect(result.current.selectedSectionIds.has('frag-2')).toBe(true)
      expect(result.current.selectedSectionIds.has('frag-3')).toBe(true)
    })

    it('should handle toggle sequence correctly', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
        result.current.toggleSection('frag-2')
        result.current.toggleSection('frag-1') // Remove frag-1
      })

      expect(result.current.selectedSectionIds.size).toBe(1)
      expect(result.current.selectedSectionIds.has('frag-1')).toBe(false)
      expect(result.current.selectedSectionIds.has('frag-2')).toBe(true)
    })
  })

  describe('setCustomPrompt', () => {
    it('should set custom prompt text', () => {
      const { result } = renderHook(() => usePromptStore())
      const customText = 'This is a custom prompt'

      act(() => {
        result.current.setCustomPrompt(customText)
      })

      expect(result.current.customPrompt).toBe(customText)
    })

    it('should handle empty string', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setCustomPrompt('Initial text')
        result.current.setCustomPrompt('')
      })

      expect(result.current.customPrompt).toBe('')
    })
  })

  describe('setCustomEnabled', () => {
    it('should enable custom prompt', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setCustomEnabled(true)
      })

      expect(result.current.customEnabled).toBe(true)
    })

    it('should disable custom prompt', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setCustomEnabled(true)
        result.current.setCustomEnabled(false)
      })

      expect(result.current.customEnabled).toBe(false)
    })
  })

  describe('clearSelection', () => {
    it('should clear all selected sections', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
        result.current.toggleSection('frag-2')
        result.current.toggleSection('frag-3')
        result.current.clearSelection()
      })

      expect(result.current.selectedSectionIds.size).toBe(0)
    })

    it('should work when no sections are selected', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.clearSelection()
      })

      expect(result.current.selectedSectionIds.size).toBe(0)
    })
  })

  describe('setLoading', () => {
    it('should set loading to true', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.loading).toBe(true)
    })

    it('should set loading to false', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setLoading(true)
        result.current.setLoading(false)
      })

      expect(result.current.loading).toBe(false)
    })
  })

  describe('setError', () => {
    it('should set error message', () => {
      const { result } = renderHook(() => usePromptStore())
      const errorMessage = 'Something went wrong'

      act(() => {
        result.current.setError(errorMessage)
      })

      expect(result.current.error).toBe(errorMessage)
    })

    it('should clear error with null', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setError('Error')
        result.current.setError(null)
      })

      expect(result.current.error).toBe(null)
    })
  })

  describe('getCompiledPrompt', () => {
    it('should return empty compiled prompt when no sections selected', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
      })

      const compiled = result.current.getCompiledPrompt()

      expect(compiled.sections).toEqual([])
      expect(compiled.compiledText).toBe('')
      expect(compiled.sectionCount).toBe(0)
      expect(compiled.customEnabled).toBe(false)
    })

    it('should compile single section', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
      })

      const compiled = result.current.getCompiledPrompt()

      expect(compiled.sections).toHaveLength(1)
      expect(compiled.compiledText).toBe(mockSections[0].content)
      expect(compiled.sectionCount).toBe(1)
    })

    it('should compile multiple sections in correct order', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-2') // order: 2
        result.current.toggleSection('frag-1') // order: 1
      })

      const compiled = result.current.getCompiledPrompt()

      expect(compiled.sections).toHaveLength(2)
      expect(compiled.sections[0].id).toBe('frag-1')
      expect(compiled.sections[1].id).toBe('frag-2')
      expect(compiled.compiledText).toBe(
        `${mockSections[0].content}\n\n${mockSections[1].content}`
      )
    })

    it('should prepend custom prompt when enabled', () => {
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
      expect(compiled.customEnabled).toBe(true)
      expect(compiled.compiledText).toBe(
        `${customText}\n\n${mockSections[0].content}`
      )
    })

    it('should not include custom prompt when disabled', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
        result.current.setCustomPrompt('Custom text')
        result.current.setCustomEnabled(false)
      })

      const compiled = result.current.getCompiledPrompt()

      expect(compiled.customPrompt).toBeUndefined()
      expect(compiled.customEnabled).toBe(false)
      expect(compiled.compiledText).toBe(mockSections[0].content)
    })

    it('should trim whitespace from custom prompt', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
        result.current.setCustomPrompt('  \n  Custom  \n  ')
        result.current.setCustomEnabled(true)
      })

      const compiled = result.current.getCompiledPrompt()

      expect(compiled.compiledText).toContain('Custom')
      expect(compiled.compiledText).not.toMatch(/^\s+/)
    })

    it('should handle empty custom prompt with enabled flag', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
        result.current.setCustomPrompt('   ')
        result.current.setCustomEnabled(true)
      })

      const compiled = result.current.getCompiledPrompt()

      // Empty custom prompt should not add extra newlines
      expect(compiled.compiledText).toBe(mockSections[0].content)
    })
  })

  describe('getSectionsByCategory', () => {
    it('should return sections for specific category', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
      })

      const cat1Sections = result.current.getSectionsByCategory('cat-1')

      expect(cat1Sections).toHaveLength(2)
      expect(cat1Sections.every(f => f.categoryId === 'cat-1')).toBe(true)
    })

    it('should return sections in correct order', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
      })

      const cat2Sections = result.current.getSectionsByCategory('cat-2')

      expect(cat2Sections[0].order).toBeLessThan(cat2Sections[1].order)
    })

    it('should return empty array for non-existent category', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
      })

      const noSections = result.current.getSectionsByCategory('cat-999')

      expect(noSections).toEqual([])
    })

    it('should return empty array when no sections loaded', () => {
      const { result } = renderHook(() => usePromptStore())

      const noSections = result.current.getSectionsByCategory('cat-1')

      expect(noSections).toEqual([])
    })
  })

  describe('getSelectedSections', () => {
    it('should return only selected sections', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
        result.current.toggleSection('frag-3')
      })

      const selected = result.current.getSelectedSections()

      expect(selected).toHaveLength(2)
      expect(selected.some(f => f.id === 'frag-1')).toBe(true)
      expect(selected.some(f => f.id === 'frag-3')).toBe(true)
    })

    it('should return empty array when nothing selected', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
      })

      const selected = result.current.getSelectedSections()

      expect(selected).toEqual([])
    })

    it('should update when selections change', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
      })

      let selected = result.current.getSelectedSections()
      expect(selected).toHaveLength(1)

      act(() => {
        result.current.toggleSection('frag-2')
      })

      selected = result.current.getSelectedSections()
      expect(selected).toHaveLength(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle selecting non-existent section gracefully', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('non-existent-id')
      })

      // Should add to selection even if section doesn't exist
      expect(result.current.selectedSectionIds.has('non-existent-id')).toBe(true)

      // But compiled prompt should handle it gracefully
      const compiled = result.current.getCompiledPrompt()
      expect(compiled.sections).toHaveLength(0)
    })

    it('should handle rapid state changes', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.setSections(mockSections)
        result.current.toggleSection('frag-1')
        result.current.setCustomPrompt('Test')
        result.current.setCustomEnabled(true)
        result.current.toggleSection('frag-2')
        result.current.setLoading(true)
        result.current.setError('Error')
        result.current.clearSelection()
      })

      expect(result.current.selectedSectionIds.size).toBe(0)
      expect(result.current.customPrompt).toBe('Test')
      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBe('Error')
    })

    it('should maintain Set immutability', () => {
      const { result } = renderHook(() => usePromptStore())

      act(() => {
        result.current.toggleSection('frag-1')
      })

      const firstSet = result.current.selectedSectionIds

      act(() => {
        result.current.toggleSection('frag-2')
      })

      const secondSet = result.current.selectedSectionIds

      // New Set should be created on each update
      expect(firstSet).not.toBe(secondSet)
    })
  })
})
