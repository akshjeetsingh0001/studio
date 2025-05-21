
'use client';

import type React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from './SidebarNav';
import { primaryNavItems, secondaryNavItems } from '@/config/nav';
import { Loader2 } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // This effect handles initial authentication check and redirection
    // It's separate from the role-based routing enforcement below
    if (!isLoading && !isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated && pathname !== '/login') {
    // This ensures that if not authenticated and not on login, nothing renders until redirect.
    // The useEffect above will handle the redirect.
    return null; 
  }

  // Role-based routing enforcement for authenticated users
  if (isAuthenticated && user) {
    if (user.role === 'kitchen' && pathname !== '/kitchen') {
      router.replace('/kitchen');
      // Render a loader while redirecting
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="ml-2">Redirecting to Kitchen...</p>
        </div>
      );
    }
    if (user.role !== 'kitchen' && pathname === '/kitchen') {
      router.replace('/dashboard'); // Or your admin default page
      // Render a loader while redirecting
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="ml-2">Redirecting...</p>
        </div>
      );
    }

    // If user is 'kitchen', render only the KDS content full-screen
    if (user.role === 'kitchen') {
      return (
        <div className="animate-fadeIn h-screen overflow-y-auto bg-muted/30">
          {/* KDS page has its own padding, so this wrapper is minimal */}
          {children}
        </div>
      );
    }
  }
  
  // Default layout for admin/other authenticated users
  // This code will only be reached if user is authenticated and not 'kitchen' role
  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  return (
    <SidebarProvider defaultOpen={true}>
        <SidebarNav navItemGroups={allNavItems} />
        <SidebarInset className="flex flex-col">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
