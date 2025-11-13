export interface PromptFragment {
  id: string;
  content: string;
  categoryId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PromptFragmentWithCategory extends PromptFragment {
  category: Category;
}

export interface CompiledPrompt {
  fragments: PromptFragment[];
  customPrompt?: string;
  compiledText: string;
  fragmentCount: number;
  customEnabled: boolean;
}

export interface PromptBuilderState {
  categories: Category[];
  fragments: PromptFragment[];
  selectedFragmentIds: Set<string>;
  customPrompt: string;
  customEnabled: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  setCategories: (categories: Category[]) => void;
  setFragments: (fragments: PromptFragment[]) => void;
  toggleFragment: (fragmentId: string) => void;
  setCustomPrompt: (prompt: string) => void;
  setCustomEnabled: (enabled: boolean) => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed
  getCompiledPrompt: () => CompiledPrompt;
  getFragmentsByCategory: (categoryId: string) => PromptFragment[];
  getSelectedFragments: () => PromptFragment[];
}

export interface DialogState {
  isOpen: boolean;
  mode: 'add' | 'edit' | null;
  type: 'category' | 'fragment' | null;
  data: Partial<Category | PromptFragment> | null;
}
