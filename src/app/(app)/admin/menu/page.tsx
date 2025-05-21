
'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, PlusCircle, Search, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  availability: boolean;
  imageUrl: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  itemCount: number;
}

interface ModifierGroup {
  id: string;
  name: string;
  items: string[];
}

const USER_MENU_ITEMS_KEY = 'dineSwiftMenuItems';

// Initial Mock data for menu items - removed to rely on localStorage or start empty.
const initialMockMenuItems: MenuItem[] = []; 
const initialMockModifiers: ModifierGroup[] = [];


export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modifiers, setModifiers] = useState<ModifierGroup[]>(initialMockModifiers);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const updateLocalStorage = (updatedItems: MenuItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_MENU_ITEMS_KEY, JSON.stringify(updatedItems));
    }
  };
  
  const loadMenuItems = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedItemsRaw = localStorage.getItem(USER_MENU_ITEMS_KEY);
        if (savedItemsRaw) {
          const parsedItems = JSON.parse(savedItemsRaw);
          // Ensure parsedItems is an array before setting
          setMenuItems(Array.isArray(parsedItems) ? parsedItems : []);
        } else {
          // If nothing in localStorage, start with an empty array
          setMenuItems([]);
          updateLocalStorage([]); // Save empty array to localStorage
        }
      } catch (e) {
        console.error("Failed to load menu items from localStorage", e);
        setMenuItems([]); // Fallback to empty array
      }
    } else {
        setMenuItems([]); // Fallback for SSR or non-browser
    }
  }, []);

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  useEffect(() => {
    // Derive categories from menuItems
    const categoryMap = new Map<string, number>();
    menuItems.forEach(item => {
      categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + 1);
    });
    const derivedCategories: Category[] = Array.from(categoryMap.entries()).map(([name, count], index) => ({
      id: `CAT${index + 1}`,
      name,
      itemCount: count,
    }));
    setCategories(derivedCategories);
  }, [menuItems]);


  const handleToggleAvailability = (itemId: string) => {
    let changedItemName = '';
    let newAvailability = false;
    
    setMenuItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === itemId) {
          newAvailability = !item.availability;
          changedItemName = item.name;
          return { ...item, availability: newAvailability };
        }
        return item;
      });
      updateLocalStorage(updatedItems);
      return updatedItems;
    });
    
    if (changedItemName) {
      toast({
        title: `Availability Updated`,
        description: `${changedItemName} is now ${newAvailability ? 'available' : 'unavailable'}.`,
        icon: newAvailability ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />,
      });
    }
  };

  const handleDeleteItem = (itemId: string) => {
    let deletedItemName = '';
    setMenuItems(prevItems => {
        const itemToDelete = prevItems.find(item => item.id === itemId);
        if (itemToDelete) {
            deletedItemName = itemToDelete.name;
        }
        const updatedItems = prevItems.filter(item => item.id !== itemId);
        updateLocalStorage(updatedItems);
        return updatedItems;
    });

    if (deletedItemName) {
        toast({
            title: "Item Deleted",
            description: `${deletedItemName} has been removed from the menu.`,
            variant: "destructive",
            icon: <Trash2 className="h-5 w-5" />,
        });
    }
  };

  const handleAddCategory = () => {
    toast({
      title: "Add Category",
      description: "This feature is coming soon! You'll be able to add new categories here.",
    });
  };

  const handleAddModifierGroup = () => {
    toast({
      title: "Add Modifier Group",
      description: "This feature is coming soon! You'll be able to add new modifier groups here.",
    });
  };
  
  const filteredMenuItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Menu Management" description="Add, edit, and organize your menu items, categories, and modifiers.">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search items..." 
              className="pl-8 sm:w-[300px]" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/admin/menu/new-item" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Tabs defaultValue="items">
        <TabsList className="grid w-full grid-cols-3 md:w-[500px]">
          <TabsTrigger value="items">All Items ({filteredMenuItems.length})</TabsTrigger>
          <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
          <TabsTrigger value="modifiers">Modifiers ({modifiers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>Manage all individual items on your menu.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Availability</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMenuItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="relative h-12 w-12 rounded-md overflow-hidden border">
                           <Image 
                            src={item.imageUrl || `https://placehold.co/100x100.png?text=${item.name.substring(0,2)}`} 
                            alt={item.name} 
                            layout="fill" 
                            objectFit="cover" 
                            data-ai-hint={`${item.category.toLowerCase()} food`} />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={item.availability}
                          onCheckedChange={() => handleToggleAvailability(item.id)}
                          id={`avail-${item.id}`}
                          aria-label={`${item.name} availability`}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" title="Edit Item" disabled> {/* Edit to be implemented */}
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete Item" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
               {filteredMenuItems.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  {searchTerm ? "No items match your search." : "No menu items available. Try adding some!"}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Organize your menu items into categories.</CardDescription>
              </div>
              <Button variant="outline" onClick={handleAddCategory}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </CardHeader>
            <CardContent>
              {categories.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category Name</TableHead>
                      <TableHead className="text-center">Items</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-center">{category.itemCount}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" title="Edit Category" disabled>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Delete Category" className="text-destructive hover:text-destructive/80" disabled>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                 <p className="text-center text-muted-foreground py-8">No categories found. Add menu items to see categories here.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modifiers">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Modifiers</CardTitle>
                <CardDescription>Manage item add-ons and customization options.</CardDescription>
              </div>
               <Button variant="outline" onClick={handleAddModifierGroup}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Modifier Group
              </Button>
            </CardHeader>
            <CardContent>
              {modifiers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Modifier Group Name</TableHead>
                      <TableHead>Options</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modifiers.map((modifier) => (
                      <TableRow key={modifier.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{modifier.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {modifier.items.slice(0, 3).join(', ')}{modifier.items.length > 3 ? '...' : ''}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" title="Edit Modifier Group" disabled>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Delete Modifier Group" className="text-destructive hover:text-destructive/80" disabled>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No modifiers defined yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
