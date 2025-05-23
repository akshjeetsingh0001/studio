
'use client';

import type React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './SidebarNav';
import { primaryNavItems, secondaryNavItems } from '@/config/nav';
import { Loader2, Menu as MenuIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import AppLogo from '@/components/AppLogo';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isLoading) {
      return; 
    }

    if (!isAuthenticated) {
      if (pathname !== '/login') {
        router.replace('/login');
      }
      return; 
    }
    
    if (user) {
      if (pathname === '/login') { 
        if (user.role === 'kitchen') {
          router.replace('/kitchen');
        } else {
          router.replace('/dashboard');
        }
      } else if (user.role === 'kitchen') {
        if (pathname !== '/kitchen') {
          router.replace('/kitchen');
        }
      } else { 
        if (pathname === '/kitchen') {
          router.replace('/dashboard');
        }
      }
    } else {
      if (pathname !== '/login') {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated && pathname !== '/login') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Redirecting to login...</p>
      </div>
    );
  }
  
  if (isAuthenticated && user) {
    if (pathname === '/login') {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Redirecting...</p>
            </div>
        );
    }

    if (user.role === 'kitchen') {
      if (pathname !== '/kitchen') {
        return (
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <p className="ml-2">Redirecting to Kitchen...</p>
          </div>
        );
      }
      
      return (
        <div className="animate-fadeIn h-screen overflow-y-auto bg-muted/30">
          {children}
        </div>
      );
    }
    
    if (user.role !== 'kitchen' && pathname === '/kitchen') {
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="ml-2">Redirecting...</p>
        </div>
      );
    }

    const allNavItems = [...primaryNavItems, ...secondaryNavItems];
    return (
      <SidebarProvider defaultOpen={false}>
          <SidebarNav navItemGroups={allNavItems} />
          <SidebarInset className="flex flex-col bg-transparent">
            {/* Header for AppLogo and Mobile Menu Trigger */}
            <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/30 bg-background/70 px-4 backdrop-blur-lg md:px-6">
              <AppLogo /> 
              <div className="flex items-center gap-2">
                {isMobile && (
                  <SidebarTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MenuIcon className="h-6 w-6" />
                    </Button>
                  </SidebarTrigger>
                )}
                {/* You could add other desktop header items here if needed, like theme toggle or user menu */}
              </div>
            </div>
            <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-transparent`}>
              {children}
            </main>
          </SidebarInset>
      </SidebarProvider>
    );
  }
  
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2">Verifying access...</p>
    </div>
  );
}
