# API Documentation

Complete REST API reference for the Memory application.

## Base URL

```
Development: http://localhost:3000/api
Production:  https://your-domain.com/api
```

## Authentication

Currently, the API does not require authentication. Future versions will implement JWT-based authentication.

```typescript
// Future: Authorization header
headers: {
  'Authorization': 'Bearer <jwt-token>',
  'Content-Type': 'application/json'
}
```

## Error Handling

### Standard Error Response

```typescript
{
  "error": {
    "code": string,      // Error code (e.g., "VALIDATION_ERROR")
    "message": string,   // Human-readable error message
    "field"?: string,    // Field that caused the error (validation)
    "details"?: any      // Additional error details
  }
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no content returned |
| 400 | Bad Request | Validation error or malformed request |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_ENTRY` | Resource already exists |
| `DATABASE_ERROR` | Database operation failed |
| `INTERNAL_ERROR` | Unexpected server error |

## Categories API

### List All Categories

Get all categories ordered by their display order.

```http
GET /api/categories
```

**Response: 200 OK**

```typescript
{
  "categories": [
    {
      "id": "uuid-1",
      "name": "Role & Context",
      "description": "Define AI role and context",
      "order": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "name": "Constraints",
      "description": "Specify limitations and boundaries",
      "order": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Category by ID

Get a single category by its ID.

```http
GET /api/categories/:id
```

**Parameters**

| Name | Type | Location | Description |
|------|------|----------|-------------|
| `id` | string | path | Category UUID |

**Response: 200 OK**

```typescript
{
  "id": "uuid-1",
  "name": "Role & Context",
  "description": "Define AI role and context",
  "order": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Response: 404 Not Found**

```typescript
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Category not found"
  }
}
```

### Create Category

Create a new category.

```http
POST /api/categories
```

**Request Body**

```typescript
{
  "name": string,           // Required, 1-255 characters
  "description"?: string,   // Optional
  "order"?: number          // Optional, default: 0
}
```

**Example Request**

```json
{
  "name": "Output Format",
  "description": "Specify desired output structure",
  "order": 3
}
```

**Response: 201 Created**

```typescript
{
  "id": "uuid-new",
  "name": "Output Format",
  "description": "Specify desired output structure",
  "order": 3,
  "createdAt": "2024-01-02T12:00:00.000Z",
  "updatedAt": "2024-01-02T12:00:00.000Z"
}
```

**Response: 400 Bad Request**

```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Category name is required",
    "field": "name"
  }
}
```

### Update Category

Update an existing category.

```http
PUT /api/categories/:id
```

**Parameters**

| Name | Type | Location | Description |
|------|------|----------|-------------|
| `id` | string | path | Category UUID |

**Request Body**

```typescript
{
  "name"?: string,          // Optional, 1-255 characters
  "description"?: string,   // Optional
  "order"?: number          // Optional
}
```

**Example Request**

```json
{
  "name": "Role & Context (Updated)",
  "order": 1
}
```

**Response: 200 OK**

```typescript
{
  "id": "uuid-1",
  "name": "Role & Context (Updated)",
  "description": "Define AI role and context",
  "order": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T12:30:00.000Z"
}
```

### Delete Category

Delete a category. This will also delete all fragments in this category (CASCADE).

```http
DELETE /api/categories/:id
```

**Parameters**

| Name | Type | Location | Description |
|------|------|----------|-------------|
| `id` | string | path | Category UUID |

**Response: 204 No Content**

No response body.

**Response: 404 Not Found**

```typescript
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Category not found"
  }
}
```

## Fragments API

### List All Fragments

Get all prompt fragments.

```http
GET /api/fragments
```

**Query Parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `categoryId` | string | No | Filter by category ID |

**Example**

```http
GET /api/fragments?categoryId=uuid-1
```

**Response: 200 OK**

```typescript
{
  "fragments": [
    {
      "id": "fragment-1",
      "content": "You are an expert AI assistant...",
      "categoryId": "uuid-1",
      "order": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "fragment-2",
      "content": "Your primary goal is to...",
      "categoryId": "uuid-1",
      "order": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Fragment by ID

Get a single prompt fragment by its ID.

```http
GET /api/fragments/:id
```

**Parameters**

| Name | Type | Location | Description |
|------|------|----------|-------------|
| `id` | string | path | Fragment UUID |

**Response: 200 OK**

```typescript
{
  "id": "fragment-1",
  "content": "You are an expert AI assistant...",
  "categoryId": "uuid-1",
  "order": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Create Fragment

Create a new prompt fragment.

```http
POST /api/fragments
```

**Request Body**

```typescript
{
  "content": string,        // Required, prompt text
  "categoryId": string,     // Required, parent category UUID
  "order"?: number          // Optional, default: 0
}
```

**Example Request**

```json
{
  "content": "Always provide clear, concise explanations.",
  "categoryId": "uuid-1",
  "order": 2
}
```

**Response: 201 Created**

```typescript
{
  "id": "fragment-new",
  "content": "Always provide clear, concise explanations.",
  "categoryId": "uuid-1",
  "order": 2,
  "createdAt": "2024-01-02T12:00:00.000Z",
  "updatedAt": "2024-01-02T12:00:00.000Z"
}
```

**Response: 400 Bad Request**

```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Fragment content is required",
    "field": "content"
  }
}
```

### Update Fragment

Update an existing fragment.

```http
PUT /api/fragments/:id
```

**Parameters**

| Name | Type | Location | Description |
|------|------|----------|-------------|
| `id` | string | path | Fragment UUID |

**Request Body**

```typescript
{
  "content"?: string,       // Optional
  "categoryId"?: string,    // Optional
  "order"?: number          // Optional
}
```

**Example Request**

```json
{
  "content": "Updated prompt text...",
  "order": 5
}
```

**Response: 200 OK**

```typescript
{
  "id": "fragment-1",
  "content": "Updated prompt text...",
  "categoryId": "uuid-1",
  "order": 5,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T12:30:00.000Z"
}
```

### Delete Fragment

Delete a prompt fragment.

```http
DELETE /api/fragments/:id
```

**Parameters**

| Name | Type | Location | Description |
|------|------|----------|-------------|
| `id` | string | path | Fragment UUID |

**Response: 204 No Content**

No response body.

## Prompt Compilation API

### Compile Prompt

Compile selected fragments into a final prompt.

```http
POST /api/compile
```

**Request Body**

```typescript
{
  "fragmentIds": string[],    // Array of fragment UUIDs
  "customPrompt"?: string     // Optional custom prompt text
}
```

**Example Request**

```json
{
  "fragmentIds": [
    "fragment-1",
    "fragment-2",
    "fragment-5"
  ],
  "customPrompt": "Additional context: Respond in JSON format"
}
```

**Response: 200 OK**

```typescript
{
  "prompt": string,           // Compiled prompt text
  "fragmentCount": number,    // Number of fragments included
  "customEnabled": boolean    // Whether custom prompt was included
}
```

**Example Response**

```json
{
  "prompt": "Additional context: Respond in JSON format\n\nYou are an expert AI assistant...\n\nYour primary goal is to...\n\nAlways provide clear, concise explanations.",
  "fragmentCount": 3,
  "customEnabled": true
}
```

**Compilation Rules**

1. Custom prompt (if provided) is prepended to the output
2. Fragments are ordered by their `order` field
3. Fragments are joined with double newlines (`\n\n`)
4. Empty fragments are skipped
5. Final output is trimmed

## TypeScript Types

### Category

```typescript
interface Category {
  id: string
  name: string
  description?: string
  order: number
  createdAt: string        // ISO 8601 timestamp
  updatedAt: string        // ISO 8601 timestamp
}
```

### PromptFragment

```typescript
interface PromptFragment {
  id: string
  content: string
  categoryId: string       // Foreign key to Category
  order: number
  createdAt: string        // ISO 8601 timestamp
  updatedAt: string        // ISO 8601 timestamp
}
```

### CompiledPrompt

```typescript
interface CompiledPrompt {
  prompt: string
  fragmentCount: number
  customEnabled: boolean
}
```

## Client Library Usage

### JavaScript/TypeScript Client

```typescript
import { api } from '@/lib/api'

// Get all categories
const categories = await api.categories.getAll()

// Create new category
const newCategory = await api.categories.create({
  name: 'New Category',
  description: 'Category description',
  order: 5
})

// Update category
const updated = await api.categories.update('uuid-1', {
  name: 'Updated Name'
})

// Delete category
await api.categories.delete('uuid-1')

// Get fragments by category
const fragments = await api.fragments.getByCategory('uuid-1')

// Compile prompt
const compiled = await api.compile(
  ['fragment-1', 'fragment-2'],
  'Custom prompt text'
)

console.log(compiled.prompt)
```

### Error Handling

```typescript
try {
  const category = await api.categories.create({
    name: 'New Category'
  })
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.status, error.message)

    switch (error.status) {
      case 400:
        // Handle validation error
        break
      case 404:
        // Handle not found
        break
      case 500:
        // Handle server error
        break
    }
  }
}
```

## Rate Limiting

Currently, no rate limiting is implemented. Future versions will include:

- **Anonymous users**: 100 requests/hour
- **Authenticated users**: 1000 requests/hour
- **Premium users**: 10000 requests/hour

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks (Future)

Future versions will support webhooks for real-time updates:

```typescript
// Register webhook
POST /api/webhooks
{
  "url": "https://your-app.com/webhook",
  "events": ["category.created", "fragment.updated"]
}

// Webhook payload
{
  "event": "category.created",
  "timestamp": "2024-01-02T12:00:00.000Z",
  "data": {
    "id": "uuid-new",
    "name": "New Category"
  }
}
```

## API Versioning (Future)

Future versions will use URL-based versioning:

```
/api/v1/categories
/api/v2/categories  # New features
```

Current version is implicitly `v1`.

---

**API Version**: 1.0.0
**Last Updated**: 2024-01-02
**Contact**: support@memory-app.com
