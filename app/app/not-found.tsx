import Link from 'next/link'

export default function NotFound() {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
          <div className="text-center px-4">
            <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
              <span className="text-4xl font-bold text-white">404</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Page Not Found
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Sorry, we could not find the page you are looking for.
            </p>

            <Link
              href="/"
              className="inline-flex items-center justify-center h-11 px-8 rounded-md text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
            >
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
