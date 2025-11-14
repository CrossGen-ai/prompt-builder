'use client'

import React, { useEffect, useState } from 'react'
import { usePromptStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Category, PromptSection } from '@/lib/types'
import { CategoryList } from '@/components/core/CategoryList'
import { PromptPreview } from '@/components/core/PromptPreview'
import { CustomPromptInput } from '@/components/core/CustomPromptInput'
import { SectionModal } from '@/components/core/SectionModal'
import { DeleteConfirmModal } from '@/components/core/DeleteConfirmModal'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw, AlertCircle } from 'lucide-react'

interface DialogState {
  isOpen: boolean
  mode: 'add' | 'edit'
  type: 'category' | 'section'
  data: Partial<Category | PromptSection> | null
  categoryContext?: Category
}

interface DeleteDialogState {
  isOpen: boolean
  type: 'category' | 'section'
  item: Category | PromptSection | null
}

export default function Home() {
  const {
    categories,
    sections,
    selectedSectionIds,
    customPrompt,
    customEnabled,
    loading,
    error,
    setCategories,
    setSections,
    toggleSection,
    setCustomPrompt,
    setCustomEnabled,
    setLoading,
    setError,
    getCompiledPrompt,
    getSectionsByCategory,
  } = usePromptStore()

  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    mode: 'add',
    type: 'category',
    data: null,
  })

  const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState>({
    isOpen: false,
    type: 'category',
    item: null,
  })

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [categoriesData, sectionsData] = await Promise.all([
        api.categories.getAll(),
        api.sections.getAll(),
      ])
      setCategories(categoriesData.sort((a, b) => a.order - b.order))
      setSections(sectionsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Category handlers
  const handleAddCategory = () => {
    setDialogState({
      isOpen: true,
      mode: 'add',
      type: 'category',
      data: null,
    })
  }

  const handleEditCategory = (category: Category) => {
    setDialogState({
      isOpen: true,
      mode: 'edit',
      type: 'category',
      data: category,
    })
  }

  const handleDeleteCategory = (category: Category) => {
    setDeleteDialogState({
      isOpen: true,
      type: 'category',
      item: category,
    })
  }

  // Section handlers
  const handleAddSection = (category: Category) => {
    setDialogState({
      isOpen: true,
      mode: 'add',
      type: 'section',
      data: { categoryId: category.id },
      categoryContext: category,
    })
  }

  const handleEditSection = (section: PromptSection) => {
    setDialogState({
      isOpen: true,
      mode: 'edit',
      type: 'section',
      data: section,
    })
  }

  const handleDeleteSection = (section: PromptSection) => {
    setDeleteDialogState({
      isOpen: true,
      type: 'section',
      item: section,
    })
  }

  // Submit handlers
  const handleDialogSubmit = async (formData: any) => {
    const { type, mode, data } = dialogState

    if (type === 'category') {
      if (mode === 'add') {
        const newCategory = await api.categories.create({
          name: formData.name,
          description: formData.description,
          order: categories.length,
        })
        setCategories([...categories, newCategory])
      } else if (data && 'id' in data) {
        const updated = await api.categories.update(data.id!, formData)
        setCategories(categories.map((c) => (c.id === updated.id ? updated : c)))
      }
    } else {
      if (mode === 'add') {
        const newSection = await api.sections.create({
          content: formData.content,
          categoryId: formData.categoryId,
          order: sections.filter((f) => f.categoryId === formData.categoryId).length,
        })
        setSections([...sections, newSection])
      } else if (data && 'id' in data) {
        const updated = await api.sections.update(data.id!, formData)
        setSections(sections.map((f) => (f.id === updated.id ? updated : f)))
      }
    }
  }

  const handleDeleteConfirm = async () => {
    const { type, item } = deleteDialogState
    if (!item) return

    if (type === 'category') {
      await api.categories.delete(item.id)
      setCategories(categories.filter((c) => c.id !== item.id))
      // Remove sections in this category
      setSections(sections.filter((f) => f.categoryId !== item.id))
    } else {
      await api.sections.delete(item.id)
      setSections(sections.filter((f) => f.id !== item.id))
    }
  }

  const compiledPrompt = getCompiledPrompt()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <main className="container mx-auto px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="flex-1 text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column - Categories and Sections */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Prompt Sections
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Select sections to build your prompt
                </p>
              </div>
              <Button onClick={handleAddCategory} className="w-full sm:w-auto shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>

            <CustomPromptInput
              value={customPrompt}
              enabled={customEnabled}
              onChange={setCustomPrompt}
              onEnabledChange={setCustomEnabled}
            />

            {loading && categories.length === 0 ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-white to-blue-50/50 p-8 sm:p-12 text-center shadow-inner">
                <div className="mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-3 shadow-lg">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <p className="mb-2 text-base sm:text-lg font-bold text-gray-800">No categories yet</p>
                <p className="mb-6 text-sm sm:text-base text-muted-foreground max-w-md">
                  Create your first category to organize prompt sections and start building amazing prompts
                </p>
                <Button onClick={handleAddCategory} size="lg" className="shadow-xl shadow-blue-300 hover:shadow-2xl hover:shadow-blue-400 hover:scale-105 transition-all">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Category
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <CategoryList
                    key={category.id}
                    category={category}
                    sections={getSectionsByCategory(category.id)}
                    selectedSectionIds={selectedSectionIds}
                    onToggleSection={toggleSection}
                    onAddSection={handleAddSection}
                    onEditSection={handleEditSection}
                    onDeleteSection={handleDeleteSection}
                    onEditCategory={handleEditCategory}
                    onDeleteCategory={handleDeleteCategory}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div>
            <PromptPreview compiledPrompt={compiledPrompt} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <SectionModal
        isOpen={dialogState.isOpen}
        mode={dialogState.mode}
        type={dialogState.type}
        initialData={dialogState.data}
        categories={categories}
        onClose={() => setDialogState({ ...dialogState, isOpen: false })}
        onSubmit={handleDialogSubmit}
      />

      <DeleteConfirmModal
        isOpen={deleteDialogState.isOpen}
        type={deleteDialogState.type}
        itemName={
          deleteDialogState.item
            ? 'name' in deleteDialogState.item
              ? deleteDialogState.item.name
              : (deleteDialogState.item as PromptSection).content.substring(0, 50) + '...'
            : undefined
        }
        onClose={() => setDeleteDialogState({ ...deleteDialogState, isOpen: false })}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
