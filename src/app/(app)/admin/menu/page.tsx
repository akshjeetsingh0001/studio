
'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, PlusCircle, Search, Trash2, CheckCircle, XCircle, Info, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; 

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
  price: number; // Base price or price of default/smallest variant
  availability: boolean;
  imageUrl: string;
  description?: string;
  'data-ai-hint'?: string;
  variants?: MenuItemVariant[];
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

const initialMockModifiers: ModifierGroup[] = [];

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenuItems, setIsLoadingMenuItems] = useState(true);
  const [menuLoadError, setMenuLoadError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modifiers, setModifiers] = useState<ModifierGroup[]>(initialMockModifiers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMenuItems = useCallback(async () => {
    setIsLoadingMenuItems(true);
    setMenuLoadError(null);
    try {
      const response = await fetch('/api/menu-items');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch menu items: ${response.statusText}`);
      }
      const data: MenuItem[] = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error("Failed to load menu items from API:", error);
      setMenuLoadError(error instanceof Error ? error.message : "An unknown error occurred while fetching menu items.");
      setMenuItems([]);
      toast({
        title: "Error Loading Menu",
        description: error instanceof Error ? error.message : "Could not load menu items. Please check Google Sheets configuration or try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMenuItems(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  useEffect(() => {
    const categoryMap = new Map<string, number>();
    menuItems.forEach(item => {
      categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + 1);
    });
    const derivedCategories: Category[] = Array.from(categoryMap.entries()).map(([name, count], index) => ({
      id: `CAT${index + 1}`,
      name,
      itemCount: count,
    })).sort((a,b) => a.name.localeCompare(b.name)); 
    setCategories(derivedCategories);
  }, [menuItems]);


  const handleToggleAvailability = (itemId: string) => {
    toast({
      title: "Feature Not Implemented",
      description: "Changing item availability requires Google Sheets write access, which is not yet implemented in this UI. Please update directly in your Google Sheet.",
      variant: "default",
      icon: <Info className="h-5 w-5 text-blue-500" />,
    });
  };

  const confirmDeleteItem = () => {
     toast({
      title: "Feature Not Implemented",
      description: "Deleting items requires Google Sheets write access, which is not yet implemented in this UI. Please update directly in your Google Sheet.",
      variant: "default",
      icon: <Info className="h-5 w-5 text-blue-500" />,
    });
    setItemToDeleteId(null);
    setIsDeleteDialogOpen(false);
  };

  const openDeleteDialog = (itemId: string) => {
    setItemToDeleteId(itemId);
    setIsDeleteDialogOpen(true);
  };

  const handleAddCategory = () => {
    toast({
      title: "Add Category",
      description: "Managing categories directly requires Google Sheets write access, which is not yet implemented. Categories are derived from your items in Google Sheets.",
    });
  };

  const handleAddModifierGroup = () => {
    toast({
      title: "Add Modifier Group",
      description: "This feature is coming soon! You'll be able to add new modifier groups here (requires backend integration).",
    });
  };
  
  const filteredMenuItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)); 

  const getPriceDisplay = (item: MenuItem): string => {
    if (item.variants && item.variants.length > 0) {
      const prices = item.variants.map(v => v.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        return `₹${minPrice.toFixed(2)}`;
      }
      return `₹${minPrice.toFixed(2)} - ₹${maxPrice.toFixed(2)}`;
    }
    return `₹${item.price.toFixed(2)}`;
  };

  return (
    <>
    <div className="space-y-6">
      <PageHeader title="Menu Management" description="View your menu items. Menu data is read from Google Sheets.">
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
      
      <Card className="shadow-sm bg-blue-50 border border-blue-200">
        <CardContent className="p-4">
            <div className="flex items-start">
                <Info className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-blue-600" />
                <div>
                    <p className="text-sm text-blue-700">
                        Menu items are now read from your configured Google Sheet. To add, edit, or delete items, please make changes directly in the Google Sheet.
                        Write operations from this interface (like 'Add New Item', 'Edit', 'Delete', or toggling availability) are not currently implemented for Google Sheets.
                    </p>
                </div>
            </div>
        </CardContent>
      </Card>


      <Tabs defaultValue="items">
        <TabsList className="grid w-full grid-cols-3 md:w-[500px]">
          <TabsTrigger value="items">All Items ({isLoadingMenuItems ? '...' : filteredMenuItems.length})</TabsTrigger>
          <TabsTrigger value="categories">Categories ({isLoadingMenuItems ? '...' : categories.length})</TabsTrigger>
          <TabsTrigger value="modifiers">Modifiers ({modifiers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>Manage all individual items on your menu. (Read-only from Google Sheets)</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMenuItems && (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                  <p>Loading menu from Google Sheets...</p>
                </div>
              )}
              {menuLoadError && !isLoadingMenuItems && (
                <div className="flex flex-col items-center justify-center h-64 text-destructive p-4 text-center">
                  <AlertTriangle className="h-12 w-12 mb-4" />
                  <p className="font-semibold text-lg">Failed to Load Menu</p>
                  <p className="text-sm">{menuLoadError}</p>
                  <Button onClick={fetchMenuItems} variant="outline" className="mt-4">Try Again</Button>
                </div>
              )}
              {!isLoadingMenuItems && !menuLoadError && (
                <>
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
                                data-ai-hint={item['data-ai-hint'] || `${item.category.toLowerCase()} food`} />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-right">{getPriceDisplay(item)}</TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={item.availability}
                              onCheckedChange={() => handleToggleAvailability(item.id)}
                              id={`avail-${item.id}`}
                              aria-label={`${item.name} availability (read-only)`}
                              disabled // Availability is now managed in Google Sheets
                            />
                             <Badge variant={item.availability ? "default" : "outline"} className={`ml-2 ${item.availability ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                                {item.availability ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                                {item.availability ? 'Available' : 'Unavailable'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" title="Edit Item (Manage in Google Sheets)" disabled> 
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Delete Item (Manage in Google Sheets)" 
                              className="text-destructive hover:text-destructive/80" 
                              onClick={() => openDeleteDialog(item.id)}
                              // disabled // Re-enable if openDeleteDialog is to show info toast
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredMenuItems.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      {menuItems.length === 0 ? "No menu items found in Google Sheets." : searchTerm ? "No items match your search." : "All items might be filtered out."}
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Categories are derived from items in your Google Sheet.</CardDescription>
              </div>
              <Button variant="outline" onClick={handleAddCategory} disabled>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingMenuItems ? (
                 <div className="flex items-center justify-center h-32"><Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" /><p>Loading categories...</p></div>
              ) : categories.length > 0 ? (
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
                          <Button variant="ghost" size="icon" title="Edit Category (Manage in Google Sheets)" disabled>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Delete Category (Manage in Google Sheets)" className="text-destructive hover:text-destructive/80" disabled>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                 <p className="text-center text-muted-foreground py-8">No categories found. Add menu items to your Google Sheet to see categories here.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modifiers">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Modifiers</CardTitle>
                <CardDescription>Manage item add-ons and customization options (Not yet integrated with Google Sheets).</CardDescription>
              </div>
               <Button variant="outline" onClick={handleAddModifierGroup} disabled>
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
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting items must be done directly in your Google Sheet. This UI action is for confirmation only and will not modify the sheet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem}>Understood, Remind Later</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
