
'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlusCircle, MinusCircle, Trash2, ShoppingCart, Zap, Lightbulb, DollarSign, CreditCard, AlertTriangle } from 'lucide-react';
import { getUpsellSuggestions, type GetUpsellSuggestionsInput } from '@/ai/flows/upsell-suggestions';
import { useToast } from '@/hooks/use-toast';

// Mock menu items (can be fetched from a service/API later)
const mockMenuItems = [
  { id: 'ITEM001', name: 'Classic Burger', category: 'Main Course', price: 12.99, imageUrl: 'https://placehold.co/150x100.png', description: 'A juicy beef patty with lettuce, tomato, and our special sauce.' },
  { id: 'ITEM002', name: 'Caesar Salad', category: 'Appetizers', price: 8.50, imageUrl: 'https://placehold.co/150x100.png', description: 'Crisp romaine lettuce, croutons, Parmesan cheese, and Caesar dressing.' },
  { id: 'ITEM003', name: 'Margherita Pizza', category: 'Main Course', price: 15.00, imageUrl: 'https://placehold.co/150x100.png', description: 'Classic pizza with tomato, mozzarella, and basil.' },
  { id: 'ITEM004', name: 'French Fries', category: 'Sides', price: 4.50, imageUrl: 'https://placehold.co/150x100.png', description: 'Crispy golden french fries.' },
  { id: 'ITEM005', name: 'Coca-Cola', category: 'Drinks', price: 2.50, imageUrl: 'https://placehold.co/150x100.png', description: 'Refreshing Coca-Cola.' },
  { id: 'ITEM006', name: 'Chocolate Lava Cake', category: 'Desserts', price: 7.00, imageUrl: 'https://placehold.co/150x100.png', description: 'Warm chocolate cake with a gooey molten center.' },
  { id: 'ITEM007', name: 'Chicken Wings', category: 'Appetizers', price: 10.50, imageUrl: 'https://placehold.co/150x100.png', description: 'Spicy and crispy chicken wings.' },
  { id: 'ITEM008', name: 'Iced Tea', category: 'Drinks', price: 2.75, imageUrl: 'https://placehold.co/150x100.png', description: 'Freshly brewed iced tea.' },
];

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  description: string;
}

interface OrderItem extends MenuItem {
  quantity: number;
}

export default function OrderEntryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const { toast } = useToast();

  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const pageTitle = id === 'new' ? 'New Order' : `Order for ${id?.toUpperCase()}`;
  const pageDescription = id === 'new' ? 'Start a new customer order.' : `Manage order for Table/ID: ${id?.toUpperCase()}`;

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

  const filteredMenuItems = mockMenuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const menuCategories = Array.from(new Set(mockMenuItems.map(item => item.category)));

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
    }, 500); // Debounce AI call

    return () => clearTimeout(debounceTimer);
  }, [currentOrder, fetchAiSuggestions]);

  const handleSaveOrder = () => {
    if (currentOrder.length === 0) {
      toast({
        title: "Empty Order",
        description: "Cannot save an empty order. Please add items.",
        variant: "destructive",
        icon: <AlertTriangle className="h-4 w-4" />,
      });
      return;
    }

    const orderIdToSave = id === 'new' ? `MOCKORD-${Date.now().toString().slice(-6)}` : id;
    const orderData = {
      orderId: orderIdToSave,
      items: currentOrder,
      total: calculateTotal(),
      timestamp: new Date().toISOString(),
      status: id === 'new' ? 'NewUnsaved' : 'UpdatedUnsaved', // Simulated status
    };

    console.log("Order Saved (Simulated):", orderData);
    toast({
      title: "Order Saved!",
      description: `Order ${orderIdToSave} has been saved. (Simulated - check console)`,
    });

    if (id === 'new') {
      setCurrentOrder([]);
      setAiSuggestions([]);
      // router.push('/orders'); // Optional: navigate after saving a new order
    }
  };

  const handleProceedToPayment = () => {
    if (currentOrder.length === 0) {
      toast({
        title: "Empty Order",
        description: "No items in the order to proceed to payment.",
        variant: "destructive",
        icon: <AlertTriangle className="h-4 w-4" />,
      });
      return;
    }
    
    const orderIdToPay = id === 'new' ? `MOCKORD-${Date.now().toString().slice(-6)}` : id;
     const orderData = {
      orderId: orderIdToPay,
      items: currentOrder,
      total: calculateTotal(),
      timestamp: new Date().toISOString(),
      status: 'PendingPayment', // Simulated status
    };

    console.log("Proceeding to Payment (Simulated):", orderData);
    toast({
      title: "Proceeding to Payment",
      description: `Taking order ${orderIdToPay} to payment. (Simulated - check console)`,
    });

    // In a real app, you'd navigate to a payment screen.
    // For now, if it's a new order, we can clear it.
    if (id === 'new') {
      setCurrentOrder([]);
      setAiSuggestions([]);
      // router.push(`/payment/${orderIdToPay}`); // Optional: navigate to a payment page
    }
  };


  if (!id) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]"> {/* Adjust height to fit within layout */}
      <PageHeader title={pageTitle} description={pageDescription}>
         <Button variant="outline" size="sm" onClick={handleSaveOrder} disabled={currentOrder.length === 0 && id === 'new'}>
            <DollarSign className="mr-2 h-4 w-4" />
            Save Order
          </Button>
          <Button size="sm" onClick={handleProceedToPayment} disabled={currentOrder.length === 0}>
            <CreditCard className="mr-2 h-4 w-4" />
            Proceed to Payment
          </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Column 1: Menu Items */}
        <Card className="lg:col-span-2 flex flex-col shadow-lg">
          <CardHeader>
            <CardTitle>Menu</CardTitle>
            <Input
              type="search"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-6 pt-0">
              {menuCategories.map(category => {
                const itemsInCategory = filteredMenuItems.filter(item => item.category === category);
                if (itemsInCategory.length === 0 && searchTerm) return null; 

                return (
                  <div key={category} className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 sticky top-0 bg-card py-2 z-10">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {itemsInCategory.map((item) => (
                        <Card key={item.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                           <div className="relative w-full h-32">
                            <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" data-ai-hint={`${item.category.toLowerCase()} food`} />
                          </div>
                          <CardHeader className="pb-2 px-4 pt-3">
                            <CardTitle className="text-base">{item.name}</CardTitle>
                            <CardDescription className="text-xs truncate">{item.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex-grow px-4 pb-3">
                            <p className="text-sm font-semibold text-primary">${item.price.toFixed(2)}</p>
                          </CardContent>
                          <Button onClick={() => addItemToOrder(item)} variant="outline" className="m-2 mt-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add to Order
                          </Button>
                        </Card>
                      ))}
                      {itemsInCategory.length === 0 && !searchTerm && (
                        <p className="text-muted-foreground col-span-full">No items in this category.</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredMenuItems.length === 0 && searchTerm && (
                <p className="text-center text-muted-foreground py-8">No menu items match your search.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Column 2: Current Order & AI Suggestions */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <Card className="flex-1 flex flex-col shadow-lg max-h-[60%]"> 
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

          <Card className="flex-1 flex flex-col shadow-lg min-h-[35%]"> 
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
                          const suggestedItem = mockMenuItems.find(mi => suggestion.toLowerCase().includes(mi.name.toLowerCase()));
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

