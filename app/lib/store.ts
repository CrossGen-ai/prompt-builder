import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { PromptBuilderState, Category, Section, CompiledPrompt } from './types'
import { api } from './api'

/**
 * Extended state interface with async actions and error handling
 */
interface ExtendedPromptBuilderState extends PromptBuilderState {
  // Enhanced loading states
  loadingStates: {
    categories: boolean
    sections: boolean
    createCategory: boolean
    updateCategory: boolean
    deleteCategory: boolean
    createSection: boolean
    updateSection: boolean
    deleteSection: boolean
  }

  // Async actions for categories
  fetchCategories: () => Promise<void>
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category | null>
  updateCategory: (id: string, data: Partial<Category>) => Promise<Category | null>
  deleteCategory: (id: string) => Promise<boolean>

  // Async actions for sections
  fetchSections: () => Promise<void>
  addSection: (section: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Section | null>
  updateSection: (id: string, data: Partial<Section>) => Promise<Section | null>
  deleteSection: (id: string) => Promise<boolean>

  // Selection management
  selectSection: (id: string) => void
  deselectSection: (id: string) => void
  selectMultipleSections: (ids: string[]) => void
  deselectMultipleSections: (ids: string[]) => void

  // Custom prompt management
  updateCustomPrompt: (text: string, enabled?: boolean) => void

  // Utility actions
  resetError: () => void
  initializeStore: () => Promise<void>
}

/**
 * AI Prompt Builder Zustand Store
 *
 * Features:
 * - Type-safe state management with TypeScript
 * - Optimistic updates for better UX
 * - Comprehensive error handling
 * - Loading states for all async operations
 * - API integration with Drizzle backend
 * - Computed values for prompt compilation
 * - DevTools integration for debugging
 */
export const usePromptStore = create<ExtendedPromptBuilderState>()(
  devtools(
    (set, get) => ({
      // Initial state
      categories: [],
      sections: [],
      selectedSectionIds: new Set<string>(),
      customPrompt: '',
      customEnabled: false,
      loading: false,
      error: null,
      loadingStates: {
        categories: false,
        sections: false,
        createCategory: false,
        updateCategory: false,
        deleteCategory: false,
        createSection: false,
        updateSection: false,
        deleteSection: false,
      },

      // Basic setters
      setCategories: (categories) => set({ categories }, false, 'setCategories'),

      setSections: (sections) => set({ sections }, false, 'setSections'),

      setCustomPrompt: (customPrompt) => set({ customPrompt }, false, 'setCustomPrompt'),

      setCustomEnabled: (customEnabled) => set({ customEnabled }, false, 'setCustomEnabled'),

      setLoading: (loading) => set({ loading }, false, 'setLoading'),

      setError: (error) => set({ error }, false, 'setError'),

      resetError: () => set({ error: null }, false, 'resetError'),

      // Section selection management
      toggleSection: (sectionId) =>
        set((state) => {
          const newSelected = new Set(state.selectedSectionIds)
          if (newSelected.has(sectionId)) {
            newSelected.delete(sectionId)
          } else {
            newSelected.add(sectionId)
          }
          return { selectedSectionIds: newSelected }
        }, false, 'toggleSection'),

      selectSection: (id) =>
        set((state) => {
          const newSelected = new Set(state.selectedSectionIds)
          newSelected.add(id)
          return { selectedSectionIds: newSelected }
        }, false, 'selectSection'),

      deselectSection: (id) =>
        set((state) => {
          const newSelected = new Set(state.selectedSectionIds)
          newSelected.delete(id)
          return { selectedSectionIds: newSelected }
        }, false, 'deselectSection'),

      selectMultipleSections: (ids) =>
        set((state) => {
          const newSelected = new Set(state.selectedSectionIds)
          ids.forEach((id) => newSelected.add(id))
          return { selectedSectionIds: newSelected }
        }, false, 'selectMultipleSections'),

      deselectMultipleSections: (ids) =>
        set((state) => {
          const newSelected = new Set(state.selectedSectionIds)
          ids.forEach((id) => newSelected.delete(id))
          return { selectedSectionIds: newSelected }
        }, false, 'deselectMultipleSections'),

      clearSelection: () =>
        set({ selectedSectionIds: new Set<string>() }, false, 'clearSelection'),

      // Custom prompt management
      updateCustomPrompt: (text, enabled) =>
        set((state) => ({
          customPrompt: text,
          customEnabled: enabled !== undefined ? enabled : state.customEnabled,
        }), false, 'updateCustomPrompt'),

      // Async: Fetch all categories
      fetchCategories: async () => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, categories: true },
          error: null,
        }), false, 'fetchCategories:start')

        try {
          const categories = await api.categories.getAll()
          set((state) => ({
            categories,
            loadingStates: { ...state.loadingStates, categories: false },
          }), false, 'fetchCategories:success')
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories'
          set((state) => ({
            error: errorMessage,
            loadingStates: { ...state.loadingStates, categories: false },
          }), false, 'fetchCategories:error')
        }
      },

      // Async: Fetch all sections
      fetchSections: async () => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, sections: true },
          error: null,
        }), false, 'fetchSections:start')

        try {
          const sections = await api.sections.getAll()
          set((state) => ({
            sections,
            loadingStates: { ...state.loadingStates, sections: false },
          }), false, 'fetchSections:success')
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sections'
          set((state) => ({
            error: errorMessage,
            loadingStates: { ...state.loadingStates, sections: false },
          }), false, 'fetchSections:error')
        }
      },

      // Async: Add new category with optimistic update
      addCategory: async (categoryData) => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, createCategory: true },
          error: null,
        }), false, 'addCategory:start')

        // Create optimistic category
        const optimisticCategory: Category = {
          id: `temp-${Date.now()}`,
          ...categoryData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        // Optimistic update
        set((state) => ({
          categories: [...state.categories, optimisticCategory],
        }), false, 'addCategory:optimistic')

        try {
          const newCategory = await api.categories.create(categoryData)

          // Replace optimistic with real data
          set((state) => ({
            categories: state.categories.map((cat) =>
              cat.id === optimisticCategory.id ? newCategory : cat
            ),
            loadingStates: { ...state.loadingStates, createCategory: false },
          }), false, 'addCategory:success')

          return newCategory
        } catch (error) {
          // Rollback optimistic update
          set((state) => ({
            categories: state.categories.filter((cat) => cat.id !== optimisticCategory.id),
            error: error instanceof Error ? error.message : 'Failed to create category',
            loadingStates: { ...state.loadingStates, createCategory: false },
          }), false, 'addCategory:error')

          return null
        }
      },

      // Async: Update category with optimistic update
      updateCategory: async (id, data) => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, updateCategory: true },
          error: null,
        }), false, 'updateCategory:start')

        // Store original for rollback
        const originalCategory = get().categories.find((cat) => cat.id === id)
        if (!originalCategory) {
          set((state) => ({
            error: 'Category not found',
            loadingStates: { ...state.loadingStates, updateCategory: false },
          }), false, 'updateCategory:notFound')
          return null
        }

        // Optimistic update
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...data, updatedAt: new Date().toISOString() } : cat
          ),
        }), false, 'updateCategory:optimistic')

        try {
          const updatedCategory = await api.categories.update(id, data)

          // Replace with real data
          set((state) => ({
            categories: state.categories.map((cat) =>
              cat.id === id ? updatedCategory : cat
            ),
            loadingStates: { ...state.loadingStates, updateCategory: false },
          }), false, 'updateCategory:success')

          return updatedCategory
        } catch (error) {
          // Rollback optimistic update
          set((state) => ({
            categories: state.categories.map((cat) =>
              cat.id === id ? originalCategory : cat
            ),
            error: error instanceof Error ? error.message : 'Failed to update category',
            loadingStates: { ...state.loadingStates, updateCategory: false },
          }), false, 'updateCategory:error')

          return null
        }
      },

      // Async: Delete category with optimistic update
      deleteCategory: async (id) => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, deleteCategory: true },
          error: null,
        }), false, 'deleteCategory:start')

        // Store original for rollback
        const originalCategory = get().categories.find((cat) => cat.id === id)
        if (!originalCategory) {
          set((state) => ({
            error: 'Category not found',
            loadingStates: { ...state.loadingStates, deleteCategory: false },
          }), false, 'deleteCategory:notFound')
          return false
        }

        // Optimistic delete
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
          // Also remove sections in this category
          sections: state.sections.filter((frag) => frag.categoryId !== id),
        }), false, 'deleteCategory:optimistic')

        try {
          await api.categories.delete(id)

          set((state) => ({
            loadingStates: { ...state.loadingStates, deleteCategory: false },
          }), false, 'deleteCategory:success')

          return true
        } catch (error) {
          // Rollback optimistic delete
          set((state) => ({
            categories: [...state.categories, originalCategory].sort((a, b) => a.order - b.order),
            error: error instanceof Error ? error.message : 'Failed to delete category',
            loadingStates: { ...state.loadingStates, deleteCategory: false },
          }), false, 'deleteCategory:error')

          // Note: We don't restore sections as they might have changed
          // Consider fetching sections again if needed
          get().fetchSections()

          return false
        }
      },

      // Async: Add new section with optimistic update
      addSection: async (sectionData) => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, createSection: true },
          error: null,
        }), false, 'addSection:start')

        // Create optimistic section
        const optimisticSection: PromptSection = {
          id: `temp-${Date.now()}`,
          ...sectionData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        // Optimistic update
        set((state) => ({
          sections: [...state.sections, optimisticSection],
        }), false, 'addSection:optimistic')

        try {
          const newSection = await api.sections.create(sectionData)

          // Replace optimistic with real data
          set((state) => ({
            sections: state.sections.map((frag) =>
              frag.id === optimisticSection.id ? newSection : frag
            ),
            loadingStates: { ...state.loadingStates, createSection: false },
          }), false, 'addSection:success')

          return newSection
        } catch (error) {
          // Rollback optimistic update
          set((state) => ({
            sections: state.sections.filter((frag) => frag.id !== optimisticSection.id),
            error: error instanceof Error ? error.message : 'Failed to create section',
            loadingStates: { ...state.loadingStates, createSection: false },
          }), false, 'addSection:error')

          return null
        }
      },

      // Async: Update section with optimistic update
      updateSection: async (id, data) => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, updateSection: true },
          error: null,
        }), false, 'updateSection:start')

        // Store original for rollback
        const originalSection = get().sections.find((frag) => frag.id === id)
        if (!originalSection) {
          set((state) => ({
            error: 'Section not found',
            loadingStates: { ...state.loadingStates, updateSection: false },
          }), false, 'updateSection:notFound')
          return null
        }

        // Optimistic update
        set((state) => ({
          sections: state.sections.map((frag) =>
            frag.id === id ? { ...frag, ...data, updatedAt: new Date().toISOString() } : frag
          ),
        }), false, 'updateSection:optimistic')

        try {
          const updatedSection = await api.sections.update(id, data)

          // Replace with real data
          set((state) => ({
            sections: state.sections.map((frag) =>
              frag.id === id ? updatedSection : frag
            ),
            loadingStates: { ...state.loadingStates, updateSection: false },
          }), false, 'updateSection:success')

          return updatedSection
        } catch (error) {
          // Rollback optimistic update
          set((state) => ({
            sections: state.sections.map((frag) =>
              frag.id === id ? originalSection : frag
            ),
            error: error instanceof Error ? error.message : 'Failed to update section',
            loadingStates: { ...state.loadingStates, updateSection: false },
          }), false, 'updateSection:error')

          return null
        }
      },

      // Async: Delete section with optimistic update
      deleteSection: async (id) => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, deleteSection: true },
          error: null,
        }), false, 'deleteSection:start')

        // Store original for rollback
        const originalSection = get().sections.find((frag) => frag.id === id)
        if (!originalSection) {
          set((state) => ({
            error: 'Section not found',
            loadingStates: { ...state.loadingStates, deleteSection: false },
          }), false, 'deleteSection:notFound')
          return false
        }

        // Optimistic delete
        set((state) => {
          const newSelected = new Set(state.selectedSectionIds)
          newSelected.delete(id)
          return {
            sections: state.sections.filter((frag) => frag.id !== id),
            selectedSectionIds: newSelected,
          }
        }, false, 'deleteSection:optimistic')

        try {
          await api.sections.delete(id)

          set((state) => ({
            loadingStates: { ...state.loadingStates, deleteSection: false },
          }), false, 'deleteSection:success')

          return true
        } catch (error) {
          // Rollback optimistic delete
          set((state) => ({
            sections: [...state.sections, originalSection].sort((a, b) => a.order - b.order),
            error: error instanceof Error ? error.message : 'Failed to delete section',
            loadingStates: { ...state.loadingStates, deleteSection: false },
          }), false, 'deleteSection:error')

          return false
        }
      },

      // Initialize store by fetching all data
      initializeStore: async () => {
        set({ loading: true, error: null }, false, 'initializeStore:start')

        try {
          await Promise.all([
            get().fetchCategories(),
            get().fetchSections(),
          ])
          set({ loading: false }, false, 'initializeStore:success')
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to initialize store',
          }, false, 'initializeStore:error')
        }
      },

      // Computed: Get compiled prompt
      getCompiledPrompt: (): CompiledPrompt => {
        const state = get()
        const selectedSections = state.sections
          .filter((f) => state.selectedSectionIds.has(f.id))
          .sort((a, b) => a.order - b.order)

        let compiledText = selectedSections.map((f) => f.content).join('\n\n')

        if (state.customEnabled && state.customPrompt.trim()) {
          compiledText = state.customPrompt.trim() + '\n\n' + compiledText
        }

        return {
          sections: selectedSections,
          customPrompt: state.customEnabled ? state.customPrompt : undefined,
          compiledText: compiledText.trim(),
          sectionCount: selectedSections.length,
          customEnabled: state.customEnabled,
        }
      },

      // Computed: Get sections by category
      getSectionsByCategory: (categoryId: string): PromptSection[] => {
        return get()
          .sections
          .filter((f) => f.categoryId === categoryId)
          .sort((a, b) => a.order - b.order)
      },

      // Computed: Get selected sections
      getSelectedSections: (): PromptSection[] => {
        const state = get()
        return state.sections
          .filter((f) => state.selectedSectionIds.has(f.id))
          .sort((a, b) => a.order - b.order)
      },
    }),
    {
      name: 'PromptBuilderStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)

/**
 * Selector hooks for better performance
 * These prevent unnecessary re-renders by selecting only needed state
 */

// Get only categories
export const useCategories = () => usePromptStore((state) => state.categories)

// Get only sections
export const useSections = () => usePromptStore((state) => state.sections)

// Get only selected section IDs
export const useSelectedSectionIds = () => usePromptStore((state) => state.selectedSectionIds)

// Get only custom prompt state
export const useCustomPrompt = () => usePromptStore((state) => ({
  text: state.customPrompt,
  enabled: state.customEnabled,
}))

// Get only loading states
export const useLoadingStates = () => usePromptStore((state) => state.loadingStates)

// Get only error state
export const useError = () => usePromptStore((state) => state.error)

// Get compiled prompt (memoized)
export const useCompiledPrompt = () => usePromptStore((state) => state.getCompiledPrompt())

// Get sections for specific category
export const useSectionsByCategory = (categoryId: string) =>
  usePromptStore((state) => state.getSectionsByCategory(categoryId))

// Get selected sections
export const useSelectedSections = () =>
  usePromptStore((state) => state.getSelectedSections())

// Get category actions
export const useCategoryActions = () =>
  usePromptStore((state) => ({
    fetchCategories: state.fetchCategories,
    addCategory: state.addCategory,
    updateCategory: state.updateCategory,
    deleteCategory: state.deleteCategory,
  }))

// Get section actions
export const useSectionActions = () =>
  usePromptStore((state) => ({
    fetchSections: state.fetchSections,
    addSection: state.addSection,
    updateSection: state.updateSection,
    deleteSection: state.deleteSection,
    selectSection: state.selectSection,
    deselectSection: state.deselectSection,
    toggleSection: state.toggleSection,
    clearSelection: state.clearSelection,
  }))

// Get custom prompt actions
export const useCustomPromptActions = () =>
  usePromptStore((state) => ({
    updateCustomPrompt: state.updateCustomPrompt,
    setCustomEnabled: state.setCustomEnabled,
  }))
