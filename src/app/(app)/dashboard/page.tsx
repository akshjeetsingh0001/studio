
'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, DollarSign, Layers, ShoppingBag, Users, Utensils } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { OrderItem } from '@/app/(app)/order/[id]/page'; 

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

const initialTableStatuses: { id: string; status: string; items: number; server: string }[] = [];

const quickActions = [
  { label: "New Order", href: "/order/new", icon: Utensils },
  { label: "View Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Manage Menu", href: "/admin/menu", icon: Utensils },
];

export default function DashboardPage() {
  const [openChecksCount, setOpenChecksCount] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [promotionalItems, setPromotionalItems] = useState<MenuItem[]>([]);
  const [todaysSales, setTodaysSales] = useState(0);
  const [coversServed, setCoversServed] = useState(0);
  const [tableStatuses, setTableStatuses] = useState(initialTableStatuses);


  const loadDashboardData = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedOrdersRaw = localStorage.getItem(USER_SAVED_ORDERS_KEY);
        if (savedOrdersRaw) {
          const savedOrders: MockOrder[] = JSON.parse(savedOrdersRaw);
          const activeOrders = savedOrders.filter(order => ['Active', 'Preparing', 'PendingPayment', 'Ready'].includes(order.status));
          setOpenChecksCount(activeOrders.length);
          setTotalOrdersCount(savedOrders.length);

          const completedOrPaidOrders = savedOrders.filter(order => ['Paid', 'Completed'].includes(order.status));
          const calculatedSales = completedOrPaidOrders.reduce((sum, order) => sum + order.total, 0);
          setTodaysSales(calculatedSales);
          setCoversServed(completedOrPaidOrders.length);

        } else {
          setOpenChecksCount(0); 
          setTotalOrdersCount(0); 
          setTodaysSales(0); 
          setCoversServed(0); 
        }
      } catch (e) {
        console.error("Failed to load orders for dashboard", e);
        setOpenChecksCount(0);
        setTotalOrdersCount(0);
        setTodaysSales(0);
        setCoversServed(0);
      }

      try {
        const menuItemsRaw = localStorage.getItem(USER_MENU_ITEMS_KEY);
        if (menuItemsRaw) {
          const allMenuItems: MenuItem[] = JSON.parse(menuItemsRaw);
          const availableItems = allMenuItems.filter(item => item.availability);
          if (availableItems.length > 0) {
            setPromotionalItems(availableItems.slice(0, 2).map(item => ({
              ...item,
              imageUrl: item.imageUrl || `https://placehold.co/600x400.png?text=${item.name.substring(0,2)}`
            })));
          } else {
            setPromotionalItems([]); 
          }
        } else {
          setPromotionalItems([]); 
        }
      } catch (e) {
        console.error("Failed to load menu items for dashboard promotions", e);
        setPromotionalItems([]);
      }
      setTableStatuses([]);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const summaryCards = [
    { title: "Today's Sales", value: `$${todaysSales.toFixed(2)}`, icon: DollarSign, isStatic: false, change: "", changeType: "neutral" as const },
    { title: "Open Checks", value: openChecksCount.toString(), icon: Layers, isStatic: false, change: "", changeType: "neutral" as const },
    { title: "Total Orders", value: totalOrdersCount.toString(), icon: ShoppingBag, isStatic: false, change: "", changeType: "neutral" as const }, 
    { title: "Covers Served", value: coversServed.toString(), icon: Users, isStatic: false, change: "", changeType: "neutral" as const },
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
          <Card key={card.title} className="shadow-sm hover:shadow-md transition-shadow duration-200">
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
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Table Status</CardTitle>
            <CardDescription>Quick view of current table occupancy. (Table data managed on Tables page)</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {tableStatuses.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-4">Table status information is managed on the Tables page. No active table data displayed here.</p>
            ) : (
              tableStatuses.slice(0,8).map(table => (
                <Link key={table.id} href={`/order/${table.id.toLowerCase()}`} passHref>
                  <Button variant="outline" className={`h-24 w-full flex flex-col items-center justify-center p-2 shadow-sm hover:shadow-lg transition-all border-2 ${table.status === 'Available' ? 'border-green-500 hover:bg-green-50' : table.status === 'Occupied' ? 'border-red-500 hover:bg-red-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                    <span className="text-lg font-semibold">{table.id}</span>
                    <span className="text-xs text-muted-foreground">{table.status}</span>
                    {table.status === 'Occupied' && <span className="text-xs">{table.items} items</span>}
                  </Button>
                </Link>
              ))
            )}
          </CardContent>
           <CardContent className="mt-2 text-right">
             <Link href="/tables" passHref>
                <Button variant="link">View All Tables &rarr;</Button>
              </Link>
           </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
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
       <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <CardTitle>Promotions & Specials</CardTitle>
          <CardDescription>Featured items from your menu.</CardDescription>
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
             <p className="text-muted-foreground md:col-span-2 text-center py-4">No special promotions available. Add items to the menu to see them here.</p>
          )}
           {promotionalItems.length === 1 && ( 
            <div className="relative aspect-video rounded-lg overflow-hidden group border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
              <Image src="https://placehold.co/600x400.png" alt="Placeholder Promotion" layout="fill" objectFit="cover" data-ai-hint="food restaurant" />
               <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="text-white text-xl font-semibold">More Coming Soon!</h3>
                <p className="text-green-400 text-lg">Check back later</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

