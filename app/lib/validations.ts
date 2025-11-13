import { z } from 'zod';

/**
 * Validation schemas for API inputs using Zod
 */

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0).default(0)
});

export const updateCategorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0).optional()
});

export const createSectionSchema = z.object({
  categoryId: z.number().int().positive('Category ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0).default(0),
  isDefault: z.boolean().default(false)
});

export const updateSectionSchema = z.object({
  id: z.number().int().positive(),
  categoryId: z.number().int().positive().optional(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isDefault: z.boolean().optional()
});

export const sectionIdSchema = z.object({
  id: z.number().int().positive()
});

export const customPromptSchema = z.object({
  content: z.string().max(10000, 'Custom prompt too long')
});

// Type exports
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type SectionIdInput = z.infer<typeof sectionIdSchema>;
export type CustomPromptInput = z.infer<typeof customPromptSchema>;
