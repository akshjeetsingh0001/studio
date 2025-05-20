
'use client';

import type React from 'react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLogo from '@/components/AppLogo';
import { Loader2, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate a short delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    const success = await login(username, password);
    if (!success) {
      toast({
        title: "Login Failed",
        description: "Incorrect username or password. Please try again.",
        variant: "destructive",
      });
    }
    // Keep loading true until redirect or if login fails then set to false.
    // The AuthContext handles redirect, so setIsLoading(false) here is mainly for the error case.
    if (!success) {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-900 dark:to-sky-800 p-4 transition-colors duration-300">
      <Card className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden animate-fadeIn">
        <CardHeader className="items-center text-center p-8 bg-background/80 backdrop-blur-sm">
          <AppLogo iconSize={48} textSize="text-4xl" className="mb-6" />
          <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
          <CardDescription className="mt-2 text-muted-foreground pb-2">
            Enter your credentials to access your DineSwift dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="e.g., aksh"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="h-12 text-base px-4 rounded-lg focus:ring-primary/50 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-12 text-base px-4 rounded-lg focus:ring-primary/50 focus:border-primary"
              />
            </div>
            <Button type="submit" size="lg" className="w-full h-14 text-lg font-semibold rounded-lg transition-transform hover:scale-105 active:scale-95" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col text-center p-6 bg-muted/30">
          <p className="text-xs text-muted-foreground/80">
            For demo: use username <b className="text-foreground/90">aksh</b> and password <b className="text-foreground/90">aksh</b>.
          </p>
          <p className="mt-4 text-xs text-muted-foreground/70">
            &copy; {new Date().getFullYear()} DineSwift POS. All rights reserved.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
