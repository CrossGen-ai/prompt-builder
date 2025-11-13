'use server';

import { db } from '@/db';
import { categories, sections } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { ActionResponse, CategoryWithSections } from '@/app/lib/types';
import { createCategorySchema, updateCategorySchema } from '@/app/lib/validations';

/**
 * Get all categories with their sections
 */
export async function getCategories(): Promise<ActionResponse<CategoryWithSections[]>> {
  try {
    const allCategories = await db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.displayOrder), asc(categories.name)],
      with: {
        sections: {
          orderBy: (sections, { asc }) => [asc(sections.displayOrder), asc(sections.title)]
        }
      }
    });

    // Transform to match CategoryWithSections type
    const categoriesWithSections: CategoryWithSections[] = allCategories.map(cat => ({
      ...cat,
      sections: cat.sections || []
    }));

    return {
      success: true,
      data: categoriesWithSections
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      error: 'Failed to fetch categories'
    };
  }
}

/**
 * Get a single category by ID with sections
 */
export async function getCategoryById(id: number): Promise<ActionResponse<CategoryWithSections>> {
  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
      with: {
        sections: {
          orderBy: (sections, { asc }) => [asc(sections.displayOrder), asc(sections.title)]
        }
      }
    });

    if (!category) {
      return {
        success: false,
        error: 'Category not found'
      };
    }

    const categoryWithSections: CategoryWithSections = {
      ...category,
      sections: category.sections || []
    };

    return {
      success: true,
      data: categoryWithSections
    };
  } catch (error) {
    console.error('Error fetching category:', error);
    return {
      success: false,
      error: 'Failed to fetch category'
    };
  }
}

/**
 * Create a new category
 */
export async function createCategory(
  input: unknown
): Promise<ActionResponse<CategoryWithSections>> {
  try {
    const validated = createCategorySchema.parse(input);

    const [newCategory] = await db
      .insert(categories)
      .values({
        ...validated,
        updatedAt: new Date().toISOString()
      })
      .returning();

    revalidatePath('/');

    return {
      success: true,
      data: {
        ...newCategory,
        sections: []
      }
    };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create category'
    };
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(
  input: unknown
): Promise<ActionResponse<CategoryWithSections>> {
  try {
    const validated = updateCategorySchema.parse(input);
    const { id, ...updates } = validated;

    const [updatedCategory] = await db
      .update(categories)
      .set({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .where(eq(categories.id, id))
      .returning();

    if (!updatedCategory) {
      return {
        success: false,
        error: 'Category not found'
      };
    }

    revalidatePath('/');

    // Fetch with sections
    const result = await getCategoryById(id);
    return result;
  } catch (error) {
    console.error('Error updating category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update category'
    };
  }
}

/**
 * Delete a category (cascades to sections)
 */
export async function deleteCategory(id: number): Promise<ActionResponse<void>> {
  try {
    await db.delete(categories).where(eq(categories.id, id));

    revalidatePath('/');

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      success: false,
      error: 'Failed to delete category'
    };
  }
}
