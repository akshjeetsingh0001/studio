
'use client';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const menuItemSchema = z.object({
  name: z.string().min(3, { message: "Item name must be at least 3 characters." }),
  category: z.string().min(1, { message: "Category is required." }),
  price: z.coerce.number().min(0.01, { message: "Price must be a positive number." }),
  description: z.string().optional(),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
  availability: z.boolean().default(true),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

const USER_MENU_ITEMS_KEY = 'dineSwiftMenuItems';

const initialMockCategories = [
    'PIZZAS - CLASSIC',
    'PIZZAS - SIMPLE',
    'PIZZAS - PREMIUM',
    'PIZZAS - SPECIAL',
    'PIZZAS - SINGLES',
    'PIZZAS - DOUBLES',
    'EXTRAS',
    'SANDWICHES',
    'PASTA',
    'FRIES',
    'BURGERS',
    'KUHLAD SPECIALS',
    'SIDES',
    'DIPS',
];


export default function AddNewMenuItemPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      category: '',
      price: 0,
      description: '',
      imageUrl: '',
      availability: true,
    },
  });

  const onSubmit = (data: MenuItemFormData) => {
    setIsLoading(true);
    
    const categoryCode = data.category.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'GNRL';
    const nameCode = data.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'ITM';
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

    const newItem = {
      id: `ITEM_${categoryCode}_${nameCode}_${randomSuffix}`,
      ...data,
      imageUrl: data.imageUrl || `https://placehold.co/100x100.png?text=${data.name.substring(0,2)}`, 
      'data-ai-hint': `${data.category.toLowerCase()} food`,
      // Note: Adding items with complex variants (like different sizes) is not supported by this form.
      // That logic currently resides in the initialMockMenuItems definition in the main menu page.
    };

    try {
      const existingItemsRaw = localStorage.getItem(USER_MENU_ITEMS_KEY);
      let existingItems = existingItemsRaw ? JSON.parse(existingItemsRaw) : [];
      existingItems.push(newItem);
      localStorage.setItem(USER_MENU_ITEMS_KEY, JSON.stringify(existingItems));

      toast({
        title: 'Menu Item Added!',
        description: `${newItem.name} has been successfully added to the menu.`,
      });
      router.push('/admin/menu');
    } catch (error) {
      console.error("Failed to save menu item to localStorage", error);
      toast({
        title: 'Storage Error',
        description: 'Could not save menu item due to a storage issue.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Add New Menu Item" description="Fill in the details for the new menu item.">
        <Link href="/admin/menu" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Button>
        </Link>
      </PageHeader>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>Provide information about the menu item.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" {...form.register('name')} />
                {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => form.setValue('category', value)} defaultValue={form.getValues('category')}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {initialMockCategories.sort((a,b) => a.localeCompare(b)).map(cat => (
                       <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && <p className="text-sm text-destructive mt-1">{form.formState.errors.category.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" step="0.01" {...form.register('price')} />
              {form.formState.errors.price && <p className="text-sm text-destructive mt-1">{form.formState.errors.price.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" {...form.register('description')} />
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input id="imageUrl" placeholder="https://example.com/image.png" {...form.register('imageUrl')} />
               {form.formState.errors.imageUrl && <p className="text-sm text-destructive mt-1">{form.formState.errors.imageUrl.message}</p>}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="availability"
                checked={form.watch('availability')}
                onCheckedChange={(checked) => form.setValue('availability', checked)}
              />
              <Label htmlFor="availability">Available for Ordering</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Menu Item'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
