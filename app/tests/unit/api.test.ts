import { api } from '@/lib/api'
import { createMockFetch } from '../mocks/api.mock'
import { mockCategories, mockPromptFragments, createMockCategory, createMockPromptFragment } from '../fixtures/mockData'

describe('API Layer', () => {
  let mockFetch: ReturnType<typeof createMockFetch>

  beforeEach(() => {
    mockFetch = createMockFetch()
    global.fetch = mockFetch.mock as any
  })

  afterEach(() => {
    mockFetch.reset()
  })

  describe('Categories API', () => {
    describe('getAll', () => {
      it('should fetch all categories successfully', async () => {
        mockFetch.setupSuccess()

        const categories = await api.categories.getAll()

        expect(categories).toEqual(mockCategories)
        expect(mockFetch.mock).toHaveBeenCalledWith(
          expect.stringContaining('/categories'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        )
      })

      it('should throw ApiError on server error', async () => {
        mockFetch.setupError(500, 'Internal Server Error')

        await expect(api.categories.getAll()).rejects.toThrow('Internal Server Error')
      })

      it('should throw ApiError on 404', async () => {
        mockFetch.setupError(404, 'Not Found')

        await expect(api.categories.getAll()).rejects.toThrow('Not Found')
      })

      it('should handle network errors', async () => {
        mockFetch.setupNetworkError()

        await expect(api.categories.getAll()).rejects.toThrow('Network error')
      })
    })

    describe('getById', () => {
      it('should fetch single category by ID', async () => {
        mockFetch.setupSuccess()

        const category = await api.categories.getById('cat-1')

        expect(category).toEqual(mockCategories[0])
        expect(mockFetch.mock).toHaveBeenCalledWith(
          expect.stringContaining('/categories/cat-1'),
          expect.any(Object)
        )
      })

      it('should throw on non-existent category', async () => {
        mockFetch.setupError(404, 'Category not found')

        await expect(api.categories.getById('non-existent')).rejects.toThrow()
      })
    })

    describe('create', () => {
      it('should create new category', async () => {
        mockFetch.setupSuccess()

        const newCategory = {
          name: 'New Category',
          description: 'Description',
          order: 1,
        }

        const created = await api.categories.create(newCategory)

        expect(created).toHaveProperty('id')
        expect(created.name).toBe(newCategory.name)
        expect(created).toHaveProperty('createdAt')
        expect(created).toHaveProperty('updatedAt')

        expect(mockFetch.mock).toHaveBeenCalledWith(
          expect.stringContaining('/categories'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(newCategory),
          })
        )
      })

      it('should handle validation errors', async () => {
        mockFetch.setupError(400, 'Invalid category data')

        await expect(
          api.categories.create({ name: '', order: 1 })
        ).rejects.toThrow('Invalid category data')
      })

      it('should handle duplicate name error', async () => {
        mockFetch.setupError(409, 'Category name already exists')

        await expect(
          api.categories.create({ name: 'Duplicate', order: 1 })
        ).rejects.toThrow('Category name already exists')
      })
    })

    describe('update', () => {
      it('should update existing category', async () => {
        mockFetch.setupSuccess()

        const updates = { name: 'Updated Name' }
        const updated = await api.categories.update('cat-1', updates)

        expect(updated.name).toBe('Updated Name')
        expect(mockFetch.mock).toHaveBeenCalledWith(
          expect.stringContaining('/categories/cat-1'),
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updates),
          })
        )
      })

      it('should handle partial updates', async () => {
        mockFetch.setupSuccess()

        const updates = { description: 'New description' }
        await api.categories.update('cat-1', updates)

        expect(mockFetch.mock).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            body: JSON.stringify(updates),
          })
        )
      })

      it('should throw on non-existent category', async () => {
        mockFetch.setupError(404, 'Category not found')

        await expect(
          api.categories.update('non-existent', { name: 'New' })
        ).rejects.toThrow()
      })
    })

    describe('delete', () => {
      it('should delete category', async () => {
        mockFetch.setupSuccess()

        await api.categories.delete('cat-1')

        expect(mockFetch.mock).toHaveBeenCalledWith(
          expect.stringContaining('/categories/cat-1'),
          expect.objectContaining({
            method: 'DELETE',
          })
        )
      })

      it('should handle delete of non-existent category', async () => {
        mockFetch.setupError(404, 'Category not found')

        await expect(api.categories.delete('non-existent')).rejects.toThrow()
      })

      it('should handle cascade delete errors', async () => {
        mockFetch.setupError(409, 'Cannot delete category with promptFragments')

        await expect(api.categories.delete('cat-1')).rejects.toThrow()
      })
    })
  })

  describe('PromptFragments API', () => {
    describe('getAll', () => {
      it('should fetch all promptFragments', async () => {
        mockFetch.setupSuccess()

        const promptFragments = await api.promptFragments.getAll()

        expect(promptFragments).toEqual(mockPromptFragments)
        expect(mockFetch.mock).toHaveBeenCalledWith(
          expect.stringContaining('/promptFragments'),
          expect.any(Object)
        )
      })

      it('should handle empty promptFragments list', async () => {
        mockFetch.mock.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([]),
        })

        const promptFragments = await api.promptFragments.getAll()
        expect(promptFragments).toEqual([])
      })
    })

    describe('getByCategory', () => {
      it('should fetch promptFragments by category ID', async () => {
        mockFetch.setupSuccess()

        const promptFragments = await api.promptFragments.getByCategory('cat-1')

        expect(promptFragments.every(f => f.categoryId === 'cat-1')).toBe(true)
        expect(mockFetch.mock).toHaveBeenCalledWith(
          expect.stringContaining('/promptFragments?categoryId=cat-1'),
          expect.any(Object)
        )
      })

      it('should return empty array for category with no promptFragments', async () => {
        mockFetch.mock.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([]),
        })

        const promptFragments = await api.promptFragments.getByCategory('empty-cat')
        expect(promptFragments).toEqual([])
      })
    })

    describe('create', () => {
      it('should create new promptFragment', async () => {
        mockFetch.setupSuccess()

        const newPromptFragment = {
          categoryId: 'cat-1',
          content: 'New promptFragment content',
          order: 1,
        }

        const created = await api.promptFragments.create(newPromptFragment)

        expect(created).toHaveProperty('id')
        expect(created.content).toBe(newPromptFragment.content)
        expect(created).toHaveProperty('createdAt')

        expect(mockFetch.mock).toHaveBeenCalledWith(
          expect.stringContaining('/promptFragments'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(newPromptFragment),
          })
        )
      })

      it('should validate promptFragment data', async () => {
        mockFetch.setupError(400, 'Invalid promptFragment data')

        await expect(
          api.promptFragments.create({ categoryId: '', content: '', order: 1 })
        ).rejects.toThrow('Invalid promptFragment data')
      })

      it('should validate category exists', async () => {
        mockFetch.setupError(404, 'Category not found')

        await expect(
          api.promptFragments.create({ categoryId: 'non-existent', content: 'Test', order: 1 })
        ).rejects.toThrow('Category not found')
      })
    })

    describe('update', () => {
      it('should update promptFragment content', async () => {
        mockFetch.setupSuccess()

        const updates = { content: 'Updated content' }
        const updated = await api.promptFragments.update('frag-1', updates)

        expect(updated.content).toBe('Updated content')
        expect(mockFetch.mock).toHaveBeenCalledWith(
          expect.stringContaining('/promptFragments/frag-1'),
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updates),
          })
        )
      })

      it('should update promptFragment order', async () => {
        mockFetch.setupSuccess()

        await api.promptFragments.update('frag-1', { order: 5 })

        expect(mockFetch.mock).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            body: expect.stringContaining('"order":5'),
          })
        )
      })

      it('should handle moving promptFragment to different category', async () => {
        mockFetch.setupSuccess()

        await api.promptFragments.update('frag-1', { categoryId: 'cat-2' })

        expect(mockFetch.mock).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            body: expect.stringContaining('"categoryId":"cat-2"'),
          })
        )
      })
    })

    describe('delete', () => {
      it('should delete promptFragment', async () => {
        mockFetch.setupSuccess()

        await api.promptFragments.delete('frag-1')

        expect(mockFetch.mock).toHaveBeenCalledWith(
          expect.stringContaining('/promptFragments/frag-1'),
          expect.objectContaining({
            method: 'DELETE',
          })
        )
      })

      it('should handle delete of non-existent promptFragment', async () => {
        mockFetch.setupError(404, 'PromptFragment not found')

        await expect(api.promptFragments.delete('non-existent')).rejects.toThrow()
      })
    })
  })

  describe('Compile API', () => {
    it('should compile promptFragments into prompt', async () => {
      mockFetch.setupSuccess()

      const promptFragmentIds = ['frag-1', 'frag-2']
      const result = await api.compile(promptFragmentIds)

      expect(result).toHaveProperty('prompt')
      expect(typeof result.prompt).toBe('string')

      expect(mockFetch.mock).toHaveBeenCalledWith(
        expect.stringContaining('/compile'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ promptFragmentIds, customPrompt: undefined }),
        })
      )
    })

    it('should include custom prompt in compilation', async () => {
      mockFetch.setupSuccess()

      const promptFragmentIds = ['frag-1']
      const customPrompt = 'Custom instruction'

      await api.compile(promptFragmentIds, customPrompt)

      expect(mockFetch.mock).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: expect.stringContaining(customPrompt),
        })
      )
    })

    it('should handle empty promptFragment list', async () => {
      mockFetch.setupSuccess()

      const result = await api.compile([])

      expect(result.prompt).toBeDefined()
    })

    it('should handle compile errors', async () => {
      mockFetch.setupError(400, 'Invalid promptFragment IDs')

      await expect(api.compile(['invalid-id'])).rejects.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should parse JSON error messages', async () => {
      mockFetch.mock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Detailed error message' }),
      })

      await expect(api.categories.getAll()).rejects.toThrow('Detailed error message')
    })

    it('should handle non-JSON error responses', async () => {
      mockFetch.mock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Not JSON')),
      })

      await expect(api.categories.getAll()).rejects.toThrow('Internal Server Error')
    })

    it('should include status code in error', async () => {
      mockFetch.setupError(403, 'Forbidden')

      try {
        await api.categories.getAll()
        fail('Should have thrown error')
      } catch (error: any) {
        expect(error.status).toBe(403)
        expect(error.name).toBe('ApiError')
      }
    })

    it('should handle timeout errors', async () => {
      mockFetch.mock.mockImplementationOnce(
        () => new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )

      await expect(api.categories.getAll()).rejects.toThrow('Timeout')
    })
  })

  describe('Request Headers', () => {
    it('should include Content-Type header', async () => {
      mockFetch.setupSuccess()

      await api.categories.getAll()

      expect(mockFetch.mock).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('should allow custom headers', async () => {
      mockFetch.setupSuccess()

      // This tests the internal flexibility of fetchApi
      // Real implementation would need to expose this
      await api.categories.getAll()

      const call = mockFetch.mock.mock.calls[0]
      expect(call[1]).toHaveProperty('headers')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long content', async () => {
      mockFetch.setupSuccess()

      const longContent = 'a'.repeat(10000)
      await api.promptFragments.create({
        categoryId: 'cat-1',
        content: longContent,
        order: 1,
      })

      expect(mockFetch.mock).toHaveBeenCalled()
    })

    it('should handle special characters in content', async () => {
      mockFetch.setupSuccess()

      const specialContent = 'Test\n\nWith "quotes" and \'apostrophes\' and <tags>'
      await api.promptFragments.create({
        categoryId: 'cat-1',
        content: specialContent,
        order: 1,
      })

      const body = JSON.parse(mockFetch.mock.mock.calls[0][1]?.body as string)
      expect(body.content).toBe(specialContent)
    })

    it('should handle concurrent requests', async () => {
      mockFetch.setupSuccess()

      const requests = [
        api.categories.getAll(),
        api.promptFragments.getAll(),
        api.categories.getById('cat-1'),
      ]

      const results = await Promise.all(requests)

      expect(results).toHaveLength(3)
      expect(mockFetch.mock).toHaveBeenCalledTimes(3)
    })
  })
})
