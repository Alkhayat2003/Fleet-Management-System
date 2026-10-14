'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '../styles/colors';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // التحقق من وجود token
    const token = localStorage.getItem('access_token');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.gradients.card1,
        color: colors.text.inverse
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div 
          style={{
            width: '48px',
            height: '48px',
            border: `3px solid ${colors.text.inverse}`,
            borderTop: `3px solid transparent`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}
        />
        <p style={{ marginTop: '16px', color: colors.text.inverse, opacity: 0.9 }}>
          جاري التوجيه...
        </p>
      </div>
    </div>
  );
}
