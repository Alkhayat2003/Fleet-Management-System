'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginRequest } from '@/services/api';
import {
  Box, 
  Card, 
  CardContent, 
  TextField,
  Button,
  Typography,
  IconButton, 
  InputAdornment,
  Alert,
  Container,
  Avatar,
  Divider,
  LinearProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Person, 
  Lock,
  DirectionsCar,
  Security,
  Speed
} from '@mui/icons-material';
import { colors } from '../../styles/colors';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: ''
  });
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(formData);
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'فشل في تسجيل الدخول';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.gradients.card1,
        padding: 1.5,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto'
      }}
    >
      {/* تأثيرات الخلفية */}
      <Box
        sx={{
          position: 'absolute',
          top: -40,
          left: -40,
          width: 150,
          height: 150,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -60,
          right: -60,
          width: 200,
          height: 200,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 300,
          height: 300,
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '50%',
          animation: 'pulse 4s ease-in-out infinite'
        }}
      />

      <Container maxWidth="sm" sx={{ width: '100%' }}>
        <Card
          elevation={20}
          sx={{
            borderRadius: 3,
            overflow: 'visible',
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
            }
          }}
        >
          {/* شعار أعلى البطاقة */}
          <Box sx={{ 
            position: 'absolute',
            top: -40,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1
          }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 12px 25px rgba(102, 126, 234, 0.4)',
                border: '3px solid white',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                }
              }}
            >
              <DirectionsCar sx={{ fontSize: 40 }} />
            </Avatar>
          </Box>

          <CardContent sx={{ padding: 3, paddingTop: 6 }}>
            {/* العنوان */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1.5,
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                نظام إدارة الأسطول
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#666',
                  textAlign: 'center',
                  fontSize: '1rem',
                  fontWeight: 500,
                  opacity: 0.8
                }}
              >
                تسجيل الدخول للوصول إلى لوحة التحكم المتقدمة
              </Typography>
            </Box>

            {/* شريط التقدم */}
            {isLoading && (
              <Box sx={{ mb: 2.5 }}>
                <LinearProgress 
                  sx={{ 
                    height: 3, 
                    borderRadius: 2,
                    background: 'rgba(102, 126, 234, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }
                  }} 
                />
              </Box>
            )}

            {/* نموذج تسجيل الدخول */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1.5 }}>
              {/* حقل اسم المستخدم */}
              <TextField
                fullWidth
                id="username"
                name="username"
                label="اسم المستخدم"
                variant="outlined"
                placeholder="أدخل اسم المستخدم"
                value={formData.username}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 3px 8px rgba(102, 126, 234, 0.15)',
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 3px 8px rgba(102, 126, 234, 0.25)',
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
                helperText="اسم المستخدم هو معرفك للدخول للنظام"
              />
              
              {/* حقل كلمة المرور */}
              <TextField
                fullWidth
                id="password"
                name="password"
                label="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                placeholder="أدخل كلمة المرور"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                sx={{ 
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 3px 8px rgba(102, 126, 234, 0.15)',
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 3px 8px rgba(102, 126, 234, 0.25)',
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        tabIndex={-1}
                        sx={{ color: '#667eea' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText="كلمة المرور حساسة لحالة الأحرف"
              />

              {/* رسالة الخطأ */}
              {error && (
                <Alert 
                  severity="error" 
                  sx={{
                    mb: 2.5,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: '#f44336'
                    }
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* زر تسجيل الدخول */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  mt: 1.5,
                  mb: 2.5,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #ccc 0%, #999 100%)',
                    transform: 'none',
                    boxShadow: 'none',
                  }
                }}
              >
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>

              <Divider sx={{ my: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Security sx={{ color: '#667eea', fontSize: 18 }} />
                  <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                    معلومات الأمان
                  </Typography>
                </Box>
              </Divider>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 1.5,
                p: 1.5,
                background: 'rgba(102, 126, 234, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(102, 126, 234, 0.1)'
              }}>
                <Speed sx={{ color: '#667eea' }} />
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '0.85rem',
                    fontWeight: 500
                  }}
                >
                  في حالة نسيان كلمة المرور، تواصل مع مدير النظام
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.05); }
          }
        `}</style>
      </Container>
    </Box>
  );
}