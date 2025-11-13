import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { categories, sections, customPrompt } from './schema';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from app/.env
dotenv.config({ path: path.join(__dirname, '..', 'app', '.env') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('Please set it in app/.env file');
  process.exit(1);
}

// Create Neon client and drizzle instance
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

/**
 * Seed script to populate database with default prompt builder data
 */
async function seed() {
  console.log('🌱 Seeding Neon database...');

  try {
    // Insert categories
    const categoryData = [
      {
        name: 'Context & Role',
        description: 'Define the AI\'s role and context for the task',
        displayOrder: 1
      },
      {
        name: 'Task Definition',
        description: 'Clearly specify what needs to be done',
        displayOrder: 2
      },
      {
        name: 'Constraints & Guidelines',
        description: 'Set boundaries and rules for the output',
        displayOrder: 3
      },
      {
        name: 'Output Format',
        description: 'Define how the response should be structured',
        displayOrder: 4
      },
      {
        name: 'Examples & References',
        description: 'Provide examples to guide the AI',
        displayOrder: 5
      },
      {
        name: 'Tone & Style',
        description: 'Set the communication style and tone',
        displayOrder: 6
      }
    ];

    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // Insert sections for each category
    const sectionsData = [
      // Context & Role sections
      {
        categoryId: insertedCategories[0].id,
        title: 'Expert Role',
        content: 'You are an expert [ROLE] with deep knowledge in [DOMAIN]. Your expertise includes [SPECIFIC SKILLS].',
        description: 'Sets the AI as a domain expert',
        displayOrder: 1,
        isDefault: true
      },
      {
        categoryId: insertedCategories[0].id,
        title: 'Professional Context',
        content: 'You are a [PROFESSION] working on [PROJECT TYPE]. Your goal is to provide professional-grade [OUTPUT TYPE].',
        description: 'Establishes professional context',
        displayOrder: 2,
        isDefault: false
      },
      {
        categoryId: insertedCategories[0].id,
        title: 'Technical Specialist',
        content: 'You are a technical specialist in [TECHNOLOGY/FIELD]. You have [X] years of experience with [SPECIFIC TOOLS/FRAMEWORKS].',
        description: 'Defines technical expertise',
        displayOrder: 3,
        isDefault: false
      },

      // Task Definition sections
      {
        categoryId: insertedCategories[1].id,
        title: 'Clear Objective',
        content: 'Your task is to [SPECIFIC ACTION] that [ACHIEVES GOAL]. Focus on [KEY ASPECTS].',
        description: 'Defines clear task objective',
        displayOrder: 1,
        isDefault: true
      },
      {
        categoryId: insertedCategories[1].id,
        title: 'Multi-Step Process',
        content: 'Complete the following steps:\n1. [STEP 1]\n2. [STEP 2]\n3. [STEP 3]\nEnsure each step is thoroughly completed before moving to the next.',
        description: 'Breaks task into sequential steps',
        displayOrder: 2,
        isDefault: false
      },
      {
        categoryId: insertedCategories[1].id,
        title: 'Problem-Solving Task',
        content: 'Analyze the following problem: [PROBLEM DESCRIPTION]. Identify root causes, propose solutions, and recommend the best approach.',
        description: 'Frames task as problem-solving',
        displayOrder: 3,
        isDefault: false
      },

      // Constraints & Guidelines sections
      {
        categoryId: insertedCategories[2].id,
        title: 'Quality Standards',
        content: 'Ensure all output meets these standards:\n- Accuracy: [REQUIREMENT]\n- Completeness: [REQUIREMENT]\n- Clarity: [REQUIREMENT]\n- Professional quality',
        description: 'Sets quality expectations',
        displayOrder: 1,
        isDefault: true
      },
      {
        categoryId: insertedCategories[2].id,
        title: 'Technical Constraints',
        content: 'Follow these technical constraints:\n- Use [TECHNOLOGY/FRAMEWORK]\n- Adhere to [CODING STANDARDS]\n- Ensure [PERFORMANCE REQUIREMENTS]\n- Maintain [COMPATIBILITY]',
        description: 'Defines technical boundaries',
        displayOrder: 2,
        isDefault: false
      },
      {
        categoryId: insertedCategories[2].id,
        title: 'Scope Limitations',
        content: 'Stay within these boundaries:\n- Do NOT include [EXCLUDED ITEMS]\n- Focus ONLY on [INCLUDED ITEMS]\n- Maximum length: [LENGTH]\n- Time constraint: [TIMEFRAME]',
        description: 'Limits scope of work',
        displayOrder: 3,
        isDefault: false
      },

      // Output Format sections
      {
        categoryId: insertedCategories[3].id,
        title: 'Structured Response',
        content: 'Format your response as follows:\n## [Section 1]\n[Content]\n\n## [Section 2]\n[Content]\n\n## Conclusion\n[Summary]',
        description: 'Defines structured markdown format',
        displayOrder: 1,
        isDefault: true
      },
      {
        categoryId: insertedCategories[3].id,
        title: 'JSON Output',
        content: 'Provide response in JSON format:\n```json\n{\n  "field1": "value",\n  "field2": ["item1", "item2"],\n  "field3": {\n    "nested": "value"\n  }\n}\n```',
        description: 'Requests JSON formatted output',
        displayOrder: 2,
        isDefault: false
      },
      {
        categoryId: insertedCategories[3].id,
        title: 'Code Documentation',
        content: 'Format as code with comprehensive documentation:\n- Include inline comments\n- Add function/class documentation\n- Provide usage examples\n- List dependencies',
        description: 'Specifies code documentation format',
        displayOrder: 3,
        isDefault: false
      },

      // Examples & References sections
      {
        categoryId: insertedCategories[4].id,
        title: 'Good Example',
        content: 'Here\'s an example of the desired output:\n\n[EXAMPLE CONTENT]\n\nMatch this quality and style.',
        description: 'Provides positive example',
        displayOrder: 1,
        isDefault: false
      },
      {
        categoryId: insertedCategories[4].id,
        title: 'Before/After Comparison',
        content: 'Transform input like this:\n\nBefore:\n[EXAMPLE BEFORE]\n\nAfter:\n[EXAMPLE AFTER]\n\nApply similar transformation to the actual input.',
        description: 'Shows transformation example',
        displayOrder: 2,
        isDefault: false
      },
      {
        categoryId: insertedCategories[4].id,
        title: 'Reference Materials',
        content: 'Reference these materials:\n- [DOCUMENTATION LINK]\n- [SPECIFICATION]\n- [BEST PRACTICES]\n\nAlign output with these references.',
        description: 'Points to reference documentation',
        displayOrder: 3,
        isDefault: true
      },

      // Tone & Style sections
      {
        categoryId: insertedCategories[5].id,
        title: 'Professional Tone',
        content: 'Maintain a professional, formal tone. Use industry-standard terminology. Avoid casual language.',
        description: 'Sets professional communication style',
        displayOrder: 1,
        isDefault: true
      },
      {
        categoryId: insertedCategories[5].id,
        title: 'Conversational Style',
        content: 'Use a friendly, conversational tone. Explain concepts clearly. Feel free to use analogies and examples.',
        description: 'Encourages accessible language',
        displayOrder: 2,
        isDefault: false
      },
      {
        categoryId: insertedCategories[5].id,
        title: 'Technical Precision',
        content: 'Be technically precise and concise. Use exact terminology. Prioritize accuracy over simplicity.',
        description: 'Emphasizes technical accuracy',
        displayOrder: 3,
        isDefault: false
      }
    ];

    const insertedSections = await db.insert(sections).values(sectionsData).returning();
    console.log(`✅ Inserted ${insertedSections.length} sections`);

    // Insert initial custom prompt (empty)
    await db.insert(customPrompt).values({ content: '' });
    console.log('✅ Initialized custom prompt');

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

seed();
