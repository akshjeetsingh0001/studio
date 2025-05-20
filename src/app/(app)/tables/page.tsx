
'use client'; // Make this a client component to use hooks

import type React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Edit, Merge, PlusCircle, Users, XCircle, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast'; // Import useToast

// Mock data for tables
const tableSections = [
  {
    name: 'Main Dining',
    tables: [
      { id: 'T1', name: 'Table 1', capacity: 4, status: 'Available', server: null },
      { id: 'T2', name: 'Table 2', capacity: 4, status: 'Occupied', server: 'Jane D.', currentOrderValue: 45.50 },
      { id: 'T3', name: 'Table 3', capacity: 2, status: 'Needs Cleaning', server: null },
      { id: 'T4', name: 'Table 4', capacity: 6, status: 'Reserved', server: 'John S.' },
      { id: 'T5', name: 'Table 5', capacity: 4, status: 'Occupied', server: 'Alice M.', currentOrderValue: 82.00 },
      { id: 'T6', name: 'Table 6', capacity: 2, status: 'Available', server: null },
    ]
  },
  {
    name: 'Patio',
    tables: [
      { id: 'P1', name: 'Patio 1', capacity: 4, status: 'Available', server: null },
      { id: 'P2', name: 'Patio 2', capacity: 2, status: 'Occupied', server: 'Jane D.', currentOrderValue: 22.75 },
      { id: 'P3', name: 'Patio 3', capacity: 4, status: 'Available', server: null },
    ]
  },
  {
    name: 'Bar',
    tables: [
      { id: 'B1', name: 'Bar Seat 1', capacity: 1, status: 'Occupied', server: 'Bartender', currentOrderValue: 15.00 },
      { id: 'B2', name: 'Bar Seat 2', capacity: 1, status: 'Available', server: null },
      { id: 'B3', name: 'Bar Seat 3', capacity: 1, status: 'Available', server: null },
      { id: 'B4', name: 'Bar Seat 4', capacity: 1, status: 'Occupied', server: 'Bartender', currentOrderValue: 8.50 },
    ]
  }
];

const getStatusProps = (status: string) => {
  switch (status) {
    case 'Available':
      return { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500' };
    case 'Occupied':
      return { icon: Users, color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500' };
    case 'Needs Cleaning':
      return { icon: XCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500' };
    case 'Reserved':
      return { icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500' };
    default:
      return { icon: Users, color: 'text-gray-500', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500' };
  }
};

export default function TableManagementPage() {
  const { toast } = useToast(); // Initialize toast

  const handleMarkAsCleaned = (tableName: string) => {
    // In a real app, this would update the table status in the backend.
    // For now, we just show a toast.
    toast({
      title: 'Table Status Updated',
      description: `${tableName} has been marked as cleaned.`,
      icon: <ThumbsUp className="h-5 w-5 text-green-500" />,
    });
    console.log(`${tableName} marked as cleaned.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Table Management" description="Oversee and manage all tables in your restaurant.">
        <div className="flex gap-2">
          <Button variant="outline">
            <Merge className="mr-2 h-4 w-4" /> Merge Tables
          </Button>
          <Link href="/order/new" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> New Order
            </Button>
          </Link>
        </div>
      </PageHeader>

      {tableSections.map(section => (
        <Card key={section.name} className="shadow-sm">
          <CardHeader>
            <CardTitle>{section.name}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {section.tables.map(table => {
              const statusProps = getStatusProps(table.status);
              return (
                <Card 
                  key={table.id} 
                  className={`shadow-sm hover:shadow-lg transition-shadow duration-200 ease-in-out border-2 ${statusProps.borderColor} ${statusProps.bgColor}`}
                >
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className={`text-lg font-semibold ${statusProps.color}`}>{table.name}</CardTitle>
                      <statusProps.icon className={`h-6 w-6 ${statusProps.color}`} />
                    </div>
                    <CardDescription className="text-xs">Capacity: {table.capacity}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm">
                    <Badge variant={table.status === "Available" ? "default" : table.status === "Occupied" ? "destructive" : "secondary"} className={
                      `${table.status === "Available" ? "bg-green-500 hover:bg-green-600" : table.status === "Occupied" ? "bg-red-500 hover:bg-red-600" : table.status === "Reserved" ? "bg-blue-500 hover:bg-blue-600" : "bg-yellow-500 hover:bg-yellow-600"} text-white` 
                    }>
                      {table.status}
                    </Badge>
                    {table.server && <p className="mt-1 text-xs">Server: {table.server}</p>}
                    {table.status === 'Occupied' && table.currentOrderValue && (
                      <p className="mt-1 text-xs font-medium">Order: ${table.currentOrderValue.toFixed(2)}</p>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    {table.status === 'Available' && (
                      <Link href={`/order/${table.id.toLowerCase()}`} passHref className="w-full">
                        <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                          <PlusCircle className="mr-2 h-4 w-4" /> Start Order
                        </Button>
                      </Link>
                    )}
                    {table.status === 'Occupied' && (
                       <Link href={`/order/${table.id.toLowerCase()}`} passHref className="w-full">
                        <Button variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-500/10">
                          <Edit className="mr-2 h-4 w-4" /> View/Edit Order
                        </Button>
                      </Link>
                    )}
                     {table.status === 'Needs Cleaning' && (
                       <Button 
                         variant="outline" 
                         className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                         onClick={() => handleMarkAsCleaned(table.name)}
                       >
                          Mark as Cleaned
                        </Button>
                    )}
                    {table.status === 'Reserved' && (
                       <Link href={`/order/${table.id.toLowerCase()}`} passHref className="w-full">
                        <Button variant="outline" className="w-full border-blue-500 text-blue-500 hover:bg-blue-500/10">
                          Seat Guests
                        </Button>
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
