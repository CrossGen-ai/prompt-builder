// @ts-nocheck
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

interface CustomPromptInputProps {
  value: string
  enabled: boolean
  onChange: (value: string) => void
  onEnabledChange: (enabled: boolean) => void
}

export function CustomPromptInput({
  value,
  enabled,
  onChange,
  onEnabledChange,
}: CustomPromptInputProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">Custom Prompt</CardTitle>
            <CardDescription className="mt-1">
              Add a custom prompt that will be prepended to selected promptFragments
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="custom-enabled" className="text-sm font-medium cursor-pointer">
              {enabled ? 'Enabled' : 'Disabled'}
            </label>
            {/* @ts-ignore React 19 type compatibility */}
            <Switch
              id="custom-enabled"
              checked={enabled}
              onCheckedChange={onEnabledChange}
            />
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-4">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            enabled
              ? 'Enter your custom prompt here...'
              : 'Enable custom prompt to add text'
          }
          disabled={!enabled}
          className="min-h-[120px] resize-y"
          aria-label="Custom prompt input"
        />
        {enabled && (
          <p className="mt-2 text-xs text-muted-foreground">
            This text will appear at the beginning of your compiled prompt
          </p>
        )}
      </CardContent>
    </Card>
  )
}
