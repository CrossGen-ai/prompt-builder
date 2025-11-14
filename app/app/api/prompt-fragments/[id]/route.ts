import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/db'
import { eq } from 'drizzle-orm'

// GET /api/prompt-fragments/:id - Get a specific prompt fragment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [fragment] = await db
      .select()
      .from(schema.promptFragments)
      .where(eq(schema.promptFragments.id, parseInt(id)))

    if (!fragment) {
      return NextResponse.json(
        { message: 'Prompt fragment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: fragment.id.toString(),
      content: fragment.content,
      categoryId: fragment.categoryId.toString(),
      order: fragment.displayOrder,
      createdAt: fragment.createdAt,
      updatedAt: fragment.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching fragment:', error)
    return NextResponse.json(
      { message: 'Failed to fetch fragment' },
      { status: 500 }
    )
  }
}

// PUT /api/fragments/:id - Update a fragment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content, categoryId, order } = body

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (content !== undefined) {
      updateData.content = content
      updateData.title = content.substring(0, 50) + '...'
    }
    if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId)
    if (order !== undefined) updateData.displayOrder = order

    const [fragment] = await db
      .update(schema.promptFragments)
      .set(updateData)
      .where(eq(schema.promptFragments.id, parseInt(id)))
      .returning()

    if (!fragment) {
      return NextResponse.json(
        { message: 'Prompt fragment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: fragment.id.toString(),
      content: fragment.content,
      categoryId: fragment.categoryId.toString(),
      order: fragment.displayOrder,
      createdAt: fragment.createdAt,
      updatedAt: fragment.updatedAt,
    })
  } catch (error) {
    console.error('Error updating fragment:', error)
    return NextResponse.json(
      { message: 'Failed to update fragment' },
      { status: 500 }
    )
  }
}

// DELETE /api/fragments/:id - Delete a fragment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db
      .delete(schema.promptFragments)
      .where(eq(schema.promptFragments.id, parseInt(id)))

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting fragment:', error)
    return NextResponse.json(
      { message: 'Failed to delete fragment' },
      { status: 500 }
    )
  }
}
