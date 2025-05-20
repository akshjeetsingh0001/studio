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

interface SidebarNavProps {
  navItemGroups: NavItemGroup[];
  className?: string;
}

export function SidebarNav({ navItemGroups, className }: SidebarNavProps) {
  const pathname = usePathname();

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
      <ScrollArea className="h-[calc(100vh-4rem)]">
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
    </Sidebar>
  );
}
