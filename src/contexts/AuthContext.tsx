
'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { LogIn, LogOut } from 'lucide-react';

interface User {
  username: string;
  role?: 'admin' | 'kitchen'; // Added role
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (usernameInput: string, passwordInput: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'dineSwiftAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const hardcodedAdminUsername = 'aksh';
  const hardcodedAdminPassword = 'aksh';
  const hardcodedKitchenUsername = 'kitchen';
  const hardcodedKitchenPassword = 'kitchen';

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
      router.replace('/login');
    } else if (!isLoading && user && pathname === '/login') {
      // Role-based redirect from login page if already authenticated
      if (user.role === 'kitchen') {
        router.replace('/kitchen');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, isLoading, router, pathname]);
  

  const login = async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call

    let userData: User | null = null;

    if (usernameInput === hardcodedAdminUsername && passwordInput === hardcodedAdminPassword) {
      userData = { username: usernameInput, role: 'admin' };
    } else if (usernameInput === hardcodedKitchenUsername && passwordInput === hardcodedKitchenPassword) {
      userData = { username: usernameInput, role: 'kitchen' };
    }

    if (userData) {
      setUser(userData);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ isAuthenticated: true, user: userData }));
      toast({
        title: "Login Successful!",
        description: `Welcome, ${userData.username}! Redirecting...`,
        icon: <LogIn className="h-5 w-5 text-green-500" />,
      });
      setIsLoading(false);
      if (userData.role === 'kitchen') {
        router.push('/kitchen');
      } else {
        router.push('/dashboard');
      }
      return true;
    }
    
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
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
