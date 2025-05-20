
'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, DollarSign, Layers, ShoppingBag, Users, Utensils } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { OrderItem } from '@/app/(app)/order/[id]/page'; // For order details type

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  availability: boolean;
  imageUrl: string;
  description?: string;
  'data-ai-hint'?: string;
}

interface MockOrder {
  id: string;
  table: string;
  items: number;
  total: number;
  status: string;
  server: string;
  time: string;
  orderDetails?: OrderItem[];
}

const USER_MENU_ITEMS_KEY = 'dineSwiftMenuItems';
const USER_SAVED_ORDERS_KEY = 'dineSwiftUserSavedOrders';

const initialPromotionalItems: MenuItem[] = [
  { id: 'PROMO1', name: 'Featured Pasta', category: 'Main Course', price: 12.99, availability: true, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'pasta dish' },
  { id: 'PROMO2', name: 'Specialty Mocktail', category: 'Drinks', price: 5.00, availability: true, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'cocktail drink' },
];

// Initial mock data for table statuses (remains static for dashboard visual for now)
const tableStatuses = [
  { id: 'T1', status: 'Available', items: 0, server: 'N/A' },
  { id: 'T2', status: 'Occupied', items: 3, server: 'Jane D.' },
  { id: 'T3', status: 'Needs Cleaning', items: 0, server: 'N/A' },
  { id: 'T4', status: 'Reserved', items: 0, server: 'John S.' },
  { id: 'T5', status: 'Occupied', items: 5, server: 'Alice M.' },
  { id: 'T6', status: 'Available', items: 0, server: 'N/A' },
];

const quickActions = [
  { label: "New Order", href: "/order/new", icon: Utensils },
  { label: "View Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Manage Menu", href: "/admin/menu", icon: Utensils },
];

export default function DashboardPage() {
  const [openChecksCount, setOpenChecksCount] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [promotionalItems, setPromotionalItems] = useState<MenuItem[]>(initialPromotionalItems);

  const loadDashboardData = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Load orders for summary cards
      try {
        const savedOrdersRaw = localStorage.getItem(USER_SAVED_ORDERS_KEY);
        if (savedOrdersRaw) {
          const savedOrders: MockOrder[] = JSON.parse(savedOrdersRaw);
          const activeOrders = savedOrders.filter(order => ['Active', 'Preparing', 'PendingPayment'].includes(order.status));
          setOpenChecksCount(activeOrders.length);
          setTotalOrdersCount(savedOrders.length);
        } else {
          // Fallback if no orders in local storage
          setOpenChecksCount(12); // Default mock
          setTotalOrdersCount(87); // Default mock
        }
      } catch (e) {
        console.error("Failed to load orders for dashboard", e);
        setOpenChecksCount(12);
        setTotalOrdersCount(87);
      }

      // Load menu items for promotions
      try {
        const menuItemsRaw = localStorage.getItem(USER_MENU_ITEMS_KEY);
        if (menuItemsRaw) {
          const allMenuItems: MenuItem[] = JSON.parse(menuItemsRaw);
          const availableItems = allMenuItems.filter(item => item.availability);
          if (availableItems.length > 0) {
            setPromotionalItems(availableItems.slice(0, 2));
          } else {
            setPromotionalItems(initialPromotionalItems); // Fallback if no available items
          }
        } else {
          setPromotionalItems(initialPromotionalItems); // Fallback if no menu items in storage
        }
      } catch (e) {
        console.error("Failed to load menu items for dashboard promotions", e);
        setPromotionalItems(initialPromotionalItems);
      }
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    // Optional: Listen for storage changes to auto-update, though can be complex
    // window.addEventListener('storage', loadDashboardData);
    // return () => window.removeEventListener('storage', loadDashboardData);
  }, [loadDashboardData]);

  const summaryCards = [
    { title: "Today's Sales", value: "$1,234.56", icon: DollarSign, change: "+5.2%", changeType: "positive" as const, isStatic: true },
    { title: "Open Checks", value: openChecksCount.toString(), icon: Layers, change: "", changeType: "neutral" as const },
    { title: "Total Orders", value: totalOrdersCount.toString(), icon: ShoppingBag, change: "", changeType: "neutral" as const },
    { title: "Covers Served", value: "35", icon: Users, change: "+3", changeType: "positive" as const, isStatic: true },
  ];


  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your restaurant's performance.">
        <Link href="/order/new" passHref>
          <Button>
            <Utensils className="mr-2 h-4 w-4" /> New Order
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {!card.isStatic && card.change && (
                 <p className={`text-xs ${card.changeType === 'positive' ? 'text-green-600' : card.changeType === 'negative' ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {card.change}
                 </p>
              )}
               {card.isStatic && card.change && (
                  <p className={`text-xs ${card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {card.change} from yesterday
                  </p>
               )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Table Status</CardTitle>
            <CardDescription>Quick view of current table occupancy.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {tableStatuses.slice(0,8).map(table => (
              <Link key={table.id} href={`/order/${table.id.toLowerCase()}`} passHref>
                <Button variant="outline" className={`h-24 w-full flex flex-col items-center justify-center p-2 shadow-sm hover:shadow-lg transition-all border-2 ${table.status === 'Available' ? 'border-green-500 hover:bg-green-50' : table.status === 'Occupied' ? 'border-red-500 hover:bg-red-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                  <span className="text-lg font-semibold">{table.id}</span>
                  <span className="text-xs text-muted-foreground">{table.status}</span>
                  {table.status === 'Occupied' && <span className="text-xs">{table.items} items</span>}
                </Button>
              </Link>
            ))}
          </CardContent>
           <CardContent className="mt-2 text-right">
             <Link href="/tables" passHref>
                <Button variant="link">View All Tables &rarr;</Button>
              </Link>
           </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access common tasks quickly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href} passHref>
                <Button variant="outline" className="w-full justify-start">
                  <action.icon className="mr-3 h-5 w-5 text-primary" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
       <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Promotions & Specials</CardTitle>
          <CardDescription>Today's featured items and offers.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          {promotionalItems.map((item, index) => (
            <div key={item.id || `promo-${index}`} className="relative aspect-video rounded-lg overflow-hidden group">
              <Image 
                src={item.imageUrl || `https://placehold.co/600x400.png?text=${item.name.substring(0,2)}`} 
                alt={item.name} 
                layout="fill" 
                objectFit="cover" 
                data-ai-hint={item['data-ai-hint'] || `${item.category.toLowerCase()} food`}
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="text-white text-xl font-semibold">{item.name}</h3>
                <p className="text-green-400 text-lg">${item.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
          {promotionalItems.length === 0 && (
             <p className="text-muted-foreground md:col-span-2 text-center py-4">No special promotions currently. Check the menu!</p>
          )}
           {promotionalItems.length === 1 && ( // Add a placeholder if only one promo item
            <div className="relative aspect-video rounded-lg overflow-hidden group border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
              <Image src="https://placehold.co/600x400.png" alt="Placeholder Promotion" layout="fill" objectFit="cover" data-ai-hint="food restaurant" />
               <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="text-white text-xl font-semibold">More Coming Soon!</h3>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

