'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg, #fff)',
      borderRadius: 24,
      boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      margin: '40px auto',
      maxWidth: 420,
      padding: 32,
    }}>
      <div style={{ marginBottom: 24 }}>
        <ShieldAlert size={72} color="#FF6B6B" />
      </div>
      <h2 style={{ color: '#FF6B6B', fontWeight: 700, fontSize: 32, marginBottom: 16 }}>وصول غير مصرح</h2>
      <p style={{ color: '#222', fontSize: 20, textAlign: 'center', lineHeight: 1.7 }}>
        هذا التطبيق مخصص للمشرفين والمديرين فقط.<br />
        يرجى التواصل مع الإدارة إذا كنت تعتقد أن هناك خطأ في حسابك.
      </p>
      <button
        onClick={handleLogout}
        style={{
          marginTop: 32,
          background: '#667EEA',
          color: '#fff',
          fontWeight: 700,
          fontSize: 18,
          border: 'none',
          borderRadius: 24,
          padding: '14px 32px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(102,126,234,0.12)',
          letterSpacing: 1,
        }}
      >
        العودة إلى تسجيل الدخول
      </button>
    </div>
  );
} 