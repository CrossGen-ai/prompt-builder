import { mockCategories, mockPromptFragments } from '../fixtures/mockData'

export const createMockFetch = () => {
  const mockFetch = jest.fn()

  return {
    mock: mockFetch,

    setupSuccess: () => {
      mockFetch.mockImplementation((url: string, options?: RequestInit) => {
        const method = options?.method || 'GET'

        // Categories endpoints
        if (url.includes('/categories') && !url.match(/\/categories\/[^/]+$/)) {
          if (method === 'GET') {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockCategories),
            })
          }
          if (method === 'POST') {
            const body = JSON.parse(options?.body as string)
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                id: `cat-${Date.now()}`,
                ...body,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }),
            })
          }
        }

        // Single category
        if (url.match(/\/categories\/[^/]+$/)) {
          if (method === 'GET') {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockCategories[0]),
            })
          }
          if (method === 'PUT') {
            const body = JSON.parse(options?.body as string)
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                ...mockCategories[0],
                ...body,
                updatedAt: new Date().toISOString(),
              }),
            })
          }
          if (method === 'DELETE') {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({}),
            })
          }
        }

        // PromptFragments endpoints
        if (url.includes('/promptFragments') && !url.match(/\/promptFragments\/[^/]+$/)) {
          if (method === 'GET') {
            const categoryId = new URL(url, 'http://localhost').searchParams.get('categoryId')
            const promptFragments = categoryId
              ? mockPromptFragments.filter(f => f.categoryId === categoryId)
              : mockPromptFragments
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(promptFragments),
            })
          }
          if (method === 'POST') {
            const body = JSON.parse(options?.body as string)
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                id: `sec-${Date.now()}`,
                ...body,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }),
            })
          }
        }

        // Single promptFragment
        if (url.match(/\/promptFragments\/[^/]+$/)) {
          if (method === 'GET') {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockPromptFragments[0]),
            })
          }
          if (method === 'PUT') {
            const body = JSON.parse(options?.body as string)
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                ...mockPromptFragments[0],
                ...body,
                updatedAt: new Date().toISOString(),
              }),
            })
          }
          if (method === 'DELETE') {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({}),
            })
          }
        }

        // Compile endpoint
        if (url.includes('/compile')) {
          const body = JSON.parse(options?.body as string)
          const promptFragments = mockPromptFragments.filter(f =>
            body.promptFragmentIds.includes(f.id)
          )
          let prompt = promptFragments.map(f => f.content).join('\n\n')
          if (body.customPrompt) {
            prompt = `${body.customPrompt}\n\n${prompt}`
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ prompt }),
          })
        }

        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ message: 'Not found' }),
        })
      })
    },

    setupError: (status = 500, message = 'Server error') => {
      mockFetch.mockResolvedValue({
        ok: false,
        status,
        json: () => Promise.resolve({ message }),
      })
    },

    setupNetworkError: () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
    },

    reset: () => {
      mockFetch.mockReset()
    },
  }
}
