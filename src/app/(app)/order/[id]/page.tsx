
'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { PlusCircle, MinusCircle, Trash2, ShoppingCart, DollarSign, CreditCard, AlertTriangle } from 'lucide-react';
// AI related imports removed
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface MenuItemVariant {
  size?: string;
  type?: string;
  price: number;
  idSuffix: string;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  description?: string;
  availability: boolean;
  'data-ai-hint'?: string;
  variants?: MenuItemVariant[];
}

export interface OrderItem extends MenuItem {
  quantity: number;
}

const USER_MENU_ITEMS_KEY = 'dineSwiftMenuItems';
const USER_SAVED_ORDERS_KEY = 'dineSwiftUserSavedOrders';

const initialMockMenuItemsForFallback: MenuItem[] = []; 

export default function OrderEntryPage() {
  const params = useParams();
  const router = useRouter();
  const pageParamId = params?.id as string | undefined;
  const { toast } = useToast();
  const { user: authUser } = useAuth();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  // AI related state removed

  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [selectedItemForVariant, setSelectedItemForVariant] = useState<MenuItem | null>(null);

  const pageTitle = pageParamId === 'new' ? 'New Order' : `Order for ${pageParamId?.toUpperCase()}`;
  const pageDescription = pageParamId === 'new' ? '' : `Manage order for Table/ID: ${pageParamId?.toUpperCase()}`;

  const loadMenuItemsFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedItemsRaw = localStorage.getItem(USER_MENU_ITEMS_KEY);
        if (savedItemsRaw) {
          const parsedItems = JSON.parse(savedItemsRaw);
          if (Array.isArray(parsedItems) && parsedItems.length > 0) {
            setMenuItems(parsedItems.map((item: any) => ({
              id: item.id || `ITEM_UNKNOWN_${Math.random().toString(36).substr(2, 9)}`,
              name: item.name || 'Unknown Item',
              category: item.category || 'Uncategorized',
              price: typeof item.price === 'number' ? item.price : 0,
              imageUrl: item.imageUrl || 'https://placehold.co/150x100.png',
              description: item.description || '',
              availability: typeof item.availability === 'boolean' ? item.availability : true,
              'data-ai-hint': item['data-ai-hint'] || `${(item.category || '').toLowerCase()} food`,
              variants: item.variants || undefined,
            })));
            return;
          }
        }
        setMenuItems(initialMockMenuItemsForFallback);
      } catch (e) {
        console.error("Failed to load menu items from localStorage for order page", e);
        setMenuItems(initialMockMenuItemsForFallback);
      }
    } else {
       setMenuItems(initialMockMenuItemsForFallback);
    }
  }, []);

  useEffect(() => {
    loadMenuItemsFromStorage();
  }, [loadMenuItemsFromStorage]);

  const handleItemClick = (item: MenuItem) => {
    if (!item.availability) {
      toast({
        title: "Item Unavailable",
        description: `${item.name} is currently not available.`,
        variant: "destructive"
      });
      return;
    }

    if (item.variants && item.variants.length > 0) {
      setSelectedItemForVariant(item);
      setIsVariantDialogOpen(true);
    } else {
      addItemToOrder(item);
    }
  };

  const handleVariantSelected = (baseItem: MenuItem, variant: MenuItemVariant) => {
    const orderItem: OrderItem = {
      ...baseItem,
      id: `${baseItem.id}${variant.idSuffix}`,
      name: `${baseItem.name} (${variant.size || variant.type})`,
      price: variant.price,
      quantity: 1,
      variants: undefined,
    };
    addItemToOrder(orderItem, true);
    setIsVariantDialogOpen(false);
    setSelectedItemForVariant(null);
  };

  const addItemToOrder = (itemToAdd: OrderItem | MenuItem, isVariant: boolean = false) => {
     setCurrentOrder((prevOrder) => {
      const existingItem = prevOrder.find((orderItem) => orderItem.id === itemToAdd.id);

      if (existingItem) {
        return prevOrder.map((orderItem) =>
          orderItem.id === itemToAdd.id ? { ...orderItem, quantity: orderItem.quantity + 1 } : orderItem
        );
      }
      const newItem = itemToAdd as OrderItem;
      return [...prevOrder, { ...newItem, quantity: newItem.quantity || 1 }];
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

  const allCategories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))].sort((a,b) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      return a.localeCompare(b);
  });

  const availableMenuItems = menuItems.filter(item => item.availability);

  const filteredMenuItems = availableMenuItems.filter((item) => {
    return selectedCategory === 'All' || item.category === selectedCategory;
  });

  const categoriesToDisplay = selectedCategory === 'All'
    ? Array.from(new Set(filteredMenuItems.map(item => item.category))).sort()
    : [selectedCategory];

  // AI suggestion related functions and useEffect removed

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
        availability: item.availability,
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
          // setAiSuggestions([]); // Removed as AI suggestions are removed
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
      // setAiSuggestions([]); // Removed
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
          const validatedOrderDetails = orderToEdit.orderDetails.map((detail: any) => ({
            ...detail,
            quantity: detail.quantity || 1,
          }));
          setCurrentOrder(validatedOrderDetails);
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

  const getDisplayPrice = (item: MenuItem) => {
    if (item.variants && item.variants.length > 0) {
      const prices = item.variants.map(v => v.price);
      const minPrice = Math.min(...prices);
      if (item.variants.length === 1) return `₹${minPrice.toFixed(2)}`;
      const maxPrice = Math.max(...prices);
      return `₹${minPrice.toFixed(2)} - ₹${maxPrice.toFixed(2)}`;
    }
    return `₹${item.price.toFixed(2)}`;
  };

  const renderVariantSelectionDialog = () => {
    if (!selectedItemForVariant || !selectedItemForVariant.variants) return null;

    const variants = selectedItemForVariant.variants;
    const useHorizontalLayout = variants.length > 0 && variants.length <= 3 && variants.every(v => v.size && v.size.length < 10);

    return (
      <Dialog open={isVariantDialogOpen} onOpenChange={(open) => {
          if (!open) {
              setIsVariantDialogOpen(false);
              setSelectedItemForVariant(null);
          }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {`Select ${variants.some(v => v.size) ? 'size' : 'option'} for ${selectedItemForVariant.name}`}
            </DialogTitle>
            <DialogDescription>
              Choose one of the available options below.
            </DialogDescription>
          </DialogHeader>

          {useHorizontalLayout ? (
            <div className="flex justify-center space-x-2 sm:space-x-3 py-4">
              {variants.map((variant) => (
                <Button
                  key={variant.idSuffix}
                  variant="default"
                  className="flex-1 flex-col h-auto p-2 sm:p-3 text-center"
                  onClick={() => handleVariantSelected(selectedItemForVariant, variant)}
                >
                  <span className="text-base sm:text-lg font-semibold">{variant.size ? variant.size.charAt(0).toUpperCase() : (variant.type ? variant.type.charAt(0).toUpperCase() : 'Opt')}</span>
                  <span className="text-xs sm:text-sm">₹{variant.price.toFixed(2)}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 py-4">
              {variants.map((variant) => (
                <Button
                  key={variant.idSuffix}
                  variant="outline"
                  className="w-full justify-between h-auto py-3 text-left"
                  onClick={() => handleVariantSelected(selectedItemForVariant, variant)}
                >
                  <span>{variant.size || variant.type}</span>
                  <span className="font-semibold">₹{variant.price.toFixed(2)}</span>
                </Button>
              ))}
            </div>
          )}
          <DialogFooter>
              <Button variant="ghost" onClick={() => { setIsVariantDialogOpen(false); setSelectedItemForVariant(null); }}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <PageHeader title={pageTitle} description={pageParamId === 'new' ? '' : pageDescription}>
         <Button variant="outline" size="sm" onClick={handleSaveOrder} disabled={currentOrder.length === 0}>
            <DollarSign className="mr-2 h-4 w-4" />
            Save Order
          </Button>
          <Button size="sm" onClick={handleProceedToPayment} disabled={currentOrder.length === 0}>
            <CreditCard className="mr-2 h-4 w-4" />
            Proceed to Payment
          </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-2 mb-4">
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

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        <Card className="lg:w-2/3 flex flex-col shadow-lg">
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-6 pt-4">
              {categoriesToDisplay.map(catName => {
                const itemsInCategory = filteredMenuItems.filter(item => item.category === catName);
                if (itemsInCategory.length === 0 && selectedCategory !== 'All' && availableMenuItems.length > 0) return null;

                return (
                  <div key={catName} className="mb-6">
                     { selectedCategory === 'All' && (
                        <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-border sticky top-0 bg-card py-2 z-10">{catName}</h3>
                     )}
                    {itemsInCategory.length === 0 && selectedCategory !== 'All' && (
                       <p className="text-muted-foreground col-span-full text-center py-4">No available items in this category.</p>
                    )}
                    {itemsInCategory.length === 0 && selectedCategory === 'All' && availableMenuItems.length > 0 && (
                      <p className="text-muted-foreground col-span-full text-center py-4">No items found in category "{catName}".</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {itemsInCategory.map((item) => (
                        <Card
                          key={item.id}
                          className="flex flex-col overflow-hidden hover:shadow-md transition-all duration-150 ease-in-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer hover:bg-muted/50"
                          onClick={() => handleItemClick(item)}
                        >
                          <div className="relative w-full h-32">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              layout="fill"
                              objectFit="cover"
                              data-ai-hint={item['data-ai-hint'] || `${item.category.toLowerCase()} food`}
                            />
                          </div>
                          <div className="p-2 flex flex-col flex-grow">
                            <div className="flex-grow mb-1">
                              <CardTitle className="text-base font-semibold mb-0.5">{item.name}</CardTitle>
                              <p className="text-sm font-bold text-primary">{getDisplayPrice(item)}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
              {filteredMenuItems.length === 0 && selectedCategory !== 'All' && availableMenuItems.length > 0 && (
                <p className="text-center text-muted-foreground py-8">No available menu items match your criteria.</p>
              )}
               {availableMenuItems.length === 0 && (
                 <p className="text-center text-muted-foreground py-8">No items available in the menu. Please add items via Menu Management.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="lg:w-1/3 flex flex-col gap-6 overflow-hidden">
          <Card className="flex-1 flex flex-col shadow-lg"> {/* Removed max-h to allow full height */}
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
                          <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => removeItemFromOrder(item.id)} className="h-7 w-7">
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <span className="w-4 text-center">{item.quantity}</span>
                          <Button variant="ghost" size="icon" onClick={() => addItemToOrder(item, true)} className="h-7 w-7">
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
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </CardContent>
              </>
            )}
          </Card>>
         {/* AI Suggestions Card removed */}
        </div>
      </div>
      {renderVariantSelectionDialog()}
    </div>
  );
}

