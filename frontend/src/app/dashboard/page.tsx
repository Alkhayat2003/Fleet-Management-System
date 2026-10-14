'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '../../styles/colors';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  CircularProgress,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  DirectionsCar,
  Route,
  Speed,
  CheckCircle,
  TrendingUp,
  Visibility,
  Build
} from '@mui/icons-material';
import { Vehicle, Trip, DashboardStats } from '@/types';
import { apiService } from '@/services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiService.getDashboardStats()
      .then((res: any) => {
        // If backend returns {success, stats}, extract stats
        if (res && res.stats) {
          setStats(res.stats);
        } else {
          setStats(res);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('فشل في جلب بيانات لوحة التحكم');
        setLoading(false);
      });
    // جلب آخر الرحلات
    setTripsLoading(true);
    setTripsError(null);
    apiService.getRecentTrips()
      .then((data) => {
        setRecentTrips(data);
        setTripsLoading(false);
      })
      .catch(() => {
        setTripsError('فشل في جلب آخر الرحلات');
        setTripsLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        width: '100%',
        background: colors.gradients.card1
      }}>
        <Box sx={{ textAlign: 'center', color: colors.text.inverse }}>
          <CircularProgress size={50} sx={{ color: colors.text.inverse, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            جاري تحميل لوحة التحكم...
          </Typography>
        </Box>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  // استخدم القيم الحقيقية من DashboardStats
  const totalVehicles = stats?.total_vehicles ?? 0;
  const activeTrips = stats?.active_trips ?? 0;
  const trackedVehicles = stats?.tracked_vehicles ?? 0;
  const vehiclesInMaintenance = stats?.vehicles_in_maintenance ?? 0;
  const completedTripsToday = stats?.completed_trips_today ?? 0;

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      background: colors.background.secondary,
      display: 'flex',
      flexDirection: 'column',
      p: 2
    }}>
      {/* العنوان الرئيسي مع تأثيرات */}
      <Box sx={{ 
        pb: 2,
        textAlign: 'right',
        flexShrink: 0
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800, 
            color: colors.text.primary,
            mb: 0.5,
            textShadow: '0 2px 8px rgba(17, 24, 39, 0.1)',
            fontSize: '1.8rem'
          }}
        >
          لوحة التحكم
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: colors.text.secondary,
            fontWeight: 500,
            opacity: 0.9,
            fontSize: '0.9rem'
          }}
        >
          نظرة شاملة على نظام إدارة الأسطول
        </Typography>
      </Box>

      {/* البطاقات الإحصائية المحسنة */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'nowrap', 
        gap: 1, 
        pb: 2,
        justifyContent: 'space-between',
        flexShrink: 0,
        width: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        <Card sx={{ 
          background: colors.gradients.card1,
          color: colors.text.inverse,
          flex: 1,
          minWidth: 0,
          maxWidth: '20%',
          borderRadius: 4,
          boxShadow: colors.shadows.card,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            transform: 'translateY(-6px) scale(1.02)',
            boxShadow: colors.shadows.large,
          }
        }}>
          <CardContent sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, fontSize: '1.6rem' }}>
                  {totalVehicles}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 600, fontSize: '0.8rem' }}>
                  إجمالي المركبات
                </Typography>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)', 
                width: 40, 
                height: 40,
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}>
                <DirectionsCar sx={{ fontSize: 20 }} />
              </Avatar>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={75} 
              sx={{ 
                height: 4, 
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.15)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                  borderRadius: 2
                }
              }} 
            />
          </CardContent>
        </Card>

        <Card sx={{ 
          background: colors.gradients.card2,
          color: colors.text.inverse,
          flex: 1,
          minWidth: 0,
          maxWidth: '20%',
          borderRadius: 4,
          boxShadow: colors.shadows.accent,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            transform: 'translateY(-6px) scale(1.02)',
            boxShadow: '0 12px 40px rgba(217, 119, 6, 0.3)',
          }
        }}>
          <CardContent sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, fontSize: '1.6rem' }}>
                  {trackedVehicles}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 600, fontSize: '0.8rem' }}>
                  المركبات النشطة
                </Typography>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)', 
                width: 40, 
                height: 40,
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}>
                <Speed sx={{ fontSize: 20 }} />
              </Avatar>
            </Box>
            <Chip 
              label="مستقر" 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)', 
                color: 'white',
                fontWeight: 600,
                height: 20,
                fontSize: '0.7rem',
                border: '1px solid rgba(255,255,255,0.2)'
              }} 
            />
          </CardContent>
        </Card>

        <Card sx={{ 
          background: colors.gradients.card5,
          color: colors.text.inverse,
          flex: 1,
          minWidth: 0,
          maxWidth: '20%',
          borderRadius: 4,
          boxShadow: colors.shadows.accent,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            transform: 'translateY(-6px) scale(1.02)',
            boxShadow: '0 12px 40px rgba(217, 119, 6, 0.3)',
          }
        }}>
          <CardContent sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, fontSize: '1.6rem' }}>
                  {vehiclesInMaintenance}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 600, fontSize: '0.8rem' }}>
                  المركبات في الصيانة
                </Typography>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)', 
                width: 40, 
                height: 40,
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}>
                <Build sx={{ fontSize: 20 }} />
              </Avatar>
            </Box>
            <Chip 
              label="تحتاج انتباه" 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)', 
                color: 'white',
                fontWeight: 600,
                height: 20,
                fontSize: '0.7rem',
                border: '1px solid rgba(255,255,255,0.2)'
              }} 
            />
          </CardContent>
        </Card>

        <Card sx={{ 
          background: colors.gradients.card3,
          color: colors.text.inverse,
          flex: 1,
          minWidth: 0,
          maxWidth: '20%',
          borderRadius: 4,
          boxShadow: colors.shadows.card,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            transform: 'translateY(-6px) scale(1.02)',
            boxShadow: colors.shadows.large,
          }
        }}>
          <CardContent sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, fontSize: '1.6rem' }}>
                  {activeTrips}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 600, fontSize: '0.8rem' }}>
                  الرحلات النشطة
                </Typography>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)', 
                width: 40, 
                height: 40,
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}>
                <Route sx={{ fontSize: 20 }} />
              </Avatar>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem', fontWeight: 500 }}>
                +12% من الأسبوع الماضي
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          background: colors.gradients.card4,
          color: colors.text.inverse,
          flex: 1,
          minWidth: 0,
          maxWidth: '20%',
          borderRadius: 4,
          boxShadow: colors.shadows.card,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            transform: 'translateY(-6px) scale(1.02)',
            boxShadow: colors.shadows.large,
          }
        }}>
          <CardContent sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, fontSize: '1.6rem' }}>
                  {completedTripsToday}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 600, fontSize: '0.8rem' }}>
                  الرحلات المكتملة
                </Typography>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)', 
                width: 40, 
                height: 40,
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}>
                <CheckCircle sx={{ fontSize: 20 }} />
              </Avatar>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Visibility sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem', fontWeight: 500 }}>
                98% معدل النجاح
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* جدول آخر الرحلات */}
      <Box sx={{ mt: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 2, minWidth: 320, borderRadius: 4, boxShadow: colors.shadows.card, p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>آخر الرحلات</Typography>
          <Box sx={{ overflowX: 'auto' }}>
            {tripsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 80 }}>
                <CircularProgress size={28} />
              </Box>
            ) : tripsError ? (
              <Typography color="error" sx={{ p: 2 }}>{tripsError}</Typography>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.97rem' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '8px', textAlign: 'right' }}>الحالة</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>السائق</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>المركبة</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrips.map((trip) => (
                    <tr key={trip.id}>
                      <td style={{ padding: '8px' }}>
                        {trip.status === 'completed' && <Chip label="مكتملة" color="success" size="small" />}
                        {trip.status === 'in_progress' && <Chip label="جارية" color="warning" size="small" />}
                        {trip.status === 'planned' && <Chip label="مخططة" color="info" size="small" />}
                        {trip.status === 'cancelled' && <Chip label="ملغاة" color="error" size="small" />}
                      </td>
                      <td style={{ padding: '8px' }}>{trip.driver}</td>
                      <td style={{ padding: '8px' }}>{trip.vehicle}</td>
                      <td style={{ padding: '8px' }}>{trip.start_time ? trip.start_time.split('T')[0] : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Box>
        </Card>
        {/* رسم بياني بسيط لعدد الرحلات المكتملة يومياً */}
        <Card sx={{ flex: 1, minWidth: 260, borderRadius: 4, boxShadow: colors.shadows.card, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>عدد الرحلات المكتملة (7 أيام)</Typography>
          {/* رسم بياني SVG بسيط */}
          <Box sx={{ width: '100%', height: 120, display: 'flex', alignItems: 'flex-end', gap: 1, pb: 1 }}>
            {/* بيانات تجريبية */}
            {[5, 7, 3, 8, 6, 4, 9].map((val, idx) => (
              <Box key={idx} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: 18, height: `${val * 10}px`, bgcolor: '#fbbf24', borderRadius: 1, mb: 0.5 }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#888' }}>{`يوم ${idx+1}`}</Typography>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>
    </Box>
  );
} 