
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Filter, PlusCircle, Printer, Search } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Initial mock data for orders
const initialMockOrders = [
  { id: 'ORD001', table: 'T1', items: 3, total: 45.50, status: 'Active', server: 'Jane D.', time: '10:30 AM' },
  { id: 'ORD002', table: 'T5', items: 5, total: 82.00, status: 'Active', server: 'John S.', time: '10:35 AM' },
  { id: 'ORD003', table: 'T2', items: 2, total: 25.00, status: 'Paid', server: 'Alice M.', time: '10:15 AM' },
  { id: 'ORD004', table: 'T8', items: 4, total: 60.75, status: 'Preparing', server: 'Jane D.', time: '10:40 AM' },
  { id: 'ORD005', table: 'T3', items: 1, total: 12.25, status: 'Completed', server: 'John S.', time: '09:50 AM' },
  { id: 'ORD006', table: 'T6', items: 6, total: 105.00, status: 'Active', server: 'Alice M.', time: '10:42 AM' },
  { id: 'ORD007', table: 'T10', items: 2, total: 33.50, status: 'Cancelled', server: 'Jane D.', time: '10:05 AM' },
];

interface MockOrder {
  id: string;
  table: string;
  items: number;
  total: number;
  status: string;
  server: string;
  time: string;
}

const USER_SAVED_ORDERS_KEY = 'dineSwiftUserSavedOrders';

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'preparing':
    case 'pendingpayment':
      return 'default'; // primary color
    case 'paid':
    case 'completed':
      return 'secondary'; // accent color
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function OrdersPage() {
  const [allOrders, setAllOrders] = useState<MockOrder[]>(initialMockOrders);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedOrdersRaw = localStorage.getItem(USER_SAVED_ORDERS_KEY);
        if (savedOrdersRaw) {
          const savedOrders: MockOrder[] = JSON.parse(savedOrdersRaw);
          // Combine initial mocks with saved orders, prioritizing saved ones if IDs clash or just appending.
          // For simplicity, let's ensure saved orders are added without complex merging for now.
          // A more robust approach would involve checking for duplicates by ID.
          const combinedOrders = [...initialMockOrders];
          const mockOrderIds = new Set(initialMockOrders.map(o => o.id));
          
          savedOrders.forEach(savedOrder => {
            if (!mockOrderIds.has(savedOrder.id)) { // Add if ID is not in initial mocks
              combinedOrders.push(savedOrder);
            } else { // If ID exists, update it (simple replacement)
              const index = combinedOrders.findIndex(o => o.id === savedOrder.id);
              if (index !== -1) {
                combinedOrders[index] = savedOrder;
              }
            }
          });
          setAllOrders(combinedOrders);
        }
      } catch (e) {
        console.error("Failed to load orders from localStorage", e);
        // Fallback to initial mock orders if localStorage is corrupted
        setAllOrders(initialMockOrders);
      }
    }
  }, []);

  const activeOrders = allOrders.filter(order => ['Active', 'Preparing', 'PendingPayment'].includes(order.status));
  const completedOrders = allOrders.filter(order => ['Paid', 'Completed', 'Cancelled'].includes(order.status));
  const [searchTerm, setSearchTerm] = useState('');


  const filterOrders = (orders: MockOrder[]) => {
    if (!searchTerm) return orders;
    return orders.filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.server.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };


  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Manage and view all customer orders.">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search orders..." 
              className="pl-8 sm:w-[300px]" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* <Button variant="outline"> // Filter button can be re-added if complex filtering is needed
            <Filter className="mr-2 h-4 w-4" /> Filter 
          </Button> */}
          <Link href="/order/new" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> New Order
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="active">Active Orders ({filterOrders(activeOrders).length})</TabsTrigger>
          <TabsTrigger value="completed">Completed/Past Orders ({filterOrders(completedOrders).length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
              <CardDescription>Orders currently in progress, being prepared, or pending payment.</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable orders={filterOrders(activeOrders)} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Completed & Past Orders</CardTitle>
              <CardDescription>Orders that have been paid, completed, or cancelled.</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable orders={filterOrders(completedOrders)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OrderTable({ orders }: { orders: MockOrder[] }) {
  if (orders.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No orders to display in this category.</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Table/Type</TableHead>
          <TableHead className="text-center">Items</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Server</TableHead>
          <TableHead>Time</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id} className="hover:bg-muted/50">
            <TableCell className="font-medium">{order.id}</TableCell>
            <TableCell>{order.table}</TableCell>
            <TableCell className="text-center">{order.items}</TableCell>
            <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
            </TableCell>
            <TableCell>{order.server}</TableCell>
            <TableCell>{order.time}</TableCell>
            <TableCell className="text-right">
              <Link href={`/order/${order.status === 'PendingPayment' ? 'new' : order.id.toLowerCase()}`} passHref> 
                {/* If PendingPayment, link to /order/new or a specific payment page might be better. For now, let's simplify.
                    Or we can pass the order id as a query param to a payment page.
                    For current structure, viewing it might try to load based on ORDxxx which page.tsx doesn't handle for loading items.
                    Linking to `/order/new` for PendingPayment might be confusing.
                    Let's assume for now, 'View Order' is always appropriate or leads to a page that can handle it.
                    Given the order entry page can take an ID, it should just be the order.id.
                */}
                <Button variant="ghost" size="icon" title="View Order">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              {['Paid', 'Completed'].includes(order.status) && (
                <Button variant="ghost" size="icon" title="Print Receipt">
                  <Printer className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

