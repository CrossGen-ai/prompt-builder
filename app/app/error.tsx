'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="text-center px-4 max-w-2xl">
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          Something Went Wrong
        </h1>

        <p className="text-lg text-muted-foreground mb-8">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>

        {error.digest && (
          <p className="text-sm text-muted-foreground mb-4 font-mono bg-muted px-4 py-2 rounded">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-4 justify-center">
          <Button onClick={reset} size="lg" variant="default" className="shadow-lg shadow-blue-300">
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>

          <Button onClick={() => window.location.href = '/'} size="lg" variant="outline">
            <Home className="mr-2 h-5 w-5" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
