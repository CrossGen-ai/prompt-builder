'use client'

import React, { useState } from 'react'
import { CompiledPrompt } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Copy, Check, FileText } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

interface PromptPreviewProps {
  compiledPrompt: CompiledPrompt
}

export function PromptPreview({ compiledPrompt }: PromptPreviewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await copyToClipboard(compiledPrompt.compiledText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const isEmpty = compiledPrompt.sectionCount === 0 && !compiledPrompt.customPrompt

  return (
    <Card className="sticky top-20 h-fit">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Prompt Preview
            </CardTitle>
            <CardDescription className="mt-1">
              {compiledPrompt.sectionCount} section{compiledPrompt.sectionCount !== 1 ? 's' : ''} selected
              {compiledPrompt.customEnabled && ' + custom prompt'}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={isEmpty}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-4 bg-white dark:bg-slate-950">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-8 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Select sections or add a custom prompt to see the preview
            </p>
          </div>
        ) : (
          <div className="relative">
            <pre className="max-h-[600px] overflow-y-auto rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 text-sm leading-relaxed whitespace-pre-wrap break-words text-slate-900 dark:text-slate-100">
              {compiledPrompt.compiledText}
            </pre>
            <div className="mt-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Character count: {compiledPrompt.compiledText.length.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
