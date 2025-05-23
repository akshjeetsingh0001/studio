
'use client';

import type React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { SidebarNav } from './SidebarNav';
import { primaryNavItems, secondaryNavItems } from '@/config/nav';
import { Loader2, Menu as MenuIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import AppLogo from '@/components/AppLogo';
import { cn } from '@/lib/utils';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  
  const AppLayoutContent = () => {
    const { state: sidebarState } = useSidebar(); 

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
          <div className="animate-fadeIn h-screen overflow-y-auto bg-transparent">
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
        <>
          <SidebarNav navItemGroups={allNavItems} />
          <SidebarInset className="flex flex-col bg-transparent">
            {/* The top navigation bar has been removed from here */}
            <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-transparent`}>
              {children}
            </main>
          </SidebarInset>
        </>
      );
    }
    
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Verifying access...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppLayoutContent />
    </SidebarProvider>
  );
}
