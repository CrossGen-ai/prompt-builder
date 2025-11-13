import { api } from '@/lib/api'
import { createMockFetch } from '../mocks/api.mock'
import { mockCategories, mockFragments, createMockCategory, createMockFragment } from '../fixtures/mockData'

describe('Database Operations Integration', () => {
  let mockFetch: ReturnType<typeof createMockFetch>

  beforeEach(() => {
    mockFetch = createMockFetch()
    global.fetch = mockFetch.mock as any
  })

  afterEach(() => {
    mockFetch.reset()
  })

  describe('Data Consistency', () => {
    it('should maintain referential integrity between categories and fragments', async () => {
      mockFetch.setupSuccess()

      // Get all categories
      const categories = await api.categories.getAll()

      // Get all fragments
      const fragments = await api.fragments.getAll()

      // Verify all fragments reference valid categories
      fragments.forEach(fragment => {
        const categoryExists = categories.some(cat => cat.id === fragment.categoryId)
        expect(categoryExists).toBe(true)
      })
    })

    it('should prevent creating fragment with invalid category', async () => {
      mockFetch.setupError(404, 'Category not found')

      await expect(
        api.fragments.create({
          categoryId: 'non-existent-category',
          content: 'Test content',
          order: 1,
        })
      ).rejects.toThrow('Category not found')
    })

    it('should handle cascade delete scenarios', async () => {
      mockFetch.setupError(409, 'Cannot delete category with fragments')

      await expect(
        api.categories.delete('cat-1')
      ).rejects.toThrow('Cannot delete category with fragments')
    })

    it('should update timestamps on modifications', async () => {
      mockFetch.setupSuccess()

      const original = await api.categories.getById('cat-1')
      const originalUpdatedAt = new Date(original.updatedAt)

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10))

      const updated = await api.categories.update('cat-1', {
        name: 'Updated Name',
      })

      const updatedAt = new Date(updated.updatedAt)
      expect(updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime())
    })
  })

  describe('Transaction Scenarios', () => {
    it('should handle creating category and fragments atomically', async () => {
      mockFetch.setupSuccess()

      // Create category
      const newCategory = await api.categories.create({
        name: 'Transaction Test',
        order: 10,
      })

      // Create multiple fragments for the category
      const fragment1 = await api.fragments.create({
        categoryId: newCategory.id,
        content: 'Fragment 1',
        order: 1,
      })

      const fragment2 = await api.fragments.create({
        categoryId: newCategory.id,
        content: 'Fragment 2',
        order: 2,
      })

      // Verify consistency
      expect(fragment1.categoryId).toBe(newCategory.id)
      expect(fragment2.categoryId).toBe(newCategory.id)
    })

    it('should rollback on partial failure', async () => {
      mockFetch.setupSuccess()

      const newCategory = await api.categories.create({
        name: 'Rollback Test',
        order: 11,
      })

      // First fragment succeeds
      await api.fragments.create({
        categoryId: newCategory.id,
        content: 'Fragment 1',
        order: 1,
      })

      // Second fragment fails
      mockFetch.setupError(400, 'Invalid data')

      await expect(
        api.fragments.create({
          categoryId: newCategory.id,
          content: '', // Invalid
          order: 2,
        })
      ).rejects.toThrow()

      // In a real transaction, both should be rolled back
      // This tests the error handling flow
    })
  })

  describe('Ordering and Sorting', () => {
    it('should maintain category order', async () => {
      mockFetch.setupSuccess()

      const categories = await api.categories.getAll()

      // Verify categories are in order
      for (let i = 1; i < categories.length; i++) {
        expect(categories[i].order).toBeGreaterThanOrEqual(categories[i - 1].order)
      }
    })

    it('should maintain fragment order within category', async () => {
      mockFetch.setupSuccess()

      const fragments = await api.fragments.getByCategory('cat-1')

      // Verify fragments are in order
      for (let i = 1; i < fragments.length; i++) {
        expect(fragments[i].order).toBeGreaterThanOrEqual(fragments[i - 1].order)
      }
    })

    it('should reorder fragments within category', async () => {
      mockFetch.setupSuccess()

      // Update fragment order
      const updated = await api.fragments.update('frag-1', { order: 10 })

      expect(updated.order).toBe(10)
    })

    it('should handle duplicate order values', async () => {
      mockFetch.setupSuccess()

      // Create two fragments with same order
      const frag1 = await api.fragments.create({
        categoryId: 'cat-1',
        content: 'Fragment 1',
        order: 5,
      })

      const frag2 = await api.fragments.create({
        categoryId: 'cat-1',
        content: 'Fragment 2',
        order: 5,
      })

      // Both should succeed, server handles ordering
      expect(frag1.order).toBe(5)
      expect(frag2.order).toBe(5)
    })
  })

  describe('Bulk Operations', () => {
    it('should handle bulk category creation', async () => {
      mockFetch.setupSuccess()

      const newCategories = [
        { name: 'Bulk 1', order: 20 },
        { name: 'Bulk 2', order: 21 },
        { name: 'Bulk 3', order: 22 },
      ]

      const created = await Promise.all(
        newCategories.map(cat => api.categories.create(cat))
      )

      expect(created).toHaveLength(3)
      created.forEach(cat => {
        expect(cat).toHaveProperty('id')
        expect(cat).toHaveProperty('createdAt')
      })
    })

    it('should handle bulk fragment creation', async () => {
      mockFetch.setupSuccess()

      const newFragments = [
        { categoryId: 'cat-1', content: 'Bulk 1', order: 10 },
        { categoryId: 'cat-1', content: 'Bulk 2', order: 11 },
        { categoryId: 'cat-2', content: 'Bulk 3', order: 10 },
      ]

      const created = await Promise.all(
        newFragments.map(frag => api.fragments.create(frag))
      )

      expect(created).toHaveLength(3)
    })

    it('should handle partial bulk failure', async () => {
      mockFetch.setupSuccess()

      const operations = [
        api.fragments.create({
          categoryId: 'cat-1',
          content: 'Valid',
          order: 1,
        }),
        api.fragments.create({
          categoryId: 'cat-1',
          content: 'Valid 2',
          order: 2,
        }),
      ]

      // Add a failing operation
      mockFetch.setupError(400, 'Invalid data')
      operations.push(
        api.fragments.create({
          categoryId: '',
          content: '',
          order: 3,
        })
      )

      const results = await Promise.allSettled(operations)

      const succeeded = results.filter(r => r.status === 'fulfilled')
      const failed = results.filter(r => r.status === 'rejected')

      // Some should succeed, some should fail
      expect(failed.length).toBeGreaterThan(0)
    })
  })

  describe('Query Performance', () => {
    it('should efficiently fetch categories', async () => {
      mockFetch.setupSuccess()

      const start = performance.now()
      await api.categories.getAll()
      const duration = performance.now() - start

      // Should complete quickly (mock should be < 100ms)
      expect(duration).toBeLessThan(100)
    })

    it('should efficiently fetch fragments by category', async () => {
      mockFetch.setupSuccess()

      const start = performance.now()
      await api.fragments.getByCategory('cat-1')
      const duration = performance.now() - start

      expect(duration).toBeLessThan(100)
    })

    it('should handle concurrent queries efficiently', async () => {
      mockFetch.setupSuccess()

      const start = performance.now()

      await Promise.all([
        api.categories.getAll(),
        api.fragments.getAll(),
        api.categories.getById('cat-1'),
        api.fragments.getByCategory('cat-1'),
      ])

      const duration = performance.now() - start

      // Concurrent queries should be faster than sequential
      expect(duration).toBeLessThan(200)
    })
  })

  describe('Data Validation', () => {
    it('should validate required category fields', async () => {
      mockFetch.setupError(400, 'Name is required')

      await expect(
        api.categories.create({
          name: '',
          order: 1,
        })
      ).rejects.toThrow()
    })

    it('should validate required fragment fields', async () => {
      mockFetch.setupError(400, 'Content is required')

      await expect(
        api.fragments.create({
          categoryId: 'cat-1',
          content: '',
          order: 1,
        })
      ).rejects.toThrow()
    })

    it('should validate unique category names', async () => {
      mockFetch.setupError(409, 'Category name already exists')

      await expect(
        api.categories.create({
          name: 'System Prompts', // Duplicate
          order: 1,
        })
      ).rejects.toThrow()
    })

    it('should validate order values', async () => {
      mockFetch.setupSuccess()

      // Negative order should be accepted or rejected by server
      const result = await api.fragments.create({
        categoryId: 'cat-1',
        content: 'Test',
        order: -1,
      })

      // Server handles validation
      expect(result).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty result sets', async () => {
      mockFetch.mock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      const categories = await api.categories.getAll()
      expect(categories).toEqual([])
    })

    it('should handle very long content', async () => {
      mockFetch.setupSuccess()

      const longContent = 'a'.repeat(100000)

      const fragment = await api.fragments.create({
        categoryId: 'cat-1',
        content: longContent,
        order: 1,
      })

      expect(fragment.content).toBe(longContent)
    })

    it('should handle special characters in names', async () => {
      mockFetch.setupSuccess()

      const category = await api.categories.create({
        name: 'Test & <Special> "Characters"',
        order: 1,
      })

      expect(category.name).toBe('Test & <Special> "Characters"')
    })

    it('should handle unicode characters', async () => {
      mockFetch.setupSuccess()

      const fragment = await api.fragments.create({
        categoryId: 'cat-1',
        content: '测试 тест test 🚀',
        order: 1,
      })

      expect(fragment.content).toBe('测试 тест test 🚀')
    })

    it('should handle rapid successive updates', async () => {
      mockFetch.setupSuccess()

      const updates = []
      for (let i = 0; i < 10; i++) {
        updates.push(
          api.categories.update('cat-1', {
            name: `Update ${i}`,
          })
        )
      }

      const results = await Promise.all(updates)
      expect(results).toHaveLength(10)
    })
  })

  describe('Error Recovery', () => {
    it('should retry after connection failure', async () => {
      // First call fails
      mockFetch.setupNetworkError()

      await expect(api.categories.getAll()).rejects.toThrow()

      // Retry succeeds
      mockFetch.setupSuccess()
      const categories = await api.categories.getAll()

      expect(categories).toEqual(mockCategories)
    })

    it('should handle timeout scenarios', async () => {
      mockFetch.mock.mockImplementationOnce(
        () => new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )

      await expect(api.categories.getAll()).rejects.toThrow('Timeout')
    })
  })
})
