
'use client';

import type React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Check, ChefHat, CheckCheck, AlertTriangle, LogOut, Timer, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { OrderItem } from '@/app/(app)/order/[id]/page';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const USER_SAVED_ORDERS_KEY = 'dineSwiftUserSavedOrders';
const KDS_REFRESH_INTERVAL = 5000; 
const KDS_TIMER_UI_REFRESH_INTERVAL = 1000; 
const ORDER_LATE_THRESHOLD_MS = 15 * 60 * 1000; 

interface StoredOrder {
  id: string;
  table: string;
  total: number;
  status: string;
  time: string; 
  orderPlacedTimestamp?: number; 
  orderDetails?: OrderItem[];
}

const relevantStatuses = ['Active', 'PendingPayment', 'Preparing', 'Ready', 'Paid'];

const parseOrderTimeForToday = (timeStr: string): Date | null => {
  if (!timeStr) return null;
  const [time, modifier] = timeStr.split(' ');
  if (!time || !modifier) return null;
  let [hours, minutes] = time.split(':').map(Number);

  if (isNaN(hours) || isNaN(minutes)) return null;

  if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
  if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0; 

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};


export default function KitchenDisplayPage() {
  const [kitchenOrders, setKitchenOrders] = useState<StoredOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timerUiInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, KDS_TIMER_UI_REFRESH_INTERVAL);
    return () => clearInterval(timerUiInterval);
  }, []);

  const loadRawOrdersFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedOrdersRaw = localStorage.getItem(USER_SAVED_ORDERS_KEY);
        const allOrders: StoredOrder[] = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : [];
        setKitchenOrders(allOrders);
      } catch (e) {
        console.error("Failed to load kitchen orders from localStorage", e);
        toast({ title: "Error Loading Orders", description: "Could not retrieve orders for the kitchen display.", variant: "destructive" });
        setKitchenOrders([]);
      }
    }
  }, [toast]); // toast is stable

  useEffect(() => {
    setIsLoading(true);
    loadRawOrdersFromStorage();
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadRawOrdersFromStorage]); // Runs once after mount because loadRawOrdersFromStorage is stable

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadRawOrdersFromStorage();
    }, KDS_REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadRawOrdersFromStorage]); // Runs once after mount

  const sortedAndFilteredKitchenOrders = useMemo(() => {
    let filtered = kitchenOrders.filter(order => relevantStatuses.includes(order.status));
    
    const statusOrderPriority = { 
      'Active': 1, 
      'PendingPayment': 1, 
      'Preparing': 2, 
      'Ready': 3,
      'Paid': 4 
    };

    return filtered.sort((a, b) => {
        const timeA = a.orderPlacedTimestamp || parseOrderTimeForToday(a.time)?.getTime() || Date.now();
        const timeB = b.orderPlacedTimestamp || parseOrderTimeForToday(b.time)?.getTime() || Date.now();

        const priorityA = statusOrderPriority[a.status as keyof typeof statusOrderPriority] ?? 99;
        const priorityB = statusOrderPriority[b.status as keyof typeof statusOrderPriority] ?? 99;
        
        const isALate = (a.status === 'Active' || a.status === 'PendingPayment' || a.status === 'Preparing') &&
                         timeA && (currentTime - timeA > ORDER_LATE_THRESHOLD_MS);
        const isBLate = (b.status === 'Active' || b.status === 'PendingPayment' || b.status === 'Preparing') &&
                         timeB && (currentTime - timeB > ORDER_LATE_THRESHOLD_MS);

        if (isALate && !isBLate) return -1; 
        if (!isALate && isBLate) return 1;

        if ((a.status === 'Active' || a.status === 'PendingPayment') && (b.status === 'Active' || b.status === 'PendingPayment')) {
             return timeA - timeB; 
        }
        if (priorityA !== priorityB) { 
            return priorityA - priorityB; 
        }
        if(timeA !== timeB) {
            return timeA - timeB; 
        }
        return a.id.localeCompare(b.id); // Stable sort tie-breaker
    });
  }, [kitchenOrders, currentTime]);

  const updateOrderStatus = useCallback((orderId: string, newStatus: 'Preparing' | 'Ready') => {
    if (typeof window !== 'undefined') {
      try {
        const savedOrdersRaw = localStorage.getItem(USER_SAVED_ORDERS_KEY);
        let allOrders: StoredOrder[] = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : [];
        const orderIndex = allOrders.findIndex(o => o.id === orderId);

        if (orderIndex > -1) {
          allOrders[orderIndex].status = newStatus;
          allOrders[orderIndex].time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); 
          localStorage.setItem(USER_SAVED_ORDERS_KEY, JSON.stringify(allOrders));
          loadRawOrdersFromStorage(); 
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
  }, [toast, loadRawOrdersFromStorage]);
  
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
        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => updateOrderStatus(order.id, 'Ready')}>
          <Check className="mr-2 h-4 w-4" /> Mark as Ready
        </Button>
      );
    }
    return null; 
  };

  const formatElapsedTime = (timestamp?: number): string => {
    if (!timestamp) return 'N/A';
    const elapsedMs = currentTime - timestamp;
    if (elapsedMs < 0) return '00:00'; 
    
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="h-screen flex flex-col bg-muted/30 p-4">
      <PageHeader title="Kitchen Display System" description="Live view of incoming and active orders.">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { setIsLoading(true); loadRawOrdersFromStorage(); setIsLoading(false); }} disabled={isLoading && kitchenOrders.length > 0}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading && kitchenOrders.length === 0 ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </PageHeader>
      <div className="mb-4 p-3 text-sm bg-yellow-100/80 border-l-4 border-yellow-500 text-yellow-800 rounded-md shadow-sm">
          <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2.5 mt-0.5 text-yellow-600 flex-shrink-0" />
              <div>
                  <strong className="font-semibold">Prototype Note:</strong> This KDS uses browser `localStorage`. For real-time updates across different devices, a backend database (like Firebase or Supabase) with real-time capabilities is required. Data is local to this browser session.
              </div>
          </div>
      </div>

      {isLoading && sortedAndFilteredKitchenOrders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <RefreshCw className="mr-2 h-6 w-6 animate-spin" /> Loading orders...
        </div>
      ) : sortedAndFilteredKitchenOrders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-xl">
          No active orders for the kitchen right now.
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedAndFilteredKitchenOrders.map((order) => {
              const orderTimestamp = order.orderPlacedTimestamp || parseOrderTimeForToday(order.time)?.getTime();
              const isLate = (order.status === 'Active' || order.status === 'PendingPayment' || order.status === 'Preparing') &&
                             orderTimestamp && (currentTime - orderTimestamp > ORDER_LATE_THRESHOLD_MS);
              return (
                <Card key={order.id} className={cn("shadow-lg flex flex-col bg-card", isLate && "border-2 border-red-500 shadow-red-500/50")}>
                  <CardHeader className={cn(`p-4 text-white`, 
                      isLate ? 'bg-red-600' :
                      order.status === 'Active' || order.status === 'PendingPayment' ? 'bg-primary' : 
                      order.status === 'Preparing' ? 'bg-orange-500' : 
                      order.status === 'Ready' ? 'bg-accent' : 
                      order.status === 'Paid' ? 'bg-indigo-500' :
                      'bg-gray-400'
                    )}>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-2xl font-bold">Order: {order.id}</CardTitle>
                        {isLate && <Badge variant="destructive" className="bg-white text-red-600 border-red-600 animate-pulse"><AlertCircle className="mr-1 h-4 w-4" />LATE</Badge>}
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span>{order.table}</span>
                      <div className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        <span>{formatElapsedTime(orderTimestamp)}</span>
                      </div>
                    </div>
                     <Badge 
                       variant="secondary" 
                       className={cn(`mt-1 w-fit self-start bg-white border`, 
                          isLate ? 'text-red-700 border-red-700' :
                          order.status === 'Active' || order.status === 'PendingPayment' ? 'text-primary border-primary' :
                          order.status === 'Preparing' ? 'text-orange-600 border-orange-600' :
                          order.status === 'Ready' ? 'text-accent border-accent' :
                          order.status === 'Paid' ? 'text-indigo-600 border-indigo-600' :
                          'text-gray-600 border-gray-600'
                       )}
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
                            <span className="text-muted-foreground font-semibold">x {item.quantity}</span>
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
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

    