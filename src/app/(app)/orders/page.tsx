
'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, PlusCircle, Printer, Search, CheckCircle2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { OrderItem } from '@/app/(app)/order/[id]/page'; // Import OrderItem type

// Initial mock data for orders
const initialMockOrders = [
  { id: 'ORD001', table: 'T1', items: 3, total: 45.50, status: 'Active', server: 'Jane D.', time: '10:30 AM', orderDetails: [{ name: 'Classic Burger', quantity: 1, price: 12.99, id: 'ITEM001', category: 'Main Course', imageUrl: '', description: '' }, { name: 'French Fries', quantity: 2, price: 4.50, id: 'ITEM004', category: 'Sides', imageUrl: '', description: '' }] },
  { id: 'ORD002', table: 'T5', items: 5, total: 82.00, status: 'Active', server: 'John S.', time: '10:35 AM', orderDetails: [] },
  { id: 'ORD003', table: 'T2', items: 2, total: 25.00, status: 'Paid', server: 'Alice M.', time: '10:15 AM', orderDetails: [] },
  { id: 'ORD004', table: 'T8', items: 4, total: 60.75, status: 'Preparing', server: 'Jane D.', time: '10:40 AM', orderDetails: [] },
  { id: 'ORD005', table: 'T3', items: 1, total: 12.25, status: 'Completed', server: 'John S.', time: '09:50 AM', orderDetails: [] },
  { id: 'ORD006', table: 'T6', items: 6, total: 105.00, status: 'Active', server: 'Alice M.', time: '10:42 AM', orderDetails: [] },
  { id: 'ORD007', table: 'T10', items: 2, total: 33.50, status: 'Cancelled', server: 'Jane D.', time: '10:05 AM', orderDetails: [] },
];

interface MockOrder {
  id: string;
  table: string;
  items: number;
  total: number;
  status: string;
  server: string;
  time: string;
  orderDetails?: OrderItem[]; // Added to store detailed items
}

const USER_SAVED_ORDERS_KEY = 'dineSwiftUserSavedOrders';

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'preparing':
    case 'pendingpayment':
      return 'default'; 
    case 'paid':
    case 'completed':
      return 'secondary'; 
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const parseTime = (timeStr: string): number => {
  if (!timeStr) return Date.now(); // Fallback for undefined time
  const [time, modifier] = timeStr.split(' ');
  if (!time || !modifier) return Date.now(); 
  let [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return Date.now(); 

  if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
  if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0; 
  
  // Create a date object for today with this time to ensure correct sorting across days if needed
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
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

  const loadOrders = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedOrdersRaw = localStorage.getItem(USER_SAVED_ORDERS_KEY);
        let loadedOrders: MockOrder[] = [];

        // Create a map of initial orders to ensure they are included and can be updated
        const initialOrdersMap = new Map<string, MockOrder>();
        initialMockOrders.forEach(order => initialOrdersMap.set(order.id, { ...order }));

        if (savedOrdersRaw) {
          const savedOrders: MockOrder[] = JSON.parse(savedOrdersRaw);
          savedOrders.forEach(savedOrder => {
            initialOrdersMap.set(savedOrder.id, savedOrder); // Add or overwrite with saved order
          });
        }
        loadedOrders = Array.from(initialOrdersMap.values());
        setAllOrders(loadedOrders);
      } catch (e) {
        console.error("Failed to load orders from localStorage", e);
        setAllOrders([...initialMockOrders]); // Fallback to initial mock orders
      }
    } else {
        setAllOrders([...initialMockOrders]);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    // Optional: Set up an interval to refresh orders from localStorage if other tabs might change it
    // const intervalId = setInterval(loadOrders, 5000); // Refresh every 5 seconds
    // return () => clearInterval(intervalId);
  }, [loadOrders]);


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
    if (sortActive) { // Sort by time, newest first
      return filtered.sort((a, b) => parseTime(b.time) - parseTime(a.time));
    }
    // For completed orders, could sort by time as well, or by ID
    return filtered.sort((a, b) => parseTime(b.time) - parseTime(a.time));
  };
  
  const activeOrders = filterAndSortOrders(
    allOrders.filter(order => ['Active', 'Preparing', 'PendingPayment'].includes(order.status)),
    searchTerm,
    true 
  );
  
  const completedOrders = filterAndSortOrders(
    allOrders.filter(order => ['Paid', 'Completed', 'Cancelled'].includes(order.status)),
    searchTerm
  );


  return (
    <TooltipProvider> {/* Added TooltipProvider here */}
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
                  isActiveTab={true}
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
                  onMarkAsPaid={() => {}} 
                  onDeleteOrder={handleDeleteOrder}
                  isActiveTab={false} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

interface OrderTableProps {
  orders: MockOrder[];
  onMarkAsPaid: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  isActiveTab: boolean;
}

function OrderTable({ orders, onMarkAsPaid, onDeleteOrder, isActiveTab }: OrderTableProps) {
  if (orders.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No orders to display in this category.</p>;
  }

  const formatOrderDetailsTooltip = (orderDetails?: OrderItem[]): string => {
    if (!orderDetails || orderDetails.length === 0) {
      return "No items detailed.";
    }
    return orderDetails.map(item => `${item.quantity}x ${item.name}`).join(', ');
  };

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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/order/${order.id.toLowerCase()}`} passHref>
                    <Button variant="ghost" size="icon" title="View Order Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formatOrderDetailsTooltip(order.orderDetails)}</p>
                </TooltipContent>
              </Tooltip>

              {isActiveTab && ['Active', 'Preparing', 'PendingPayment'].includes(order.status) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" title="Mark as Paid" onClick={() => onMarkAsPaid(order.id)}>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mark as Paid</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" title="Delete Order" onClick={() => onDeleteOrder(order.id)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Order</p>
                </TooltipContent>
              </Tooltip>

              {['Paid', 'Completed'].includes(order.status) && (
                 <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" title="Print Receipt">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Print Receipt</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

