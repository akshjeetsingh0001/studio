
'use client';

import type React from 'react';
import { useState, useEffect, useCallback }
from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlusCircle, MinusCircle, Trash2, ShoppingCart, Zap, Lightbulb, DollarSign, CreditCard, AlertTriangle, FolderOpen } from 'lucide-react';
import { getUpsellSuggestions, type GetUpsellSuggestionsInput } from '@/ai/flows/upsell-suggestions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Fallback menu items if localStorage is empty
const initialMockMenuItemsForOrderPage = [
  { id: 'ITEM001', name: 'Classic Burger', category: 'Main Course', price: 12.99, imageUrl: 'https://placehold.co/150x100.png', description: 'A juicy beef patty with lettuce, tomato, and our special sauce.', availability: true, 'data-ai-hint': 'burger food' },
  { id: 'ITEM002', name: 'Caesar Salad', category: 'Appetizers', price: 8.50, imageUrl: 'https://placehold.co/150x100.png', description: 'Crisp romaine lettuce, croutons, Parmesan cheese, and Caesar dressing.', availability: true, 'data-ai-hint': 'salad food' },
  { id: 'ITEM003', name: 'Margherita Pizza', category: 'Main Course', price: 15.00, imageUrl: 'https://placehold.co/150x100.png', description: 'Classic pizza with tomato, mozzarella, and basil.', availability: true, 'data-ai-hint': 'pizza food' },
  { id: 'ITEM004', name: 'French Fries', category: 'Sides', price: 4.50, imageUrl: 'https://placehold.co/150x100.png', description: 'Crispy golden french fries.', availability: true, 'data-ai-hint': 'fries side' },
  { id: 'ITEM005', name: 'Coca-Cola', category: 'Drinks', price: 2.50, imageUrl: 'https://placehold.co/150x100.png', description: 'Refreshing Coca-Cola.', availability: true, 'data-ai-hint': 'soda drink' },
  { id: 'ITEM006', name: 'Chocolate Lava Cake', category: 'Desserts', price: 7.00, imageUrl: 'https://placehold.co/150x100.png', description: 'Warm chocolate cake with a gooey molten center.', availability: false, 'data-ai-hint': 'cake dessert' }, // Example of unavailable item
  { id: 'ITEM007', name: 'Chicken Wings', category: 'Appetizers', price: 10.50, imageUrl: 'https://placehold.co/150x100.png', description: 'Spicy and crispy chicken wings.', availability: true, 'data-ai-hint': 'wings appetizer' },
  { id: 'ITEM008', name: 'Iced Tea', category: 'Drinks', price: 2.75, imageUrl: 'https://placehold.co/150x100.png', description: 'Freshly brewed iced tea.', availability: true, 'data-ai-hint': 'tea drink' },
];

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  description: string;
  availability: boolean;
  'data-ai-hint'?: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
}

const USER_MENU_ITEMS_KEY = 'dineSwiftMenuItems';
const USER_SAVED_ORDERS_KEY = 'dineSwiftUserSavedOrders';

export default function OrderEntryPage() {
  const params = useParams();
  const router = useRouter();
  const pageParamId = params?.id as string | undefined;
  const { toast } = useToast();
  const { user: authUser } = useAuth();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const pageTitle = pageParamId === 'new' ? 'New Order' : `Order for ${pageParamId?.toUpperCase()}`;
  const pageDescription = pageParamId === 'new' ? 'Start a new customer order.' : `Manage order for Table/ID: ${pageParamId?.toUpperCase()}`;

  const loadMenuItemsFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedItemsRaw = localStorage.getItem(USER_MENU_ITEMS_KEY);
        if (savedItemsRaw) {
          const parsedItems = JSON.parse(savedItemsRaw);
          if (Array.isArray(parsedItems) && parsedItems.length > 0) {
            setMenuItems(parsedItems.map((item: any) => ({ // Ensure structure consistency
              id: item.id || `ITEM_UNKNOWN_${Math.random().toString(36).substr(2, 9)}`,
              name: item.name || 'Unknown Item',
              category: item.category || 'Uncategorized',
              price: typeof item.price === 'number' ? item.price : 0,
              imageUrl: item.imageUrl || 'https://placehold.co/150x100.png',
              description: item.description || '',
              availability: typeof item.availability === 'boolean' ? item.availability : true,
              'data-ai-hint': item['data-ai-hint'] || `${(item.category || '').toLowerCase()} food`
            })));
            return;
          }
        }
      } catch (e) {
        console.error("Failed to load menu items from localStorage for order page", e);
      }
    }
    // Fallback if localStorage is empty or fails
    setMenuItems(initialMockMenuItemsForOrderPage);
  }, []);

  useEffect(() => {
    loadMenuItemsFromStorage();
  }, [loadMenuItemsFromStorage]);

  const addItemToOrder = (item: MenuItem) => {
    setCurrentOrder((prevOrder) => {
      const existingItem = prevOrder.find((orderItem) => orderItem.id === item.id);
      if (existingItem) {
        return prevOrder.map((orderItem) =>
          orderItem.id === item.id ? { ...orderItem, quantity: orderItem.quantity + 1 } : orderItem
        );
      }
      return [...prevOrder, { ...item, quantity: 1 }];
    });
  };

  const removeItemFromOrder = (itemId: string) => {
    setCurrentOrder((prevOrder) => {
      const existingItem = prevOrder.find((orderItem) => orderItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevOrder.map((orderItem) =>
          orderItem.id === itemId ? { ...orderItem, quantity: orderItem.quantity - 1 } : orderItem
        );
      }
      return prevOrder.filter((orderItem) => orderItem.id !== itemId);
    });
  };

  const completelyRemoveItem = (itemId: string) => {
    setCurrentOrder((prevOrder) => prevOrder.filter((orderItem) => orderItem.id !== itemId));
  };

  const calculateTotal = () => {
    return currentOrder.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const allCategories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const availableMenuItems = menuItems.filter(item => item.availability);

  const filteredMenuItems = availableMenuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesCategory;
  });

  const categoriesToDisplay = selectedCategory === 'All'
    ? Array.from(new Set(filteredMenuItems.map(item => item.category))).sort()
    : [selectedCategory];


  const fetchAiSuggestions = useCallback(async () => {
    if (currentOrder.length === 0) {
      setAiSuggestions([]);
      return;
    }
    setIsFetchingSuggestions(true);
    try {
      const orderDescription = currentOrder
        .map(item => `${item.quantity}x ${item.name}`)
        .join(', ');
      
      const input: GetUpsellSuggestionsInput = { orderDescription };
      const result = await getUpsellSuggestions(input);
      setAiSuggestions(result.suggestions);
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error);
      toast({
        title: 'AI Suggestion Error',
        description: 'Could not fetch upsell suggestions. API key might be missing or invalid.',
        variant: 'destructive',
      });
      setAiSuggestions([]);
    } finally {
      setIsFetchingSuggestions(false);
    }
  }, [currentOrder, toast]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (currentOrder.length > 0) {
        fetchAiSuggestions();
      } else {
        setAiSuggestions([]);
      }
    }, 500); 

    return () => clearTimeout(debounceTimer);
  }, [currentOrder, fetchAiSuggestions]);

  const handleSaveOrder = () => {
    if (!pageParamId) return; 

    if (currentOrder.length === 0) {
      toast({
        title: "Empty Order",
        description: "Cannot save an empty order. Please add items.",
        variant: "destructive",
        icon: <AlertTriangle className="h-4 w-4" />,
      });
      return;
    }

    const newOrderId = pageParamId === 'new' || !pageParamId.startsWith('ORD') 
      ? `ORD-${Date.now().toString().slice(-6)}`
      : pageParamId.toUpperCase();
    const orderTableId = pageParamId === 'new' ? 'Counter' : (pageParamId.startsWith('ORD') ? 'Takeout' : pageParamId.toUpperCase());

    const newOrderForStorage = {
      id: newOrderId,
      table: orderTableId,
      items: currentOrder.reduce((sum, item) => sum + item.quantity, 0),
      total: calculateTotal(),
      status: 'Active',
      server: authUser?.username || 'Staff',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      orderDetails: currentOrder.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl,
        description: item.description,
        availability: item.availability, // ensure availability is saved
        'data-ai-hint': item['data-ai-hint'],
      })),
    };

    if (typeof window !== 'undefined') {
      try {
        const existingSavedOrdersRaw = localStorage.getItem(USER_SAVED_ORDERS_KEY);
        let existingSavedOrders = existingSavedOrdersRaw ? JSON.parse(existingSavedOrdersRaw) : [];
        
        const existingOrderIndex = existingSavedOrders.findIndex((order: any) => order.id === newOrderId);
        if (existingOrderIndex > -1) {
          existingSavedOrders[existingOrderIndex] = newOrderForStorage; 
        } else {
          existingSavedOrders.push(newOrderForStorage); 
        }
        
        localStorage.setItem(USER_SAVED_ORDERS_KEY, JSON.stringify(existingSavedOrders));
        
        toast({
          title: "Order Saved!",
          description: `Order ${newOrderId} for ${orderTableId} has been saved.`,
        });

        if (pageParamId === 'new') { 
          setCurrentOrder([]);
          setAiSuggestions([]);
        }
        router.push('/orders'); 

      } catch (e) {
        console.error("Failed to save order to localStorage", e);
        toast({
          title: "Storage Error",
          description: "Could not save order due to a storage issue.",
          variant: "destructive",
        });
      }
    }
  };

  const handleProceedToPayment = () => {
    if (!pageParamId) return;

    if (currentOrder.length === 0) {
      toast({
        title: "Empty Order",
        description: "No items in the order to proceed to payment.",
        variant: "destructive",
        icon: <AlertTriangle className="h-4 w-4" />,
      });
      return;
    }
    
    const paymentOrderId = pageParamId === 'new' || !pageParamId.startsWith('ORD') 
      ? `ORD-PAY-${Date.now().toString().slice(-6)}` 
      : pageParamId.toUpperCase();
    const orderTableId = pageParamId === 'new' ? 'Counter' : (pageParamId.startsWith('ORD') ? 'Takeout' : pageParamId.toUpperCase());
    
    const paymentOrderData = {
      id: paymentOrderId,
      table: orderTableId,
      items: currentOrder.reduce((sum, item) => sum + item.quantity, 0),
      total: calculateTotal(),
      status: 'PendingPayment',
      server: authUser?.username || 'Staff',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      orderDetails: currentOrder.map(item => ({ 
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl,
        description: item.description,
        availability: item.availability,
        'data-ai-hint': item['data-ai-hint'],
      })),
    };
    
    if (typeof window !== 'undefined') {
      try {
        const existingSavedOrdersRaw = localStorage.getItem(USER_SAVED_ORDERS_KEY);
        let existingSavedOrders = existingSavedOrdersRaw ? JSON.parse(existingSavedOrdersRaw) : [];

        const existingOrderIndex = existingSavedOrders.findIndex((order: any) => order.id === paymentOrderId);
        if (existingOrderIndex > -1) {
          existingSavedOrders[existingOrderIndex] = paymentOrderData;
        } else {
          existingSavedOrders.push(paymentOrderData);
        }
        localStorage.setItem(USER_SAVED_ORDERS_KEY, JSON.stringify(existingSavedOrders));
      } catch (e) {
        console.error("Failed to save order for payment to localStorage", e);
      }
    }

    console.log("Proceeding to Payment (Simulated):", paymentOrderData);
    toast({
      title: "Proceeding to Payment",
      description: `Order ${paymentOrderData.id} for ${orderTableId} is being processed for payment.`,
    });

    if (pageParamId === 'new') {
      setCurrentOrder([]);
      setAiSuggestions([]);
    }
    router.push('/orders');
  };

  useEffect(() => {
    if (pageParamId && pageParamId !== 'new' && typeof window !== 'undefined') {
      const savedOrdersRaw = localStorage.getItem(USER_SAVED_ORDERS_KEY);
      if (savedOrdersRaw) {
        const savedOrders = JSON.parse(savedOrdersRaw);
        const orderToEdit = savedOrders.find((order: any) => order.id.toLowerCase() === pageParamId.toLowerCase() || order.table.toLowerCase() === pageParamId.toLowerCase());
        if (orderToEdit && orderToEdit.orderDetails) {
          setCurrentOrder(orderToEdit.orderDetails);
        } else if (orderToEdit) {
           console.warn(`Order ${pageParamId} found but no detailed items. Starting fresh for this ID.`);
        }
      }
    }
  }, [pageParamId]);


  if (!pageParamId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]"> 
      <PageHeader title={pageTitle} description={pageDescription}>
         <Button variant="outline" size="sm" onClick={handleSaveOrder} disabled={currentOrder.length === 0}>
            <DollarSign className="mr-2 h-4 w-4" />
            Save Order
          </Button>
          <Button size="sm" onClick={handleProceedToPayment} disabled={currentOrder.length === 0}>
            <CreditCard className="mr-2 h-4 w-4" />
            Proceed to Payment
          </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        <Card className="lg:col-span-2 flex flex-col shadow-lg">
          <CardHeader>
            <CardTitle>Menu</CardTitle>
            <div className="flex flex-wrap gap-2 mt-2 mb-4">
              {allCategories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs px-3 py-1 h-auto"
                >
                  {category}
                </Button>
              ))}
            </div>
            {/* Search Input Removed */}
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-6 pt-0">
              {categoriesToDisplay.map(category => {
                const itemsInCategory = filteredMenuItems.filter(item => item.category === category);
                if (itemsInCategory.length === 0 && selectedCategory !== 'All') return null; 

                return (
                  <div key={category} className="mb-6">
                    <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-border sticky top-0 bg-card py-2 z-10">{category}</h3>
                    {itemsInCategory.length === 0 && selectedCategory !== 'All' && (
                       <p className="text-muted-foreground col-span-full">No available items in this category.</p>
                    )}
                     {itemsInCategory.length === 0 && selectedCategory === 'All' && availableMenuItems.length > 0 && (
                       <p className="text-muted-foreground col-span-full">No items in category &quot;{category}&quot;. Check other categories or &quot;All&quot;.</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                      {itemsInCategory.map((item) => (
                        <Card
                          key={item.id}
                          className="flex flex-col overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => addItemToOrder(item)}
                        >
                          <div className="relative w-full h-40">
                            <Image 
                              src={item.imageUrl} 
                              alt={item.name} 
                              layout="fill" 
                              objectFit="cover" 
                              data-ai-hint={item['data-ai-hint'] || `${item.category.toLowerCase()} food`} 
                            />
                          </div>
                          <div className="p-3 flex flex-col flex-grow">
                            <div className="flex-grow mb-1">
                              <CardTitle className="text-base font-semibold mb-0.5">{item.name}</CardTitle>
                              <p className="text-sm font-bold text-primary">${item.price.toFixed(2)}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
              {filteredMenuItems.length === 0 && selectedCategory !== 'All' && (
                <p className="text-center text-muted-foreground py-8">No available menu items match your criteria.</p>
              )}
               {availableMenuItems.length === 0 && selectedCategory === 'All' && (
                 <p className="text-center text-muted-foreground py-8">No items available in the menu. Please add items via Menu Management.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6 overflow-hidden">
          <Card className="flex-1 flex flex-col shadow-lg max-h-[65%]"> 
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5 text-primary" />
                Current Order
              </CardTitle>
              <CardDescription>Items added for this order.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-6 pt-0">
                {currentOrder.length === 0 ? (
                  <p className="text-muted-foreground text-center py-10">No items added yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {currentOrder.map((item) => (
                      <li key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => removeItemFromOrder(item.id)} className="h-7 w-7">
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <span className="w-4 text-center">{item.quantity}</span>
                          <Button variant="ghost" size="icon" onClick={() => addItemToOrder(item)} className="h-7 w-7">
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                           <Button variant="ghost" size="icon" onClick={() => completelyRemoveItem(item.id)} className="h-7 w-7 text-destructive hover:text-destructive/80">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </CardContent>
            {currentOrder.length > 0 && (
              <>
                <Separator />
                <CardContent className="p-4">
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </CardContent>
              </>
            )}
          </Card>

          <Card className="flex-1 flex flex-col shadow-lg min-h-[30%]"> 
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-accent" />
                 AI Upsell Suggestions
              </CardTitle>
              <CardDescription>Boost your sales with smart recommendations.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-6 pt-0">
              {isFetchingSuggestions && <p className="text-muted-foreground text-center">Loading suggestions...</p>}
              {!isFetchingSuggestions && aiSuggestions.length === 0 && currentOrder.length > 0 && (
                <p className="text-muted-foreground text-center">No specific suggestions right now. Try adding more items!</p>
              )}
              {!isFetchingSuggestions && aiSuggestions.length === 0 && currentOrder.length === 0 && (
                 <p className="text-muted-foreground text-center">Add items to your order to see suggestions.</p>
              )}
              {!isFetchingSuggestions && aiSuggestions.length > 0 && (
                <ul className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <li key={index}>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left h-auto py-2 hover:border-accent hover:text-accent"
                        onClick={() => {
                          const suggestedItem = menuItems.find(mi => mi.availability && suggestion.toLowerCase().includes(mi.name.toLowerCase()));
                          if (suggestedItem) {
                            addItemToOrder(suggestedItem);
                            toast({ title: "Added to order!", description: `${suggestedItem.name} was added from AI suggestion.`});
                          } else {
                             toast({ title: "Suggestion", description: `Consider: ${suggestion}`});
                          }
                        }}
                      >
                        <Zap className="mr-2 h-4 w-4 text-accent/80" /> {suggestion}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    