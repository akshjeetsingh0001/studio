
'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { LogIn, LogOut } from 'lucide-react'; // Import icons for toast

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string } | null;
  isLoading: boolean;
  login: (usernameInput: string, passwordInput: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'dineSwiftAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast(); // Initialize useToast

  const hardcodedUsername = 'aksh';
  const hardcodedPassword = 'aksh';

  const loadUserFromStorage = useCallback(() => {
    setIsLoading(true);
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        if (authData.isAuthenticated && authData.user) {
          setUser(authData.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to load auth state from storage:", error);
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login');
    } else if (!isLoading && user && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [user, isLoading, router, pathname]);
  

  const login = async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    if (usernameInput === hardcodedUsername && passwordInput === hardcodedPassword) {
      const userData = { username: usernameInput };
      setUser(userData);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ isAuthenticated: true, user: userData }));
      toast({
        title: "Login Successful!",
        description: `Welcome back, ${usernameInput}! Redirecting...`,
        icon: <LogIn className="h-5 w-5 text-green-500" />,
      });
      setIsLoading(false);
      router.push('/dashboard');
      return true;
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Toast for login failure is handled in LoginPage.tsx
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    const currentUsername = user?.username;
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    toast({
      title: "Logged Out Successfully",
      description: currentUsername ? `Goodbye, ${currentUsername}!` : "You have been logged out.",
      icon: <LogOut className="h-5 w-5" />,
    });
    router.push('/login');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
