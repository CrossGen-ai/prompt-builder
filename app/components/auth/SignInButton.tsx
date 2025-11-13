'use client';

import { useRouter } from 'next/navigation';
import { AuthButton } from './AuthButton';

interface SignInButtonProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function SignInButton({ user }: SignInButtonProps) {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleSignOut = async () => {
    // Call the sign out API
    await fetch('/api/auth/signout', {
      method: 'POST',
    });
    router.push('/');
    router.refresh();
  };

  return <AuthButton user={user} onSignIn={handleSignIn} onSignOut={handleSignOut} />;
}
