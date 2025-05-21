
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
    if (isLoading) {
      return; // Don't perform redirects until auth state is resolved
    }

    if (!isAuthenticated) {
      if (pathname !== '/login') {
        router.replace('/login');
      }
      return; // Stop further checks if not authenticated
    }

    // User is authenticated
    if (user) {
      if (pathname === '/login') { // Authenticated but on login page
        if (user.role === 'kitchen') {
          router.replace('/kitchen');
        } else {
          router.replace('/dashboard');
        }
      } else if (user.role === 'kitchen') {
        if (pathname !== '/kitchen') {
          router.replace('/kitchen');
        }
      } else { // User is admin or other non-kitchen role
        if (pathname === '/kitchen') {
          router.replace('/dashboard');
        }
      }
    } else {
      // Authenticated but no user object? Should not happen. Fallback to login.
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

  // If not authenticated and not on login page, useEffect will redirect. Show loader.
  if (!isAuthenticated && pathname !== '/login') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Redirecting to login...</p>
      </div>
    );
  }

  // If authenticated, user object should exist for role-based rendering.
  if (isAuthenticated && user) {
    // If authenticated and on login page, useEffect will redirect. Show loader.
    if (pathname === '/login') {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Redirecting...</p>
            </div>
        );
    }

    // Handle Kitchen role
    if (user.role === 'kitchen') {
      // If not yet on /kitchen page, useEffect will redirect. Show loader.
      if (pathname !== '/kitchen') {
        return (
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <p className="ml-2">Redirecting to Kitchen...</p>
          </div>
        );
      }
      // Correct page for kitchen user: render KDS content full-screen
      return (
        <div className="animate-fadeIn h-screen overflow-y-auto bg-muted/30">
          {children}
        </div>
      );
    }
    
    // Handle Admin/Other roles
    // If admin is trying to access /kitchen, useEffect will redirect. Show loader.
    if (user.role !== 'kitchen' && pathname === '/kitchen') {
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="ml-2">Redirecting...</p>
        </div>
      );
    }

    // Default layout for admin/other authenticated users
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
  
  // Fallback for any state not covered above (e.g. on login page when not authenticated)
  // AppLayout is used by src/app/(app)/layout.tsx which is for authenticated routes.
  // The login page has its own (or no) layout.
  // So, if we reach here, it's likely an edge case or the login page itself (if AppLayout was misapplied).
  // For authenticated routes, the conditions above should cover rendering or redirection.
  // If !isAuthenticated and pathname IS '/login', children (the login page) should render without AppLayout.
  // This indicates a potential misapplication of AppLayout if it ever tries to render the login page.
  // However, given the (app) route group structure, this path should primarily handle authenticated states.
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2">Verifying access...</p>
    </div>
  );
}
