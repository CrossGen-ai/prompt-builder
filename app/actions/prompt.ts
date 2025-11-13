'use server';

import { db } from '@/db';
import { customPrompt, selectedSections, sections, categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { ActionResponse, CompiledPrompt } from '@/app/lib/types';
import type { CustomPrompt } from '@/db/schema';
import { customPromptSchema } from '@/app/lib/validations';

/**
 * Get the compiled prompt from selected sections and custom prompt
 */
export async function getCompiledPrompt(): Promise<ActionResponse<CompiledPrompt>> {
  try {
    // Get all selected sections with their details
    const selections = await db.query.selectedSections.findMany({
      with: {
        section: {
          with: {
            category: true
          }
        }
      }
    });

    // Get custom prompt
    const custom = await db.query.customPrompt.findFirst();

    // Group sections by category
    const categoryMap = new Map<number, {
      category: string;
      displayOrder: number;
      sections: { title: string; content: string; displayOrder: number }[];
    }>();

    for (const selection of selections) {
      const section = selection.section;
      const category = (section as any).category;

      if (!categoryMap.has(category.id)) {
        categoryMap.set(category.id, {
          category: category.name,
          displayOrder: category.displayOrder,
          sections: []
        });
      }

      categoryMap.get(category.id)!.sections.push({
        title: section.title,
        content: section.content,
        displayOrder: section.displayOrder
      });
    }

    // Sort categories and sections
    const sortedCategories = Array.from(categoryMap.values())
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(cat => ({
        category: cat.category,
        sections: cat.sections.sort((a, b) => a.displayOrder - b.displayOrder)
      }));

    // Build full prompt text
    let fullPrompt = '';

    for (const cat of sortedCategories) {
      fullPrompt += `# ${cat.category}\n\n`;
      for (const section of cat.sections) {
        fullPrompt += `## ${section.title}\n\n${section.content}\n\n`;
      }
    }

    // Add custom prompt if exists
    const customPromptContent = custom?.content || '';
    if (customPromptContent.trim()) {
      fullPrompt += `# Custom Instructions\n\n${customPromptContent}\n`;
    }

    const compiledPrompt: CompiledPrompt = {
      sections: sortedCategories,
      customPrompt: customPromptContent,
      fullPrompt: fullPrompt.trim()
    };

    return {
      success: true,
      data: compiledPrompt
    };
  } catch (error) {
    console.error('Error compiling prompt:', error);
    return {
      success: false,
      error: 'Failed to compile prompt'
    };
  }
}

/**
 * Get the current custom prompt
 */
export async function getCustomPrompt(): Promise<ActionResponse<CustomPrompt>> {
  try {
    let custom = await db.query.customPrompt.findFirst();

    // Initialize if doesn't exist
    if (!custom) {
      [custom] = await db
        .insert(customPrompt)
        .values({ content: '', updatedAt: new Date().toISOString() })
        .returning();
    }

    return {
      success: true,
      data: custom
    };
  } catch (error) {
    console.error('Error fetching custom prompt:', error);
    return {
      success: false,
      error: 'Failed to fetch custom prompt'
    };
  }
}

/**
 * Update the custom prompt
 */
export async function updateCustomPrompt(input: unknown): Promise<ActionResponse<CustomPrompt>> {
  try {
    const validated = customPromptSchema.parse(input);

    // Get existing or create new
    let existing = await db.query.customPrompt.findFirst();

    let updatedPrompt: CustomPrompt;

    if (existing) {
      // Update existing
      [updatedPrompt] = await db
        .update(customPrompt)
        .set({
          content: validated.content,
          updatedAt: new Date().toISOString()
        })
        .where(eq(customPrompt.id, existing.id))
        .returning();
    } else {
      // Create new
      [updatedPrompt] = await db
        .insert(customPrompt)
        .values({
          content: validated.content,
          updatedAt: new Date().toISOString()
        })
        .returning();
    }

    revalidatePath('/');

    return {
      success: true,
      data: updatedPrompt
    };
  } catch (error) {
    console.error('Error updating custom prompt:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update custom prompt'
    };
  }
}

/**
 * Clear the custom prompt
 */
export async function clearCustomPrompt(): Promise<ActionResponse<void>> {
  try {
    const existing = await db.query.customPrompt.findFirst();

    if (existing) {
      await db
        .update(customPrompt)
        .set({
          content: '',
          updatedAt: new Date().toISOString()
        })
        .where(eq(customPrompt.id, existing.id));
    }

    revalidatePath('/');

    return {
      success: true
    };
  } catch (error) {
    console.error('Error clearing custom prompt:', error);
    return {
      success: false,
      error: 'Failed to clear custom prompt'
    };
  }
}
