import type React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, PlusCircle, Search, Trash2, Image as ImageIcon, ToggleLeft, ToggleRight, Utensils } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Mock data for menu items
const mockMenuItems = [
  { id: 'ITEM001', name: 'Classic Burger', category: 'Main Course', price: 12.99, availability: true, imageUrl: 'https://placehold.co/100x100.png', description: 'A juicy beef patty with lettuce, tomato, and our special sauce.' },
  { id: 'ITEM002', name: 'Caesar Salad', category: 'Appetizers', price: 8.50, availability: true, imageUrl: 'https://placehold.co/100x100.png', description: 'Crisp romaine lettuce, croutons, Parmesan cheese, and Caesar dressing.' },
  { id: 'ITEM003', name: 'Margherita Pizza', category: 'Main Course', price: 15.00, availability: true, imageUrl: 'https://placehold.co/100x100.png', description: 'Classic pizza with tomato, mozzarella, and basil.' },
  { id: 'ITEM004', name: 'French Fries', category: 'Sides', price: 4.50, availability: false, imageUrl: 'https://placehold.co/100x100.png', description: 'Crispy golden french fries.' },
  { id: 'ITEM005', name: 'Coca-Cola', category: 'Drinks', price: 2.50, availability: true, imageUrl: 'https://placehold.co/100x100.png', description: 'Refreshing Coca-Cola.' },
  { id: 'ITEM006', name: 'Chocolate Lava Cake', category: 'Desserts', price: 7.00, availability: true, imageUrl: 'https://placehold.co/100x100.png', description: 'Warm chocolate cake with a gooey molten center.' },
];

const mockCategories = [
  { id: 'CAT01', name: 'Appetizers', itemCount: 1 },
  { id: 'CAT02', name: 'Main Course', itemCount: 2 },
  { id: 'CAT03', name: 'Sides', itemCount: 1 },
  { id: 'CAT04', name: 'Drinks', itemCount: 1 },
  { id: 'CAT05', name: 'Desserts', itemCount: 1 },
];

const mockModifiers = [
  { id: 'MOD01', name: 'Cheese Options', items: ['Cheddar', 'Swiss', 'Pepper Jack'] },
  { id: 'MOD02', name: 'Burger Doneness', items: ['Rare', 'Medium Rare', 'Medium', 'Well Done'] },
  { id: 'MOD03', name: 'Salad Dressing', items: ['Ranch', 'Italian', 'Vinaigrette'] },
];


export default function MenuManagementPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Menu Management" description="Add, edit, and organize your menu items, categories, and modifiers.">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search items..." className="pl-8 sm:w-[300px]" />
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
          <TabsTrigger value="items">All Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="modifiers">Modifiers</TabsTrigger>
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
                  {mockMenuItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="relative h-12 w-12 rounded-md overflow-hidden border">
                           <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" data-ai-hint={`${item.category.toLowerCase()} food`} />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Switch checked={item.availability} id={`avail-${item.id}`} aria-label={`${item.name} availability`} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" title="Edit Item">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete Item" className="text-destructive hover:text-destructive/80">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Category</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCategories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-center">{category.itemCount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" title="Edit Category">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete Category" className="text-destructive hover:text-destructive/80">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
               <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Modifier Group</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Modifier Group Name</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockModifiers.map((modifier) => (
                    <TableRow key={modifier.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{modifier.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {modifier.items.slice(0, 3).join(', ')}{modifier.items.length > 3 ? '...' : ''}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" title="Edit Modifier Group">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete Modifier Group" className="text-destructive hover:text-destructive/80">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
