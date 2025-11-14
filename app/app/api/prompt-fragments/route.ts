import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/db'
import type { PromptFragment } from '@/db/schema'
import { eq } from 'drizzle-orm'

// GET /api/prompt-fragments - Get all prompt fragments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    let query = db.select().from(schema.promptFragments)

    if (categoryId) {
      query = query.where(eq(schema.promptFragments.categoryId, parseInt(categoryId)))
    }

    const promptFragments = await query.orderBy(schema.promptFragments.displayOrder)

    return NextResponse.json(
      promptFragments.map((fragment: PromptFragment) => ({
        id: fragment.id.toString(),
        content: fragment.content,
        categoryId: fragment.categoryId.toString(),
        order: fragment.displayOrder,
        createdAt: fragment.createdAt,
        updatedAt: fragment.updatedAt,
      }))
    )
  } catch (error) {
    console.error('Error fetching prompt fragments:', error)
    return NextResponse.json(
      { message: 'Failed to fetch prompt fragments' },
      { status: 500 }
    )
  }
}

// POST /api/prompt-fragments - Create a new prompt fragment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, categoryId, order } = body

    if (!content || !categoryId) {
      return NextResponse.json(
        { message: 'Content and categoryId are required' },
        { status: 400 }
      )
    }

    const [fragment] = await db
      .insert(schema.promptFragments)
      .values({
        title: content.substring(0, 50) + '...',
        content,
        categoryId: parseInt(categoryId),
        displayOrder: order || 0,
      })
      .returning()

    return NextResponse.json(
      {
        id: fragment.id.toString(),
        content: fragment.content,
        categoryId: fragment.categoryId.toString(),
        order: fragment.displayOrder,
        createdAt: fragment.createdAt,
        updatedAt: fragment.updatedAt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating prompt fragment:', error)
    return NextResponse.json(
      { message: 'Failed to create prompt fragment' },
      { status: 500 }
    )
  }
}
