import { Inter } from 'next/font/google'
import './styles/globals.css'
import { ThemeProvider } from '@/lib/theme-provider'
import { Header } from '@/components/core/Header'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

// Force dynamic rendering to avoid static generation errors
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Prompt Builder</title>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getCookie(name) {
                  const nameEQ = name + '=';
                  const ca = document.cookie.split(';');
                  for (let i = 0; i < ca.length; i++) {
                    let c = ca[i];
                    while (c.charAt(0) === ' ') c = c.substring(1);
                    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
                  }
                  return null;
                }
                const theme = getCookie('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
