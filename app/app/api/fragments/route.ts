import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/db'
import { eq } from 'drizzle-orm'

// GET /api/fragments - Get all fragments (sections)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    let query = db.select().from(schema.sections)

    if (categoryId) {
      query = query.where(eq(schema.sections.categoryId, parseInt(categoryId)))
    }

    const sections = await query.orderBy(schema.sections.displayOrder)

    return NextResponse.json(
      sections.map((section) => ({
        id: section.id.toString(),
        content: section.content,
        categoryId: section.categoryId.toString(),
        order: section.displayOrder,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
      }))
    )
  } catch (error) {
    console.error('Error fetching fragments:', error)
    return NextResponse.json(
      { message: 'Failed to fetch fragments' },
      { status: 500 }
    )
  }
}

// POST /api/fragments - Create a new fragment (section)
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

    const [section] = await db
      .insert(schema.sections)
      .values({
        title: content.substring(0, 50) + '...',
        content,
        categoryId: parseInt(categoryId),
        displayOrder: order || 0,
      })
      .returning()

    return NextResponse.json(
      {
        id: section.id.toString(),
        content: section.content,
        categoryId: section.categoryId.toString(),
        order: section.displayOrder,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating fragment:', error)
    return NextResponse.json(
      { message: 'Failed to create fragment' },
      { status: 500 }
    )
  }
}
