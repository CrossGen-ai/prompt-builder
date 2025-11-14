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
  promptFragments: PromptFragment[];
  customPrompt?: string;
  compiledText: string;
  promptFragmentCount: number;
  customEnabled: boolean;
}

export interface PromptBuilderState {
  categories: Category[];
  promptFragments: PromptFragment[];
  selectedPromptFragmentIds: Set<string>;
  customPrompt: string;
  customEnabled: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  setCategories: (categories: Category[]) => void;
  setPromptFragments: (promptFragments: PromptFragment[]) => void;
  togglePromptFragment: (promptFragmentId: string) => void;
  setCustomPrompt: (prompt: string) => void;
  setCustomEnabled: (enabled: boolean) => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed
  getCompiledPrompt: () => CompiledPrompt;
  getPromptFragmentsByCategory: (categoryId: string) => PromptFragment[];
  getSelectedPromptFragments: () => PromptFragment[];
}

export interface DialogState {
  isOpen: boolean;
  mode: 'add' | 'edit' | null;
  type: 'category' | 'promptFragment' | null;
  data: Partial<Category | PromptFragment> | null;
}
