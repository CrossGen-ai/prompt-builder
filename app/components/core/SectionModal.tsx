'use client'

import React, { useState, useEffect } from 'react'
import { PromptFragment, Category } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface SectionModalProps {
  isOpen: boolean
  mode: 'add' | 'edit'
  type: 'category' | 'fragment'
  initialData?: Partial<Category | PromptFragment> | null
  categories?: Category[]
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
}

export function SectionModal({
  isOpen,
  mode,
  type,
  initialData,
  categories = [],
  onClose,
  onSubmit,
}: SectionModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (isOpen) {
      if (type === 'category') {
        const categoryData = initialData as Partial<Category>
        setFormData({
          name: categoryData?.name || '',
          description: categoryData?.description || '',
        })
      } else {
        const fragmentData = initialData as Partial<PromptFragment>
        setFormData({
          content: fragmentData?.content || '',
          categoryId: fragmentData?.categoryId || categories[0]?.id || '',
        })
      }
    }
  }, [isOpen, initialData, type, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Failed to submit:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTitle = () => {
    if (type === 'category') {
      return mode === 'add' ? 'Add Category' : 'Edit Category'
    }
    return mode === 'add' ? 'Add Section' : 'Edit Section'
  }

  const getDescription = () => {
    if (type === 'category') {
      return mode === 'add'
        ? 'Create a new category to organize your prompt sections'
        : 'Update the category details'
    }
    return mode === 'add'
      ? 'Create a new prompt section in this category'
      : 'Update the section content'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{getTitle()}</DialogTitle>
            <DialogDescription>{getDescription()}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {type === 'category' ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Technical Requirements"
                    required
                    autoFocus
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description for this category"
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">
                    Content <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter the prompt section content..."
                    rows={8}
                    required
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Character count: {(formData.content || '').length}
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto shadow-lg shadow-blue-300 hover:shadow-xl hover:shadow-blue-400"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'add' ? 'Create' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
