'use client'; // Required for Recharts and date picker interactions

import type React from 'react';
import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

// Mock data for reports
const salesOverTimeData = [
  { date: '2024-07-01', sales: 1200, orders: 30 },
  { date: '2024-07-02', sales: 1500, orders: 35 },
  { date: '2024-07-03', sales: 1100, orders: 28 },
  { date: '2024-07-04', sales: 1800, orders: 42 },
  { date: '2024-07-05', sales: 1650, orders: 38 },
  { date: '2024-07-06', sales: 2200, orders: 50 },
  { date: '2024-07-07', sales: 2000, orders: 45 },
];

const topSellingItemsData = [
  { name: 'Classic Burger', sales: 150, revenue: 1948.50 },
  { name: 'Margherita Pizza', sales: 120, revenue: 1800.00 },
  { name: 'Caesar Salad', sales: 90, revenue: 765.00 },
  { name: 'Coca-Cola', sales: 200, revenue: 500.00 },
  { name: 'Chocolate Lava Cake', sales: 75, revenue: 525.00 },
];

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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Print Report
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
            <CardDescription>
              Daily sales and order volume for the selected period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={salesChartConfig} className="h-[300px] w-full">
              <LineChart data={salesOverTimeData} margin={{ left: 12, right: 12, top: 5, bottom: 5 }}>
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
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
            <CardDescription>
              Most popular items by units sold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={itemsChartConfig} className="h-[300px] w-full">
              <BarChart data={topSellingItemsData} layout="vertical" margin={{ left: 20, right: 12, top: 5, bottom: 5 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
       <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Key Performance Indicators (KPIs)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Average Order Value", value: "$35.78" },
            { title: "Total Customers", value: "125" },
            { title: "New Customers", value: "23" },
            { title: "Peak Hours", value: "7 PM - 9 PM" },
          ].map(kpi => (
            <Card key={kpi.title} className="bg-muted/50">
              <CardHeader className="pb-2">
                 <CardDescription>{kpi.title}</CardDescription>
                 <CardTitle className="text-2xl">{kpi.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
