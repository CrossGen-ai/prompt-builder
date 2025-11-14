import { Category, PromptFragment } from './types'
import { API_BASE_URL } from './utils'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new ApiError(response.status, error.message || 'API request failed')
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export const api = {
  // Categories
  categories: {
    getAll: () => fetchApi<Category[]>('/categories'),
    getById: (id: string) => fetchApi<Category>(`/categories/${id}`),
    create: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) =>
      fetchApi<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Category>) =>
      fetchApi<Category>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/categories/${id}`, {
        method: 'DELETE',
      }),
  },

  // Prompt Fragments
  promptFragments: {
    getAll: () => fetchApi<PromptFragment[]>('/prompt-fragments'),
    getById: (id: string) => fetchApi<PromptFragment>(`/prompt-fragments/${id}`),
    getByCategory: (categoryId: string) =>
      fetchApi<PromptFragment[]>(`/prompt-fragments?categoryId=${categoryId}`),
    create: (data: Omit<PromptFragment, 'id' | 'createdAt' | 'updatedAt'>) =>
      fetchApi<PromptFragment>('/prompt-fragments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<PromptFragment>) =>
      fetchApi<PromptFragment>(`/prompt-fragments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/prompt-fragments/${id}`, {
        method: 'DELETE',
      }),
  },

  // Prompt compilation
  compile: (promptFragmentIds: string[], customPrompt?: string) =>
    fetchApi<{ prompt: string }>('/compile', {
      method: 'POST',
      body: JSON.stringify({ promptFragmentIds, customPrompt }),
    }),
}
