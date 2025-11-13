# AI Prompt Builder - Component Architecture

## Component Hierarchy

```
App (Root Layout)
└── ThemeProvider
    └── ToastProvider
        └── ModalProvider
            └── Main Layout
                ├── Header
                │   ├── Logo
                │   ├── Title
                │   └── ThemeToggle
                │
                ├── Main Content (3-Column Layout)
                │   ├── Left Panel: Category List (40%)
                │   │   ├── CategoryListHeader
                │   │   │   ├── Title
                │   │   │   └── CreateCategoryButton
                │   │   │
                │   │   ├── CategorySection (Collapsible) [repeated]
                │   │   │   ├── CategoryHeader
                │   │   │   │   ├── ExpandIcon
                │   │   │   │   ├── CategoryName
                │   │   │   │   └── CategoryActions
                │   │   │   │       ├── EditButton
                │   │   │   │       └── DeleteButton
                │   │   │   │
                │   │   │   ├── CreateSectionButton
                │   │   │   │
                │   │   │   └── SectionList
                │   │   │       └── SectionItem [repeated]
                │   │   │           ├── Checkbox
                │   │   │           ├── SectionDescription
                │   │   │           └── SectionActions
                │   │   │               ├── EditButton
                │   │   │               └── DeleteButton
                │   │   │
                │   │   └── EmptyState (if no categories)
                │   │
                │   ├── Center Panel: Prompt Preview (35%)
                │   │   ├── PreviewHeader
                │   │   │   ├── Title
                │   │   │   └── CopyButton
                │   │   │
                │   │   ├── AssembledPromptDisplay
                │   │   │   └── PromptText (read-only textarea)
                │   │   │
                │   │   └── EmptyState (if no selections)
                │   │
                │   └── Right Panel: Custom Prompt (25%)
                │       ├── CustomPromptHeader
                │       │   ├── Title
                │       │   └── EnableToggle
                │       │
                │       └── CustomPromptInput
                │           └── Textarea (editable)
                │
                └── Footer
                    ├── SelectionCount
                    └── ClearAllButton

Modals (Portal Rendered)
├── CreateCategoryModal
│   ├── Dialog
│   │   ├── DialogHeader
│   │   ├── CategoryForm
│   │   │   └── Input (name)
│   │   └── DialogFooter
│   │       ├── CancelButton
│   │       └── SubmitButton
│
├── EditCategoryModal
│   └── [Same structure as Create]
│
├── DeleteCategoryModal
│   ├── Dialog
│   │   ├── DialogHeader
│   │   ├── ConfirmationMessage
│   │   └── DialogFooter
│   │       ├── CancelButton
│   │       └── ConfirmButton
│
├── CreateSectionModal
│   ├── Dialog
│   │   ├── DialogHeader
│   │   ├── SectionForm
│   │   │   ├── Input (description)
│   │   │   ├── Textarea (prompt_text)
│   │   │   └── Select (category)
│   │   └── DialogFooter
│   │       ├── CancelButton
│   │       └── SubmitButton
│
├── EditSectionModal
│   └── [Same structure as Create]
│
└── DeleteSectionModal
    └── [Same structure as DeleteCategory]
```

## Component Specifications

### 1. Layout Components

#### `Header` (Server Component)
```typescript
// components/layout/header.tsx
export function Header() {
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <Logo />
          <h1 className="text-2xl font-bold">AI Prompt Builder</h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
```

**Responsibilities**:
- Display app title and logo
- Theme toggle button
- Future: User menu

**Props**: None (static)

---

#### `MainLayout` (Server Component)
```typescript
// app/(main)/layout.tsx
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="grid grid-cols-12 gap-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

**Responsibilities**:
- 3-column responsive grid
- Container padding/spacing
- Background styling

---

### 2. Category Components

#### `CategoryList` (Client Component)
```typescript
// components/prompt-builder/category-list.tsx
'use client';

interface CategoryListProps {
  initialCategories: Category[];
}

export function CategoryList({ initialCategories }: CategoryListProps) {
  const categories = useCategoryStore(state => state.categories);
  const { openModal } = useUIStore();

  useEffect(() => {
    useCategoryStore.setState({ categories: initialCategories });
  }, [initialCategories]);

  return (
    <div className="col-span-12 lg:col-span-5">
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <Button onClick={() => openModal('create-category')}>
            <PlusIcon /> New Category
          </Button>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <EmptyState message="No categories yet" />
          ) : (
            categories.map(category => (
              <CategorySection key={category.id} category={category} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Props**:
- `initialCategories`: Pre-fetched categories from server

**State Dependencies**:
- `useCategoryStore`: Categories list
- `useUIStore`: Modal state

**Interactions**:
- Opens create category modal
- Renders category sections

---

#### `CategorySection` (Client Component)
```typescript
// components/prompt-builder/category-section.tsx
'use client';

interface CategorySectionProps {
  category: Category;
}

export function CategorySection({ category }: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const sections = useSectionStore(state =>
    state.sections.filter(s => s.categoryId === category.id)
  );
  const { openModal } = useUIStore();

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border rounded-lg p-4 mb-4">
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            <h3 className="font-semibold">{category.name}</h3>
            <Badge variant="secondary">{sections.length}</Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => openModal('edit-category', category)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openModal('delete-category', category)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openModal('create-section', { categoryId: category.id })}
          >
            <PlusIcon /> Add Section
          </Button>

          <div className="mt-4 space-y-2">
            {sections.map(section => (
              <SectionItem key={section.id} section={section} />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
```

**Props**:
- `category`: Category object

**State**:
- Local: `isExpanded` (collapse state)
- Store: `sections` filtered by category

**Interactions**:
- Toggle expand/collapse
- Open edit/delete category modals
- Open create section modal

---

#### `SectionItem` (Client Component)
```typescript
// components/prompt-builder/section-item.tsx
'use client';

interface SectionItemProps {
  section: Section;
}

export function SectionItem({ section }: SectionItemProps) {
  const isSelected = useSelectionStore(state =>
    state.selectedIds.includes(section.id)
  );
  const toggleSelection = useSelectionStore(state => state.toggleSelection);
  const { openModal } = useUIStore();

  const handleToggle = async () => {
    toggleSelection(section.id); // Optimistic update
    await toggleSelectionAction(section.id); // Server sync
  };

  return (
    <div className="flex items-start gap-3 p-3 border rounded hover:bg-accent">
      <Checkbox
        checked={isSelected}
        onCheckedChange={handleToggle}
        id={`section-${section.id}`}
      />
      <div className="flex-1">
        <Label
          htmlFor={`section-${section.id}`}
          className="cursor-pointer font-medium"
        >
          {section.description}
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          {section.promptText.slice(0, 100)}...
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => openModal('edit-section', section)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openModal('delete-section', section)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

**Props**:
- `section`: Section object

**State Dependencies**:
- `useSelectionStore`: Selected IDs, toggle function

**Interactions**:
- Toggle checkbox (optimistic + server sync)
- Open edit/delete section modals

---

### 3. Prompt Preview Components

#### `PromptPreview` (Client Component)
```typescript
// components/prompt-builder/prompt-preview.tsx
'use client';

export function PromptPreview() {
  const assembledPrompt = useAssembledPrompt();
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  return (
    <div className="col-span-12 lg:col-span-4">
      <Card>
        <CardHeader>
          <CardTitle>Assembled Prompt</CardTitle>
          <Button
            onClick={() => copyToClipboard(assembledPrompt)}
            disabled={!assembledPrompt}
          >
            {isCopied ? <CheckIcon /> : <CopyIcon />}
            {isCopied ? 'Copied!' : 'Copy'}
          </Button>
        </CardHeader>
        <CardContent>
          {assembledPrompt ? (
            <Textarea
              value={assembledPrompt}
              readOnly
              className="min-h-[400px] font-mono text-sm"
            />
          ) : (
            <EmptyState message="Select sections to build your prompt" />
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            {assembledPrompt.length} characters
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
```

**Props**: None

**State Dependencies**:
- `useAssembledPrompt`: Computed prompt from selections

**Hooks**:
- `useCopyToClipboard`: Clipboard functionality

---

#### `useAssembledPrompt` (Custom Hook)
```typescript
// lib/hooks/use-assembled-prompt.ts
export function useAssembledPrompt(): string {
  const selectedIds = useSelectionStore(state => state.selectedIds);
  const sections = useSectionStore(state => state.sections);
  const customPrompt = useCustomPromptStore(state => state.customPrompt);
  const isCustomEnabled = useCustomPromptStore(state => state.isEnabled);

  return useMemo(() => {
    const selectedSections = sections
      .filter(s => selectedIds.includes(s.id))
      .map(s => s.promptText);

    let assembled = selectedSections.join('\n\n');

    if (isCustomEnabled && customPrompt.trim()) {
      assembled += '\n\n' + customPrompt;
    }

    return assembled;
  }, [selectedIds, sections, customPrompt, isCustomEnabled]);
}
```

**Dependencies**:
- Selection store (selected IDs)
- Section store (all sections)
- Custom prompt store (text, enabled)

**Logic**:
1. Filter sections by selected IDs
2. Join with double newlines
3. Append custom prompt if enabled
4. Memoized for performance

---

### 4. Custom Prompt Components

#### `CustomPromptInput` (Client Component)
```typescript
// components/prompt-builder/custom-prompt-input.tsx
'use client';

export function CustomPromptInput() {
  const customPrompt = useCustomPromptStore(state => state.customPrompt);
  const isEnabled = useCustomPromptStore(state => state.isEnabled);
  const setCustomPrompt = useCustomPromptStore(state => state.setCustomPrompt);
  const toggleEnabled = useCustomPromptStore(state => state.toggleEnabled);

  const [localValue, setLocalValue] = useState(customPrompt);
  const debouncedUpdate = useDebouncedCallback(async (value: string) => {
    setCustomPrompt(value);
    await updateCustomPromptAction(value);
  }, 500);

  return (
    <div className="col-span-12 lg:col-span-3">
      <Card>
        <CardHeader>
          <CardTitle>Custom Prompt</CardTitle>
          <Switch
            checked={isEnabled}
            onCheckedChange={async (checked) => {
              toggleEnabled();
              await toggleCustomPromptAction(checked);
            }}
          />
        </CardHeader>
        <CardContent>
          <Textarea
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value);
              debouncedUpdate(e.target.value);
            }}
            disabled={!isEnabled}
            placeholder="Add your custom prompt here..."
            className="min-h-[400px]"
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

**Props**: None

**State**:
- Local: `localValue` (for immediate UI updates)
- Store: `customPrompt`, `isEnabled`

**Optimizations**:
- Debounced server sync (500ms)
- Optimistic UI updates

---

### 5. Modal Components

#### `CreateCategoryModal` (Client Component)
```typescript
// components/modals/create-category-modal.tsx
'use client';

export function CreateCategoryModal() {
  const { isOpen, closeModal } = useUIStore(state => ({
    isOpen: state.modals['create-category']?.isOpen ?? false,
    closeModal: state.closeModal,
  }));

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      await createCategoryAction(data);
      toast.success('Category created');
      closeModal('create-category');
      form.reset();
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal('create-category')}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="e.g., Role Definition"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => closeModal('create-category')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Props**: None (uses modal store)

**Form Handling**:
- React Hook Form + Zod validation
- Optimistic UI during submission
- Toast notifications for feedback

**Interactions**:
- Calls server action on submit
- Closes on success
- Resets form state

---

## Component Communication Patterns

### 1. **Parent → Child (Props)**
```typescript
<CategorySection category={category} />
```

### 2. **Child → Parent (Callbacks)**
```typescript
<Button onClick={() => openModal('create-category')} />
```

### 3. **Sibling → Sibling (Zustand Store)**
```typescript
// Component A
const addSelection = useSelectionStore(state => state.addSelection);
addSelection(id);

// Component B (auto-updates)
const selectedIds = useSelectionStore(state => state.selectedIds);
```

### 4. **Client → Server (Server Actions)**
```typescript
await createCategoryAction(data);
// → Revalidates cache
// → Store auto-updates via subscription
```

### 5. **Server → Client (React Server Components)**
```typescript
// Server Component
const categories = await getCategories();
return <CategoryList initialCategories={categories} />;

// Client Component
export function CategoryList({ initialCategories }) {
  useEffect(() => {
    useCategoryStore.setState({ categories: initialCategories });
  }, [initialCategories]);
}
```

## Performance Optimizations

### 1. **Memoization**
```typescript
const assembledPrompt = useMemo(() => {
  // Expensive computation
}, [dependencies]);
```

### 2. **Debouncing**
```typescript
const debouncedUpdate = useDebouncedCallback(async (value) => {
  await updateAction(value);
}, 500);
```

### 3. **Optimistic Updates**
```typescript
toggleSelection(id); // Immediate UI update
await toggleSelectionAction(id); // Server sync
```

### 4. **Code Splitting**
```typescript
const HeavyModal = lazy(() => import('./heavy-modal'));
```

### 5. **Zustand Selectors**
```typescript
// ❌ Re-renders on any store change
const state = useStore();

// ✅ Re-renders only when selectedIds changes
const selectedIds = useStore(state => state.selectedIds);
```

## Accessibility Considerations

1. **Keyboard Navigation**
   - All interactive elements focusable
   - Logical tab order
   - Escape to close modals

2. **ARIA Labels**
   - Descriptive button labels
   - Form field associations
   - Modal announcements

3. **Screen Readers**
   - Semantic HTML (`<header>`, `<main>`, `<section>`)
   - Status announcements (toast)
   - Focus management in modals

4. **Color Contrast**
   - WCAG AA compliant (4.5:1 ratio)
   - Theme-aware components

## Testing Strategy

### Unit Tests
- Hooks (useAssembledPrompt)
- Utilities (formatters)
- Store actions

### Integration Tests
- Component + Store interactions
- Form submissions
- Server action calls

### E2E Tests
- Complete user workflows
- Category/section CRUD
- Prompt assembly
