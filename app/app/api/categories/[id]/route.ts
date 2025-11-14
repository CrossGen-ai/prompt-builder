import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/db'
import { eq } from 'drizzle-orm'

// GET /api/categories/:id - Get a specific category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [category] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, parseInt(id)))

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: category.id.toString(),
      name: category.name,
      description: category.description,
      order: category.displayOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { message: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PUT /api/categories/:id - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, order } = body

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (order !== undefined) updateData.displayOrder = order

    const [category] = await db
      .update(schema.categories)
      .set(updateData)
      .where(eq(schema.categories.id, parseInt(id)))
      .returning()

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: category.id.toString(),
      name: category.name,
      description: category.description,
      order: category.displayOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { message: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/:id - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db
      .delete(schema.categories)
      .where(eq(schema.categories.id, parseInt(id)))

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { message: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
