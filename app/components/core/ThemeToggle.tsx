'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme-provider';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      ) : (
        <Sun className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      )}
    </Button>
  );
}
