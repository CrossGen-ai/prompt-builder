import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/db'
import { eq } from 'drizzle-orm'

// GET /api/sections/:id - Get a specific section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [section] = await db
      .select()
      .from(schema.sections)
      .where(eq(schema.sections.id, parseInt(id)))

    if (!section) {
      return NextResponse.json(
        { message: 'Section not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: section.id.toString(),
      content: section.content,
      categoryId: section.categoryId.toString(),
      order: section.displayOrder,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching section:', error)
    return NextResponse.json(
      { message: 'Failed to fetch section' },
      { status: 500 }
    )
  }
}

// PUT /api/sections/:id - Update a section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content, categoryId, order } = body

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    }

    if (content !== undefined) {
      updateData.content = content
      updateData.title = content.substring(0, 50) + '...'
    }
    if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId)
    if (order !== undefined) updateData.displayOrder = order

    const [section] = await db
      .update(schema.sections)
      .set(updateData)
      .where(eq(schema.sections.id, parseInt(id)))
      .returning()

    if (!section) {
      return NextResponse.json(
        { message: 'Section not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: section.id.toString(),
      content: section.content,
      categoryId: section.categoryId.toString(),
      order: section.displayOrder,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
    })
  } catch (error) {
    console.error('Error updating section:', error)
    return NextResponse.json(
      { message: 'Failed to update section' },
      { status: 500 }
    )
  }
}

// DELETE /api/sections/:id - Delete a section
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db
      .delete(schema.sections)
      .where(eq(schema.sections.id, parseInt(id)))

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting section:', error)
    return NextResponse.json(
      { message: 'Failed to delete section' },
      { status: 500 }
    )
  }
}
