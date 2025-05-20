
'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, PlusCircle, Printer, Search, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

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

// Helper to parse time string (e.g., "10:30 AM") into minutes from midnight for sorting
const parseTime = (timeStr: string): number => {
  const [time, modifier] = timeStr.split(' ');
  if (!time || !modifier) return 0; // Fallback for invalid format
  let [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0; // Fallback for invalid time parts

  if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
  if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0; // Midnight case (12 AM is 0 hours)
  return hours * 60 + minutes;
};

export default function OrdersPage() {
  const [allOrders, setAllOrders] = useState<MockOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const updateLocalStorage = (updatedOrders: MockOrder[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_SAVED_ORDERS_KEY, JSON.stringify(updatedOrders));
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedOrdersRaw = localStorage.getItem(USER_SAVED_ORDERS_KEY);
        let loadedOrders = [...initialMockOrders]; // Start with a fresh copy of initial mocks

        if (savedOrdersRaw) {
          const savedOrders: MockOrder[] = JSON.parse(savedOrdersRaw);
          const initialOrderIds = new Set(initialMockOrders.map(o => o.id));
          
          // Create a map of initial orders for quick lookup and update
          const ordersMap = new Map<string, MockOrder>();
          initialMockOrders.forEach(order => ordersMap.set(order.id, order));

          savedOrders.forEach(savedOrder => {
            ordersMap.set(savedOrder.id, savedOrder); // Overwrite or add saved order
          });
          loadedOrders = Array.from(ordersMap.values());
        }
        setAllOrders(loadedOrders);
      } catch (e) {
        console.error("Failed to load orders from localStorage", e);
        setAllOrders([...initialMockOrders]); // Fallback to initial mock orders
      }
    }
  }, []);


  const handleMarkAsPaid = (orderId: string) => {
    setAllOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order =>
        order.id === orderId ? { ...order, status: 'Paid' } : order
      );
      updateLocalStorage(updatedOrders);
      toast({
        title: "Order Updated",
        description: `Order ${orderId} marked as Paid.`,
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
      return updatedOrders;
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    setAllOrders(prevOrders => {
      const updatedOrders = prevOrders.filter(order => order.id !== orderId);
      updateLocalStorage(updatedOrders);
      toast({
        title: "Order Deleted",
        description: `Order ${orderId} has been removed.`,
        variant: "destructive",
        icon: <Trash2 className="h-4 w-4" />,
      });
      return updatedOrders;
    });
  };

  const filterAndSortOrders = (orders: MockOrder[], filterTerm: string, sortActive: boolean = false) => {
    let filtered = orders;
    if (filterTerm) {
      filtered = orders.filter(order => 
        order.id.toLowerCase().includes(filterTerm.toLowerCase()) ||
        order.table.toLowerCase().includes(filterTerm.toLowerCase()) ||
        order.server.toLowerCase().includes(filterTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(filterTerm.toLowerCase())
      );
    }
    if (sortActive) {
      return filtered.sort((a, b) => parseTime(b.time) - parseTime(a.time));
    }
    return filtered;
  };
  
  const activeOrders = filterAndSortOrders(
    allOrders.filter(order => ['Active', 'Preparing', 'PendingPayment'].includes(order.status)),
    searchTerm,
    true // Enable sorting for active orders
  );
  
  const completedOrders = filterAndSortOrders(
    allOrders.filter(order => ['Paid', 'Completed', 'Cancelled'].includes(order.status)),
    searchTerm
  );


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
          <Link href="/order/new" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> New Order
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="active">Active Orders ({activeOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed/Past Orders ({completedOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
              <CardDescription>Orders currently in progress, being prepared, or pending payment. Sorted by newest first.</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable 
                orders={activeOrders} 
                onMarkAsPaid={handleMarkAsPaid}
                onDeleteOrder={handleDeleteOrder}
                showActions={true}
              />
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
              <OrderTable 
                orders={completedOrders} 
                onMarkAsPaid={() => {}} // No "mark as paid" for completed orders
                onDeleteOrder={handleDeleteOrder} // Optionally allow delete for completed orders too
                showActions={false} // Or limited actions
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface OrderTableProps {
  orders: MockOrder[];
  onMarkAsPaid: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  showActions: boolean;
}

function OrderTable({ orders, onMarkAsPaid, onDeleteOrder, showActions }: OrderTableProps) {
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
            <TableCell className="text-right space-x-1">
              <Link href={`/order/${order.id.toLowerCase()}`} passHref>
                <Button variant="ghost" size="icon" title="View Order">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              {showActions && ['Active', 'Preparing', 'PendingPayment'].includes(order.status) && (
                <Button variant="ghost" size="icon" title="Mark as Paid" onClick={() => onMarkAsPaid(order.id)}>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </Button>
              )}
              {showActions && ( // Enable delete for active orders for now
                 <Button variant="ghost" size="icon" title="Delete Order" onClick={() => onDeleteOrder(order.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
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

