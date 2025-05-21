
import type { LucideIcon } from 'lucide-react';
import { Home, ShoppingCart, LayoutGrid, UtensilsCrossed, BarChart3, Settings, Users, Cookie } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
  adminOnly?: boolean;
}

export interface NavItemGroup {
  title?: string;
  items: NavItem[];
}

export const siteConfig = {
  name: "Seera",
  description: "Modern Point of Sale system for restaurants.",
};

export const primaryNavItems: NavItemGroup[] = [
  {
    items: [
      { title: "Dashboard", href: "/dashboard", icon: Home },
      { title: "New Order", href: "/order/new", icon: UtensilsCrossed },
      { title: "Orders", href: "/orders", icon: ShoppingCart },
      { title: "Tables", href: "/tables", icon: LayoutGrid },
      { title: "Kitchen", href: "/kitchen", icon: Cookie },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Menu", href: "/admin/menu", icon: UtensilsCrossed, adminOnly: true },
      { title: "Customers", href: "/admin/customers", icon: Users, adminOnly: true },
      { title: "Reports", href: "/admin/reports", icon: BarChart3, adminOnly: true },
    ],
  },
];

export const secondaryNavItems: NavItemGroup[] = [
 {
    items: [
      { title: "Settings", href: "/admin/settings", icon: Settings, adminOnly: true },
    ]
  }
];

    