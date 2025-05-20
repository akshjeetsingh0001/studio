import type React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, DollarSign, Layers, ShoppingBag, Users, Utensils } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Mock data for dashboard
const summaryCards = [
  { title: "Today's Sales", value: "$1,234.56", icon: DollarSign, change: "+5.2%", changeType: "positive" as const },
  { title: "Open Checks", value: "12", icon: Layers, change: "-2", changeType: "negative" as const },
  { title: "Total Orders", value: "87", icon: ShoppingBag, change: "+10", changeType: "positive" as const },
  { title: "Covers Served", value: "35", icon: Users, change: "+3", changeType: "positive" as const },
];

const quickActions = [
  { label: "New Order", href: "/tables", icon: Utensils },
  { label: "View Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Manage Menu", href: "/admin/menu", icon: Utensils },
];

const tableStatuses = [
  { id: 'T1', status: 'Available', items: 0, server: 'N/A' },
  { id: 'T2', status: 'Occupied', items: 3, server: 'Jane D.' },
  { id: 'T3', status: 'Needs Cleaning', items: 0, server: 'N/A' },
  { id: 'T4', status: 'Reserved', items: 0, server: 'John S.' },
  { id: 'T5', status: 'Occupied', items: 5, server: 'Alice M.' },
  { id: 'T6', status: 'Available', items: 0, server: 'N/A' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Available': return 'bg-green-500';
    case 'Occupied': return 'bg-red-500';
    case 'Needs Cleaning': return 'bg-yellow-500';
    case 'Reserved': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};


export default function DashboardPage() {
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
              <p className={`text-xs ${card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {card.change} from yesterday
              </p>
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
          <div className="relative aspect-video rounded-lg overflow-hidden group">
            <Image src="https://placehold.co/600x400.png" alt="Special Offer 1" layout="fill" objectFit="cover" data-ai-hint="pasta dish" />
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <h3 className="text-white text-xl font-semibold">Pasta Primavera</h3>
              <p className="text-green-400 text-lg">$12.99</p>
            </div>
          </div>
          <div className="relative aspect-video rounded-lg overflow-hidden group">
             <Image src="https://placehold.co/600x400.png" alt="Special Offer 2" layout="fill" objectFit="cover" data-ai-hint="cocktail drink"/>
             <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <h3 className="text-white text-xl font-semibold">Sunset Mocktail</h3>
              <p className="text-green-400 text-lg">$5.00</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
