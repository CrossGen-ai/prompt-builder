import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { PromptBuilderState, Category, PromptFragment, CompiledPrompt } from './types'
import { api } from './api'

/**
 * Extended state interface with async actions and error handling
 */
interface ExtendedPromptBuilderState extends PromptBuilderState {
  // Enhanced loading states
  loadingStates: {
    categories: boolean
    promptFragments: boolean
    createCategory: boolean
    updateCategory: boolean
    deleteCategory: boolean
    createPromptFragment: boolean
    updatePromptFragment: boolean
    deletePromptFragment: boolean
  }

  // Async actions for categories
  fetchCategories: () => Promise<void>
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category | null>
  updateCategory: (id: string, data: Partial<Category>) => Promise<Category | null>
  deleteCategory: (id: string) => Promise<boolean>

  // Async actions for promptFragments
  fetchPromptFragments: () => Promise<void>
  addPromptFragment: (promptFragment: Omit<PromptFragment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PromptFragment | null>
  updatePromptFragment: (id: string, data: Partial<PromptFragment>) => Promise<PromptFragment | null>
  deletePromptFragment: (id: string) => Promise<boolean>

  // Selection management
  selectPromptFragment: (id: string) => void
  deselectPromptFragment: (id: string) => void
  selectMultiplePromptFragments: (ids: string[]) => void
  deselectMultiplePromptFragments: (ids: string[]) => void

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
      promptFragments: [],
      selectedPromptFragmentIds: new Set<string>(),
      customPrompt: '',
      customEnabled: false,
      loading: false,
      error: null,
      loadingStates: {
        categories: false,
        promptFragments: false,
        createCategory: false,
        updateCategory: false,
        deleteCategory: false,
        createPromptFragment: false,
        updatePromptFragment: false,
        deletePromptFragment: false,
      },

      // Basic setters
      setCategories: (categories) => set({ categories }, false, 'setCategories'),

      setPromptFragments: (promptFragments) => set({ promptFragments }, false, 'setPromptFragments'),

      setCustomPrompt: (customPrompt) => set({ customPrompt }, false, 'setCustomPrompt'),

      setCustomEnabled: (customEnabled) => set({ customEnabled }, false, 'setCustomEnabled'),

      setLoading: (loading) => set({ loading }, false, 'setLoading'),

      setError: (error) => set({ error }, false, 'setError'),

      resetError: () => set({ error: null }, false, 'resetError'),

      // PromptFragment selection management
      togglePromptFragment: (promptFragmentId) =>
        set((state) => {
          const newSelected = new Set(state.selectedPromptFragmentIds)
          if (newSelected.has(promptFragmentId)) {
            newSelected.delete(promptFragmentId)
          } else {
            newSelected.add(promptFragmentId)
          }
          return { selectedPromptFragmentIds: newSelected }
        }, false, 'togglePromptFragment'),

      selectPromptFragment: (id) =>
        set((state) => {
          const newSelected = new Set(state.selectedPromptFragmentIds)
          newSelected.add(id)
          return { selectedPromptFragmentIds: newSelected }
        }, false, 'selectPromptFragment'),

      deselectPromptFragment: (id) =>
        set((state) => {
          const newSelected = new Set(state.selectedPromptFragmentIds)
          newSelected.delete(id)
          return { selectedPromptFragmentIds: newSelected }
        }, false, 'deselectPromptFragment'),

      selectMultiplePromptFragments: (ids) =>
        set((state) => {
          const newSelected = new Set(state.selectedPromptFragmentIds)
          ids.forEach((id) => newSelected.add(id))
          return { selectedPromptFragmentIds: newSelected }
        }, false, 'selectMultiplePromptFragments'),

      deselectMultiplePromptFragments: (ids) =>
        set((state) => {
          const newSelected = new Set(state.selectedPromptFragmentIds)
          ids.forEach((id) => newSelected.delete(id))
          return { selectedPromptFragmentIds: newSelected }
        }, false, 'deselectMultiplePromptFragments'),

      clearSelection: () =>
        set({ selectedPromptFragmentIds: new Set<string>() }, false, 'clearSelection'),

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

      // Async: Fetch all promptFragments
      fetchPromptFragments: async () => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, promptFragments: true },
          error: null,
        }), false, 'fetchPromptFragments:start')

        try {
          const promptFragments = await api.promptFragments.getAll()
          set((state) => ({
            promptFragments,
            loadingStates: { ...state.loadingStates, promptFragments: false },
          }), false, 'fetchPromptFragments:success')
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch promptFragments'
          set((state) => ({
            error: errorMessage,
            loadingStates: { ...state.loadingStates, promptFragments: false },
          }), false, 'fetchPromptFragments:error')
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
          // Also remove promptFragments in this category
          promptFragments: state.promptFragments.filter((frag) => frag.categoryId !== id),
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

          // Note: We don't restore promptFragments as they might have changed
          // Consider fetching promptFragments again if needed
          get().fetchPromptFragments()

          return false
        }
      },

      // Async: Add new promptFragment with optimistic update
      addPromptFragment: async (promptFragmentData) => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, createPromptFragment: true },
          error: null,
        }), false, 'addPromptFragment:start')

        // Create optimistic promptFragment
        const optimisticPromptFragment: PromptFragment = {
          id: `temp-${Date.now()}`,
          ...promptFragmentData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        // Optimistic update
        set((state) => ({
          promptFragments: [...state.promptFragments, optimisticPromptFragment],
        }), false, 'addPromptFragment:optimistic')

        try {
          const newPromptFragment = await api.promptFragments.create(promptFragmentData)

          // Replace optimistic with real data
          set((state) => ({
            promptFragments: state.promptFragments.map((frag) =>
              frag.id === optimisticPromptFragment.id ? newPromptFragment : frag
            ),
            loadingStates: { ...state.loadingStates, createPromptFragment: false },
          }), false, 'addPromptFragment:success')

          return newPromptFragment
        } catch (error) {
          // Rollback optimistic update
          set((state) => ({
            promptFragments: state.promptFragments.filter((frag) => frag.id !== optimisticPromptFragment.id),
            error: error instanceof Error ? error.message : 'Failed to create promptFragment',
            loadingStates: { ...state.loadingStates, createPromptFragment: false },
          }), false, 'addPromptFragment:error')

          return null
        }
      },

      // Async: Update promptFragment with optimistic update
      updatePromptFragment: async (id, data) => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, updatePromptFragment: true },
          error: null,
        }), false, 'updatePromptFragment:start')

        // Store original for rollback
        const originalPromptFragment = get().promptFragments.find((frag) => frag.id === id)
        if (!originalPromptFragment) {
          set((state) => ({
            error: 'PromptFragment not found',
            loadingStates: { ...state.loadingStates, updatePromptFragment: false },
          }), false, 'updatePromptFragment:notFound')
          return null
        }

        // Optimistic update
        set((state) => ({
          promptFragments: state.promptFragments.map((frag) =>
            frag.id === id ? { ...frag, ...data, updatedAt: new Date().toISOString() } : frag
          ),
        }), false, 'updatePromptFragment:optimistic')

        try {
          const updatedPromptFragment = await api.promptFragments.update(id, data)

          // Replace with real data
          set((state) => ({
            promptFragments: state.promptFragments.map((frag) =>
              frag.id === id ? updatedPromptFragment : frag
            ),
            loadingStates: { ...state.loadingStates, updatePromptFragment: false },
          }), false, 'updatePromptFragment:success')

          return updatedPromptFragment
        } catch (error) {
          // Rollback optimistic update
          set((state) => ({
            promptFragments: state.promptFragments.map((frag) =>
              frag.id === id ? originalPromptFragment : frag
            ),
            error: error instanceof Error ? error.message : 'Failed to update promptFragment',
            loadingStates: { ...state.loadingStates, updatePromptFragment: false },
          }), false, 'updatePromptFragment:error')

          return null
        }
      },

      // Async: Delete promptFragment with optimistic update
      deletePromptFragment: async (id) => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, deletePromptFragment: true },
          error: null,
        }), false, 'deletePromptFragment:start')

        // Store original for rollback
        const originalPromptFragment = get().promptFragments.find((frag) => frag.id === id)
        if (!originalPromptFragment) {
          set((state) => ({
            error: 'PromptFragment not found',
            loadingStates: { ...state.loadingStates, deletePromptFragment: false },
          }), false, 'deletePromptFragment:notFound')
          return false
        }

        // Optimistic delete
        set((state) => {
          const newSelected = new Set(state.selectedPromptFragmentIds)
          newSelected.delete(id)
          return {
            promptFragments: state.promptFragments.filter((frag) => frag.id !== id),
            selectedPromptFragmentIds: newSelected,
          }
        }, false, 'deletePromptFragment:optimistic')

        try {
          await api.promptFragments.delete(id)

          set((state) => ({
            loadingStates: { ...state.loadingStates, deletePromptFragment: false },
          }), false, 'deletePromptFragment:success')

          return true
        } catch (error) {
          // Rollback optimistic delete
          set((state) => ({
            promptFragments: [...state.promptFragments, originalPromptFragment].sort((a, b) => a.order - b.order),
            error: error instanceof Error ? error.message : 'Failed to delete promptFragment',
            loadingStates: { ...state.loadingStates, deletePromptFragment: false },
          }), false, 'deletePromptFragment:error')

          return false
        }
      },

      // Initialize store by fetching all data
      initializeStore: async () => {
        set({ loading: true, error: null }, false, 'initializeStore:start')

        try {
          await Promise.all([
            get().fetchCategories(),
            get().fetchPromptFragments(),
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
        const selectedPromptFragments = state.promptFragments
          .filter((f) => state.selectedPromptFragmentIds.has(f.id))
          .sort((a, b) => a.order - b.order)

        let compiledText = selectedPromptFragments.map((f) => f.content).join('\n\n')

        if (state.customEnabled && state.customPrompt.trim()) {
          compiledText = state.customPrompt.trim() + '\n\n' + compiledText
        }

        return {
          promptFragments: selectedPromptFragments,
          customPrompt: state.customEnabled ? state.customPrompt : undefined,
          compiledText: compiledText.trim(),
          promptFragmentCount: selectedPromptFragments.length,
          customEnabled: state.customEnabled,
        }
      },

      // Computed: Get promptFragments by category
      getPromptFragmentsByCategory: (categoryId: string): PromptFragment[] => {
        return get()
          .promptFragments
          .filter((f) => f.categoryId === categoryId)
          .sort((a, b) => a.order - b.order)
      },

      // Computed: Get selected promptFragments
      getSelectedPromptFragments: (): PromptFragment[] => {
        const state = get()
        return state.promptFragments
          .filter((f) => state.selectedPromptFragmentIds.has(f.id))
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

// Get only promptFragments
export const usePromptFragments = () => usePromptStore((state) => state.promptFragments)

// Get only selected promptFragment IDs
export const useSelectedPromptFragmentIds = () => usePromptStore((state) => state.selectedPromptFragmentIds)

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

// Get promptFragments for specific category
export const usePromptFragmentsByCategory = (categoryId: string) =>
  usePromptStore((state) => state.getPromptFragmentsByCategory(categoryId))

// Get selected promptFragments
export const useSelectedPromptFragments = () =>
  usePromptStore((state) => state.getSelectedPromptFragments())

// Get category actions
export const useCategoryActions = () =>
  usePromptStore((state) => ({
    fetchCategories: state.fetchCategories,
    addCategory: state.addCategory,
    updateCategory: state.updateCategory,
    deleteCategory: state.deleteCategory,
  }))

// Get promptFragment actions
export const usePromptFragmentActions = () =>
  usePromptStore((state) => ({
    fetchPromptFragments: state.fetchPromptFragments,
    addPromptFragment: state.addPromptFragment,
    updatePromptFragment: state.updatePromptFragment,
    deletePromptFragment: state.deletePromptFragment,
    selectPromptFragment: state.selectPromptFragment,
    deselectPromptFragment: state.deselectPromptFragment,
    togglePromptFragment: state.togglePromptFragment,
    clearSelection: state.clearSelection,
  }))

// Get custom prompt actions
export const useCustomPromptActions = () =>
  usePromptStore((state) => ({
    updateCustomPrompt: state.updateCustomPrompt,
    setCustomEnabled: state.setCustomEnabled,
  }))
