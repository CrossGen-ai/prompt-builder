// @ts-nocheck
'use client';

import { LogIn, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AuthButtonProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function AuthButton({ user, onSignIn, onSignOut }: AuthButtonProps) {
  if (!user) {
    return (
      <Button
        onClick={onSignIn}
        variant="default"
        size="sm"
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Sign In
      </Button>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : user.email?.[0].toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          {/* @ts-ignore React 19 type compatibility */}
          <Avatar className="h-9 w-9">
            {/* @ts-ignore React 19 type compatibility */}
            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
            {/* @ts-ignore React 19 type compatibility */}
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      {/* @ts-ignore React 19 type compatibility */}
      <DropdownMenuContent className="w-56 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800" align="end" forceMount>
        {/* @ts-ignore React 19 type compatibility */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        {/* @ts-ignore React 19 type compatibility */}
        <DropdownMenuSeparator />
        {/* @ts-ignore React 19 type compatibility */}
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
