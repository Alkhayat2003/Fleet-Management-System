'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import { colors } from '../../styles/colors';
import UnauthorizedPage from '../UnauthorizedPage';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Always call hooks at the top level
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated && pathname !== '/login') {
      router.push('/login');
    } else if (isAuthenticated && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, pathname, router, mounted]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // تجنب مشاكل Hydration
  if (!mounted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.gradients.card1,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            sx={{ 
              color: colors.text.inverse,
              mb: 2
            }} 
          />
          <Box
            sx={{
              color: colors.text.inverse,
              fontSize: '1.1rem',
              fontWeight: 500
            }}
          >
            جاري تحميل النظام...
          </Box>
        </Box>
      </Box>
    );
  }

  // إذا كان التطبيق في حالة تحميل
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.gradients.card1,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            sx={{ 
              color: colors.text.inverse,
              mb: 2
            }} 
          />
          <Box
            sx={{
              color: colors.text.inverse,
              fontSize: '1.1rem',
              fontWeight: 500
            }}
          >
            جاري تحميل النظام...
          </Box>
        </Box>
      </Box>
    );
  }

  // إضافة منطق التحقق من الدور لعرض UnauthorizedPage إذا لم يكن المستخدم مشرفًا أو مديرًا.
  if (isAuthenticated && user && user.role !== 'admin' && user.role !== 'manager') {
    return <UnauthorizedPage />;
  }

  // إذا لم يكن المستخدم مسجل دخول وليس في صفحة تسجيل الدخول
  if (!isAuthenticated && pathname !== '/login') {
    return null;
  }

  // إذا كان المستخدم مسجل دخول وهو في صفحة تسجيل الدخول
  if (isAuthenticated && pathname === '/login') {
    router.push('/dashboard');
    return null;
  }

  // إذا كان في صفحة تسجيل الدخول، لا نعرض Sidebar وHeader
  if (pathname === '/login') {
    return <>{children}</>;
  }

  const sidebarWidth = sidebarOpen ? 280 : 70;

  // للصفحات الأخرى، نعرض Layout كامل مع Sidebar وHeader
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar ثابت */}
      <Box sx={{ 
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        zIndex: 1200,
        width: sidebarWidth,
        transition: 'width 0.3s ease'
      }}>
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      </Box>
      
      {/* المحتوى الرئيسي */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        background: colors.background.primary,
        marginRight: `${sidebarWidth}px`,
        transition: 'margin-right 0.3s ease'
      }}>
        {/* Header ثابت */}
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: `${sidebarWidth}px`,
          height: 64,
          zIndex: 1100,
          background: colors.background.primary,
          borderBottom: `1px solid ${colors.border.light}`,
          transition: 'right 0.3s ease'
        }}>
          <Header />
        </Box>
        
        {/* المحتوى */}
        <Box sx={{ 
          flex: 1, 
          pt: 8, // مساحة للHeader
          overflow: 'auto',
          minHeight: '100vh'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
} 