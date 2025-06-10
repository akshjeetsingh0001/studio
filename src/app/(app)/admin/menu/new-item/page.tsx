
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
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
import { ArrowLeft, Save, Info } from 'lucide-react';
import Link from 'next/link';

const menuItemSchema = z.object({
  name: z.string().min(3, { message: "Item name must be at least 3 characters." }),
  category: z.string().min(1, { message: "Category is required." }),
  price: z.coerce.number().min(0.01, { message: "Price must be a positive number." }),
  description: z.string().optional(),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
  availability: z.boolean().default(true),
  // variantsJson is not directly in the form but would be part of sheet data
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

// Fetch categories from API or use a static list if API isn't ready for categories
const initialMockCategories: string[] = []; // Will be populated by API ideally


export default function AddNewMenuItemPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);

  useEffect(() => {
    // Fetch distinct categories from menu items API to populate the dropdown
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/menu-items');
        if (response.ok) {
          const items: {category: string}[] = await response.json();
          const distinctCategories = Array.from(new Set(items.map(item => item.category)));
          setDynamicCategories(distinctCategories.sort((a,b) => a.localeCompare(b)));
        } else {
          console.error("Failed to fetch categories for dropdown");
          setDynamicCategories(initialMockCategories); // Fallback
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setDynamicCategories(initialMockCategories); // Fallback
      }
    };
    fetchCategories();
  }, []);


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
    toast({
        title: 'Feature Not Implemented',
        description: (
          <div>
            <p>Adding new menu items directly from this UI to Google Sheets is not yet implemented.</p>
            <p className="mt-2"><strong>Please add new items directly into your Google Sheet.</strong></p>
            <p className="mt-1">The sheet should have columns: id, name, category, price, imageUrl, availability (TRUE/FALSE), description, dataAiHint, variantsJson.</p>
          </div>
        ),
        variant: 'default', // Using default, could be 'destructive' or a custom variant
        duration: 10000, // Longer duration for important info
        icon: <Info className="h-5 w-5 text-blue-500" />
    });
    
    // Simulate some work or redirect
    setTimeout(() => {
        setIsLoading(false);
        // router.push('/admin/menu'); // Optionally redirect
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Add New Menu Item" description="Define a new item for your menu. (Currently informational - add to Google Sheets)">
        <Link href="/admin/menu" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Button>
        </Link>
      </PageHeader>
      
      <Card className="shadow-sm bg-blue-50 border border-blue-200 mb-6">
        <CardContent className="p-4">
            <div className="flex items-start">
                <Info className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-blue-600" />
                <div>
                    <p className="text-sm text-blue-700 font-medium">
                        Note: This form is for demonstration. To add menu items, please edit your Google Sheet directly.
                    </p>
                     <p className="text-xs text-blue-600 mt-1">
                        Ensure your sheet includes columns: id, name, category, price, imageUrl, availability (TRUE/FALSE), description, dataAiHint, and variantsJson.
                    </p>
                </div>
            </div>
        </CardContent>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>Provide information about the menu item. (This will not save to Google Sheets yet)</CardDescription>
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
                    {dynamicCategories.length > 0 ? dynamicCategories.map(cat => (
                       <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    )) : <SelectItem value="" disabled>Loading categories...</SelectItem>}
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
              <Label htmlFor="availability">Available for Ordering (Set in Google Sheet)</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Processing...' : 'Save Menu Item (Informational)'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
