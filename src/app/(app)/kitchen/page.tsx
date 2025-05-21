
'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Check, ChefHat, CheckCheck, AlertTriangle, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { OrderItem } from '@/app/(app)/order/[id]/page';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const USER_SAVED_ORDERS_KEY = 'dineSwiftUserSavedOrders';
const KDS_REFRESH_INTERVAL = 5000; // 5 seconds

interface StoredOrder {
  id: string;
  table: string;
  total: number;
  status: string;
  time: string;
  orderDetails?: OrderItem[];
}

const relevantStatuses = ['Active', 'PendingPayment', 'Preparing', 'Ready'];

export default function KitchenDisplayPage() {
  const [kitchenOrders, setKitchenOrders] = useState<StoredOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { logout } = useAuth();

  const loadKitchenOrders = useCallback(() => {
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      try {
        const savedOrdersRaw = localStorage.getItem(USER_SAVED_ORDERS_KEY);
        const allOrders: StoredOrder[] = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : [];
        const filtered = allOrders.filter(order => relevantStatuses.includes(order.status));
        
        filtered.sort((a, b) => {
            const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
            const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
            if (['Active', 'PendingPayment'].includes(a.status) && ['Active', 'PendingPayment'].includes(b.status)) {
                return timeB - timeA; 
            }
            if (['Preparing', 'Ready'].includes(a.status) && ['Preparing', 'Ready'].includes(b.status)) {
                return timeA - timeB; 
            }
            if (relevantStatuses.indexOf(a.status) < relevantStatuses.indexOf(b.status, 2)) return -1;
            if (relevantStatuses.indexOf(b.status) < relevantStatuses.indexOf(a.status, 2)) return 1;

            return timeB - timeA; 
        });
        setKitchenOrders(filtered);
      } catch (e) {
        console.error("Failed to load kitchen orders from localStorage", e);
        toast({ title: "Error Loading Orders", description: "Could not retrieve orders for the kitchen display.", variant: "destructive" });
        setKitchenOrders([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [toast]);

  useEffect(() => {
    loadKitchenOrders();
    const intervalId = setInterval(loadKitchenOrders, KDS_REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [loadKitchenOrders]);

  const updateOrderStatus = (orderId: string, newStatus: 'Preparing' | 'Ready') => {
    if (typeof window !== 'undefined') {
      try {
        const savedOrdersRaw = localStorage.getItem(USER_SAVED_ORDERS_KEY);
        let allOrders: StoredOrder[] = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : [];
        const orderIndex = allOrders.findIndex(o => o.id === orderId);

        if (orderIndex > -1) {
          allOrders[orderIndex].status = newStatus;
          allOrders[orderIndex].time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); 
          localStorage.setItem(USER_SAVED_ORDERS_KEY, JSON.stringify(allOrders));
          loadKitchenOrders(); 
          toast({
            title: `Order ${orderId} Updated`,
            description: `Status changed to ${newStatus}.`,
            icon: newStatus === 'Preparing' ? <ChefHat className="h-5 w-5 text-orange-500" /> : <CheckCheck className="h-5 w-5 text-green-500" />
          });
        } else {
          throw new Error("Order not found for update.");
        }
      } catch (e) {
        console.error("Failed to update order status in localStorage", e);
        toast({ title: "Update Error", description: `Could not update order ${orderId}.`, variant: "destructive" });
      }
    }
  };
  
  const getActionForOrder = (order: StoredOrder) => {
    if (order.status === 'Active' || order.status === 'PendingPayment') {
      return (
        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" onClick={() => updateOrderStatus(order.id, 'Preparing')}>
          <ChefHat className="mr-2 h-4 w-4" /> Mark as Preparing
        </Button>
      );
    }
    if (order.status === 'Preparing') {
      return (
        <Button className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={() => updateOrderStatus(order.id, 'Ready')}>
          <Check className="mr-2 h-4 w-4" /> Mark as Ready
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="h-screen flex flex-col bg-muted/30 p-4">
      <PageHeader title="Kitchen Display System" description="Live view of incoming and active orders.">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadKitchenOrders} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </PageHeader>
      <div className="text-center mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700">
        <AlertTriangle className="inline-block mr-2 h-5 w-5" />
        <strong>Note:</strong> This KDS prototype uses browser `localStorage`. For true multi-device functionality, a backend database and real-time updates would be required. Orders will only sync if managed in the same browser.
      </div>

      {isLoading && kitchenOrders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <RefreshCw className="mr-2 h-6 w-6 animate-spin" /> Loading orders...
        </div>
      ) : kitchenOrders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-xl">
          No active orders for the kitchen right now.
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kitchenOrders.map((order) => (
              <Card key={order.id} className="shadow-lg flex flex-col bg-card">
                <CardHeader className={`p-4 ${order.status === 'Active' || order.status === 'PendingPayment' ? 'bg-blue-500 text-white' : order.status === 'Preparing' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>
                  <CardTitle className="text-xl font-bold">Order: {order.id}</CardTitle>
                  <div className="flex justify-between text-sm">
                    <span>{order.table}</span>
                    <span>{order.time}</span>
                  </div>
                   <Badge 
                     variant={
                        order.status === 'Active' || order.status === 'PendingPayment' 
                        ? 'default' 
                        : order.status === 'Preparing' 
                        ? 'destructive' 
                        : order.status === 'Ready'
                        ? 'secondary'
                        : 'outline' // Fallback
                     } 
                     className={`mt-1 w-fit self-start ${
                        order.status === 'Active' || order.status === 'PendingPayment' ? 'bg-white text-blue-600 border-blue-600' :
                        order.status === 'Preparing' ? 'bg-white text-orange-600 border-orange-600' :
                        order.status === 'Ready' ? 'bg-white text-green-600 border-green-600' : ''
                     }`}
                    >
                    {order.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 flex-1">
                  {order.orderDetails && order.orderDetails.length > 0 ? (
                    <ul className="space-y-2">
                      {order.orderDetails.map((item, index) => (
                        <li key={`${item.id}-${index}`} className="flex justify-between border-b border-border pb-1">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-muted-foreground">x {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No items detailed for this order.</p>
                  )}
                </CardContent>
                {getActionForOrder(order) && (
                  <CardFooter className="p-4 border-t border-border">
                    {getActionForOrder(order)}
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
