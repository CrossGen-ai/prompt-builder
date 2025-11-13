'use client'

import React from 'react'
import { PromptFragment } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionItemProps {
  fragment: PromptFragment
  isSelected: boolean
  onToggle: (fragmentId: string) => void
  onEdit: (fragment: PromptFragment) => void
  onDelete: (fragment: PromptFragment) => void
}

export function SectionItem({
  fragment,
  isSelected,
  onToggle,
  onEdit,
  onDelete,
}: SectionItemProps) {
  return (
    <Card
      className={cn(
        'group relative transition-all duration-200',
        isSelected && 'border-primary bg-primary/5'
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <Checkbox
          id={`fragment-${fragment.id}`}
          checked={isSelected}
          onCheckedChange={() => onToggle(fragment.id)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <label
            htmlFor={`fragment-${fragment.id}`}
            className="cursor-pointer select-none"
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {fragment.content}
            </p>
          </label>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(fragment)}
            aria-label="Edit section"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(fragment)}
            aria-label="Delete section"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
