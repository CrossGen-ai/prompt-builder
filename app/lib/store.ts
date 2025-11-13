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
    fragments: boolean
    createCategory: boolean
    updateCategory: boolean
    deleteCategory: boolean
    createFragment: boolean
    updateFragment: boolean
    deleteFragment: boolean
  }

  // Async actions for categories
  fetchCategories: () => Promise<void>
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category | null>
  updateCategory: (id: string, data: Partial<Category>) => Promise<Category | null>
  deleteCategory: (id: string) => Promise<boolean>

  // Async actions for fragments
  fetchFragments: () => Promise<void>
  addFragment: (fragment: Omit<PromptFragment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PromptFragment | null>
  updateFragment: (id: string, data: Partial<PromptFragment>) => Promise<PromptFragment | null>
  deleteFragment: (id: string) => Promise<boolean>

  // Selection management
  selectFragment: (id: string) => void
  deselectFragment: (id: string) => void
  selectMultipleFragments: (ids: string[]) => void
  deselectMultipleFragments: (ids: string[]) => void

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
      fragments: [],
      selectedFragmentIds: new Set<string>(),
      customPrompt: '',
      customEnabled: false,
      loading: false,
      error: null,
      loadingStates: {
        categories: false,
        fragments: false,
        createCategory: false,
        updateCategory: false,
        deleteCategory: false,
        createFragment: false,
        updateFragment: false,
        deleteFragment: false,
      },

      // Basic setters
      setCategories: (categories) => set({ categories }, false, 'setCategories'),

      setFragments: (fragments) => set({ fragments }, false, 'setFragments'),

      setCustomPrompt: (customPrompt) => set({ customPrompt }, false, 'setCustomPrompt'),

      setCustomEnabled: (customEnabled) => set({ customEnabled }, false, 'setCustomEnabled'),

      setLoading: (loading) => set({ loading }, false, 'setLoading'),

      setError: (error) => set({ error }, false, 'setError'),

      resetError: () => set({ error: null }, false, 'resetError'),

      // Fragment selection management
      toggleFragment: (fragmentId) =>
        set((state) => {
          const newSelected = new Set(state.selectedFragmentIds)
          if (newSelected.has(fragmentId)) {
            newSelected.delete(fragmentId)
          } else {
            newSelected.add(fragmentId)
          }
          return { selectedFragmentIds: newSelected }
        }, false, 'toggleFragment'),

      selectFragment: (id) =>
        set((state) => {
          const newSelected = new Set(state.selectedFragmentIds)
          newSelected.add(id)
          return { selectedFragmentIds: newSelected }
        }, false, 'selectFragment'),

      deselectFragment: (id) =>
        set((state) => {
          const newSelected = new Set(state.selectedFragmentIds)
          newSelected.delete(id)
          return { selectedFragmentIds: newSelected }
        }, false, 'deselectFragment'),

      selectMultipleFragments: (ids) =>
        set((state) => {
          const newSelected = new Set(state.selectedFragmentIds)
          ids.forEach((id) => newSelected.add(id))
          return { selectedFragmentIds: newSelected }
        }, false, 'selectMultipleFragments'),

      deselectMultipleFragments: (ids) =>
        set((state) => {
          const newSelected = new Set(state.selectedFragmentIds)
          ids.forEach((id) => newSelected.delete(id))
          return { selectedFragmentIds: newSelected }
        }, false, 'deselectMultipleFragments'),

      clearSelection: () =>
        set({ selectedFragmentIds: new Set<string>() }, false, 'clearSelection'),

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

      // Async: Fetch all fragments
      fetchFragments: async () => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, fragments: true },
          error: null,
        }), false, 'fetchFragments:start')

        try {
          const fragments = await api.fragments.getAll()
          set((state) => ({
            fragments,
            loadingStates: { ...state.loadingStates, fragments: false },
          }), false, 'fetchFragments:success')
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch fragments'
          set((state) => ({
            error: errorMessage,
            loadingStates: { ...state.loadingStates, fragments: false },
          }), false, 'fetchFragments:error')
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
          // Also remove fragments in this category
          fragments: state.fragments.filter((frag) => frag.categoryId !== id),
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

          // Note: We don't restore fragments as they might have changed
          // Consider fetching fragments again if needed
          get().fetchFragments()

          return false
        }
      },

      // Async: Add new fragment with optimistic update
      addFragment: async (fragmentData) => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, createFragment: true },
          error: null,
        }), false, 'addFragment:start')

        // Create optimistic fragment
        const optimisticFragment: PromptFragment = {
          id: `temp-${Date.now()}`,
          ...fragmentData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        // Optimistic update
        set((state) => ({
          fragments: [...state.fragments, optimisticFragment],
        }), false, 'addFragment:optimistic')

        try {
          const newFragment = await api.fragments.create(fragmentData)

          // Replace optimistic with real data
          set((state) => ({
            fragments: state.fragments.map((frag) =>
              frag.id === optimisticFragment.id ? newFragment : frag
            ),
            loadingStates: { ...state.loadingStates, createFragment: false },
          }), false, 'addFragment:success')

          return newFragment
        } catch (error) {
          // Rollback optimistic update
          set((state) => ({
            fragments: state.fragments.filter((frag) => frag.id !== optimisticFragment.id),
            error: error instanceof Error ? error.message : 'Failed to create fragment',
            loadingStates: { ...state.loadingStates, createFragment: false },
          }), false, 'addFragment:error')

          return null
        }
      },

      // Async: Update fragment with optimistic update
      updateFragment: async (id, data) => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, updateFragment: true },
          error: null,
        }), false, 'updateFragment:start')

        // Store original for rollback
        const originalFragment = get().fragments.find((frag) => frag.id === id)
        if (!originalFragment) {
          set((state) => ({
            error: 'Fragment not found',
            loadingStates: { ...state.loadingStates, updateFragment: false },
          }), false, 'updateFragment:notFound')
          return null
        }

        // Optimistic update
        set((state) => ({
          fragments: state.fragments.map((frag) =>
            frag.id === id ? { ...frag, ...data, updatedAt: new Date().toISOString() } : frag
          ),
        }), false, 'updateFragment:optimistic')

        try {
          const updatedFragment = await api.fragments.update(id, data)

          // Replace with real data
          set((state) => ({
            fragments: state.fragments.map((frag) =>
              frag.id === id ? updatedFragment : frag
            ),
            loadingStates: { ...state.loadingStates, updateFragment: false },
          }), false, 'updateFragment:success')

          return updatedFragment
        } catch (error) {
          // Rollback optimistic update
          set((state) => ({
            fragments: state.fragments.map((frag) =>
              frag.id === id ? originalFragment : frag
            ),
            error: error instanceof Error ? error.message : 'Failed to update fragment',
            loadingStates: { ...state.loadingStates, updateFragment: false },
          }), false, 'updateFragment:error')

          return null
        }
      },

      // Async: Delete fragment with optimistic update
      deleteFragment: async (id) => {
        set((state) => ({
          loadingStates: { ...state.loadingStates, deleteFragment: true },
          error: null,
        }), false, 'deleteFragment:start')

        // Store original for rollback
        const originalFragment = get().fragments.find((frag) => frag.id === id)
        if (!originalFragment) {
          set((state) => ({
            error: 'Fragment not found',
            loadingStates: { ...state.loadingStates, deleteFragment: false },
          }), false, 'deleteFragment:notFound')
          return false
        }

        // Optimistic delete
        set((state) => {
          const newSelected = new Set(state.selectedFragmentIds)
          newSelected.delete(id)
          return {
            fragments: state.fragments.filter((frag) => frag.id !== id),
            selectedFragmentIds: newSelected,
          }
        }, false, 'deleteFragment:optimistic')

        try {
          await api.fragments.delete(id)

          set((state) => ({
            loadingStates: { ...state.loadingStates, deleteFragment: false },
          }), false, 'deleteFragment:success')

          return true
        } catch (error) {
          // Rollback optimistic delete
          set((state) => ({
            fragments: [...state.fragments, originalFragment].sort((a, b) => a.order - b.order),
            error: error instanceof Error ? error.message : 'Failed to delete fragment',
            loadingStates: { ...state.loadingStates, deleteFragment: false },
          }), false, 'deleteFragment:error')

          return false
        }
      },

      // Initialize store by fetching all data
      initializeStore: async () => {
        set({ loading: true, error: null }, false, 'initializeStore:start')

        try {
          await Promise.all([
            get().fetchCategories(),
            get().fetchFragments(),
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
        const selectedFragments = state.fragments
          .filter((f) => state.selectedFragmentIds.has(f.id))
          .sort((a, b) => a.order - b.order)

        let compiledText = selectedFragments.map((f) => f.content).join('\n\n')

        if (state.customEnabled && state.customPrompt.trim()) {
          compiledText = state.customPrompt.trim() + '\n\n' + compiledText
        }

        return {
          fragments: selectedFragments,
          customPrompt: state.customEnabled ? state.customPrompt : undefined,
          compiledText: compiledText.trim(),
          fragmentCount: selectedFragments.length,
          customEnabled: state.customEnabled,
        }
      },

      // Computed: Get fragments by category
      getFragmentsByCategory: (categoryId: string): PromptFragment[] => {
        return get()
          .fragments
          .filter((f) => f.categoryId === categoryId)
          .sort((a, b) => a.order - b.order)
      },

      // Computed: Get selected fragments
      getSelectedFragments: (): PromptFragment[] => {
        const state = get()
        return state.fragments
          .filter((f) => state.selectedFragmentIds.has(f.id))
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

// Get only fragments
export const useFragments = () => usePromptStore((state) => state.fragments)

// Get only selected fragment IDs
export const useSelectedFragmentIds = () => usePromptStore((state) => state.selectedFragmentIds)

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

// Get fragments for specific category
export const useFragmentsByCategory = (categoryId: string) =>
  usePromptStore((state) => state.getFragmentsByCategory(categoryId))

// Get selected fragments
export const useSelectedFragments = () =>
  usePromptStore((state) => state.getSelectedFragments())

// Get category actions
export const useCategoryActions = () =>
  usePromptStore((state) => ({
    fetchCategories: state.fetchCategories,
    addCategory: state.addCategory,
    updateCategory: state.updateCategory,
    deleteCategory: state.deleteCategory,
  }))

// Get fragment actions
export const useFragmentActions = () =>
  usePromptStore((state) => ({
    fetchFragments: state.fetchFragments,
    addFragment: state.addFragment,
    updateFragment: state.updateFragment,
    deleteFragment: state.deleteFragment,
    selectFragment: state.selectFragment,
    deselectFragment: state.deselectFragment,
    toggleFragment: state.toggleFragment,
    clearSelection: state.clearSelection,
  }))

// Get custom prompt actions
export const useCustomPromptActions = () =>
  usePromptStore((state) => ({
    updateCustomPrompt: state.updateCustomPrompt,
    setCustomEnabled: state.setCustomEnabled,
  }))
