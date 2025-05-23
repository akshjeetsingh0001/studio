
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItemGroup } from '@/config/nav';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarGroup,
  SidebarGroupContent,
  useSidebar,
} from '@/components/ui/sidebar';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut, PanelLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLogo from '@/components/AppLogo';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarNavProps {
  navItemGroups: NavItemGroup[];
  className?: string;
}

export function SidebarNav({ navItemGroups, className }: SidebarNavProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { state, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  if (!navItemGroups?.length) {
    return null;
  }

  return (
    <Sidebar
      className={cn(
        "text-sidebar-foreground bg-transparent backdrop-blur-lg",
        className
      )}
      collapsible="icon"
      variant="sidebar"
    >
      <div className={cn(
        "flex h-16 items-center px-2",
        // When expanded, push the toggle button to the right. When collapsed, center the toggle button.
        state === 'expanded' && !isMobile ? "justify-end" : "justify-center"
      )}>
        {/* This is the desktop toggle button for the sidebar. AppLogo is at the bottom. */}
        {!isMobile && ( // Only show this for desktop
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-9 w-9" aria-label="Toggle sidebar">
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}
      </div>
      <ScrollArea className="h-[calc(100vh-4rem-6.5rem)]"> {/* Adjusted height for bottom section */}
        <SidebarMenu className="p-4">
          {navItemGroups.map((group, groupIndex) => (
            <SidebarGroup key={groupIndex} className="p-0 mb-4">
              {group.title && (
                <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70 px-2">
                  {group.title}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <SidebarMenuItem key={item.href} className="p-0">
                      <Link href={item.href} legacyBehavior passHref>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            "w-full justify-start",
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
                              : "hover:bg-sidebar-accent hover:text-sidebar-primary",
                            "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                          )}
                          tooltip={{ children: item.title, side: "right", align: "center" }}
                        >
                          <a>
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarMenu>
      </ScrollArea>

      {/* Bottom Section: AppLogo and actions */}
      <div className="mt-auto p-2 group-data-[collapsible=icon]:border-t-0">
        <div className={cn("flex flex-col items-center", state === 'expanded' ? 'items-center' : 'items-center')}>
          <AppLogo
            iconSize={state === 'expanded' ? 24 : 28}
            textSize={state === 'expanded' ? "text-2xl" : "hidden"}
            onClick={!isMobile ? toggleSidebar : undefined} // Logo itself toggles sidebar on desktop
            className={cn(
              "py-2",
              state === 'collapsed' && !isMobile && "py-3" 
            )}
          />
          {state === 'expanded' && !isMobile && (
            <div className="flex w-full justify-around items-center mt-2 pt-2 border-t border-sidebar-border/20">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="h-8 w-8 hover:bg-sidebar-accent hover:text-sidebar-primary"
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  <p>Toggle Theme ({theme === 'dark' ? 'Light' : 'Dark'})</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="h-8 w-8 hover:bg-sidebar-accent hover:text-sidebar-primary"
                    aria-label="Log out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  <p>Log Out</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
