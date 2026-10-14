'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, LoginRequest, LoginResponse, User } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const isAuthenticated = !!user;

  // تجنب مشاكل Hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // التحقق من وجود token عند تحميل التطبيق
  useEffect(() => {
    if (!mounted) return;

    const initializeAuth = async () => {
      // التأكد من أننا في المتصفح
      if (typeof window === 'undefined') return;

      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (accessToken && refreshToken) {
        try {
          // محاولة الحصول على معلومات المستخدم
          const userData = await apiService.getProfile();
          setUser(userData);
        } catch (error) {
          // إذا فشل الحصول على معلومات المستخدم، محاولة تحديث token
          try {
            const tokens = await apiService.refreshToken(refreshToken);
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);
            
            const userData = await apiService.getProfile();
            setUser(userData);
          } catch (refreshError) {
            // إذا فشل تحديث token، مسح البيانات المحلية
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [mounted]);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response: LoginResponse = await apiService.login(credentials);
      
      // حفظ tokens في localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
      }
      
      // حفظ معلومات المستخدم
      setUser({ ...response.user, updated_at: 'updated_at' in response.user ? (response.user as any).updated_at : undefined });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('حدث خطأ في تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await apiService.logout(refreshToken);
        }
      }
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    } finally {
      // مسح البيانات المحلية
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await apiService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('خطأ في تحديث معلومات المستخدم:', error);
      // إذا فشل الحصول على معلومات المستخدم، تسجيل الخروج
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 