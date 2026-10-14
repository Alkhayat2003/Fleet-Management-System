'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Trip, Vehicle, User } from '@/types';
import { colors } from '../../styles/colors';
import { toast } from 'react-hot-toast';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  Tooltip,
  Snackbar
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  ConfirmationNumber,
  Search,
  Refresh,
  Person,
  DirectionsCar,
  LocationOn,
  CalendarToday,
  PlayArrow,
  Stop,
  Error
} from '@mui/icons-material';

interface TripFormData {
  vehicle: string;
  driver: string;
  start_time: string;
  end_time: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  estimated_distance?: string;
  created_by?: string;
  start_location?: string;
  end_location?: string;
  notes?: string; // Added for notes
}

const initialFormData: TripFormData = {
  vehicle: '',
  driver: '',
  start_time: '',
  end_time: '',
  status: 'planned',
  estimated_distance: '',
  start_location: '',
  end_location: '',
  notes: '' // Initialize notes
};

// دالة لتحويل العنوان إلى إحداثيات باستخدام Nominatim
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

// دالة geocoding عكسي
async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ar`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.display_name) {
      return data.display_name;
    }
    return null;
  } catch {
    return null;
  }
}

// أضف دالة حارس نوعي في الأعلى:
function isTrip(obj: any): obj is Trip {
  return obj && typeof obj === 'object' && typeof obj.id === 'number';
}

// أضف دالة مساعدة أعلى الكومبوننت:
function getId(val: any): number | undefined {
  if (!val) return undefined;
  if (typeof val === 'object' && val !== null && 'id' in val) return val.id;
  if (typeof val === 'number') return val;
  return undefined;
}

export default function TripsPage() {
  const { user: currentUser } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // حالة النماذج
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState<TripFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // حالة البحث والفلترة
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // تحميل الرحلات
  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tripsData, vehiclesData, usersData] = await Promise.all([
        apiService.getTrips(),
        apiService.getVehicles(),
        apiService.getUsers()
      ]);
      setTrips(Array.isArray(tripsData) ? tripsData.filter(isTrip) : []);
      setVehicles(vehiclesData);
      setUsers(usersData);
    } catch (err) {
      setError('فشل في تحميل قائمة الرحلات');
      console.error('Error loading trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const [locationNames, setLocationNames] = useState<Record<number, { start?: string; end?: string }>>({});

  useEffect(() => {
    // عند تحميل الرحلات، جلب أسماء المواقع لكل رحلة
    const fetchLocations = async () => {
      const names: Record<number, { start?: string; end?: string }> = {};
      for (const trip of trips) {
        if (!isTrip(trip)) continue;
        if (Array.isArray(trip.route_points) && trip.route_points.length >= 2) {
          const [start, end] = trip.route_points;
          let startName = '';
          let endName = '';
          if (start && start.lat && start.lon) {
            startName = await reverseGeocode(start.lat, start.lon) || '';
          }
          if (end && end.lat && end.lon) {
            endName = await reverseGeocode(end.lat, end.lon) || '';
          }
          names[trip.id] = { start: startName, end: endName };
        }
      }
      setLocationNames(names);
    };
    if (trips.length > 0) fetchLocations();
  }, [trips]);

  // فلترة الرحلات
  const filteredTrips: Trip[] = trips.filter((trip: Trip) => {
    const matchesSearch = 
      trip.id.toString().includes(searchTerm) ||
      (trip.driver?.toString() || '').includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
  };

  // فتح نموذج إنشاء رحلة جديدة
  const handleCreateTrip = () => {
    resetForm();
    // تعيين المستخدم الحالي كمنشئ للرحلة
    if (currentUser) {
      setFormData(prev => ({ ...prev, created_by: currentUser.id.toString() }));
    }
    setError(null);
    setOpenCreateDialog(true);
  };

  // فتح نموذج تعديل رحلة
  const handleEditTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    let start_location = '';
    let end_location = '';
    if (Array.isArray(trip.route_points) && trip.route_points.length >= 2) {
      start_location = `${trip.route_points[0].lat},${trip.route_points[0].lon}`;
      end_location = `${trip.route_points[1].lat},${trip.route_points[1].lon}`;
    }
    setFormData({
      vehicle: trip.vehicle ? String(typeof trip.vehicle === 'object' && trip.vehicle !== null ? trip.vehicle.id : trip.vehicle) : '',
      driver: trip.driver ? String(typeof trip.driver === 'object' && trip.driver !== null ? trip.driver.id : trip.driver) : '',
      start_time: trip.start_time,
      end_time: trip.end_time || '',
      status: trip.status,
      estimated_distance: trip.estimated_distance?.toString() || '',
      created_by: currentUser ? String(currentUser.id) : '',
      start_location,
      end_location,
      notes: trip.notes || '' // Set notes from trip
    });
    setError(null);
    setFormErrors({});
    setOpenEditDialog(true);
  };

  // فتح عرض تفاصيل الرحلة
  const handleViewTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setOpenViewDialog(true);
  };

  // فتح حذف رحلة
  const handleDeleteTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setOpenDeleteDialog(true);
  };

  // بدء رحلة
  const handleStartTrip = async (tripId: number) => {
    try {
      await apiService.startTrip(tripId);
      toast.success('تم بدء الرحلة بنجاح');
      loadTrips();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل في بدء الرحلة');
    }
  };

  // إنهاء رحلة
  const handleEndTrip = async (tripId: number) => {
    try {
      await apiService.endTrip(tripId);
      toast.success('تم إنهاء الرحلة بنجاح');
      loadTrips();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل في إنهاء الرحلة');
    }
  };

  // التحقق من صحة النموذج
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.vehicle) errors.vehicle = 'المركبة مطلوبة';
    if (!formData.driver) errors.driver = 'السائق مطلوب';
    if (!formData.start_time) errors.start_time = 'وقت البداية مطلوب';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // إنشاء رحلة جديدة
  const handleSubmitCreate = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    setError(null);
    try {
      let route_points = undefined;
      if (formData.start_location && formData.end_location) {
        const [start, end] = await Promise.all([
          geocodeAddress(formData.start_location),
          geocodeAddress(formData.end_location)
        ]);
        if (!start || !end) {
          setError('تعذر تحويل العناوين إلى إحداثيات. تحقق من صحة العناوين وحاول مرة أخرى.');
          setSubmitting(false);
          return;
        }
        route_points = [start, end];
      }
      const tripPayload = {
        ...formData,
        driver: formData.driver,
        vehicle: formData.vehicle,
        created_by: formData.created_by,
        estimated_distance: formData.estimated_distance,
        route_points
      };
      await apiService.createTrip(tripPayload);
      setSuccess('تمت إضافة الرحلة بنجاح');
      setOpenCreateDialog(false);
      loadTrips();
    } catch (err: any) {
      // معالجة أخطاء الحقول
      if (err.response?.data && typeof err.response.data === 'object') {
        const errors = err.response.data;
        const fieldErrors: Record<string, string> = {};
        let generalError = '';
        Object.entries(errors).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            if (['vehicle', 'driver', 'start_time', 'end_time', 'status', 'created_by', 'estimated_distance', 'route_points'].includes(key)) {
              fieldErrors[key] = value.join(' ');
            } else {
              generalError += value.join(' ') + ' ';
            }
          }
        });
        setFormErrors(fieldErrors);
        setError(generalError.trim() || '');
      } else {
        setError(err.response?.data?.message || 'فشل في إضافة الرحلة');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // تحديث رحلة
  const handleSubmitEdit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    setError(null);
    try {
      let route_points = undefined;
      if (formData.start_location && formData.end_location) {
        const [start, end] = await Promise.all([
          geocodeAddress(formData.start_location),
          geocodeAddress(formData.end_location)
        ]);
        if (!start || !end) {
          setError('تعذر تحويل العناوين إلى إحداثيات. تحقق من صحة العناوين وحاول مرة أخرى.');
          setSubmitting(false);
          return;
        }
        route_points = [start, end];
      }
      const tripPayload = {
        ...formData,
        driver: formData.driver,
        vehicle: formData.vehicle,
        created_by: formData.created_by,
        estimated_distance: formData.estimated_distance,
        route_points
      };
      console.log('tripPayload', tripPayload); // طباعة البيانات المرسلة
      if (selectedTrip) {
        await apiService.updateTrip(selectedTrip.id, tripPayload);
        setSuccess('تم تحديث الرحلة بنجاح');
        setOpenEditDialog(false);
        loadTrips();
      }
    } catch (err: any) {
      // معالجة أخطاء الحقول
      if (err.response?.data && typeof err.response.data === 'object') {
        const errors = err.response.data;
        const fieldErrors: Record<string, string> = {};
        let generalError = '';
        Object.entries(errors).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            if (['vehicle', 'driver', 'start_time', 'end_time', 'status', 'created_by', 'estimated_distance', 'route_points'].includes(key)) {
              fieldErrors[key] = value.join(' ');
            } else {
              generalError += value.join(' ') + ' ';
            }
          }
        });
        setFormErrors(fieldErrors);
        setError(generalError.trim() || '');
      } else {
        setError(err.response?.data?.message || 'فشل في تحديث الرحلة');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // حذف رحلة
  const handleDeleteConfirm = async () => {
    if (!selectedTrip) return;

    try {
      setSubmitting(true);
      await apiService.deleteTrip(selectedTrip.id);
      setSuccess('تم حذف الرحلة بنجاح');
      setOpenDeleteDialog(false);
      loadTrips();
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في حذف الرحلة');
    } finally {
      setSubmitting(false);
    }
  };

  // الحصول على لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // الحصول على نص الحالة
  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned': return 'مخططة';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتملة';
      case 'cancelled': return 'ملغية';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: colors.gradients.card1
      }}>
        <Box sx={{ textAlign: 'center', color: colors.text.inverse }}>
          <CircularProgress size={50} sx={{ color: colors.text.inverse, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            جاري تحميل الرحلات...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: colors.background.primary }}>
      {/* العنوان المحسن */}
      <Box sx={{ 
        mb: 4,
        p: 3,
        background: colors.gradients.card1,
        borderRadius: 3,
        border: `1px solid ${colors.border.light}`,
        boxShadow: colors.shadows.card
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ 
            background: 'rgba(255, 255, 255, 0.2)',
            width: 50,
            height: 50
          }}>
            <ConfirmationNumber sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 800, 
              color: colors.text.inverse,
              mb: 0.5,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              إدارة الرحلات
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 500
            }}>
              إدارة وتتبع جميع رحلات الأسطول
            </Typography>
          </Box>
        </Box>
        
        {/* إحصائيات سريعة */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, 
          gap: 2,
          mt: 2
        }}>
          <Box sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            p: 2,
            borderRadius: 2,
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="h5" sx={{ 
              color: colors.text.inverse, 
              fontWeight: 700,
              mb: 0.5
            }}>
              {trips.length}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 600
            }}>
              إجمالي الرحلات
            </Typography>
          </Box>
          
          <Box sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            p: 2,
            borderRadius: 2,
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="h5" sx={{ 
              color: colors.text.inverse, 
              fontWeight: 700,
              mb: 0.5
            }}>
              {trips.filter(t => t.status === 'in_progress').length}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 600
            }}>
              قيد التنفيذ
            </Typography>
          </Box>
          
          <Box sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            p: 2,
            borderRadius: 2,
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="h5" sx={{ 
              color: colors.text.inverse, 
              fontWeight: 700,
              mb: 0.5
            }}>
              {trips.filter(t => t.status === 'completed').length}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 600
            }}>
              مكتملة
            </Typography>
          </Box>
          
          <Box sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            p: 2,
            borderRadius: 2,
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="h5" sx={{ 
              color: colors.text.inverse, 
              fontWeight: 700,
              mb: 0.5
            }}>
              {trips.filter(t => t.status === 'planned').length}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 600
            }}>
              مخططة
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* شريط الأدوات المحسن */}
      <Card sx={{ 
        mb: 3, 
        background: colors.background.secondary, 
        boxShadow: colors.shadows.card,
        borderRadius: 3,
        border: `1px solid ${colors.border.light}`
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3, 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* البحث والفلترة */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
              <TextField
                size="medium"
                placeholder="البحث في الرحلات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: colors.primary.main }} />
                }}
                sx={{ 
                  minWidth: 300,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: colors.background.primary,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.primary.main
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.primary.main
                    }
                  }
                }}
              />
              
              <FormControl size="medium" sx={{ minWidth: 180 }}>
                <InputLabel>فلترة حسب الحالة</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="فلترة حسب الحالة"
                  sx={{
                    borderRadius: 2,
                    background: colors.background.primary,
                    '& .MuiOutlinedInput-notchedOutline': {
                      '&:hover': {
                        borderColor: colors.primary.main
                      }
                    }
                  }}
                >
                  <MenuItem value="all">جميع الحالات</MenuItem>
                  <MenuItem value="planned">مخططة</MenuItem>
                  <MenuItem value="in_progress">قيد التنفيذ</MenuItem>
                  <MenuItem value="completed">مكتملة</MenuItem>
                  <MenuItem value="cancelled">ملغية</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* الأزرار */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadTrips}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  borderColor: colors.border.medium,
                  color: colors.text.secondary,
                  '&:hover': {
                    borderColor: colors.primary.main,
                    color: colors.primary.main
                  }
                }}
              >
                تحديث
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateTrip}
                sx={{
                  background: colors.gradients.card2,
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    background: colors.gradients.card5,
                    transform: 'translateY(-1px)',
                    boxShadow: colors.shadows.large
                  }
                }}
              >
                إضافة رحلة جديدة
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* عرض الرحلات بالكارد */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(3, 1fr)', 
          lg: 'repeat(4, 1fr)' 
        }, 
        gap: 3 
      }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            p: 6,
            gap: 2,
            gridColumn: '1 / -1'
          }}>
            <CircularProgress 
              size={50} 
              sx={{ 
                color: colors.primary.main,
                mb: 2
              }} 
            />
            <Typography variant="h6" sx={{ 
              color: colors.text.primary,
              fontWeight: 600
            }}>
              جاري تحميل الرحلات
            </Typography>
            <Typography variant="body2" sx={{ 
              color: colors.text.secondary
            }}>
              يرجى الانتظار قليلاً...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            p: 6,
            gap: 2,
            gridColumn: '1 / -1'
          }}>
            <Avatar sx={{ 
              background: colors.status.error + '20',
              width: 80,
              height: 80,
              mb: 2
            }}>
              <Error sx={{ fontSize: 40, color: colors.status.error }} />
            </Avatar>
            <Typography variant="h6" sx={{ 
              color: colors.status.error,
              fontWeight: 600
            }}>
              حدث خطأ في تحميل الرحلات
            </Typography>
            <Typography variant="body2" sx={{ 
              color: colors.text.secondary,
              maxWidth: 400,
              mb: 2
            }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={loadTrips}
              sx={{
                background: colors.gradients.card1,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  background: colors.gradients.card2,
                  transform: 'translateY(-1px)',
                  boxShadow: colors.shadows.large
                }
              }}
            >
              إعادة المحاولة
            </Button>
          </Box>
        ) : filteredTrips.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            gridColumn: '1 / -1'
          }}>
            <Avatar sx={{ 
              background: colors.neutral[300],
              width: 80,
              height: 80,
              mb: 2
            }}>
              <ConfirmationNumber sx={{ fontSize: 40, color: colors.text.secondary }} />
            </Avatar>
            <Typography variant="h6" sx={{ 
              color: colors.text.primary,
              fontWeight: 600
            }}>
              لا توجد رحلات
            </Typography>
            <Typography variant="body2" sx={{ 
              color: colors.text.secondary,
              maxWidth: 400
            }}>
              {searchTerm || statusFilter !== 'all' ? 'لا توجد نتائج للبحث المحدد' : 'لم يتم العثور على رحلات في النظام'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateTrip}
              sx={{
                mt: 2,
                background: colors.gradients.card2,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  background: colors.gradients.card5,
                  transform: 'translateY(-1px)',
                  boxShadow: colors.shadows.large
                }
              }}
            >
              إضافة أول رحلة
            </Button>
          </Box>
        ) : (
          filteredTrips.map((trip: Trip) => {
            if (!(trip && typeof trip === 'object' && typeof trip.id === 'number')) return null;
            const driverId = typeof trip.driver === 'object' && trip.driver !== null ? trip.driver.id : trip.driver;
            const vehicleId = typeof trip.vehicle === 'object' && trip.vehicle !== null ? trip.vehicle.id : trip.vehicle;
            const driver = users.find(u => u.id === driverId);
            const vehicle = vehicles.find(v => v.id === vehicleId);
            return (
              <Card
                key={trip.id}
                sx={{
                  background: `linear-gradient(135deg, ${colors.background.secondary} 0%, ${colors.background.primary} 100%)`,
                  border: `2px solid ${colors.border.light}`,
                  borderRadius: 4,
                  boxShadow: `0 8px 32px ${colors.shadows.card}`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${colors.primary.main}, ${colors.primary.light})`,
                    transform: 'scaleX(0)',
                    transition: 'transform 0.3s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-8px) rotateX(2deg)',
                    boxShadow: `0 20px 40px ${colors.shadows.large}`,
                    borderColor: colors.primary.main,
                    '&::before': {
                      transform: 'scaleX(1)',
                    },
                    '& .trip-avatar': {
                      transform: 'scale(1.1) rotate(5deg)',
                      boxShadow: `0 8px 25px ${colors.shadows.medium}`,
                    },
                    '& .trip-info': {
                      transform: 'translateY(-2px)',
                    },
                    '& .action-buttons': {
                      opacity: 1,
                      transform: 'translateY(0)',
                    }
                  }
                }}
              >
                <CardContent sx={{ p: 1.2, position: 'relative' }}>
                  {/* خلفية مزخرفة */}
                  <Box sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    background: `radial-gradient(circle, ${colors.primary.light}20 0%, transparent 70%)`,
                    borderRadius: '50%',
                    zIndex: 0,
                  }} />
                  {/* رأس الكارد */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, position: 'relative', zIndex: 1 }}>
                    <Avatar className="trip-avatar" sx={{ bgcolor: colors.primary.main, width: 56, height: 56, boxShadow: colors.shadows.medium, fontSize: '1.5rem', fontWeight: 700 }}>
                      <ConfirmationNumber sx={{ fontSize: 24, color: '#fff' }} />
                    </Avatar>
                    <Box className="trip-info" sx={{ flex: 1, transition: 'transform 0.3s ease', minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: colors.text.primary, mb: 0.2, fontSize: '1.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {driver ? driver.first_name + ' ' + driver.last_name : 'غير محدد'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <DirectionsCar sx={{ fontSize: 16, color: colors.primary.main, mr: 0.5 }} />
                        <Typography variant="body2" sx={{ color: colors.text.secondary, fontWeight: 600, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {vehicle ? vehicle.plate_number + ' - ' + vehicle.model : 'غير محدد'}
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusText(trip.status)}
                        color={getStatusColor(trip.status) as any}
                        size="small"
                        sx={{ fontWeight: 700, borderRadius: 2, fontSize: '0.7rem', height: 20, boxShadow: colors.shadows.small, '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.2s ease' } }}
                      />
                    </Box>
                  </Box>
                  {/* معلومات الرحلة */}
                  <Box className="trip-info" sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 2, transition: 'transform 0.3s ease' }}>
                    {/* وقت البدء */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, background: colors.background.primary, borderRadius: 2, border: `1px solid ${colors.border.light}`, transition: 'all 0.2s ease', '&:hover': { background: colors.primary.light + '10', borderColor: colors.primary.main, transform: 'translateX(4px)' } }}>
                      <Avatar sx={{ background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.light})`, width: 26, height: 26, fontSize: '0.7rem' }}>
                        <CalendarToday sx={{ fontSize: 13 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: colors.text.secondary, fontWeight: 500 }}>وقت البدء</Typography>
                        <Typography variant="body2" sx={{ color: colors.text.primary, fontWeight: 600 }}>{trip.start_time ? formatDate(trip.start_time) : '-'}</Typography>
                      </Box>
                    </Box>
                    {/* وقت النهاية */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, background: colors.background.primary, borderRadius: 2, border: `1px solid ${colors.border.light}`, transition: 'all 0.2s ease', '&:hover': { background: colors.primary.light + '10', borderColor: colors.primary.main, transform: 'translateX(4px)' } }}>
                      <Avatar sx={{ background: `linear-gradient(135deg, ${colors.status.info}, ${colors.status.info}dd)`, width: 26, height: 26, fontSize: '0.7rem' }}>
                        <CalendarToday sx={{ fontSize: 13 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: colors.text.secondary, fontWeight: 500 }}>وقت النهاية</Typography>
                        <Typography variant="body2" sx={{ color: colors.text.primary, fontWeight: 600 }}>{trip.end_time ? formatDate(trip.end_time) : '-'}</Typography>
                      </Box>
                    </Box>
                    {/* نقطة البداية */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, background: colors.background.primary, borderRadius: 2, border: `1px solid ${colors.border.light}`, transition: 'all 0.2s ease', '&:hover': { background: colors.primary.light + '10', borderColor: colors.primary.main, transform: 'translateX(4px)' } }}>
                      <Avatar sx={{ background: `linear-gradient(135deg, ${colors.status.warning}, ${colors.status.warning}dd)`, width: 26, height: 26, fontSize: '0.7rem' }}>
                        <LocationOn sx={{ fontSize: 13 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: colors.text.secondary, fontWeight: 500 }}>نقطة البداية</Typography>
                        {locationNames[trip.id]?.start ? (
                          <>
                            <Typography variant="body2" sx={{ color: colors.text.primary, fontWeight: 600 }}>{locationNames[trip.id]?.start}</Typography>
                            {Array.isArray(trip.route_points) && trip.route_points.length > 0 && (
                              <Typography variant="caption" sx={{ color: colors.text.secondary, fontSize: '0.75rem' }}>{`${trip.route_points[0].lat},${trip.route_points[0].lon}`}</Typography>
                            )}
                          </>
                        ) : (
                          <Typography variant="body2" sx={{ color: colors.text.primary, fontWeight: 600 }}>{Array.isArray(trip.route_points) && trip.route_points.length > 0 ? `${trip.route_points[0].lat},${trip.route_points[0].lon}` : '-'}</Typography>
                        )}
                      </Box>
                    </Box>
                    {/* نقطة النهاية */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, background: colors.background.primary, borderRadius: 2, border: `1px solid ${colors.border.light}`, transition: 'all 0.2s ease', '&:hover': { background: colors.primary.light + '10', borderColor: colors.primary.main, transform: 'translateX(4px)' } }}>
                      <Avatar sx={{ background: `linear-gradient(135deg, ${colors.status.error}, ${colors.status.error}dd)`, width: 26, height: 26, fontSize: '0.7rem' }}>
                        <LocationOn sx={{ fontSize: 13 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: colors.text.secondary, fontWeight: 500 }}>نقطة النهاية</Typography>
                        {locationNames[trip.id]?.end ? (
                          <>
                            <Typography variant="body2" sx={{ color: colors.text.primary, fontWeight: 600 }}>{locationNames[trip.id]?.end}</Typography>
                            {Array.isArray(trip.route_points) && trip.route_points.length > 1 && (
                              <Typography variant="caption" sx={{ color: colors.text.secondary, fontSize: '0.75rem' }}>{`${trip.route_points[1].lat},${trip.route_points[1].lon}`}</Typography>
                            )}
                          </>
                        ) : (
                          <Typography variant="body2" sx={{ color: colors.text.primary, fontWeight: 600 }}>{Array.isArray(trip.route_points) && trip.route_points.length > 1 ? `${trip.route_points[1].lat},${trip.route_points[1].lon}` : '-'}</Typography>
                        )}
                      </Box>
                    </Box>
                    {/* المسافة التقديرية */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, background: colors.background.primary, borderRadius: 2, border: `1px solid ${colors.border.light}`, transition: 'all 0.2s ease', '&:hover': { background: colors.primary.light + '10', borderColor: colors.primary.main, transform: 'translateX(4px)' } }}>
                      <Avatar sx={{ background: `linear-gradient(135deg, ${colors.status.success}, ${colors.status.success}dd)`, width: 26, height: 26, fontSize: '0.7rem' }}>
                        <DirectionsCar sx={{ fontSize: 13 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: colors.text.secondary, fontWeight: 500 }}>المسافة التقديرية (كم)</Typography>
                        <Typography variant="body2" sx={{ color: colors.text.primary, fontWeight: 600 }}>{trip.estimated_distance || '-'}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  {/* أزرار الإجراءات */}
                  <Box className="action-buttons" sx={{ display: 'flex', gap: 1, pt: 2, borderTop: `1px solid ${colors.border.light}` }}>
                    <Tooltip title="تعديل">
                      <IconButton color="primary" onClick={() => handleEditTrip(trip)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="حذف">
                      <IconButton color="error" onClick={() => handleDeleteTrip(trip)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="عرض التفاصيل">
                      <IconButton color="info" onClick={() => handleViewTrip(trip)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {trip.status === 'planned' && (
                      <Tooltip title="بدء الرحلة">
                        <IconButton color="success" onClick={() => handleStartTrip(trip.id)}>
                          <PlayArrow />
                        </IconButton>
                      </Tooltip>
                    )}
                    {trip.status === 'in_progress' && (
                      <Tooltip title="إنهاء الرحلة">
                        <IconButton color="warning" onClick={() => handleEndTrip(trip.id)}>
                          <Stop />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })
        )}
      </Box>

      {/* رسائل النجاح والخطأ */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* نموذج إنشاء رحلة جديدة */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>إضافة رحلة جديدة</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* معلومات أساسية */}
            <Card sx={{ background: colors.background.secondary, border: `1px solid ${colors.border.light}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ConfirmationNumber sx={{ fontSize: 20, color: colors.primary.main }} />
                  معلومات الرحلة الأساسية
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <FormControl fullWidth error={!!formErrors.vehicle}>
                    <InputLabel>المركبة</InputLabel>
                    <Select
                      value={formData.vehicle}
                      onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                      label="المركبة"
                    >
                      {vehicles.map((vehicle) => (
                        <MenuItem key={vehicle.id} value={String(vehicle.id)}>
                          {vehicle.plate_number} - {vehicle.model}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.vehicle && <Typography color="error" variant="caption">{formErrors.vehicle}</Typography>}
                  </FormControl>
                  <FormControl fullWidth error={!!formErrors.driver}>
                    <InputLabel>السائق</InputLabel>
                    <Select
                      value={formData.driver}
                      onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                      label="السائق"
                    >
                      {users.filter(user => user.role === 'driver').map((user) => (
                        <MenuItem key={user.id} value={String(user.id)}>
                          {user.first_name} {user.last_name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.driver && <Typography color="error" variant="caption">{formErrors.driver}</Typography>}
                  </FormControl>
                  <TextField
                    fullWidth
                    label="وقت البداية"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    error={!!formErrors.start_time}
                    helperText={formErrors.start_time}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="وقت النهاية المتوقع"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    error={!!formErrors.end_time}
                    helperText={formErrors.end_time}
                    InputLabelProps={{ shrink: true }}
                  />
                  <FormControl fullWidth error={!!formErrors.status}>
                    <InputLabel>الحالة</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      label="الحالة"
                    >
                      <MenuItem value="planned">مخططة</MenuItem>
                      <MenuItem value="in_progress">قيد التنفيذ</MenuItem>
                      <MenuItem value="completed">مكتملة</MenuItem>
                      <MenuItem value="cancelled">ملغية</MenuItem>
                    </Select>
                    {formErrors.status && <Typography color="error" variant="caption">{formErrors.status}</Typography>}
                  </FormControl>
                  <TextField
                    fullWidth
                    label="المسافة التقديرية (كم)"
                    type="number"
                    value={formData.estimated_distance}
                    onChange={(e) => setFormData({ ...formData, estimated_distance: e.target.value })}
                    InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                    error={!!formErrors.estimated_distance}
                    helperText={formErrors.estimated_distance}
                  />
                </Box>
              </CardContent>
            </Card>
            {/* تفاصيل المسار */}
            <Card sx={{ background: colors.background.secondary, border: `1px solid ${colors.border.light}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 20, color: colors.primary.main }} />
                  تفاصيل المسار
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    label="نقطة البداية (عنوان أو إحداثيات)"
                    value={formData.start_location}
                    onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                    placeholder="مثال: الرياض، شارع الملك فهد أو 24.7136,46.6753"
                    error={!!formErrors.start_location}
                    helperText={formErrors.start_location}
                  />
                  <TextField
                    fullWidth
                    label="نقطة النهاية (عنوان أو إحداثيات)"
                    value={formData.end_location}
                    onChange={(e) => setFormData({ ...formData, end_location: e.target.value })}
                    placeholder="مثال: جدة، شارع التحلية أو 21.5433,39.1728"
                    error={!!formErrors.end_location}
                    helperText={formErrors.end_location}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenCreateDialog(false);
            setError(null);
            setFormErrors({});
          }}>إلغاء</Button>
          <Button onClick={handleSubmitCreate} variant="contained" disabled={submitting}>
            {submitting ? 'جاري الإنشاء...' : 'إنشاء'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* نموذج تعديل رحلة */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: colors.shadows.large,
            background: colors.background.primary,
            border: `1px solid ${colors.border.light}`
          }
        }}
      >
        <DialogTitle sx={{ 
          background: colors.gradients.card3,
          color: colors.text.inverse,
          borderRadius: '12px 12px 0 0',
          py: 3,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Avatar sx={{ 
            background: 'rgba(255, 255, 255, 0.2)',
            width: 40,
            height: 40
          }}>
            <Edit />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              تعديل الرحلة
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
              تحديث بيانات الرحلة: {selectedTrip && users.find((u: User) => u.id === (typeof selectedTrip.driver === 'object' && selectedTrip.driver !== null ? (selectedTrip.driver as User).id : selectedTrip.driver))?.first_name || ''}
              {selectedTrip && vehicles.find((v: Vehicle) => v.id === (typeof selectedTrip.vehicle === 'object' && selectedTrip.vehicle !== null ? (selectedTrip.vehicle as Vehicle).id : selectedTrip.vehicle))
                ? ' - ' + vehicles.find((v: Vehicle) => v.id === (typeof selectedTrip.vehicle === 'object' && selectedTrip.vehicle !== null ? (selectedTrip.vehicle as Vehicle).id : selectedTrip.vehicle))?.plate_number : ''}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
            {/* المعلومات الأساسية */}
            <Card sx={{ background: colors.background.secondary, border: `1px solid ${colors.border.light}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ConfirmationNumber sx={{ fontSize: 20, color: colors.primary.main }} />
                  المعلومات الأساسية
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth error={!!formErrors.vehicle}>
                    <InputLabel>المركبة</InputLabel>
                    <Select
                      value={formData.vehicle}
                      onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                      label="المركبة"
                      sx={{ borderRadius: 2 }}
                    >
                      {vehicles.map((vehicle) => (
                        <MenuItem key={vehicle.id} value={String(vehicle.id)}>
                          {vehicle.plate_number} - {vehicle.model}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.vehicle && <Typography color="error" variant="caption">{formErrors.vehicle}</Typography>}
                  </FormControl>
                  <FormControl fullWidth error={!!formErrors.driver}>
                    <InputLabel>السائق</InputLabel>
                    <Select
                      value={formData.driver}
                      onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                      label="السائق"
                      sx={{ borderRadius: 2 }}
                    >
                      {users.filter(user => user.role === 'driver').map((user) => (
                        <MenuItem key={user.id} value={String(user.id)}>
                          {user.first_name} {user.last_name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.driver && <Typography color="error" variant="caption">{formErrors.driver}</Typography>}
                  </FormControl>
                  <TextField
                    fullWidth
                    label="وقت البداية"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    error={!!formErrors.start_time}
                    helperText={formErrors.start_time}
                    InputLabelProps={{ shrink: true }}
                    sx={{ borderRadius: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="وقت النهاية المتوقع"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    error={!!formErrors.end_time}
                    helperText={formErrors.end_time}
                    InputLabelProps={{ shrink: true }}
                    sx={{ borderRadius: 2 }}
                  />
                  <FormControl fullWidth error={!!formErrors.status}>
                    <InputLabel>الحالة</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      label="الحالة"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="planned">مخططة</MenuItem>
                      <MenuItem value="in_progress">قيد التنفيذ</MenuItem>
                      <MenuItem value="completed">مكتملة</MenuItem>
                      <MenuItem value="cancelled">ملغية</MenuItem>
                    </Select>
                    {formErrors.status && <Typography color="error" variant="caption">{formErrors.status}</Typography>}
                  </FormControl>
                  <TextField
                    fullWidth
                    label="المسافة التقديرية (كم)"
                    type="number"
                    value={formData.estimated_distance}
                    onChange={(e) => setFormData({ ...formData, estimated_distance: e.target.value })}
                    InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                    error={!!formErrors.estimated_distance}
                    helperText={formErrors.estimated_distance}
                    sx={{ borderRadius: 2 }}
                  />
                </Box>
              </CardContent>
            </Card>
            {/* تفاصيل المسار */}
            <Card sx={{ background: colors.background.secondary, border: `1px solid ${colors.border.light}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 20, color: colors.primary.main }} />
                  تفاصيل المسار
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="نقطة البداية (عنوان أو إحداثيات)"
                    value={locationNames[selectedTrip?.id || 0]?.start || formData.start_location}
                    onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                    placeholder="مثال: الرياض، شارع الملك فهد أو 24.7136,46.6753"
                    error={!!formErrors.start_location}
                    helperText={
                      locationNames[selectedTrip?.id || 0]?.start && Array.isArray(selectedTrip?.route_points) && selectedTrip.route_points.length > 0
                        ? `${selectedTrip.route_points[0].lat},${selectedTrip.route_points[0].lon}`
                        : formErrors.start_location || ''
                    }
                    sx={{ borderRadius: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="نقطة النهاية (عنوان أو إحداثيات)"
                    value={locationNames[selectedTrip?.id || 0]?.end || formData.end_location}
                    onChange={(e) => setFormData({ ...formData, end_location: e.target.value })}
                    placeholder="مثال: جدة، شارع التحلية أو 21.5433,39.1728"
                    error={!!formErrors.end_location}
                    helperText={
                      locationNames[selectedTrip?.id || 0]?.end && Array.isArray(selectedTrip?.route_points) && selectedTrip.route_points.length > 1
                        ? `${selectedTrip.route_points[1].lat},${selectedTrip.route_points[1].lon}`
                        : formErrors.end_location || ''
                    }
                    sx={{ borderRadius: 2 }}
                  />
                </Box>
              </CardContent>
            </Card>
            {/* معلومات إضافية */}
            <Card sx={{ background: colors.background.secondary, border: `1px solid ${colors.border.light}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Error sx={{ fontSize: 20, color: colors.primary.main }} />
                  معلومات إضافية
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="ملاحظات الرحلة (اختياري)"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    multiline
                    minRows={2}
                    maxRows={5}
                    sx={{ borderRadius: 2 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setOpenEditDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              borderColor: colors.border.medium,
              color: colors.text.secondary,
              '&:hover': {
                borderColor: colors.text.primary,
                color: colors.text.primary
              }
            }}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmitEdit}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : <Edit />}
            sx={{
              background: colors.gradients.card3,
              borderRadius: 2,
              px: 4,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: colors.gradients.card5,
                transform: 'translateY(-1px)',
                boxShadow: colors.shadows.large
              },
              '&:disabled': {
                background: colors.neutral[400]
              }
            }}
          >
            {submitting ? 'جاري التحديث...' : 'حفظ التعديلات'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* تأكيد الحذف */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف هذه الرحلة؟ لا يمكن التراجع عن هذا الإجراء.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>إلغاء</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={submitting}>
            {submitting ? 'جاري الحذف...' : 'حذف'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* نموذج عرض تفاصيل الرحلة */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          background: colors.gradients.card3,
          color: colors.text.inverse,
          borderRadius: '12px 12px 0 0',
          py: 3,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Avatar sx={{ background: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
            <Visibility />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              تفاصيل الرحلة
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
              عرض جميع بيانات الرحلة رقم #{selectedTrip?.id}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* معلومات أساسية */}
            <Card sx={{ background: colors.background.secondary, border: `1px solid ${colors.border.light}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ConfirmationNumber sx={{ fontSize: 20, color: colors.primary.main }} />
                  معلومات الرحلة الأساسية
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">المركبة</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {(() => {
                        const vehicleId = getId(selectedTrip?.vehicle);
                        const vehicle = vehicles.find(v => v.id === vehicleId);
                        return (
                          <Typography variant="body1" fontWeight={600}>
                            {vehicle ? `${vehicle.plate_number} - ${vehicle.model}` : 'غير محدد'}
                          </Typography>
                        );
                      })()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">السائق</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {(() => {
                        const driverId = getId(selectedTrip?.driver);
                        const driver = users.find(u => u.id === driverId);
                        return (
                          <Typography variant="body1" fontWeight={600}>
                            {driver ? `${driver.first_name} ${driver.last_name}` : 'غير محدد'}
                          </Typography>
                        );
                      })()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">وقت البداية</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedTrip?.start_time ? formatDate(selectedTrip.start_time) : '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">وقت النهاية</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedTrip?.end_time ? formatDate(selectedTrip.end_time) : '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">الحالة</Typography>
                    <Typography variant="body1" fontWeight={600}>{getStatusText(selectedTrip?.status || '')}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">المسافة التقديرية (كم)</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedTrip?.estimated_distance || '-'}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            {/* تفاصيل المسار */}
            <Card sx={{ background: colors.background.secondary, border: `1px solid ${colors.border.light}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 20, color: colors.primary.main }} />
                  تفاصيل المسار
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">نقطة البداية</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {locationNames[selectedTrip?.id || 0]?.start ? (
                        <>
                          <Typography variant="body2" sx={{ color: colors.text.primary, fontWeight: 600 }}>{locationNames[selectedTrip?.id || 0]?.start}</Typography>
                          {Array.isArray(selectedTrip?.route_points) && selectedTrip.route_points.length > 0 && (
                            <Typography variant="caption" sx={{ color: colors.text.secondary, fontSize: '0.75rem' }}>{`${selectedTrip.route_points[0].lat},${selectedTrip.route_points[0].lon}`}</Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="body2" sx={{ color: colors.text.primary, fontWeight: 600 }}>{Array.isArray(selectedTrip?.route_points) && selectedTrip.route_points.length > 0 ? `${selectedTrip.route_points[0].lat},${selectedTrip.route_points[0].lon}` : '-'}</Typography>
                      )}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">نقطة النهاية</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {locationNames[selectedTrip?.id || 0]?.end ? (
                        <>
                          <Typography variant="body2" sx={{ color: colors.text.primary, fontWeight: 600 }}>{locationNames[selectedTrip?.id || 0]?.end}</Typography>
                          {Array.isArray(selectedTrip?.route_points) && selectedTrip.route_points.length > 1 && (
                            <Typography variant="caption" sx={{ color: colors.text.secondary, fontSize: '0.75rem' }}>{`${selectedTrip.route_points[1].lat},${selectedTrip.route_points[1].lon}`}</Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="body2" sx={{ color: colors.text.primary, fontWeight: 600 }}>{Array.isArray(selectedTrip?.route_points) && selectedTrip.route_points.length > 1 ? `${selectedTrip.route_points[1].lat},${selectedTrip.route_points[1].lon}` : '-'}</Typography>
                      )}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setOpenViewDialog(false)} variant="outlined" sx={{ borderRadius: 2, px: 3, py: 1, borderColor: colors.border.medium, color: colors.text.secondary, '&:hover': { borderColor: colors.text.primary, color: colors.text.primary } }}>
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 