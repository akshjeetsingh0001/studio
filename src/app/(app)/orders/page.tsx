
'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, PlusCircle, Printer, Search, CheckCircle2, Trash2, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { OrderItem } from '@/app/(app)/order/[id]/page'; 

const initialMockOrders: MockOrder[] = [];

interface MockOrder {
  id: string;
  table: string;
  total: number;
  status: string;
  time: string;
  orderDetails?: OrderItem[];
}

const USER_SAVED_ORDERS_KEY = 'dineSwiftUserSavedOrders';

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'outline'; 
    case 'preparing':
      return 'default'; 
    case 'ready':
      return 'secondary'; 
    case 'pendingpayment':
      return 'outline'; 
    case 'paid': 
      return 'default'; 
    case 'completed':
      return 'secondary'; 
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const parseTime = (timeStr: string): number => {
  if (!timeStr) return Date.now();
  const [time, modifier] = timeStr.split(' ');
  if (!time || !modifier) return Date.now(); 
  let [hours, minutes] = time.split(':').map(Number);

  if (isNaN(hours) || isNaN(minutes)) {
      const now = new Date();
      if (!isNaN(hours) && modifier) { 
        if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
        now.setHours(hours, 0, 0, 0); 
        return now.getTime();
      }
      return now.getTime(); 
  }
  
  if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
  if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0; 

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

        if (savedOrdersRaw) {
          const parsedOrders = JSON.parse(savedOrdersRaw);
          loadedOrders = Array.isArray(parsedOrders) ? parsedOrders : [];
        }
        setAllOrders(loadedOrders);
      } catch (e) {
        console.error("Failed to load orders from localStorage", e);
        setAllOrders([]); 
      }
    } else {
        setAllOrders([]); 
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const intervalId = setInterval(loadOrders, 5000); 
    return () => clearInterval(intervalId);
  }, [loadOrders]);


  const handleUpdateOrderStatus = (orderId: string, newStatus: string, successMessage: string, icon?: React.ReactNode) => {
    setAllOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) } : order
      );
      updateLocalStorage(updatedOrders);
      toast({
        title: "Order Updated",
        description: successMessage,
        icon: icon,
      });
      return updatedOrders;
    });
  };

  const handleMarkAsPaid = (orderId: string) => {
    handleUpdateOrderStatus(orderId, 'Paid', `Order ${orderId} marked as Paid.`, <CheckCircle2 className="h-4 w-4 text-green-600" />);
  };

  const handleCompleteOrder = (orderId: string) => {
     handleUpdateOrderStatus(orderId, 'Completed', `Order ${orderId} marked as Completed. This order will now move to past orders.`, <CheckCheck className="h-4 w-4 text-blue-600" />);
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

  const filterAndSortOrders = (orders: MockOrder[], filterTerm: string, statuses: string[]) => {
    let filtered = orders.filter(order => statuses.includes(order.status));
    if (filterTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(filterTerm.toLowerCase()) ||
        order.table.toLowerCase().includes(filterTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(filterTerm.toLowerCase())
      );
    }
    return filtered.sort((a, b) => parseTime(b.time) - parseTime(a.time));
  };

  const activeStatuses = ['Active', 'Preparing', 'Ready', 'PendingPayment', 'Paid'];
  const completedStatuses = ['Completed', 'Cancelled'];

  const activeOrders = filterAndSortOrders(allOrders, searchTerm, activeStatuses);
  const completedOrders = filterAndSortOrders(allOrders, searchTerm, completedStatuses);


  return (
    <TooltipProvider>
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
              <Button className="transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95">
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
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Active Orders</CardTitle>
                <CardDescription>Orders currently in progress, preparing, ready, pending payment, or paid. Sorted by newest first.</CardDescription>
              </CardHeader>
              <CardContent>
                <OrderTable
                  orders={activeOrders}
                  onMarkAsPaid={handleMarkAsPaid}
                  onCompleteOrder={handleCompleteOrder}
                  onDeleteOrder={handleDeleteOrder}
                  isViewingActiveOrders={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="completed">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Completed & Past Orders</CardTitle>
                <CardDescription>Orders that have been completed or cancelled.</CardDescription>
              </CardHeader>
              <CardContent>
                <OrderTable
                  orders={completedOrders}
                  onMarkAsPaid={() => {}} 
                  onCompleteOrder={() => {}} 
                  onDeleteOrder={handleDeleteOrder}
                  isViewingActiveOrders={false}
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
  onCompleteOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  isViewingActiveOrders: boolean;
}

function OrderTable({ orders, onMarkAsPaid, onCompleteOrder, onDeleteOrder, isViewingActiveOrders }: OrderTableProps) {
  if (orders.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No orders to display in this category.</p>;
  }

  const formatOrderDetailsTooltip = (orderDetails?: OrderItem[]): string => {
    if (!orderDetails || orderDetails.length === 0) {
      return "No items detailed for this order.";
    }
    return orderDetails.map(item => `${item.quantity}x ${item.name}`).join(', ');
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Table/Type</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Time</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id} className="hover:bg-muted/50">
            <TableCell className="font-medium">{order.id}</TableCell>
            <TableCell>{order.table}</TableCell>
            <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
            </TableCell>
            <TableCell>{order.time}</TableCell>
            <TableCell className="text-right space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/order/${order.id.toLowerCase()}`} passHref>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formatOrderDetailsTooltip(order.orderDetails)}</p>
                </TooltipContent>
              </Tooltip>

              {isViewingActiveOrders && ['active', 'preparing', 'ready', 'pendingpayment'].includes(order.status.toLowerCase()) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onMarkAsPaid(order.id)}>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mark as Paid</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {isViewingActiveOrders && order.status.toLowerCase() === 'paid' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onCompleteOrder(order.id)}>
                      <CheckCheck className="h-4 w-4 text-blue-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mark as Completed</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {(order.status.toLowerCase() === 'paid' || order.status.toLowerCase() === 'completed') && (
                 <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" title="Print Receipt" disabled> 
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Print Receipt (Coming Soon)</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => onDeleteOrder(order.id)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Order</p>
                </TooltipContent>
              </Tooltip>

            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

    
