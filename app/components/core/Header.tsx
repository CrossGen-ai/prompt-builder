import React from 'react';
import { Sparkles } from 'lucide-react';
import { auth } from '@/auth';
import { SignInButton } from '@/components/auth/SignInButton';
import { ThemeToggle } from '@/components/core/ThemeToggle';

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl shadow-lg dark:shadow-blue-900/20 shadow-blue-100/50">
      <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight gradient-text">
              Prompt Builder
            </h1>
            <p className="hidden sm:block text-xs text-muted-foreground">
              Build and manage reusable prompt templates
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden md:inline text-xs sm:text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full">
            ✨ AI Powered
          </span>
          <ThemeToggle />
          <SignInButton user={session?.user || null} />
        </div>
      </div>
    </header>
  );
}
