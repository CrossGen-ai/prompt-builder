import { Category, PromptSection, CompiledPrompt } from '@/lib/types'

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'System Prompts',
    description: 'Core system instructions',
    order: 1,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-2',
    name: 'Code Guidelines',
    description: 'Coding standards and best practices',
    order: 2,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-3',
    name: 'Testing',
    description: 'Testing requirements and strategies',
    order: 3,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
]

export const mockSections: PromptSection[] = [
  {
    id: 'frag-1',
    categoryId: 'cat-1',
    content: 'You are a helpful AI assistant.',
    order: 1,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'frag-2',
    categoryId: 'cat-1',
    content: 'Always be concise and clear.',
    order: 2,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'frag-3',
    categoryId: 'cat-2',
    content: 'Follow TypeScript best practices.',
    order: 1,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'frag-4',
    categoryId: 'cat-2',
    content: 'Use functional components with hooks.',
    order: 2,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'frag-5',
    categoryId: 'cat-3',
    content: 'Aim for 90% test coverage.',
    order: 1,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
]

export const mockCompiledPrompt: CompiledPrompt = {
  sections: [mockSections[0], mockSections[2]],
  customPrompt: undefined,
  compiledText: 'You are a helpful AI assistant.\n\nFollow TypeScript best practices.',
  sectionCount: 2,
  customEnabled: false,
}

export const mockCompiledPromptWithCustom: CompiledPrompt = {
  sections: [mockSections[0]],
  customPrompt: 'Custom instruction here.',
  compiledText: 'Custom instruction here.\n\nYou are a helpful AI assistant.',
  sectionCount: 1,
  customEnabled: true,
}

export const createMockCategory = (overrides?: Partial<Category>): Category => ({
  id: `cat-${Date.now()}`,
  name: 'Test Category',
  description: 'Test description',
  order: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createMockSection = (overrides?: Partial<PromptSection>): PromptSection => ({
  id: `frag-${Date.now()}`,
  categoryId: 'cat-1',
  content: 'Test content',
  order: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})
