'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error boundary caught:', error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #f8fafc, #eff6ff, #faf5ff)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '600px' }}>
            <div style={{
              marginBottom: '2rem',
              display: 'inline-flex',
              height: '80px',
              width: '80px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: '#fecaca'
            }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#dc2626' }}>!</span>
            </div>

            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              background: 'linear-gradient(to right, #dc2626, #ea580c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Application Error
            </h1>

            <p style={{ fontSize: '1.125rem', color: '#64748b', marginBottom: '2rem' }}>
              A critical error occurred. Please refresh the page or contact support.
            </p>

            {error.digest && (
              <p style={{
                fontSize: '0.875rem',
                color: '#64748b',
                marginBottom: '1rem',
                fontFamily: 'monospace',
                background: '#f1f5f9',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem'
              }}>
                Error ID: {error.digest}
              </p>
            )}

            <button
              onClick={reset}
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
