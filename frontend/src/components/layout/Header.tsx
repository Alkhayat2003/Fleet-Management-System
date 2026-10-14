'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar
} from '@mui/material';
import {
  DirectionsCarFilled
} from '@mui/icons-material';
import { colors } from '../../styles/colors';

export default function Header() {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: 1100,
        background: colors.gradients.header,
        boxShadow: colors.shadows.header
      }}
    >
      <Toolbar sx={{ 
        minHeight: 64,
        justifyContent: 'center'
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -2,
                right: -2,
                bottom: -2,
                left: -2,
                background: 'linear-gradient(45deg, #d97706, #f59e0b)',
                borderRadius: '50%',
                zIndex: -1,
                opacity: 0.3
              }
            }}
          >
            <DirectionsCarFilled sx={{ fontSize: 20, color: colors.text.inverse }} />
          </Avatar>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: colors.text.inverse,
              fontSize: '1.2rem',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -4,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: 2,
                background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)',
                borderRadius: 1
              }
            }}
          >
            نظام إدارة الأسطول
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 