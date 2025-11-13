# AI Prompt Builder - State Management with Zustand

## State Management Strategy

The application uses **Zustand** for client-side state management with the following principles:

1. **Store per Domain**: Separate stores for categories, sections, selections, custom prompt, and UI
2. **Optimistic Updates**: Update UI immediately, sync with server asynchronously
3. **Persistence**: Selected stores persist to localStorage
4. **Type Safety**: Full TypeScript integration
5. **Devtools**: Redux DevTools integration for debugging

---

## Store Architecture

```
┌─────────────────────────────────────────────────┐
│                 Application State                │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Category    │  │   Section    │            │
│  │   Store      │  │    Store     │            │
│  └──────────────┘  └──────────────┘            │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Selection   │  │   Custom     │            │
│  │   Store      │  │   Prompt     │            │
│  └──────────────┘  └──────────────┘            │
│                                                  │
│  ┌──────────────┐                               │
│  │  UI Store    │                               │
│  │  (Modals,    │                               │
│  │   Theme)     │                               │
│  └──────────────┘                               │
└─────────────────────────────────────────────────┘
```

---

## Category Store

Manages categories list and CRUD operations.

```typescript
// lib/stores/category-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Category } from '@/lib/types/database';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: number, data: Partial<Category>) => void;
  deleteCategory: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCategoryStore = create<CategoryState>()(
  devtools(
    persist(
      (set) => ({
        categories: [],
        isLoading: false,
        error: null,

        setCategories: (categories) =>
          set({ categories, error: null }),

        addCategory: (category) =>
          set((state) => ({
            categories: [category, ...state.categories],
            error: null,
          })),

        updateCategory: (id, data) =>
          set((state) => ({
            categories: state.categories.map((cat) =>
              cat.id === id ? { ...cat, ...data } : cat
            ),
            error: null,
          })),

        deleteCategory: (id) =>
          set((state) => ({
            categories: state.categories.filter((cat) => cat.id !== id),
            error: null,
          })),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),
      }),
      {
        name: 'category-store',
        partialize: (state) => ({ categories: state.categories }),
      }
    ),
    { name: 'CategoryStore' }
  )
);
```

**Usage**:
```typescript
// In component
const categories = useCategoryStore(state => state.categories);
const addCategory = useCategoryStore(state => state.addCategory);

// Optimistic update
addCategory(newCategory);
await createCategoryAction(newCategory);
```

---

## Section Store

Manages sections with category relationships.

```typescript
// lib/stores/section-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Section } from '@/lib/types/database';

interface SectionState {
  sections: Section[];

  // Actions
  setSections: (sections: Section[]) => void;
  addSection: (section: Section) => void;
  updateSection: (id: number, data: Partial<Section>) => void;
  deleteSection: (id: number) => void;
  getSectionsByCategory: (categoryId: number) => Section[];
}

export const useSectionStore = create<SectionState>()(
  devtools(
    persist(
      (set, get) => ({
        sections: [],

        setSections: (sections) => set({ sections }),

        addSection: (section) =>
          set((state) => ({
            sections: [section, ...state.sections],
          })),

        updateSection: (id, data) =>
          set((state) => ({
            sections: state.sections.map((sec) =>
              sec.id === id ? { ...sec, ...data } : sec
            ),
          })),

        deleteSection: (id) =>
          set((state) => ({
            sections: state.sections.filter((sec) => sec.id !== id),
          })),

        getSectionsByCategory: (categoryId) =>
          get().sections.filter((sec) => sec.categoryId === categoryId),
      }),
      {
        name: 'section-store',
        partialize: (state) => ({ sections: state.sections }),
      }
    ),
    { name: 'SectionStore' }
  )
);
```

---

## Selection Store

Manages selected sections for prompt assembly.

```typescript
// lib/stores/selection-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SelectionState {
  selectedIds: number[];

  // Actions
  toggleSelection: (sectionId: number) => void;
  addSelection: (sectionId: number) => void;
  removeSelection: (sectionId: number) => void;
  clearSelections: () => void;
  setSelections: (ids: number[]) => void;
  isSelected: (sectionId: number) => boolean;
}

export const useSelectionStore = create<SelectionState>()(
  devtools(
    persist(
      (set, get) => ({
        selectedIds: [],

        toggleSelection: (sectionId) =>
          set((state) => ({
            selectedIds: state.selectedIds.includes(sectionId)
              ? state.selectedIds.filter((id) => id !== sectionId)
              : [...state.selectedIds, sectionId],
          })),

        addSelection: (sectionId) =>
          set((state) => ({
            selectedIds: state.selectedIds.includes(sectionId)
              ? state.selectedIds
              : [...state.selectedIds, sectionId],
          })),

        removeSelection: (sectionId) =>
          set((state) => ({
            selectedIds: state.selectedIds.filter((id) => id !== sectionId),
          })),

        clearSelections: () => set({ selectedIds: [] }),

        setSelections: (ids) => set({ selectedIds: ids }),

        isSelected: (sectionId) => get().selectedIds.includes(sectionId),
      }),
      {
        name: 'selection-store',
      }
    ),
    { name: 'SelectionStore' }
  )
);
```

**Selectors** (for performance):
```typescript
// Only re-renders when selectedIds changes
const selectedIds = useSelectionStore(state => state.selectedIds);

// Derived state with useMemo in component
const selectedCount = useMemo(
  () => selectedIds.length,
  [selectedIds]
);
```

---

## Custom Prompt Store

Manages custom prompt text and enabled state.

```typescript
// lib/stores/custom-prompt-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface CustomPromptState {
  text: string;
  isEnabled: boolean;

  // Actions
  setText: (text: string) => void;
  setEnabled: (enabled: boolean) => void;
  toggleEnabled: () => void;
  reset: () => void;
}

export const useCustomPromptStore = create<CustomPromptState>()(
  devtools(
    persist(
      (set) => ({
        text: '',
        isEnabled: false,

        setText: (text) => set({ text }),

        setEnabled: (enabled) => set({ isEnabled: enabled }),

        toggleEnabled: () =>
          set((state) => ({ isEnabled: !state.isEnabled })),

        reset: () => set({ text: '', isEnabled: false }),
      }),
      {
        name: 'custom-prompt-store',
      }
    ),
    { name: 'CustomPromptStore' }
  )
);
```

---

## UI Store

Manages UI state (modals, theme, toast).

```typescript
// lib/stores/ui-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type ModalType =
  | 'create-category'
  | 'edit-category'
  | 'delete-category'
  | 'create-section'
  | 'edit-section'
  | 'delete-section';

interface ModalState {
  isOpen: boolean;
  data?: unknown;
}

interface UIState {
  modals: Record<ModalType, ModalState>;
  theme: 'light' | 'dark' | 'system';

  // Actions
  openModal: (type: ModalType, data?: unknown) => void;
  closeModal: (type: ModalType) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      modals: {
        'create-category': { isOpen: false },
        'edit-category': { isOpen: false },
        'delete-category': { isOpen: false },
        'create-section': { isOpen: false },
        'edit-section': { isOpen: false },
        'delete-section': { isOpen: false },
      },
      theme: 'system',

      openModal: (type, data) =>
        set((state) => ({
          modals: {
            ...state.modals,
            [type]: { isOpen: true, data },
          },
        })),

      closeModal: (type) =>
        set((state) => ({
          modals: {
            ...state.modals,
            [type]: { isOpen: false, data: undefined },
          },
        })),

      setTheme: (theme) => set({ theme }),
    }),
    { name: 'UIStore' }
  )
);
```

**Usage**:
```typescript
// Open modal with data
const { openModal } = useUIStore();
openModal('edit-category', { id: 1, name: 'Test' });

// Access modal state
const isOpen = useUIStore(state => state.modals['edit-category'].isOpen);
const data = useUIStore(state => state.modals['edit-category'].data);
```

---

## Custom Hooks (Computed State)

### `useAssembledPrompt`

Computes the final assembled prompt from selections.

```typescript
// lib/hooks/use-assembled-prompt.ts
import { useMemo } from 'react';
import { useSectionStore } from '@/lib/stores/section-store';
import { useSelectionStore } from '@/lib/stores/selection-store';
import { useCustomPromptStore } from '@/lib/stores/custom-prompt-store';

export function useAssembledPrompt(): string {
  const sections = useSectionStore(state => state.sections);
  const selectedIds = useSelectionStore(state => state.selectedIds);
  const customText = useCustomPromptStore(state => state.text);
  const isCustomEnabled = useCustomPromptStore(state => state.isEnabled);

  return useMemo(() => {
    // Get selected sections in order
    const selectedSections = selectedIds
      .map(id => sections.find(s => s.id === id))
      .filter(Boolean)
      .map(s => s!.promptText);

    let assembled = selectedSections.join('\n\n');

    // Append custom prompt if enabled
    if (isCustomEnabled && customText.trim()) {
      assembled += '\n\n' + customText;
    }

    return assembled;
  }, [sections, selectedIds, customText, isCustomEnabled]);
}
```

**Performance**: Memoized to prevent recalculation on unrelated state changes.

---

### `useCategoryWithSections`

Fetches category with its sections.

```typescript
// lib/hooks/use-category-with-sections.ts
import { useMemo } from 'react';
import { useCategoryStore } from '@/lib/stores/category-store';
import { useSectionStore } from '@/lib/stores/section-store';
import type { Category, Section } from '@/lib/types/database';

export function useCategoryWithSections(categoryId: number): {
  category: Category | undefined;
  sections: Section[];
} {
  const categories = useCategoryStore(state => state.categories);
  const getSectionsByCategory = useSectionStore(state => state.getSectionsByCategory);

  return useMemo(
    () => ({
      category: categories.find(c => c.id === categoryId),
      sections: getSectionsByCategory(categoryId),
    }),
    [categories, categoryId, getSectionsByCategory]
  );
}
```

---

## Store Synchronization Patterns

### 1. **Server → Client (Initial Load)**

```typescript
// Server Component
export default async function HomePage() {
  const categories = await CategoryService.getAll();
  return <CategoryList initialCategories={categories} />;
}

// Client Component
'use client';
export function CategoryList({ initialCategories }: Props) {
  const setCategories = useCategoryStore(state => state.setCategories);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories, setCategories]);

  // ...
}
```

---

### 2. **Client → Server (Mutations)**

```typescript
// Component
const addCategory = useCategoryStore(state => state.addCategory);

const onSubmit = async (data: CategoryFormValues) => {
  // 1. Optimistic update
  const tempId = Date.now();
  addCategory({ id: tempId, ...data, createdAt: new Date().toISOString() });

  try {
    // 2. Server sync
    const result = await createCategoryAction(data);

    // 3. Replace temp with real data
    useCategoryStore.getState().updateCategory(tempId, result.data);
  } catch (error) {
    // 4. Rollback on error
    useCategoryStore.getState().deleteCategory(tempId);
    throw error;
  }
};
```

---

### 3. **Store → Store (Derived State)**

```typescript
// Delete category cascades to sections and selections
const deleteCategory = useCategoryStore(state => state.deleteCategory);

const handleDelete = async (categoryId: number) => {
  // Get affected sections
  const sections = useSectionStore
    .getState()
    .getSectionsByCategory(categoryId);

  // Clear selections for those sections
  sections.forEach(section => {
    useSelectionStore.getState().removeSelection(section.id);
  });

  // Delete sections
  sections.forEach(section => {
    useSectionStore.getState().deleteSection(section.id);
  });

  // Delete category
  deleteCategory(categoryId);

  // Server sync (cascades automatically)
  await deleteCategoryAction(categoryId);
};
```

---

## Persistence Strategy

### What to Persist
- ✅ **Categories**: Yes (offline access)
- ✅ **Sections**: Yes (offline access)
- ✅ **Selections**: Yes (preserve state across sessions)
- ✅ **Custom Prompt**: Yes (preserve user input)
- ❌ **UI State**: No (reset on page load)

### Persistence Configuration

```typescript
persist(
  (set, get) => ({ /* store */ }),
  {
    name: 'store-name', // localStorage key
    partialize: (state) => ({ /* only persist these fields */ }),
    version: 1,
    migrate: (persistedState, version) => {
      // Handle version migrations
      return persistedState;
    },
  }
)
```

---

## Testing Stores

### Unit Tests

```typescript
// tests/stores/category-store.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCategoryStore } from '@/lib/stores/category-store';

describe('CategoryStore', () => {
  beforeEach(() => {
    // Reset store
    useCategoryStore.setState({ categories: [] });
  });

  it('should add category', () => {
    const { result } = renderHook(() => useCategoryStore());

    act(() => {
      result.current.addCategory({ id: 1, name: 'Test' });
    });

    expect(result.current.categories).toHaveLength(1);
    expect(result.current.categories[0].name).toBe('Test');
  });

  it('should update category', () => {
    const { result } = renderHook(() => useCategoryStore());

    act(() => {
      result.current.addCategory({ id: 1, name: 'Test' });
      result.current.updateCategory(1, { name: 'Updated' });
    });

    expect(result.current.categories[0].name).toBe('Updated');
  });
});
```

---

## Performance Optimizations

### 1. **Selective Subscriptions**

```typescript
// ❌ Re-renders on any store change
const store = useCategoryStore();

// ✅ Only re-renders when categories change
const categories = useCategoryStore(state => state.categories);
```

### 2. **Shallow Equality**

```typescript
import { shallow } from 'zustand/shallow';

// Only re-renders when categories or loading changes
const { categories, isLoading } = useCategoryStore(
  state => ({ categories: state.categories, isLoading: state.isLoading }),
  shallow
);
```

### 3. **Memoized Selectors**

```typescript
// Create reusable selector
const selectCategoriesWithCounts = (state: CategoryState) =>
  state.categories.map(cat => ({
    ...cat,
    sectionCount: useSectionStore
      .getState()
      .getSectionsByCategory(cat.id).length,
  }));

// Use in component
const categoriesWithCounts = useCategoryStore(selectCategoriesWithCounts);
```

---

## Debugging

### Redux DevTools Integration

```typescript
// Already configured via devtools middleware
// Open Redux DevTools in browser to inspect:
// - Current state
// - Action history
// - Time-travel debugging
```

### Store Inspection

```typescript
// Get current state without subscribing
const currentState = useCategoryStore.getState();

// Subscribe to all changes (debugging only)
const unsubscribe = useCategoryStore.subscribe(
  state => console.log('State changed:', state)
);
```

---

## Migration to Server State Management (Future)

If the app grows, consider migrating to **TanStack Query** (React Query):

```typescript
// Instead of Zustand
const { data: categories } = useQuery({
  queryKey: ['categories'],
  queryFn: () => fetch('/api/categories').then(r => r.json()),
});

// Mutations with optimistic updates
const mutation = useMutation({
  mutationFn: createCategory,
  onMutate: async (newCategory) => {
    // Optimistic update
    const previous = queryClient.getQueryData(['categories']);
    queryClient.setQueryData(['categories'], old => [...old, newCategory]);
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback
    queryClient.setQueryData(['categories'], context.previous);
  },
});
```

**Benefits**:
- Automatic caching
- Background refetching
- Stale-while-revalidate
- Request deduplication
