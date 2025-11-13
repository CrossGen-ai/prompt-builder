import { mockCategories, mockFragments } from '../fixtures/mockData'

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

        // Fragments endpoints
        if (url.includes('/fragments') && !url.match(/\/fragments\/[^/]+$/)) {
          if (method === 'GET') {
            const categoryId = new URL(url).searchParams.get('categoryId')
            const fragments = categoryId
              ? mockFragments.filter(f => f.categoryId === categoryId)
              : mockFragments
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(fragments),
            })
          }
          if (method === 'POST') {
            const body = JSON.parse(options?.body as string)
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                id: `frag-${Date.now()}`,
                ...body,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }),
            })
          }
        }

        // Single fragment
        if (url.match(/\/fragments\/[^/]+$/)) {
          if (method === 'GET') {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockFragments[0]),
            })
          }
          if (method === 'PUT') {
            const body = JSON.parse(options?.body as string)
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                ...mockFragments[0],
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
          const fragments = mockFragments.filter(f =>
            body.fragmentIds.includes(f.id)
          )
          let prompt = fragments.map(f => f.content).join('\n\n')
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
