
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import AppLogo from '@/components/AppLogo';
import SplashScreen from '@/components/SplashScreen';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  
  // This state determines if we should run the auth check & redirect logic
  const [readyForRouting, setReadyForRouting] = useState(false);

  const handleSplashFinished = () => {
    setShowSplashScreen(false);
    setReadyForRouting(true); // Signal that splash is done, and we can now check auth & route
  };

  useEffect(() => {
    if (authIsLoading || !readyForRouting) {
      // Wait for auth to resolve AND for splash screen to finish
      return;
    }

    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, authIsLoading, router, readyForRouting]);

  if (showSplashScreen) {
    return <SplashScreen onFinished={handleSplashFinished} />;
  }

  // Fallback loader shown after splash screen, while routing/auth is finalizing
  // This should ideally be very brief or not visible if routing is fast
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground space-y-6 p-4">
      <AppLogo iconSize={56} textSize="text-5xl" />
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground">Loading your Seera experience...</p>
    </div>
  );
}
