import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/db'
import { eq } from 'drizzle-orm'

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const categories = await db
      .select()
      .from(schema.categories)
      .orderBy(schema.categories.displayOrder)

    return NextResponse.json(
      categories.map((cat) => ({
        id: cat.id.toString(),
        name: cat.name,
        description: cat.description,
        order: cat.displayOrder,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      }))
    )
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { message: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, order } = body

    if (!name) {
      return NextResponse.json(
        { message: 'Category name is required' },
        { status: 400 }
      )
    }

    const [category] = await db
      .insert(schema.categories)
      .values({
        name,
        description: description || null,
        displayOrder: order || 0,
      })
      .returning()

    return NextResponse.json(
      {
        id: category.id.toString(),
        name: category.name,
        description: category.description,
        order: category.displayOrder,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { message: 'Failed to create category' },
      { status: 500 }
    )
  }
}
