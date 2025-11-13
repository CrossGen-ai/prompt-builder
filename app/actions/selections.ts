'use server';

import { db } from '@/db';
import { selectedSections, sections, categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { ActionResponse, SelectedSectionWithDetails } from '@/app/lib/types';
import type { SelectedSection } from '@/db/schema';
import { sectionIdSchema } from '@/app/lib/validations';

/**
 * Get all selected sections with their details
 */
export async function getSelectedSections(): Promise<ActionResponse<SelectedSectionWithDetails[]>> {
  try {
    const selections = await db.query.selectedSections.findMany({
      with: {
        section: {
          with: {
            category: true
          }
        }
      },
      orderBy: (selectedSections, { asc }) => [asc(selectedSections.id)]
    });

    // Transform to flat structure
    const selectionsWithDetails: SelectedSectionWithDetails[] = selections.map(sel => ({
      id: sel.id,
      sectionId: sel.sectionId,
      selectedAt: sel.selectedAt,
      section: sel.section,
      category: (sel.section as any).category
    }));

    return {
      success: true,
      data: selectionsWithDetails
    };
  } catch (error) {
    console.error('Error fetching selected sections:', error);
    return {
      success: false,
      error: 'Failed to fetch selected sections'
    };
  }
}

/**
 * Select a section for prompt compilation
 */
export async function selectSection(input: unknown): Promise<ActionResponse<SelectedSection>> {
  try {
    const { id: sectionId } = sectionIdSchema.parse(input);

    // Check if section exists
    const section = await db.query.sections.findFirst({
      where: eq(sections.id, sectionId)
    });

    if (!section) {
      return {
        success: false,
        error: 'Section not found'
      };
    }

    // Check if already selected
    const existing = await db.query.selectedSections.findFirst({
      where: eq(selectedSections.sectionId, sectionId)
    });

    if (existing) {
      return {
        success: false,
        error: 'Section already selected'
      };
    }

    // Insert selection
    const [newSelection] = await db
      .insert(selectedSections)
      .values({
        sectionId,
        selectedAt: new Date().toISOString()
      })
      .returning();

    revalidatePath('/');

    return {
      success: true,
      data: newSelection
    };
  } catch (error) {
    console.error('Error selecting section:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to select section'
    };
  }
}

/**
 * Deselect a section from prompt compilation
 */
export async function deselectSection(input: unknown): Promise<ActionResponse<void>> {
  try {
    const { id: sectionId } = sectionIdSchema.parse(input);

    await db.delete(selectedSections).where(eq(selectedSections.sectionId, sectionId));

    revalidatePath('/');

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deselecting section:', error);
    return {
      success: false,
      error: 'Failed to deselect section'
    };
  }
}

/**
 * Toggle section selection (select if not selected, deselect if selected)
 */
export async function toggleSectionSelection(input: unknown): Promise<ActionResponse<{ selected: boolean }>> {
  try {
    const { id: sectionId } = sectionIdSchema.parse(input);

    // Check current selection state
    const existing = await db.query.selectedSections.findFirst({
      where: eq(selectedSections.sectionId, sectionId)
    });

    if (existing) {
      // Deselect
      await db.delete(selectedSections).where(eq(selectedSections.sectionId, sectionId));
      revalidatePath('/');
      return {
        success: true,
        data: { selected: false }
      };
    } else {
      // Select
      const result = await selectSection({ id: sectionId });
      if (result.success) {
        return {
          success: true,
          data: { selected: true }
        };
      }
      return result as ActionResponse<{ selected: boolean }>;
    }
  } catch (error) {
    console.error('Error toggling section selection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle selection'
    };
  }
}

/**
 * Clear all selections
 */
export async function clearAllSelections(): Promise<ActionResponse<void>> {
  try {
    await db.delete(selectedSections);

    revalidatePath('/');

    return {
      success: true
    };
  } catch (error) {
    console.error('Error clearing selections:', error);
    return {
      success: false,
      error: 'Failed to clear selections'
    };
  }
}

/**
 * Select default sections from all categories
 */
export async function selectDefaultSections(): Promise<ActionResponse<number>> {
  try {
    // Get all default sections
    const defaultSections = await db.query.sections.findMany({
      where: eq(sections.isDefault, true)
    });

    // Clear existing selections
    await db.delete(selectedSections);

    // Insert default selections
    if (defaultSections.length > 0) {
      const selectionsToInsert = defaultSections.map(section => ({
        sectionId: section.id,
        selectedAt: new Date().toISOString()
      }));

      await db.insert(selectedSections).values(selectionsToInsert);
    }

    revalidatePath('/');

    return {
      success: true,
      data: defaultSections.length
    };
  } catch (error) {
    console.error('Error selecting default sections:', error);
    return {
      success: false,
      error: 'Failed to select default sections'
    };
  }
}
