'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  type: 'category' | 'fragment'
  itemName?: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function DeleteConfirmModal({
  isOpen,
  type,
  itemName,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Failed to delete:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTitle = () => {
    return type === 'category' ? 'Delete Category' : 'Delete Section'
  }

  const getDescription = () => {
    if (type === 'category') {
      return 'This will permanently delete this category and all its sections. This action cannot be undone.'
    }
    return 'This will permanently delete this section. This action cannot be undone.'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <DialogTitle>{getTitle()}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pt-2">
            {getDescription()}
          </DialogDescription>
          {itemName && (
            <div className="mt-3 rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">
                {type === 'category' ? 'Category' : 'Section'}: {itemName}
              </p>
            </div>
          )}
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="w-full sm:w-auto shadow-lg shadow-red-300 hover:shadow-xl hover:shadow-red-400"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
