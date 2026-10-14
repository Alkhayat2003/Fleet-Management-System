import { Toaster } from 'react-hot-toast';
import { colors } from '../../styles/colors';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: colors.neutral[800],
            color: colors.text.inverse,
            borderRadius: '8px',
            padding: '12px 16px',
            boxShadow: colors.shadows.medium,
          },
        }}
      />
    </>
  );
} 