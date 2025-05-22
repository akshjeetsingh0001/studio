
import type React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Undo, Users, CreditCard, Printer,Percent, PlusCircle as PlusCircleIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings & Configuration" description="Manage system-wide settings for your restaurant.">
        <div className="flex gap-2">
          <Button variant="outline">
            <Undo className="mr-2 h-4 w-4" /> Reset to Defaults
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="taxes">Tax Rates</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="printers">Printers</TabsTrigger>
          <TabsTrigger value="users">Users & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic information and operational settings for your restaurant.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="restaurantName">Restaurant Name</Label>
                  <Input id="restaurantName" defaultValue="Seera Bistro" />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                   <Select defaultValue="USD">
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue="123 Foodie Lane, Flavor Town, USA" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="onlineOrdering" defaultChecked />
                <Label htmlFor="onlineOrdering">Enable Online Ordering</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="tableReservations" />
                <Label htmlFor="tableReservations">Enable Table Reservations</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Tax Rates</CardTitle>
              <CardDescription>Manage tax rates applicable to your sales.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="salesTaxName">Tax Name</Label>
                  <Input id="salesTaxName" defaultValue="Sales Tax" />
                </div>
                <div className="w-1/4">
                  <Label htmlFor="salesTaxRate">Rate (%)</Label>
                  <Input id="salesTaxRate" type="number" defaultValue="8.25" />
                </div>
                <Button variant="outline" className="whitespace-nowrap"><PlusCircleIcon className="mr-2 h-4 w-4"/> Add Tax Rate</Button>
              </div>
               <div className="flex items-center space-x-2">
                <Switch id="taxInclusivePricing" />
                <Label htmlFor="taxInclusivePricing">Prices are tax inclusive</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Payment Gateway Settings</CardTitle>
              <CardDescription>Configure your payment processing options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-primary" />
                    <div>
                        <Label htmlFor="stripeConnect" className="font-semibold">Stripe</Label>
                        <p className="text-xs text-muted-foreground">Connect your Stripe account for card payments.</p>
                    </div>
                </div>
                <Button variant={true ? "default" : "outline"}>
                  {true ? "Connected" : "Connect"}
                </Button>
              </div>
               <div className="flex items-center justify-between rounded-lg border p-4">
                 <div className="flex items-center gap-3">
                    <Percent className="h-6 w-6 text-primary" />
                    <div>
                        <Label htmlFor="paypalConnect" className="font-semibold">Tip Suggestions</Label>
                        <p className="text-xs text-muted-foreground">Default tip percentages (e.g., 15,18,20).</p>
                    </div>
                </div>
                 <Input id="tipSuggestions" defaultValue="15,18,20,25" className="w-1/3"/>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="printers">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Printer Configuration</CardTitle>
              <CardDescription>Set up receipt and kitchen printers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between rounded-lg border p-4">
                 <div className="flex items-center gap-3">
                    <Printer className="h-6 w-6 text-primary" />
                    <div>
                        <Label htmlFor="receiptPrinter" className="font-semibold">Receipt Printer</Label>
                        <p className="text-xs text-muted-foreground">Epson TM-T88VI (Network)</p>
                    </div>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
               <div className="flex items-center justify-between rounded-lg border p-4">
                 <div className="flex items-center gap-3">
                    <Printer className="h-6 w-6 text-primary" />
                    <div>
                        <Label htmlFor="kitchenPrinter" className="font-semibold">Kitchen Printer</Label>
                        <p className="text-xs text-muted-foreground">Star SP700 (Kitchen)</p>
                    </div>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
              <Button variant="default" className="mt-2"><PlusCircleIcon className="mr-2 h-4 w-4"/> Add New Printer</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
           <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage staff accounts and permissions.</CardDescription>
              </div>
               <Button variant="outline"><Users className="mr-2 h-4 w-4" /> Add User</Button>
            </CardHeader>
            <CardContent>
             {/* User table would go here */}
             <p className="text-muted-foreground">User management table will be displayed here, allowing addition, editing, and role assignment for staff members.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
