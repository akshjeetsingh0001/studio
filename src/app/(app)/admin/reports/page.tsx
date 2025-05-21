
'use client'; // Required for Recharts, date picker interactions, and localStorage access

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DateRange } from "react-day-picker";
import { addDays, format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { OrderItem } from '@/app/(app)/order/[id]/page'; // For order details type

// Key for localStorage
const USER_SAVED_ORDERS_KEY = 'dineSwiftUserSavedOrders';

// Interface for orders loaded from localStorage
interface StoredOrder {
  id: string;
  table: string;
  items: number;
  total: number;
  status: string;
  server: string;
  time: string; // "HH:MM AM/PM" format
  orderDetails?: OrderItem[];
}

interface TopSellingItemData {
  name: string;
  sales: number; // Units sold
  revenue: number;
}

interface KpiData {
  title: string;
  value: string;
  isDynamic?: boolean;
  description?: string;
}

// Static mock data for Sales Over Time removed.
const staticSalesOverTimeData: { date: string, sales: number, orders: number }[] = [];

// Chart configurations
const salesChartConfig = {
  sales: {
    label: "Sales ($)",
    color: "hsl(var(--primary))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

const itemsChartConfig = {
  sales: {
    label: "Units Sold",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue ($)",
    color: "hsl(var(--chart-2))",
  }
} satisfies ChartConfig;


export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  const [dynamicTopSellingItems, setDynamicTopSellingItems] = useState<TopSellingItemData[]>([]);
  const [dynamicKpis, setDynamicKpis] = useState<KpiData[]>([
    { title: "Average Order Value", value: "$0.00", isDynamic: true, description:"From completed orders" },
    { title: "Total Customers Served", value: "0", isDynamic: true, description:"Based on completed orders" },
    { title: "New Customers", value: "N/A", isDynamic: false, description:"Data not available" }, 
    { title: "Peak Hours", value: "N/A", isDynamic: false, description:"Data not available" }, 
  ]);

  const loadAndProcessReportData = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedOrdersRaw = localStorage.getItem(USER_SAVED_ORDERS_KEY);
        const savedOrders: StoredOrder[] = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : [];
        
        const completedOrders = savedOrders.filter(order => ['Paid', 'Completed'].includes(order.status));

        // Process for Top Selling Items
        const itemStatsMap = new Map<string, { name: string; sales: number; revenue: number }>();
        completedOrders.forEach(order => {
          order.orderDetails?.forEach(item => {
            const stat = itemStatsMap.get(item.id) || { name: item.name, sales: 0, revenue: 0 };
            stat.sales += item.quantity;
            stat.revenue += item.price * item.quantity;
            itemStatsMap.set(item.id, stat);
          });
        });
        const topItems = Array.from(itemStatsMap.values())
          .sort((a, b) => b.sales - a.sales) // Sort by units sold
          .slice(0, 5); // Take top 5
        setDynamicTopSellingItems(topItems);

        // Process for KPIs
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
        const numberOfCompletedOrders = completedOrders.length;
        const averageOrderValue = numberOfCompletedOrders > 0 ? totalRevenue / numberOfCompletedOrders : 0;

        setDynamicKpis(prevKpis => prevKpis.map(kpi => {
          if (kpi.title === "Average Order Value") return { ...kpi, value: `$${averageOrderValue.toFixed(2)}` };
          if (kpi.title === "Total Customers Served") return { ...kpi, value: numberOfCompletedOrders.toString() };
          return kpi; 
        }));

      } catch (e) {
        console.error("Failed to load or process report data from localStorage", e);
        setDynamicTopSellingItems([]);
         setDynamicKpis([
            { title: "Average Order Value", value: "$0.00", isDynamic: true, description:"From completed orders" },
            { title: "Total Customers Served", value: "0", isDynamic: true, description:"Based on completed orders" },
            { title: "New Customers", value: "N/A", isDynamic: false, description:"Data not available" },
            { title: "Peak Hours", value: "N/A", isDynamic: false, description:"Data not available" },
        ]);
      }
    }
  }, []);

  useEffect(() => {
    loadAndProcessReportData();
  }, [loadAndProcessReportData]);

  // Filter static sales data based on dateRange (example for the static chart)
  const filteredSalesOverTimeData = staticSalesOverTimeData.filter(d => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const itemDate = parseISO(d.date);
    return itemDate >= dateRange.from && itemDate <= dateRange.to;
  });


  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" description="View sales trends, item performance, and more.">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[260px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
                 <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={() => alert("Export CSV: Coming soon!")}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print Report
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
            <CardDescription>
              Daily sales and order volume. (Note: Chart requires historical data not currently stored.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={salesChartConfig} className="h-[300px] w-full">
              <LineChart data={filteredSalesOverTimeData} margin={{ left: 12, right: 12, top: 5, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="hsl(var(--primary))" tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} yAxisId="left" dot={false} />
                <Line type="monotone" dataKey="orders" stroke="var(--color-orders)" strokeWidth={2} yAxisId="right" dot={false} />
              </LineChart>
            </ChartContainer>
             {filteredSalesOverTimeData.length === 0 && <p className="text-center text-muted-foreground pt-4">No sales data available for the selected period.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
            <CardDescription>
              Most popular items by units sold (from completed orders).
            </CardDescription>
          </CardHeader>
          <CardContent>
             {dynamicTopSellingItems.length > 0 ? (
                <ChartContainer config={itemsChartConfig} className="h-[300px] w-full">
                  <BarChart data={dynamicTopSellingItems} layout="vertical" margin={{ left: 20, right: 12, top: 5, bottom: 5 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} style={{ fontSize: '0.75rem' }} interval={0} />
                    <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={4} name="Units Sold" />
                    {/* <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} name="Revenue ($)" /> Uncomment to show revenue bar */}
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-center text-muted-foreground h-[300px] flex items-center justify-center">No sales data yet to determine top selling items.</p>
              )}
          </CardContent>
        </Card>
      </div>
       <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Key Performance Indicators (KPIs)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dynamicKpis.map(kpi => (
            <Card key={kpi.title} className="bg-muted/50">
              <CardHeader className="pb-2">
                 <CardDescription>{kpi.title} {!kpi.isDynamic && <span className="text-xs">(Static/Unavailable)</span>}</CardDescription>
                 <CardTitle className="text-2xl">{kpi.value}</CardTitle>
                 {kpi.description && <p className="text-xs text-muted-foreground/70 pt-1">{kpi.description}</p>}
              </CardHeader>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
