
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

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  availability: boolean;
  imageUrl: string;
  description: string;
  'data-ai-hint'?: string;
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

const initialMockMenuItems: MenuItem[] = [
  // Pizzas - CLASSIC
  { id: 'PIZZA_CLASSIC_MARG_S', name: 'Margherita (Small)', category: 'PIZZAS - CLASSIC', price: 100, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=MS', description: 'Classic Margherita Pizza - Small size.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_CLASSIC_MARG_M', name: 'Margherita (Medium)', category: 'PIZZAS - CLASSIC', price: 200, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=MM', description: 'Classic Margherita Pizza - Medium size.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_CLASSIC_MARG_L', name: 'Margherita (Large)', category: 'PIZZAS - CLASSIC', price: 300, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=ML', description: 'Classic Margherita Pizza - Large size.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_CLASSIC_CT', name: 'Cheese Tomato Pizza', category: 'PIZZAS - CLASSIC', price: 0, availability: false, imageUrl: 'https://placehold.co/100x100.png?text=CT', description: 'Cheese Tomato Pizza.', 'data-ai-hint': 'pizza food' },

  // Pizzas - SIMPLE
  { id: 'PIZZA_SIMPLE_DCM_S', name: 'Double Cheese Margherita (Small)', category: 'PIZZAS - SIMPLE', price: 150, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=DCS', description: 'Double Cheese Margherita - Small.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_SIMPLE_DCM_M', name: 'Double Cheese Margherita (Medium)', category: 'PIZZAS - SIMPLE', price: 290, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=DCM', description: 'Double Cheese Margherita - Medium.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_SIMPLE_DCM_L', name: 'Double Cheese Margherita (Large)', category: 'PIZZAS - SIMPLE', price: 450, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=DCL', description: 'Double Cheese Margherita - Large.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_SIMPLE_SV', name: 'Simple Veg Pizza', category: 'PIZZAS - SIMPLE', price: 0, availability: false, imageUrl: 'https://placehold.co/100x100.png?text=SV', description: 'Simple Veg Pizza.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_SIMPLE_JC', name: 'Just Corn Pizza', category: 'PIZZAS - SIMPLE', price: 0, availability: false, imageUrl: 'https://placehold.co/100x100.png?text=JC', description: 'Just Corn Pizza.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_SIMPLE_FL', name: 'Farm Lover Pizza', category: 'PIZZAS - SIMPLE', price: 0, availability: false, imageUrl: 'https://placehold.co/100x100.png?text=FL', description: 'Farm Lover Pizza.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_SIMPLE_SP', name: 'Spicy Paneer Pizza', category: 'PIZZAS - SIMPLE', price: 0, availability: false, imageUrl: 'https://placehold.co/100x100.png?text=SPP', description: 'Spicy Paneer Pizza.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_SIMPLE_TM', name: 'Tasty Mexicana Pizza', category: 'PIZZAS - SIMPLE', price: 0, availability: false, imageUrl: 'https://placehold.co/100x100.png?text=TMP', description: 'Tasty Mexicana Pizza.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_SIMPLE_BW', name: 'Black & White Pizza', category: 'PIZZAS - SIMPLE', price: 0, availability: false, imageUrl: 'https://placehold.co/100x100.png?text=BWP', description: 'Black & White Pizza.', 'data-ai-hint': 'pizza food' },

  // Pizzas - PREMIUM
  { id: 'PIZZA_PREMIUM_PH_S', name: 'Paneer Hub (Small)', category: 'PIZZAS - PREMIUM', price: 200, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=PHS', description: 'Paneer Hub Pizza - Small.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_PREMIUM_PH_M', name: 'Paneer Hub (Medium)', category: 'PIZZAS - PREMIUM', price: 370, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=PHM', description: 'Paneer Hub Pizza - Medium.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_PREMIUM_PH_L', name: 'Paneer Hub (Large)', category: 'PIZZAS - PREMIUM', price: 550, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=PHL', description: 'Paneer Hub Pizza - Large.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_PREMIUM_OLIVY', name: 'Olivy Pizza', category: 'PIZZAS - PREMIUM', price: 0, availability: false, imageUrl: 'https://placehold.co/100x100.png?text=OP', description: 'Olivy Pizza.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_PREMIUM_PMIX', name: 'Premium Mix Pizza', category: 'PIZZAS - PREMIUM', price: 0, availability: false, imageUrl: 'https://placehold.co/100x100.png?text=PMP', description: 'Premium Mix Pizza.', 'data-ai-hint': 'pizza food' },

  // Pizzas - Delight Hub SPECIAL
  { id: 'PIZZA_SPECIAL_DHS_S', name: 'Delight Hub Special (Small)', category: 'PIZZAS - SPECIAL', price: 230, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=DHS', description: 'Delight Hub Special Pizza - Small.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_SPECIAL_DHS_M', name: 'Delight Hub Special (Medium)', category: 'PIZZAS - SPECIAL', price: 460, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=DHM', description: 'Delight Hub Special Pizza - Medium.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_SPECIAL_DHS_L', name: 'Delight Hub Special (Large)', category: 'PIZZAS - SPECIAL', price: 650, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=DHL', description: 'Delight Hub Special Pizza - Large.', 'data-ai-hint': 'pizza food' },
  
  // EXTRAS
  { id: 'EXTRA_CHEESE', name: 'Cheese-Topping', category: 'EXTRAS', price: 40, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=CT', description: 'Extra cheese topping.', 'data-ai-hint': 'cheese topping' },
  { id: 'EXTRA_TOPPING', name: 'Extra Topping', category: 'EXTRAS', price: 30, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=ET', description: 'Additional topping.', 'data-ai-hint': 'vegetable topping' },

  // SINGLES
  { id: 'PIZZA_SINGLE_ONION', name: 'Onion Single Pizza', category: 'PIZZAS - SINGLES', price: 60, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=OS', description: 'Single topping pizza with onion.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_SINGLE_CAP', name: 'Capsicum Single Pizza', category: 'PIZZAS - SINGLES', price: 70, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=CS', description: 'Single topping pizza with capsicum.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_SINGLE_TOM', name: 'Tomato Single Pizza', category: 'PIZZAS - SINGLES', price: 70, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=TS', description: 'Single topping pizza with tomato.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_SINGLE_CORN', name: 'Corn Single Pizza', category: 'PIZZAS - SINGLES', price: 70, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=CrS', description: 'Single topping pizza with corn.', 'data-ai-hint': 'pizza food' },

  // DOUBLES
  { id: 'PIZZA_DOUBLE_OC', name: 'Onion Capsicum Double Pizza', category: 'PIZZAS - DOUBLES', price: 70, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=OCD', description: 'Double topping pizza with onion and capsicum.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_DOUBLE_PC', name: 'Paneer Capsicum Double Pizza', category: 'PIZZAS - DOUBLES', price: 80, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=PCD', description: 'Double topping pizza with paneer and capsicum.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_DOUBLE_PO', name: 'Paneer Onion Double Pizza', category: 'PIZZAS - DOUBLES', price: 80, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=POD', description: 'Double topping pizza with paneer and onion.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_DOUBLE_OJ', name: 'Onion Jalapeno Double Pizza', category: 'PIZZAS - DOUBLES', price: 80, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=OJD', description: 'Double topping pizza with onion and jalapeno.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_DOUBLE_TC', name: 'Tomato Corn Double Pizza', category: 'PIZZAS - DOUBLES', price: 80, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=TCD', description: 'Double topping pizza with tomato and corn.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_DOUBLE_PCO', name: 'Paneer Corn Double Pizza', category: 'PIZZAS - DOUBLES', price: 80, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=PCO', description: 'Double topping pizza with paneer and corn.', 'data-ai-hint': 'pizza food' },
  { id: 'PIZZA_DOUBLE_POC', name: 'Paneer-O-C Double Pizza', category: 'PIZZAS - DOUBLES', price: 100, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=POCD', description: 'Paneer, Onion, Capsicum Double Pizza.', 'data-ai-hint': 'pizza food' },

  // SANDWICHES
  { id: 'SAND_CLASSIC', name: 'Classic Green Sandwich', category: 'SANDWICHES', price: 60, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=CGS', description: 'A classic green sandwich.', 'data-ai-hint': 'sandwich food' },
  { id: 'SAND_CHEESY', name: 'Cheesy Sandwich', category: 'SANDWICHES', price: 70, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=CHS', description: 'A delicious cheesy sandwich.', 'data-ai-hint': 'sandwich food' },
  { id: 'SAND_PANEERCORN', name: 'Paneer Corn Sandwich', category: 'SANDWICHES', price: 80, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=PCS', description: 'Paneer and corn sandwich.', 'data-ai-hint': 'sandwich food' },
  { id: 'SAND_PANEERTIKKA', name: 'Paneer Tikka Sandwich', category: 'SANDWICHES', price: 100, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=PTS', description: 'Spicy paneer tikka sandwich.', 'data-ai-hint': 'sandwich food' },

  // PASTA
  { id: 'PASTA_REG_R', name: 'Regular Pasta (Red)', category: 'PASTA', price: 80, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=RPR', description: 'Regular pasta in red sauce.', 'data-ai-hint': 'pasta food' },
  { id: 'PASTA_REG_W', name: 'Regular Pasta (White)', category: 'PASTA', price: 80, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=RPW', description: 'Regular pasta in white sauce.', 'data-ai-hint': 'pasta food' },
  { id: 'PASTA_REG_C', name: 'Regular Pasta (Combi)', category: 'PASTA', price: 100, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=RPC', description: 'Regular pasta in combination sauce.', 'data-ai-hint': 'pasta food' },
  { id: 'PASTA_TANDOORI_R', name: 'Tandoori Pasta (Red)', category: 'PASTA', price: 80, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=TPR', description: 'Tandoori pasta in red sauce.', 'data-ai-hint': 'pasta food' },
  { id: 'PASTA_TANDOORI_W', name: 'Tandoori Pasta (White)', category: 'PASTA', price: 80, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=TPW', description: 'Tandoori pasta in white sauce.', 'data-ai-hint': 'pasta food' },
  { id: 'PASTA_TANDOORI_C', name: 'Tandoori Pasta (Combi)', category: 'PASTA', price: 100, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=TPC', description: 'Tandoori pasta in combination sauce.', 'data-ai-hint': 'pasta food' },

  // FRIES
  { id: 'FRIES_PERI', name: 'Peri Peri Fries', category: 'FRIES', price: 70, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=PPF', description: 'Spicy Peri Peri fries.', 'data-ai-hint': 'fries food' },
  { id: 'FRIES_CHEESE', name: 'Cheese Fries', category: 'FRIES', price: 80, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=CF', description: 'Fries topped with cheese.', 'data-ai-hint': 'fries food' },
  { id: 'FRIES_PIZZA', name: 'Pizza Style Fries', category: 'FRIES', price: 100, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=PSF', description: 'Fries with pizza style toppings.', 'data-ai-hint': 'fries food' },

  // BURGERS
  { id: 'BURGER_ALOO', name: 'Aloo Burger', category: 'BURGERS', price: 35, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=AB', description: 'Simple aloo patty burger.', 'data-ai-hint': 'burger food' },
  { id: 'BURGER_VEGCHEESE', name: 'Veg. Cheese Burger', category: 'BURGERS', price: 50, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=VCB', description: 'Vegetable burger with cheese.', 'data-ai-hint': 'burger food' },
  { id: 'BURGER_SPICYALOO', name: 'Spicy Aloo Burger', category: 'BURGERS', price: 50, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=SAB', description: 'Spicy aloo patty burger.', 'data-ai-hint': 'burger food' },
  { id: 'BURGER_JALAPENO', name: 'Jalapeno Burger', category: 'BURGERS', price: 60, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=JB', description: 'Burger with jalapenos.', 'data-ai-hint': 'burger food' },
  { id: 'BURGER_PANEERTIKKA', name: 'Paneer Tikka Burger', category: 'BURGERS', price: 75, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=PTB', description: 'Paneer tikka patty burger.', 'data-ai-hint': 'burger food' },
  { id: 'BURGER_DOUBLEDECKER', name: 'Double Decker Burger', category: 'BURGERS', price: 100, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=DDB', description: 'A double decker burger.', 'data-ai-hint': 'burger food' },

  // KUHLAD SPECIALS
  { id: 'KUHLAD_PIZZA_R', name: 'Kuhlad Pizza (Regular)', category: 'KUHLAD SPECIALS', price: 100, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=KP', description: 'Pizza served in a kuhlad - regular size.', 'data-ai-hint': 'pizza food' },
  { id: 'KUHLAD_PIZZA_L', name: 'Kuhlad Pizza (Large)', category: 'KUHLAD SPECIALS', price: 140, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=KPL', description: 'Pizza served in a kuhlad - large size.', 'data-ai-hint': 'pizza food' },
  { id: 'KUHLAD_CHEESEFRIES', name: 'Kuhlad Cheese Fries', category: 'KUHLAD SPECIALS', price: 120, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=KCF', description: 'Cheese fries served in a kuhlad.', 'data-ai-hint': 'fries food' },
  { id: 'KUHLAD_PASTA', name: 'Kuhlad Pasta', category: 'KUHLAD SPECIALS', price: 120, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=KPS', description: 'Pasta served in a kuhlad.', 'data-ai-hint': 'pasta food' },

  // SIDES
  { id: 'SIDE_VEGPOCKET', name: 'Veg. Pocket', category: 'SIDES', price: 40, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=VP', description: 'Vegetable pocket.', 'data-ai-hint': 'snack food' },
  { id: 'SIDE_GARLICBREAD', name: 'Garlic Bread', category: 'SIDES', price: 60, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=GB', description: 'Classic garlic bread.', 'data-ai-hint': 'bread food' },
  { id: 'SIDE_GARLICBREADCHEESE', name: 'Garlic Bread Cheese', category: 'SIDES', price: 100, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=GBC', description: 'Garlic bread with cheese.', 'data-ai-hint': 'bread food' },
  { id: 'SIDE_CHEESEFILLEDGB', name: 'Cheese Filled Garlic Bread', category: 'SIDES', price: 120, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=CFGB', description: 'Garlic bread filled with cheese.', 'data-ai-hint': 'bread food' },

  // DIPS
  { id: 'DIP_CHEESY', name: 'Cheesy Dip', category: 'DIPS', price: 30, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=CD', description: 'A creamy cheesy dip.', 'data-ai-hint': 'dip sauce' },
  { id: 'DIP_THOUSANDISLAND', name: 'Thousand Island Dip', category: 'DIPS', price: 30, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=TID', description: 'Thousand Island dressing dip.', 'data-ai-hint': 'dip sauce' },
  { id: 'DIP_PERIPERI', name: 'Peri Peri Dip', category: 'DIPS', price: 30, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=PPD', description: 'Spicy Peri Peri dip.', 'data-ai-hint': 'dip sauce' },
  { id: 'DIP_TANDOORI', name: 'Tandoori Dip', category: 'DIPS', price: 30, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=TD', description: 'Flavorful Tandoori dip.', 'data-ai-hint': 'dip sauce' },
  { id: 'DIP_MAYO', name: 'Mayo Dip', category: 'DIPS', price: 30, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=MD', description: 'Classic mayonnaise dip.', 'data-ai-hint': 'dip sauce' },
  { id: 'DIP_CHILLYGARLIC', name: 'Chilly Garlic Dip', category: 'DIPS', price: 30, availability: true, imageUrl: 'https://placehold.co/100x100.png?text=CGD', description: 'Spicy chilly garlic dip.', 'data-ai-hint': 'dip sauce' },
];

const initialMockModifiers: ModifierGroup[] = [];


export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modifiers, setModifiers] = useState<ModifierGroup[]>(initialMockModifiers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
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
          if (Array.isArray(parsedItems) && parsedItems.length > 0) {
            setMenuItems(parsedItems); 
          } else {
            setMenuItems(initialMockMenuItems);
            updateLocalStorage(initialMockMenuItems); 
          }
        } else {
          setMenuItems(initialMockMenuItems);
          updateLocalStorage(initialMockMenuItems); 
        }
      } catch (e) {
        console.error("Failed to load menu items from localStorage", e);
        setMenuItems(initialMockMenuItems); 
        updateLocalStorage(initialMockMenuItems); 
      }
    } else {
        setMenuItems(initialMockMenuItems); 
    }
  }, []);

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

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

  const confirmDeleteItem = () => {
    if (itemToDeleteId) {
      let deletedItemName = '';
      setMenuItems(prevItems => {
        const itemToDelete = prevItems.find(item => item.id === itemToDeleteId);
        if (itemToDelete) {
          deletedItemName = itemToDelete.name;
        }
        const updatedItems = prevItems.filter(item => item.id !== itemToDeleteId);
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
    }
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
  ).sort((a,b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)); 


  return (
    <>
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
          <Card className="shadow-lg">
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
                            data-ai-hint={item['data-ai-hint'] || `${item.category.toLowerCase()} food`} />
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
                        <Button variant="ghost" size="icon" title="Edit Item" disabled> 
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Delete Item" 
                          className="text-destructive hover:text-destructive/80" 
                          onClick={() => openDeleteDialog(item.id)}
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
                  {menuItems.length === 0 ? "No menu items available. Try adding some!" : searchTerm ? "No items match your search." : "All items might be filtered out or unavailable."}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="shadow-lg">
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
          <Card className="shadow-lg">
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
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the menu item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    
