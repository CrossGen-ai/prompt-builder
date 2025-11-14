'use client'

import React from 'react'
import { PromptSection } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionItemProps {
  section: PromptSection
  isSelected: boolean
  onToggle: (sectionId: string) => void
  onEdit: (section: PromptSection) => void
  onDelete: (section: PromptSection) => void
}

export function SectionItem({
  section,
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
          id={`section-${section.id}`}
          checked={isSelected}
          onCheckedChange={() => onToggle(section.id)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <label
            htmlFor={`section-${section.id}`}
            className="cursor-pointer select-none"
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {section.content}
            </p>
          </label>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(section)}
            aria-label="Edit section"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(section)}
            aria-label="Delete section"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
