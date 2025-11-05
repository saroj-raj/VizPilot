'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  role: string;
  is_active: boolean;
}

interface SignupData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: SignupData) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Mock user for testing
          const mockUser = JSON.parse(localStorage.getItem('mock_user') || 'null');
          if (mockUser) {
            setUser(mockUser);
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      // Mock login for testing - determine role from email
      const role = email.includes('ceo') || email.includes('admin') ? 'admin' :
                   email.includes('cfo') || email.includes('finance') ? 'finance' :
                   email.includes('manager') ? 'manager' : 'employee';
      
      const mockUser: User = {
        id: 1,
        email: email,
        username: email.split('@')[0],
        full_name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        role: role,
        is_active: true,
      };
      
      localStorage.setItem('access_token', 'mock_token');
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      // Redirect to role-specific dashboard (admin, finance, manager, or employee)
      router.push(`/dashboard/${role}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setError(null);
    setLoading(true);

    try {
      // Mock signup for testing
      const mockUser: User = {
        id: Date.now(),
        email: userData.email,
        username: userData.username,
        full_name: userData.full_name,
        role: userData.role,
        is_active: true,
      };
      
      localStorage.setItem('access_token', 'mock_token');
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      // Redirect to role-specific dashboard
      router.push(`/dashboard/${mockUser.role}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('mock_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        isAuthenticated: !!user,
        loading,
        error,
      }}
    >
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
