
import type React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, PlusCircle, Search, Trash2, Star, Gift } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data for customers has been removed.
const mockCustomers: any[] = [];

const getTierBadgeVariant = (tier: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (tier.toLowerCase()) {
    case 'platinum':
      return 'default';
    case 'gold':
      return 'secondary';
    case 'silver':
      return 'outline';
    default:
      return 'outline';
  }
};

const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
};

export default function CustomerManagementPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Customer Management" description="View, add, and manage your customer profiles and loyalty program.">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search customers..." className="pl-8 sm:w-[300px]" />
          </div>
          <Link href="/admin/customers/new" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Customer
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>All registered customers and their loyalty status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-center">Loyalty Points</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No customers found. Add customers to see them here.
                  </TableCell>
                </TableRow>
              ) : (
                mockCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(customer.name)}`} alt={customer.name} data-ai-hint="person avatar" />
                        <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell className="text-center">{customer.loyaltyPoints}</TableCell>
                    <TableCell>
                      <Badge variant={getTierBadgeVariant(customer.tier)} className="capitalize">
                        {customer.tier === 'Gold' && <Star className="mr-1 h-3 w-3 fill-current" />}
                        {customer.tier === 'Platinum' && <Star className="mr-1 h-3 w-3 fill-current" />}
                        {customer.tier === 'Silver' && <Star className="mr-1 h-3 w-3 fill-current" />}
                        {customer.tier}
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.lastVisit}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" title="Redeem Points">
                        <Gift className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit Customer">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete Customer" className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

