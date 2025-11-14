'use client'

import React from 'react'
import { PromptPromptFragment } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PromptFragmentItemProps {
  promptFragment: PromptPromptFragment
  isSelected: boolean
  onToggle: (promptFragmentId: string) => void
  onEdit: (promptFragment: PromptPromptFragment) => void
  onDelete: (promptFragment: PromptPromptFragment) => void
}

export function PromptFragmentItem({
  promptFragment,
  isSelected,
  onToggle,
  onEdit,
  onDelete,
}: PromptFragmentItemProps) {
  return (
    <Card
      className={cn(
        'group relative transition-all duration-300 hover:shadow-lg',
        isSelected && [
          'border-emerald-400/50',
          'bg-gradient-to-br from-emerald-400/10 via-green-400/5 to-teal-400/10',
          'backdrop-blur-sm',
          'shadow-lg shadow-emerald-500/20',
          'ring-1 ring-emerald-400/20'
        ]
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <Checkbox
          id={`promptFragment-${promptFragment.id}`}
          checked={isSelected}
          onCheckedChange={() => onToggle(promptFragment.id)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <label
            htmlFor={`promptFragment-${promptFragment.id}`}
            className="cursor-pointer select-none"
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {promptFragment.content}
            </p>
          </label>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(promptFragment)}
            aria-label="Edit promptFragment"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(promptFragment)}
            aria-label="Delete promptFragment"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
