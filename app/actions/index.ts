/**
 * Centralized exports for all Server Actions
 * Import from '@/app/actions' instead of individual files
 */

// Category actions
export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from './categories';

// Section actions
export {
  getSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  getSectionsByCategory
} from './sections';

// Selection actions
export {
  getSelectedSections,
  selectSection,
  deselectSection,
  toggleSectionSelection,
  clearAllSelections,
  selectDefaultSections
} from './selections';

// Prompt actions
export {
  getCompiledPrompt,
  getCustomPrompt,
  updateCustomPrompt,
  clearCustomPrompt
} from './prompt';
