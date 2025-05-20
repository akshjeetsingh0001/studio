'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import AppLogo from '@/components/AppLogo';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {  
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground space-y-6 p-4">
      <AppLogo iconSize={56} textSize="text-5xl" />
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground">Loading your Seera experience...</p>
    </div>
  );
}
