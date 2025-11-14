// @ts-nocheck
'use client'

import React, { useState } from 'react'
import { Category, PromptFragment } from '@/lib/types'
import { PromptFragmentItem } from './PromptFragmentItem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, Plus, Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryListProps {
  category: Category
  promptFragments: PromptFragment[]
  selectedPromptFragmentIds: Set<string>
  onTogglePromptFragment: (promptFragmentId: string) => void
  onAddPromptFragment: (category: Category) => void
  onEditPromptFragment: (promptFragment: PromptFragment) => void
  onDeletePromptFragment: (promptFragment: PromptFragment) => void
  onEditCategory: (category: Category) => void
  onDeleteCategory: (category: Category) => void
}

export function CategoryList({
  category,
  promptFragments,
  selectedPromptFragmentIds,
  onTogglePromptFragment,
  onAddPromptFragment,
  onEditPromptFragment,
  onDeletePromptFragment,
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
                  ({promptFragments.length})
                </span>
              </Button>
            </CollapsibleTrigger>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onAddPromptFragment(category)}
                aria-label="Add promptFragment"
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
            {promptFragments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No promptFragments in this category yet.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => onAddPromptFragment(category)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First PromptFragment
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {promptFragments.map((promptFragment) => (
                  <PromptFragmentItem
                    key={promptFragment.id}
                    promptFragment={promptFragment}
                    isSelected={selectedPromptFragmentIds.has(promptFragment.id)}
                    onToggle={onTogglePromptFragment}
                    onEdit={onEditPromptFragment}
                    onDelete={onDeletePromptFragment}
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
