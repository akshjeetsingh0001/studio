
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
    // This case should ideally be caught by the useEffect and redirect.
    // Showing a loader here is a fallback.
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Redirecting to login...</p>
      </div>
    );
  }

  
  if (isAuthenticated && user) {
    
    if (pathname === '/login') {
        // User is authenticated but somehow on the login page, redirect them.
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Redirecting...</p>
            </div>
        );
    }

    
    if (user.role === 'kitchen') {
      
      if (pathname !== '/kitchen') {
        // Kitchen user trying to access a non-kitchen page.
        // useEffect should handle redirection. Show loader as fallback.
        return (
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <p className="ml-2">Redirecting to Kitchen...</p>
          </div>
        );
      }
      
      // Render Kitchen Display System (no sidebar)
      return (
        <div className="animate-fadeIn h-screen overflow-y-auto bg-muted/30">
          {children}
        </div>
      );
    }
    
    
    if (user.role !== 'kitchen' && pathname === '/kitchen') {
      // Admin/other user trying to access kitchen page.
      // useEffect should handle redirection. Show loader as fallback.
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="ml-2">Redirecting...</p>
        </div>
      );
    }

    
    // Regular app layout for non-kitchen users
    const allNavItems = [...primaryNavItems, ...secondaryNavItems];
    return (
      <SidebarProvider defaultOpen={false}> {/* Sidebar starts collapsed on desktop, closed on mobile */}
          <SidebarNav navItemGroups={allNavItems} />
          <SidebarInset className="flex flex-col">
            {isMobile && (
              <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
                {/* Placeholder for AppLogo or Title if needed */}
                <div></div> 
                <SidebarTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MenuIcon className="h-6 w-6" />
                  </Button>
                </SidebarTrigger>
              </div>
            )}
            <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 ${isMobile ? 'pt-4' : ''}`}> {/* Adjusted mobile padding-top */}
              {children}
            </main>
          </SidebarInset>
      </SidebarProvider>
    );
  }
  
  
  // Fallback if user is somehow null after loading and not on login page
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2">Verifying access...</p>
    </div>
  );
}
