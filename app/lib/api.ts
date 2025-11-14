import { Category, Section } from './types'
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

  // Sections
  sections: {
    getAll: () => fetchApi<Section[]>('/sections'),
    getById: (id: string) => fetchApi<Section>(`/sections/${id}`),
    getByCategory: (categoryId: string) =>
      fetchApi<Section[]>(`/sections?categoryId=${categoryId}`),
    create: (data: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>) =>
      fetchApi<Section>('/sections', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Section>) =>
      fetchApi<Section>(`/sections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/sections/${id}`, {
        method: 'DELETE',
      }),
  },

  // Prompt compilation
  compile: (sectionIds: string[], customPrompt?: string) =>
    fetchApi<{ prompt: string }>('/compile', {
      method: 'POST',
      body: JSON.stringify({ sectionIds, customPrompt }),
    }),
}
