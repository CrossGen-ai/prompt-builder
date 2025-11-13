'use server';

import { db } from '@/db';
import { sections } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { ActionResponse, SectionWithCategory } from '@/app/lib/types';
import type { Section } from '@/db/schema';
import { createSectionSchema, updateSectionSchema, sectionIdSchema } from '@/app/lib/validations';

/**
 * Get all sections
 */
export async function getSections(): Promise<ActionResponse<Section[]>> {
  try {
    const allSections = await db.query.sections.findMany({
      orderBy: (sections, { asc }) => [asc(sections.categoryId), asc(sections.displayOrder)]
    });

    return {
      success: true,
      data: allSections
    };
  } catch (error) {
    console.error('Error fetching sections:', error);
    return {
      success: false,
      error: 'Failed to fetch sections'
    };
  }
}

/**
 * Get a single section by ID with category
 */
export async function getSectionById(id: number): Promise<ActionResponse<SectionWithCategory>> {
  try {
    const section = await db.query.sections.findFirst({
      where: eq(sections.id, id),
      with: {
        category: true
      }
    });

    if (!section) {
      return {
        success: false,
        error: 'Section not found'
      };
    }

    // Type assertion needed due to Drizzle's type inference
    const sectionWithCategory = section as unknown as SectionWithCategory;

    return {
      success: true,
      data: sectionWithCategory
    };
  } catch (error) {
    console.error('Error fetching section:', error);
    return {
      success: false,
      error: 'Failed to fetch section'
    };
  }
}

/**
 * Create a new section
 */
export async function createSection(input: unknown): Promise<ActionResponse<Section>> {
  try {
    const validated = createSectionSchema.parse(input);

    const [newSection] = await db
      .insert(sections)
      .values({
        ...validated,
        updatedAt: new Date().toISOString()
      })
      .returning();

    revalidatePath('/');

    return {
      success: true,
      data: newSection
    };
  } catch (error) {
    console.error('Error creating section:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create section'
    };
  }
}

/**
 * Update an existing section
 */
export async function updateSection(input: unknown): Promise<ActionResponse<Section>> {
  try {
    const validated = updateSectionSchema.parse(input);
    const { id, ...updates } = validated;

    const [updatedSection] = await db
      .update(sections)
      .set({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .where(eq(sections.id, id))
      .returning();

    if (!updatedSection) {
      return {
        success: false,
        error: 'Section not found'
      };
    }

    revalidatePath('/');

    return {
      success: true,
      data: updatedSection
    };
  } catch (error) {
    console.error('Error updating section:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update section'
    };
  }
}

/**
 * Delete a section
 */
export async function deleteSection(input: unknown): Promise<ActionResponse<void>> {
  try {
    const { id } = sectionIdSchema.parse(input);

    await db.delete(sections).where(eq(sections.id, id));

    revalidatePath('/');

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting section:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete section'
    };
  }
}

/**
 * Get sections by category ID
 */
export async function getSectionsByCategory(categoryId: number): Promise<ActionResponse<Section[]>> {
  try {
    const categorySections = await db.query.sections.findMany({
      where: eq(sections.categoryId, categoryId),
      orderBy: (sections, { asc }) => [asc(sections.displayOrder), asc(sections.title)]
    });

    return {
      success: true,
      data: categorySections
    };
  } catch (error) {
    console.error('Error fetching sections by category:', error);
    return {
      success: false,
      error: 'Failed to fetch sections'
    };
  }
}
