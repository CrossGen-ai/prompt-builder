// @ts-nocheck
'use client'

import React, { useState } from 'react'
import { Category, PromptFragment } from '@/lib/types'
import { SectionItem } from './SectionItem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, Plus, Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryListProps {
  category: Category
  fragments: PromptFragment[]
  selectedFragmentIds: Set<string>
  onToggleFragment: (fragmentId: string) => void
  onAddSection: (category: Category) => void
  onEditSection: (fragment: PromptFragment) => void
  onDeleteSection: (fragment: PromptFragment) => void
  onEditCategory: (category: Category) => void
  onDeleteCategory: (category: Category) => void
}

export function CategoryList({
  category,
  fragments,
  selectedFragmentIds,
  onToggleFragment,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onEditCategory,
  onDeleteCategory,
}: CategoryListProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Card>
      {/* @ts-ignore React 19 type compatibility */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            {/* @ts-ignore React 19 type compatibility */}
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex-1 justify-start gap-2 px-0 hover:bg-transparent"
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    !isOpen && '-rotate-90'
                  )}
                />
                <CardTitle className="text-lg font-semibold">
                  {category.name}
                </CardTitle>
                <span className="ml-2 text-sm text-muted-foreground">
                  ({fragments.length})
                </span>
              </Button>
            </CollapsibleTrigger>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onAddSection(category)}
                aria-label="Add section"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEditCategory(category)}
                aria-label="Edit category"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDeleteCategory(category)}
                aria-label="Delete category"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {category.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {category.description}
            </p>
          )}
        </CardHeader>
        {/* @ts-ignore React 19 type compatibility */}
        <CollapsibleContent>
          <CardContent className="p-4 pt-0">
            {fragments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No sections in this category yet.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => onAddSection(category)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Section
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {fragments.map((fragment) => (
                  <SectionItem
                    key={fragment.id}
                    fragment={fragment}
                    isSelected={selectedFragmentIds.has(fragment.id)}
                    onToggle={onToggleFragment}
                    onEdit={onEditSection}
                    onDelete={onDeleteSection}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
