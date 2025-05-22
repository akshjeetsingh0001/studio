
'use client'; // Make this a client component to use hooks

import type React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Edit, Merge, PlusCircle, Users, XCircle, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast'; 

// Mock data for tables - removed to start with an empty state.
const tableSections: { name: string; tables: any[] }[] = [];

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
  const { toast } = useToast(); 

  const handleMarkAsCleaned = (tableName: string) => {
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
          <Button variant="outline" disabled> {/* Disabled until implemented */}
            <Merge className="mr-2 h-4 w-4" /> Merge Tables
          </Button>
          <Link href="/order/new" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> New Order
            </Button>
          </Link>
        </div>
      </PageHeader>

      {tableSections.length === 0 && (
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center text-muted-foreground">
            No table sections or tables configured. Please set up tables in settings or via an admin interface.
          </CardContent>
        </Card>
      )}

      {tableSections.map(section => (
        <Card key={section.name} className="shadow-lg">
          <CardHeader>
            <CardTitle>{section.name}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {section.tables.length === 0 ? (
                 <p className="text-muted-foreground col-span-full">No tables in this section.</p>
            ) : (
                section.tables.map(table => {
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
                })
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

