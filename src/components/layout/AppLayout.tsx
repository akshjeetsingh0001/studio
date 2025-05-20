
'use client';

import type React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from './SidebarNav';
// import { Header } from './Header'; // Header is no longer imported or used
import { primaryNavItems, secondaryNavItems } from '@/config/nav';
import { Loader2 } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // This case should ideally be handled by the redirect in useEffect,
    // but as a fallback or during initial render before effect runs:
    return null; 
  }
  
  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  return (
    <SidebarProvider defaultOpen={true}>
        <SidebarNav navItemGroups={allNavItems} />
        <SidebarInset className="flex flex-col">
          {/* <Header /> The Header component has been removed */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
