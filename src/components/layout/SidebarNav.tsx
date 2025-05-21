
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
  SidebarGroupContent
} from '@/components/ui/sidebar';
import AppLogo from '../AppLogo';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Moon, Sun, LogOut } from 'lucide-react';

interface SidebarNavProps {
  navItemGroups: NavItemGroup[];
  className?: string;
}

export function SidebarNav({ navItemGroups, className }: SidebarNavProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (!navItemGroups?.length) {
    return null;
  }

  return (
    <Sidebar
      className={cn("border-r bg-sidebar text-sidebar-foreground", className)}
      collapsible="icon"
      variant="sidebar"
    >
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-4">
         <AppLogo className="group-data-[collapsible=icon]:hidden" />
         <AppLogo iconSize={24} textSize="text-lg" className="hidden group-data-[collapsible=icon]:flex" />
      </div>
      <ScrollArea className="h-[calc(100vh-4rem-3.5rem)]"> {/* Adjusted height for bottom bar */}
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
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
      {/* User Profile/Theme Section */}
      <div className="mt-auto p-2 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full h-auto p-1.5 flex items-center justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:aspect-square group-data-[collapsible=icon]:p-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              aria-label="User menu"
            >
              <Avatar className="h-7 w-7 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6">
                <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(user?.username)}`} alt={user?.username || 'User'} data-ai-hint="user avatar" />
                <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
              </Avatar>
              <span className="ml-2 text-sm font-medium group-data-[collapsible=icon]:hidden">{user?.username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56 mb-1 ml-1 z-50">
            {user && (
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.username}@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              <span>Toggle Theme</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Sidebar>
  );
}
