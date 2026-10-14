'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from '@/types';
import { colors } from '../../styles/colors';
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
  Snackbar,
  Grid
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  DirectionsCar,
  Build,
  Search,
  Refresh,
  Speed,
  LocalGasStation,
  CalendarToday,
  Notes,
  Error,
  Person,
  ConfirmationNumber
} from '@mui/icons-material';

interface VehicleFormData {
  name: string;
  model: string;
  year: number;
  plate_number: string;
  vin: string;
  status: 'active' | 'maintenance' | 'inactive';
  odometer: number;
  fuel_type: string;
  insurance_expiry: string;
  notes: string;
}

const initialFormData: VehicleFormData = {
    name: '',
    model: '',
    year: new Date().getFullYear(),
    plate_number: '',
    vin: '',
  status: 'active',
  odometer: 0,
    fuel_type: '',
    insurance_expiry: '',
    notes: ''
};

export default function VehiclesPage() {
  const { user: currentUser } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // حالة النماذج
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // حالة البحث والفلترة
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // تحميل المركبات
  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getVehicles();
      setVehicles(data);
    } catch (err) {
      setError('فشل في تحميل قائمة المركبات');
      console.error('Error loading vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  // فلترة المركبات
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
  };

  // فتح نموذج إنشاء مركبة جديدة
  const handleCreateVehicle = () => {
    resetForm();
    setOpenCreateDialog(true);
  };

  // فتح نموذج تعديل مركبة
  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      model: vehicle.model,
      year: vehicle.year,
      plate_number: vehicle.plate_number,
      vin: vehicle.vin,
      status: vehicle.status,
      odometer: vehicle.odometer || 0,
      fuel_type: vehicle.fuel_type,
      insurance_expiry: vehicle.insurance_expiry,
      notes: vehicle.notes || ''
    });
    setOpenEditDialog(true);
  };

  // فتح عرض تفاصيل المركبة
  const handleViewVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setOpenViewDialog(true);
  };

  // فتح حذف مركبة
  const handleDeleteVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setOpenDeleteDialog(true);
  };

  // التحقق من صحة النموذج
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'اسم المركبة مطلوب';
    if (!formData.model.trim()) errors.model = 'الموديل مطلوب';
    if (!formData.plate_number.trim()) errors.plate_number = 'رقم اللوحة مطلوب';
    if (!formData.vin.trim()) errors.vin = 'رقم الهيكل مطلوب';
    if (!formData.fuel_type.trim()) errors.fuel_type = 'نوع الوقود مطلوب';
    if (!formData.insurance_expiry) errors.insurance_expiry = 'تاريخ انتهاء التأمين مطلوب';
    
    // التحقق من صحة التاريخ
    if (formData.insurance_expiry) {
      const expiryDate = new Date(formData.insurance_expiry);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate < today) {
        errors.insurance_expiry = 'تاريخ انتهاء التأمين لا يمكن أن يكون في الماضي';
      }
    }
    
    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      errors.year = 'سنة الصنع غير صحيحة';
    }
    
    if (formData.odometer < 0) {
      errors.odometer = 'عداد المسافة يجب أن يكون موجب';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // إنشاء مركبة جديدة
  const handleSubmitCreate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);
      
      const createData: CreateVehicleRequest = {
        name: formData.name,
        model: formData.model,
        year: formData.year,
        plate_number: formData.plate_number,
        vin: formData.vin,
        status: formData.status,
        odometer: formData.odometer,
        fuel_type: formData.fuel_type,
        insurance_expiry: formData.insurance_expiry,
        notes: formData.notes
      };

      console.log('Creating vehicle with data:', createData);
      await apiService.createVehicle(createData);
      setSuccess('تم إنشاء المركبة بنجاح');
      setOpenCreateDialog(false);
      resetForm();
      loadVehicles();
    } catch (err: any) {
      console.error('Error creating vehicle:', err);
      if (err.response?.data?.errors) {
        // إذا كان هناك أخطاء محددة من الخادم
        const errorMessages = Object.values(err.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('فشل في إنشاء المركبة. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // تحديث مركبة
  const handleSubmitEdit = async () => {
    if (!validateForm() || !selectedVehicle) return;

    try {
      setSubmitting(true);
      setError(null);
      
      const updateData: UpdateVehicleRequest = {
        name: formData.name,
        model: formData.model,
        year: formData.year,
        plate_number: formData.plate_number,
        vin: formData.vin,
        status: formData.status,
        odometer: formData.odometer,
        fuel_type: formData.fuel_type,
        insurance_expiry: formData.insurance_expiry,
        notes: formData.notes
      };

      console.log('Updating vehicle with data:', updateData);
      await apiService.updateVehicle(selectedVehicle.id, updateData);
      setSuccess('تم تحديث المركبة بنجاح');
      setOpenEditDialog(false);
      resetForm();
      loadVehicles();
    } catch (err: any) {
      console.error('Error updating vehicle:', err);
      if (err.response?.data?.errors) {
        // إذا كان هناك أخطاء محددة من الخادم
        const errorMessages = Object.values(err.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('فشل في تحديث المركبة. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // حذف مركبة
  const handleDeleteConfirm = async () => {
    if (!selectedVehicle) return;

    try {
      setSubmitting(true);
      await apiService.deleteVehicle(selectedVehicle.id);
      setSuccess('تم حذف المركبة بنجاح');
      setOpenDeleteDialog(false);
      loadVehicles();
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في حذف المركبة');
    } finally {
      setSubmitting(false);
    }
  };

  // الحصول على أيقونة الحالة
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <DirectionsCar />;
      case 'maintenance': return <Build />;
      case 'inactive': return <DirectionsCar />;
      default: return <DirectionsCar />;
    }
  };

  // الحصول على لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  // الحصول على نص الحالة
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشطة';
      case 'maintenance': return 'في الصيانة';
      case 'inactive': return 'غير نشطة';
      default: return status;
    }
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
            جاري تحميل المركبات...
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
            height: 50,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'rotate(360deg) scale(1.1)',
              background: 'rgba(255, 255, 255, 0.3)'
            }
          }}>
            <DirectionsCar sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 800, 
              color: colors.text.inverse,
              mb: 0.5,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              background: 'linear-gradient(45deg, #fff, #f0f0f0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              إدارة المركبات
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 500
            }}>
              إدارة جميع المركبات والمركبات في الأسطول
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
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.2)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }
          }}>
            <Typography variant="h5" sx={{ 
              color: colors.text.inverse, 
              fontWeight: 700,
              mb: 0.5
            }}>
              {vehicles.length}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 600
            }}>
              إجمالي المركبات
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
              {vehicles.filter(v => v.status === 'active').length}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 600
            }}>
              مركبات نشطة
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
              {vehicles.filter(v => v.status === 'maintenance').length}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 600
            }}>
              في الصيانة
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
              {vehicles.filter(v => v.status === 'inactive').length}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 600
            }}>
              غير نشطة
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
        border: `1px solid ${colors.border.light}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: colors.shadows.large,
          transform: 'translateY(-2px)'
        }
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
              placeholder="البحث في المركبات..."
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
                  <MenuItem value="all">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsCar sx={{ fontSize: 18, color: colors.text.secondary }} />
                      جميع الحالات
                    </Box>
                  </MenuItem>
                  <MenuItem value="active">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsCar sx={{ fontSize: 18, color: colors.status.success }} />
                      نشطة
                    </Box>
                  </MenuItem>
                  <MenuItem value="maintenance">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Build sx={{ fontSize: 18, color: colors.status.warning }} />
                      في الصيانة
                    </Box>
                  </MenuItem>
                  <MenuItem value="inactive">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsCar sx={{ fontSize: 18, color: colors.status.error }} />
                      غير نشطة
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* الأزرار */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadVehicles}
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
                onClick={handleCreateVehicle}
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
                إضافة مركبة جديدة
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* عرض المركبات بالكارد */}
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
              جاري تحميل المركبات
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
              حدث خطأ في تحميل المركبات
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
              onClick={loadVehicles}
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
        ) : filteredVehicles.length === 0 ? (
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
              <DirectionsCar sx={{ fontSize: 40, color: colors.text.secondary }} />
            </Avatar>
            <Typography variant="h6" sx={{ 
              color: colors.text.primary,
              fontWeight: 600
            }}>
              لا توجد مركبات
            </Typography>
            <Typography variant="body2" sx={{ 
              color: colors.text.secondary,
              maxWidth: 400
            }}>
              {searchTerm || statusFilter !== 'all' ? 'لا توجد نتائج للبحث المحدد' : 'لم يتم العثور على مركبات في النظام'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateVehicle}
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
              إضافة أول مركبة
            </Button>
          </Box>
        ) : (
          filteredVehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
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
                  '& .vehicle-icon': {
                    transform: 'scale(1.1) rotate(5deg)',
                    boxShadow: `0 8px 25px ${colors.shadows.medium}`,
                  },
                  '& .vehicle-info': {
                    transform: 'translateY(-2px)',
                  },
                  '& .action-buttons': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  }
                }
              }}
            >
              <CardContent sx={{ p: 4, position: 'relative' }}>
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
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 3, 
                  mb: 4,
                  position: 'relative',
                  zIndex: 1
                }}>
                  <Avatar 
                    className="vehicle-icon"
                    sx={{ 
                      bgcolor: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.light})`,
                      width: 70,
                      height: 70,
                      boxShadow: colors.shadows.medium,
                      border: `3px solid ${colors.border.light}`,
                      transition: 'all 0.3s ease',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        width: 20,
                        height: 20,
                        background: getStatusColor(vehicle.status),
                        border: `3px solid ${colors.background.secondary}`,
                        borderRadius: '50%',
                        boxShadow: colors.shadows.small,
                      }
                    }}
                  >
                    <DirectionsCar sx={{ fontSize: 32 }} />
                  </Avatar>
                  
                  <Box className="vehicle-info" sx={{ flex: 1, transition: 'transform 0.3s ease' }}>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 800,
                      color: colors.text.primary,
                      mb: 1,
                      background: `linear-gradient(135deg, ${colors.text.primary}, ${colors.primary.main})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      {vehicle.name}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: colors.text.secondary,
                      mb: 2,
                      fontWeight: 500,
                      fontSize: '0.9rem'
                    }}>
                      {vehicle.model} - {vehicle.year}
                    </Typography>
                    <Chip
                      label={getStatusText(vehicle.status)}
                      color={getStatusColor(vehicle.status) as any}
                      size="small"
                      icon={getStatusIcon(vehicle.status)}
                      sx={{
                        fontWeight: 700,
                        borderRadius: 2,
                        fontSize: '0.75rem',
                        height: 24,
                        '& .MuiChip-icon': {
                          fontSize: 14
                        },
                        boxShadow: colors.shadows.small,
                        '&:hover': {
                          transform: 'scale(1.05)',
                          transition: 'transform 0.2s ease'
                        }
                      }}
                    />
                  </Box>
                </Box>

                {/* معلومات المركبة */}
                <Box className="vehicle-info" sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2.5, 
                  mb: 4,
                  transition: 'transform 0.3s ease'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 2,
                    background: colors.background.primary,
                    borderRadius: 2,
                    border: `1px solid ${colors.border.light}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: colors.primary.light + '10',
                      borderColor: colors.primary.main,
                      transform: 'translateX(4px)',
                    }
                  }}>
                    <Avatar sx={{ 
                      background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.light})`,
                      width: 32,
                      height: 32,
                      fontSize: '0.8rem'
                    }}>
                      <ConfirmationNumber sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ 
                        color: colors.text.secondary,
                        fontWeight: 500,
                        display: 'block',
                        mb: 0.5
                      }}>
                        رقم اللوحة
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: colors.text.primary,
                        fontWeight: 600,
                        fontFamily: 'monospace',
                        fontSize: '1rem'
                      }}>
                        {vehicle.plate_number}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 2,
                    background: colors.background.primary,
                    borderRadius: 2,
                    border: `1px solid ${colors.border.light}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: colors.primary.light + '10',
                      borderColor: colors.primary.main,
                      transform: 'translateX(4px)',
                    }
                  }}>
                    <Avatar sx={{ 
                      background: `linear-gradient(135deg, ${colors.status.warning}, ${colors.status.warning}dd)`,
                      width: 32,
                      height: 32,
                      fontSize: '0.8rem'
                    }}>
                      <Speed sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ 
                        color: colors.text.secondary,
                        fontWeight: 500,
                        display: 'block',
                        mb: 0.5
                      }}>
                        قراءة العداد
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: colors.text.primary,
                        fontWeight: 600
                      }}>
                        {vehicle.odometer?.toLocaleString() || 'غير محدد'} كم
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 2,
                    background: colors.background.primary,
                    borderRadius: 2,
                    border: `1px solid ${colors.border.light}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: colors.primary.light + '10',
                      borderColor: colors.primary.main,
                      transform: 'translateX(4px)',
                    }
                  }}>
                    <Avatar sx={{ 
                      background: `linear-gradient(135deg, ${colors.status.info}, ${colors.status.info}dd)`,
                      width: 32,
                      height: 32,
                      fontSize: '0.8rem'
                    }}>
                      <LocalGasStation sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ 
                        color: colors.text.secondary,
                        fontWeight: 500,
                        display: 'block',
                        mb: 0.5
                      }}>
                        نوع الوقود
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: colors.text.primary,
                        fontWeight: 600
                      }}>
                        {vehicle.fuel_type || 'غير محدد'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* أزرار الإجراءات */}
                <Box 
                  className="action-buttons"
                  sx={{ 
                    display: 'flex', 
                    gap: 1.5,
                    justifyContent: 'center',
                    opacity: 0.8,
                    transform: 'translateY(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      opacity: 1,
                      transform: 'translateY(0)',
                    }
                  }}
                >
                  <Tooltip title="عرض التفاصيل" arrow placement="top">
                    <IconButton
                      size="medium"
                      onClick={() => handleViewVehicle(vehicle)}
                      sx={{
                        color: colors.text.secondary,
                        background: colors.background.primary,
                        borderRadius: 2,
                        width: 45,
                        height: 45,
                        border: `1px solid ${colors.border.light}`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${colors.primary.light}, ${colors.primary.main})`,
                          color: colors.text.inverse,
                          transform: 'scale(1.1) rotate(5deg)',
                          boxShadow: colors.shadows.medium,
                        }
                      }}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="تعديل المركبة" arrow placement="top">
                    <IconButton
                      size="medium"
                      onClick={() => handleEditVehicle(vehicle)}
                      sx={{
                        color: colors.primary.main,
                        background: colors.background.primary,
                        borderRadius: 2,
                        width: 45,
                        height: 45,
                        border: `1px solid ${colors.border.light}`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.light})`,
                          color: colors.text.inverse,
                          transform: 'scale(1.1) rotate(-5deg)',
                          boxShadow: colors.shadows.medium,
                        }
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="حذف المركبة" arrow placement="top">
                    <IconButton
                      size="medium"
                      onClick={() => handleDeleteVehicle(vehicle)}
                      sx={{
                        color: colors.status.error,
                        background: colors.background.primary,
                        borderRadius: 2,
                        width: 45,
                        height: 45,
                        border: `1px solid ${colors.border.light}`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${colors.status.error}, ${colors.status.error}dd)`,
                          color: colors.text.inverse,
                          transform: 'scale(1.1) rotate(5deg)',
                          boxShadow: colors.shadows.medium,
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* نموذج إنشاء مركبة جديدة */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)}
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
          background: colors.gradients.card2,
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
            <Add />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              إضافة مركبة جديدة
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
              أدخل بيانات المركبة الجديدة
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 3,
            mb: 3
          }}>
            {/* المعلومات الأساسية */}
            <Card sx={{ 
              background: colors.background.secondary,
              border: `1px solid ${colors.border.light}`,
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: colors.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <DirectionsCar sx={{ fontSize: 20, color: colors.primary.main }} />
                  المعلومات الأساسية
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="اسم المركبة"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary.main
                        }
                      }
                    }}
                  />
                  <TextField
                    label="الموديل"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    error={!!formErrors.model}
                    helperText={formErrors.model}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary.main
                        }
                      }
                    }}
                  />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField
                      label="سنة الصنع"
                    type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      error={!!formErrors.year}
                      helperText={formErrors.year}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.primary.main
                          }
                        }
                      }}
                    />
                    <TextField
                      label="رقم اللوحة"
                      value={formData.plate_number}
                      onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                      error={!!formErrors.plate_number}
                      helperText={formErrors.plate_number}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.primary.main
                          }
                        }
                      }}
                    />
                  </Box>
                  <TextField
                    label="رقم الهيكل (VIN)"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                    error={!!formErrors.vin}
                    helperText={formErrors.vin}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary.main
                        }
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* المعلومات التقنية */}
            <Card sx={{ 
              background: colors.background.secondary,
              border: `1px solid ${colors.border.light}`,
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: colors.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Build sx={{ fontSize: 20, color: colors.primary.main }} />
                  المعلومات التقنية
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth required>
                    <InputLabel>الحالة</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      label="الحالة"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.primary.main
                          }
                        }
                      }}
                    >
                      <MenuItem value="active">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DirectionsCar sx={{ fontSize: 18, color: colors.status.success }} />
                          نشطة
                        </Box>
                      </MenuItem>
                      <MenuItem value="maintenance">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Build sx={{ fontSize: 18, color: colors.status.warning }} />
                          في الصيانة
                        </Box>
                      </MenuItem>
                      <MenuItem value="inactive">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DirectionsCar sx={{ fontSize: 18, color: colors.status.error }} />
                          غير نشطة
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="عداد المسافة (كم)"
                    type="number"
                    value={formData.odometer}
                    onChange={(e) => setFormData({ ...formData, odometer: parseInt(e.target.value) })}
                    error={!!formErrors.odometer}
                    helperText={formErrors.odometer}
                    fullWidth
                    InputProps={{
                      startAdornment: <Speed sx={{ mr: 1, color: colors.text.secondary }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary.main
                        }
                      }
                    }}
                  />
                  
                  <TextField
                    label="نوع الوقود"
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    error={!!formErrors.fuel_type}
                    helperText={formErrors.fuel_type}
                    fullWidth
                    InputProps={{
                      startAdornment: <LocalGasStation sx={{ mr: 1, color: colors.text.secondary }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary.main
                        }
                      }
                    }}
                  />
                  
                  <TextField
                    label="تاريخ انتهاء التأمين"
                    type="date"
                    value={formData.insurance_expiry}
                    onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                    error={!!formErrors.insurance_expiry}
                    helperText={formErrors.insurance_expiry}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <CalendarToday sx={{ mr: 1, color: colors.text.secondary }} />
                    }}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary.main
                        }
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* الملاحظات */}
          <Card sx={{ 
            background: colors.background.secondary,
            border: `1px solid ${colors.border.light}`,
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 2, 
                color: colors.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Notes sx={{ fontSize: 20, color: colors.primary.main }} />
                ملاحظات إضافية
              </Typography>
              
              <TextField
                label="ملاحظات"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={3}
                fullWidth
                placeholder="أدخل أي ملاحظات إضافية حول المركبة..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.primary.main
                    }
                  }
                }}
              />
            </CardContent>
          </Card>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          background: colors.background.secondary,
          borderTop: `1px solid ${colors.border.light}`
        }}>
          <Button 
            onClick={() => setOpenCreateDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              borderColor: colors.border.medium,
              color: colors.text.secondary,
              '&:hover': {
                borderColor: colors.primary.main,
                color: colors.primary.main
              }
            }}
          >
                    إلغاء
                  </Button>
          <Button 
            onClick={handleSubmitCreate} 
            variant="contained" 
            disabled={submitting}
            sx={{
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
              },
              '&:disabled': {
                background: colors.neutral[300]
              }
            }}
          >
            {submitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} sx={{ color: 'white' }} />
                جاري الإضافة...
              </Box>
            ) : (
              'إضافة المركبة'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* نموذج تعديل المركبة */}
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
              تعديل المركبة
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
              تحديث بيانات المركبة: {selectedVehicle?.name}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 3,
            mb: 3
          }}>
            {/* المعلومات الأساسية */}
            <Card sx={{ 
              background: colors.background.secondary,
              border: `1px solid ${colors.border.light}`,
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: colors.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <DirectionsCar sx={{ fontSize: 20, color: colors.primary.main }} />
                  المعلومات الأساسية
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="اسم المركبة"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary.main
                        }
                      }
                    }}
                  />
                  <TextField
                    label="الموديل"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    error={!!formErrors.model}
                    helperText={formErrors.model}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary.main
                        }
                      }
                    }}
                  />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField
                      label="سنة الصنع"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      error={!!formErrors.year}
                      helperText={formErrors.year}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.primary.main
                          }
                        }
                      }}
                    />
                    <TextField
                      label="رقم اللوحة"
                      value={formData.plate_number}
                      onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                      error={!!formErrors.plate_number}
                      helperText={formErrors.plate_number}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.primary.main
                          }
                        }
                      }}
                    />
                  </Box>
                  <TextField
                    label="رقم الهيكل (VIN)"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                    error={!!formErrors.vin}
                    helperText={formErrors.vin}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary.main
                        }
                      }
                    }}
                  />
                </Box>
            </CardContent>
          </Card>

            {/* المعلومات التقنية */}
            <Card sx={{ 
              background: colors.background.secondary,
              border: `1px solid ${colors.border.light}`,
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: colors.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Build sx={{ fontSize: 20, color: colors.primary.main }} />
                  المعلومات التقنية
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth required>
                    <InputLabel>الحالة</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      label="الحالة"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.primary.main
                          }
                        }
                      }}
                    >
                      <MenuItem value="active">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DirectionsCar sx={{ fontSize: 18, color: colors.status.success }} />
                          نشطة
                        </Box>
                      </MenuItem>
                      <MenuItem value="maintenance">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Build sx={{ fontSize: 18, color: colors.status.warning }} />
                          في الصيانة
                        </Box>
                      </MenuItem>
                      <MenuItem value="inactive">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DirectionsCar sx={{ fontSize: 18, color: colors.status.error }} />
                          غير نشطة
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="عداد المسافة (كم)"
                    type="number"
                    value={formData.odometer}
                    onChange={(e) => setFormData({ ...formData, odometer: parseInt(e.target.value) })}
                    error={!!formErrors.odometer}
                    helperText={formErrors.odometer}
                    fullWidth
                    InputProps={{
                      startAdornment: <Speed sx={{ mr: 1, color: colors.text.secondary }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary.main
                        }
                      }
                    }}
                  />
                  
                  <TextField
                    label="نوع الوقود"
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    error={!!formErrors.fuel_type}
                    helperText={formErrors.fuel_type}
                    fullWidth
                    InputProps={{
                      startAdornment: <LocalGasStation sx={{ mr: 1, color: colors.text.secondary }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary.main
                        }
                      }
                    }}
                  />
                  
                  <TextField
                    label="تاريخ انتهاء التأمين"
                    type="date"
                    value={formData.insurance_expiry}
                    onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                    error={!!formErrors.insurance_expiry}
                    helperText={formErrors.insurance_expiry}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <CalendarToday sx={{ mr: 1, color: colors.text.secondary }} />
                    }}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.primary.main
                        }
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* الملاحظات */}
          <Card sx={{ 
            background: colors.background.secondary,
            border: `1px solid ${colors.border.light}`,
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 2, 
                color: colors.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Notes sx={{ fontSize: 20, color: colors.primary.main }} />
                ملاحظات إضافية
              </Typography>
              
              <TextField
                label="ملاحظات"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={3}
                fullWidth
                placeholder="أدخل أي ملاحظات إضافية حول المركبة..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.primary.main
                    }
                  }
                }}
              />
            </CardContent>
          </Card>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          background: colors.background.secondary,
          borderTop: `1px solid ${colors.border.light}`
        }}>
          <Button 
            onClick={() => setOpenEditDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              borderColor: colors.border.medium,
              color: colors.text.secondary,
              '&:hover': {
                borderColor: colors.primary.main,
                color: colors.primary.main
              }
            }}
          >
            إلغاء
                  </Button>
                  <Button 
            onClick={handleSubmitEdit} 
            variant="contained" 
            disabled={submitting}
            sx={{
              background: colors.gradients.card3,
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: colors.gradients.card4,
                transform: 'translateY(-1px)',
                boxShadow: colors.shadows.large
              },
              '&:disabled': {
                background: colors.neutral[300]
              }
            }}
          >
            {submitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} sx={{ color: 'white' }} />
                جاري التحديث...
              </Box>
            ) : (
              'تحديث المركبة'
            )}
                  </Button>
        </DialogActions>
      </Dialog>

      {/* نموذج عرض تفاصيل المركبة */}
      <Dialog 
        open={openViewDialog} 
        onClose={() => setOpenViewDialog(false)}
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
          background: colors.gradients.card1,
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
            <Visibility />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              تفاصيل المركبة
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
              عرض جميع معلومات المركبة
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          {selectedVehicle && (
            <>
              {/* رأس المعلومات */}
              <Card sx={{ 
                background: colors.background.secondary,
                border: `1px solid ${colors.border.light}`,
                borderRadius: 2,
                mb: 3
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: colors.primary.main, 
                      width: 80, 
                      height: 80,
                      boxShadow: colors.shadows.medium
                    }}>
                      {getStatusIcon(selectedVehicle.status)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700,
                        color: colors.text.primary,
                        mb: 1
                      }}>
                        {selectedVehicle.name}
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: colors.text.secondary,
                        mb: 2
                      }}>
                        {selectedVehicle.model} - {selectedVehicle.year}
                      </Typography>
                      <Chip
                        label={getStatusText(selectedVehicle.status)}
                        color={getStatusColor(selectedVehicle.status) as any}
                        icon={getStatusIcon(selectedVehicle.status)}
                        sx={{
                          fontWeight: 600,
                          borderRadius: 2,
                          px: 2,
                          py: 1,
                          '& .MuiChip-icon': {
                            fontSize: 18
                          }
                        }}
                      />
                    </Box>
                  </Box>
              </CardContent>
            </Card>

              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                gap: 3
              }}>
                {/* المعلومات الأساسية */}
                <Card sx={{ 
                  background: colors.background.secondary,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: 2
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      mb: 3, 
                      color: colors.text.primary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <DirectionsCar sx={{ fontSize: 20, color: colors.primary.main }} />
                      المعلومات الأساسية
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ 
                          color: colors.text.secondary,
                          fontWeight: 600,
                          mb: 0.5
                        }}>
                          الموديل
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: colors.text.primary,
                          fontWeight: 500
                        }}>
                          {selectedVehicle.model}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" sx={{ 
                          color: colors.text.secondary,
                          fontWeight: 600,
                          mb: 0.5
                        }}>
                          سنة الصنع
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: colors.text.primary,
                          fontWeight: 500
                        }}>
                          {selectedVehicle.year}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" sx={{ 
                          color: colors.text.secondary,
                          fontWeight: 600,
                          mb: 0.5
                        }}>
                          رقم اللوحة
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          fontFamily: 'monospace', 
                          fontWeight: 700,
                          color: colors.primary.main,
                          fontSize: '1.1rem'
                        }}>
                          {selectedVehicle.plate_number}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" sx={{ 
                          color: colors.text.secondary,
                          fontWeight: 600,
                          mb: 0.5
                        }}>
                          رقم الهيكل (VIN)
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          fontFamily: 'monospace',
                          color: colors.text.primary,
                          fontWeight: 500
                        }}>
                          {selectedVehicle.vin}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* المعلومات التقنية */}
                <Card sx={{ 
                  background: colors.background.secondary,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: 2
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      mb: 3, 
                      color: colors.text.primary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Build sx={{ fontSize: 20, color: colors.primary.main }} />
                      المعلومات التقنية
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Speed sx={{ fontSize: 20, color: colors.text.secondary }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ 
                            color: colors.text.secondary,
                            fontWeight: 600,
                            mb: 0.5
                          }}>
                            عداد المسافة
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: colors.text.primary,
                            fontWeight: 500
                          }}>
                            {selectedVehicle.odometer?.toLocaleString() || 0} كم
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalGasStation sx={{ fontSize: 20, color: colors.text.secondary }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ 
                            color: colors.text.secondary,
                            fontWeight: 600,
                            mb: 0.5
                          }}>
                            نوع الوقود
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: colors.text.primary,
                            fontWeight: 500
                          }}>
                            {selectedVehicle.fuel_type}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 20, color: colors.text.secondary }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ 
                            color: colors.text.secondary,
                            fontWeight: 600,
                            mb: 0.5
                          }}>
                            تاريخ انتهاء التأمين
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: colors.text.primary,
                            fontWeight: 500
                          }}>
                            {new Date(selectedVehicle.insurance_expiry).toLocaleDateString('ar-SA')}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* معلومات إضافية */}
              <Card sx={{ 
                background: colors.background.secondary,
                border: `1px solid ${colors.border.light}`,
                borderRadius: 2,
                mt: 3
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 3, 
                    color: colors.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <CalendarToday sx={{ fontSize: 20, color: colors.primary.main }} />
                    معلومات إضافية
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                    gap: 3
                  }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ 
                        color: colors.text.secondary,
                        fontWeight: 600,
                        mb: 0.5
                      }}>
                        تاريخ الإنشاء
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: colors.text.primary,
                        fontWeight: 500
                      }}>
                        {new Date(selectedVehicle.created_at).toLocaleDateString('ar-SA')}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" sx={{ 
                        color: colors.text.secondary,
                        fontWeight: 600,
                        mb: 0.5
                      }}>
                        آخر تحديث
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: colors.text.primary,
                        fontWeight: 500
                      }}>
                        {selectedVehicle.updated_at ? new Date(selectedVehicle.updated_at).toLocaleDateString('ar-SA') : 'غير محدد'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* الملاحظات */}
              {selectedVehicle.notes && (
                <Card sx={{ 
                  background: colors.background.secondary,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: 2,
                  mt: 3
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      mb: 2, 
                      color: colors.text.primary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Notes sx={{ fontSize: 20, color: colors.primary.main }} />
                      ملاحظات
                    </Typography>
                    
                    <Typography variant="body1" sx={{ 
                      color: colors.text.primary,
                      lineHeight: 1.6,
                      background: colors.background.primary,
                      p: 2,
                      borderRadius: 1,
                      border: `1px solid ${colors.border.light}`
                    }}>
                      {selectedVehicle.notes}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          background: colors.background.secondary,
          borderTop: `1px solid ${colors.border.light}`
        }}>
          <Button 
            onClick={() => setOpenViewDialog(false)}
            variant="contained"
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
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* نموذج تأكيد الحذف */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
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
          background: colors.status.error + '20',
          color: colors.status.error,
          borderRadius: '12px 12px 0 0',
          py: 3,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Avatar sx={{ 
            background: colors.status.error,
            width: 40,
            height: 40
          }}>
            <Delete />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              تأكيد الحذف
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
              حذف المركبة نهائياً
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Avatar sx={{ 
              bgcolor: colors.status.error + '20',
              color: colors.status.error,
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 3
            }}>
              <Delete sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              color: colors.text.primary,
              mb: 2
            }}>
              هل أنت متأكد من حذف المركبة؟
            </Typography>
            
            <Typography variant="body1" sx={{ 
              color: colors.text.secondary,
              mb: 3,
              lineHeight: 1.6
            }}>
              سيتم حذف المركبة <strong>"{selectedVehicle?.name}"</strong> نهائياً من النظام.
              <br />
              <span style={{ color: colors.status.error, fontWeight: 600 }}>
                لا يمكن التراجع عن هذا الإجراء.
              </span>
            </Typography>
            
            {selectedVehicle && (
              <Card sx={{ 
                background: colors.background.secondary,
                border: `1px solid ${colors.border.light}`,
                borderRadius: 2,
                p: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ 
                    bgcolor: colors.primary.main,
                    width: 50,
                    height: 50
                  }}>
                    {getStatusIcon(selectedVehicle.status)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 600,
                      color: colors.text.primary
                    }}>
                      {selectedVehicle.name}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: colors.text.secondary
                    }}>
                      {selectedVehicle.model} - {selectedVehicle.plate_number}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          background: colors.background.secondary,
          borderTop: `1px solid ${colors.border.light}`
        }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              borderColor: colors.border.medium,
              color: colors.text.secondary,
              '&:hover': {
                borderColor: colors.primary.main,
                color: colors.primary.main
              }
            }}
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained"
            disabled={submitting}
            sx={{
              background: colors.status.error,
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: colors.status.error + 'dd',
                transform: 'translateY(-1px)',
                boxShadow: colors.shadows.large
              },
              '&:disabled': {
                background: colors.neutral[300]
              }
            }}
          >
            {submitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} sx={{ color: 'white' }} />
                جاري الحذف...
              </Box>
            ) : (
              'حذف المركبة'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
} 