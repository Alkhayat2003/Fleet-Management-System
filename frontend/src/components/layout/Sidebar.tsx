'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '../../styles/colors';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  Button
} from '@mui/material';
import {
  Dashboard,
  DirectionsCar,
  Route,
  Map,
  Assessment,
  People,
  ChevronRight,
  Speed,
  Menu,
  Logout,
  Person
} from '@mui/icons-material';

const drawerWidth = 240;
const collapsedWidth = 70;

const links = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: <Dashboard /> },
  { href: '/vehicles', label: 'المركبات', icon: <DirectionsCar /> },
  { href: '/trips', label: 'الرحلات', icon: <Route /> },
  { href: '/tracking', label: 'التتبع', icon: <Map /> },
  { href: '/users', label: 'المستخدمين', icon: <People /> },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: isOpen ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isOpen ? drawerWidth : collapsedWidth,
          boxSizing: 'border-box',
          background: colors.gradients.sidebar,
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          position: 'relative',
          height: '100vh',
          zIndex: 1200,
          boxShadow: colors.shadows.large,
        },
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'white'
        }}
      >
        {/* زر التبديل */}
        <Box sx={{ 
          p: 1.5, 
          display: 'flex',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <IconButton 
            onClick={onToggle} 
            sx={{
              color: '#fbbf24',
              background: 'rgba(251, 191, 36, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(251, 191, 36, 0.3)',
              transition: 'all 0.3s ease-in-out',
              width: 40,
              height: 40,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -2,
                right: -2,
                bottom: -2,
                left: -2,
                background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
                borderRadius: '50%',
                zIndex: -1,
                opacity: 0.3
              },
              '&:hover': {
                background: 'rgba(251, 191, 36, 0.2)',
                transform: 'scale(1.1)',
                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
                border: '2px solid rgba(251, 191, 36, 0.5)',
                '&::before': {
                  opacity: 0.5
                }
              }
            }}
          >
            {isOpen ? (
              <ChevronRight sx={{ 
                fontSize: 20,
                color: '#fbbf24',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
              }} />
            ) : (
              <Menu sx={{ 
                fontSize: 20,
                color: '#fbbf24',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
              }} />
            )}
          </IconButton>
        </Box>

        {/* شعار النظام + رابط الملف الشخصي */}
        {isOpen && (
          <Box sx={{ 
            p: 2, 
            textAlign: 'center',
            transition: 'all 0.3s ease-in-out',
            opacity: 1,
            flexShrink: 0
          }}>
            <Link href="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Box sx={{
                width: 60,
                height: 60,
                mx: 'auto',
                mb: 1.5,
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                }
              }}>
                <Person sx={{ fontSize: 36, color: 'white' }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  textAlign: 'center',
                  opacity: 1,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  mb: 0.5,
                  fontSize: '0.9rem'
                }}
              >
                مرحباً {user?.first_name || 'بك'}
              </Typography>
            </Link>
          </Box>
        )}
        <Divider sx={{ 
          mx: 1.5, 
          mb: 1.5, 
          flexShrink: 0,
          borderColor: 'rgba(255, 255, 255, 0.2)'
        }} />

        {/* قائمة الروابط */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <List sx={{ 
            px: isOpen ? 1.5 : 0,
            pt: isOpen ? 0 : 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: isOpen ? 'stretch' : 'center',
            gap: isOpen ? 0 : 0.5
          }}>
            {links.map((link, index) => {
              const isActive = pathname === link.href;
              
              return (
                <ListItem 
                  key={link.href} 
                  disablePadding 
                  sx={{
                    mb: isOpen ? 0.5 : 0,
                    transition: 'all 0.3s ease-in-out',
                    transitionDelay: isOpen ? `${index * 0.05}s` : '0s',
                    transform: isOpen ? 'translateX(0)' : 'translateX(5px)',
                    opacity: isOpen ? 1 : 0.8,
                    width: isOpen ? 'auto' : '100%',
                    display: 'flex',
                    justifyContent: isOpen ? 'stretch' : 'center'
                  }}
                >
                  {isOpen ? (
                    <ListItemButton
                      component={Link}
                      href={link.href}
                      sx={{
                        borderRadius: 2,
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        color: 'white',
                        transition: 'all 0.3s ease-in-out',
                        backdropFilter: isActive ? 'blur(10px)' : 'none',
                        border: isActive ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                        py: 1,
                        px: 1.5,
                        '&:hover': {
                          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateX(-3px)',
                          backdropFilter: 'blur(10px)',
                        },
                        '& .MuiListItemIcon-root': {
                          color: '#fbbf24',
                          transition: 'all 0.3s ease-in-out',
                          minWidth: 36
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {link.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={link.label}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 700 : 500,
                          fontSize: '0.85rem',
                          color: 'white'
                        }}
                      />
                      {/* Removed badge from here */}
                    </ListItemButton>
                  ) : (
                    <Tooltip title={link.label} placement="left">
                      <ListItemButton
                        component={Link}
                        href={link.href}
                        sx={{
                          borderRadius: '12px',
                          minHeight: 45,
                          width: 45,
                          height: 45,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                          color: 'white',
                          transition: 'all 0.3s ease-in-out',
                          display: 'flex',
                          backdropFilter: isActive ? 'blur(10px)' : 'none',
                          border: isActive ? '2px solid rgba(255, 255, 255, 0.3)' : '2px solid transparent',
                          '&:hover': {
                            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                            transform: 'scale(1.1)',
                            backdropFilter: 'blur(10px)',
                          },
                          '& .MuiListItemIcon-root': {
                            color: '#fbbf24',
                            minWidth: 'auto',
                            transition: 'all 0.3s ease-in-out'
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 'auto' }}>
                          {link.icon}
                        </ListItemIcon>
                      </ListItemButton>
                    </Tooltip>
                  )}
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* زر تسجيل الخروج */}
        <Box sx={{ 
          p: isOpen ? 2 : 1.5, 
          flexShrink: 0
        }}>
          <Divider sx={{ 
            mb: isOpen ? 1.5 : 1,
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }} />
          
          {isOpen ? (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Logout />}
              onClick={logout}
              sx={{
                color: '#ef4444',
                borderColor: 'rgba(239, 68, 68, 0.5)',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 2,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  background: 'rgba(239, 68, 68, 0.2)',
                  borderColor: 'rgba(239, 68, 68, 0.7)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                },
                '& .MuiButton-startIcon': {
                  color: '#ef4444'
                }
              }}
            >
              تسجيل الخروج
            </Button>
          ) : (
            <Tooltip title="تسجيل الخروج" placement="left">
              <IconButton
                onClick={logout}
                sx={{
                  color: '#ef4444',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '2px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  width: 45,
                  height: 45,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '2px solid rgba(239, 68, 68, 0.5)',
                    transform: 'scale(1.1)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }
                }}
              >
                <Logout sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* معلومات إضافية */}
        <Box sx={{ 
          p: isOpen ? 2 : 1.5, 
          textAlign: 'center',
          transition: 'all 0.3s ease-in-out',
          opacity: isOpen ? 1 : 0.7,
          flexShrink: 0
        }}>
          {isOpen ? (
            <Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 0.5, 
                mb: 1 
              }}>
                <Speed sx={{ fontSize: 14, color: '#fbbf24' }} />
                <Typography 
                  variant="caption" 
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 600,
                    fontSize: '0.7rem'
                  }}
                >
                  نظام متقدم
                </Typography>
              </Box>
              <Typography 
                variant="caption" 
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  display: 'block',
                  fontSize: '0.65rem'
                }}
              >
                Fleet Management © 2024
              </Typography>
            </Box>
          ) : (
            <Box sx={{ height: 10 }} />
          )}
        </Box>
      </Box>
    </Drawer>
  );
} 