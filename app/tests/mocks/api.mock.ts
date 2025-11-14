import { mockCategories, mockSections } from '../fixtures/mockData'

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

        // Sections endpoints
        if (url.includes('/sections') && !url.match(/\/sections\/[^/]+$/)) {
          if (method === 'GET') {
            const categoryId = new URL(url, 'http://localhost').searchParams.get('categoryId')
            const sections = categoryId
              ? mockSections.filter(f => f.categoryId === categoryId)
              : mockSections
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(sections),
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

        // Single section
        if (url.match(/\/sections\/[^/]+$/)) {
          if (method === 'GET') {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockSections[0]),
            })
          }
          if (method === 'PUT') {
            const body = JSON.parse(options?.body as string)
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                ...mockSections[0],
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
          const sections = mockSections.filter(f =>
            body.sectionIds.includes(f.id)
          )
          let prompt = sections.map(f => f.content).join('\n\n')
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
