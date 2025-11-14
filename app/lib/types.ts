export interface Section {
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

export interface SectionWithCategory extends Section {
  category: Category;
}

export interface CompiledPrompt {
  sections: Section[];
  customPrompt?: string;
  compiledText: string;
  sectionCount: number;
  customEnabled: boolean;
}

export interface PromptBuilderState {
  categories: Category[];
  sections: Section[];
  selectedSectionIds: Set<string>;
  customPrompt: string;
  customEnabled: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  setCategories: (categories: Category[]) => void;
  setSections: (sections: Section[]) => void;
  toggleSection: (sectionId: string) => void;
  setCustomPrompt: (prompt: string) => void;
  setCustomEnabled: (enabled: boolean) => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed
  getCompiledPrompt: () => CompiledPrompt;
  getSectionsByCategory: (categoryId: string) => Section[];
  getSelectedSections: () => Section[];
}

export interface DialogState {
  isOpen: boolean;
  mode: 'add' | 'edit' | null;
  type: 'category' | 'section' | null;
  data: Partial<Category | Section> | null;
}
