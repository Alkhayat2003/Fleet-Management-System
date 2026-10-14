'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, User, CreateUserRequest, UpdateUserRequest } from '@/services/api';
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
  Snackbar
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Person,
  AdminPanelSettings,
  SupervisorAccount,
  DirectionsCar,
  Search,
  Refresh,
  Update,
  CalendarToday,
  Email,
  Phone,
  LocationOn,
  Badge,
  Error
} from '@mui/icons-material';

interface UserFormData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'driver';
  phone_number: string;
  address: string;
  license_number: string;
  license_expiry: string;
}

const initialFormData: UserFormData = {
  username: '',
  email: '',
  password: '',
  password2: '',
  first_name: '',
  last_name: '',
  role: 'driver',
  phone_number: '',
  address: '',
  license_number: '',
  license_expiry: ''
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // حالة النماذج
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // حالة البحث والفلترة
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // تحميل المستخدمين
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('فشل في تحميل قائمة المستخدمين');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // فلترة المستخدمين
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
  };

  // فتح نموذج إنشاء مستخدم جديد
  const handleCreateUser = () => {
    resetForm();
    setOpenCreateDialog(true);
  };

  // فتح نموذج تعديل مستخدم
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      password2: '',
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      phone_number: user.phone_number || '',
      address: user.address || '',
      license_number: user.license_number || '',
      license_expiry: user.license_expiry || ''
    });
    setOpenEditDialog(true);
  };

  // فتح عرض تفاصيل المستخدم
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setOpenViewDialog(true);
  };

  // فتح حذف مستخدم
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  // التحقق من صحة النموذج
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) errors.username = 'اسم المستخدم مطلوب';
    if (!formData.email.trim()) errors.email = 'البريد الإلكتروني مطلوب';
    if (!formData.first_name.trim()) errors.first_name = 'الاسم الأول مطلوب';
    if (!formData.last_name.trim()) errors.last_name = 'اسم العائلة مطلوب';
    
    if (openCreateDialog) {
      if (!formData.password) errors.password = 'كلمة المرور مطلوبة';
      if (formData.password.length < 8) errors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
      if (formData.password !== formData.password2) errors.password2 = 'كلمة المرور غير متطابقة';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // إنشاء مستخدم جديد
  const handleSubmitCreate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const userData: CreateUserRequest = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        phone_number: formData.phone_number || undefined,
        address: formData.address || undefined,
        license_number: formData.license_number || undefined,
        license_expiry: formData.license_expiry || undefined
      };

      await apiService.createUser(userData);
      setSuccess('تم إنشاء المستخدم بنجاح');
      setOpenCreateDialog(false);
      loadUsers();
    } catch (err: unknown) {
      setError((err as Error).message || 'فشل في إنشاء المستخدم');
    } finally {
      setSubmitting(false);
    }
  };

  // تحديث مستخدم
  const handleSubmitEdit = async () => {
    if (!validateForm() || !selectedUser) return;

    try {
      setSubmitting(true);
      const userData: UpdateUserRequest = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        phone_number: formData.phone_number || undefined,
        address: formData.address || undefined,
        license_number: formData.license_number || undefined,
        license_expiry: formData.license_expiry || undefined
      };

      await apiService.updateUser(selectedUser.id, userData);
      setSuccess('تم تحديث المستخدم بنجاح');
      setOpenEditDialog(false);
      loadUsers();
    } catch (err: unknown) {
      setError((err as Error).message || 'فشل في تحديث المستخدم');
    } finally {
      setSubmitting(false);
    }
  };

  // حذف مستخدم
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      await apiService.deleteUser(selectedUser.id);
      setSuccess('تم حذف المستخدم بنجاح');
      setOpenDeleteDialog(false);
      loadUsers();
    } catch (err: unknown) {
      setError((err as Error).message || 'فشل في حذف المستخدم');
    } finally {
      setSubmitting(false);
    }
  };

  // الحصول على أيقونة الدور
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettings />;
      case 'manager':
        return <SupervisorAccount />;
      case 'driver':
        return <DirectionsCar />;
      default:
        return <Person />;
    }
  };

  // الحصول على لون الدور
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'driver':
        return 'info';
      default:
        return 'default';
    }
  };

  // الحصول على نص الدور
  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدير النظام';
      case 'manager':
        return 'مشرف';
      case 'driver':
        return 'سائق';
      default:
        return role;
    }
  };

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
            <Person sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 800, 
              color: colors.text.inverse,
              mb: 0.5,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              إدارة المستخدمين
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 500
            }}>
              إدارة جميع المستخدمين والصلاحيات في النظام
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
              {users.length}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 600
            }}>
              إجمالي المستخدمين
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
              {users.filter(u => u.role === 'admin').length}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 600
            }}>
              مدراء النظام
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
              {users.filter(u => u.role === 'manager').length}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 600
            }}>
              مشرفين
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
              {users.filter(u => u.role === 'driver').length}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 600
            }}>
              سائقين
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
                placeholder="البحث في المستخدمين..."
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
                <InputLabel>فلترة حسب الدور</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="فلترة حسب الدور"
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
                      <Person sx={{ fontSize: 18, color: colors.text.secondary }} />
                      جميع الأدوار
                    </Box>
                  </MenuItem>
                  <MenuItem value="admin">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AdminPanelSettings sx={{ fontSize: 18, color: colors.status.error }} />
                      مدير النظام
                    </Box>
                  </MenuItem>
                  <MenuItem value="manager">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SupervisorAccount sx={{ fontSize: 18, color: colors.status.warning }} />
                      مشرف
                    </Box>
                  </MenuItem>
                  <MenuItem value="driver">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsCar sx={{ fontSize: 18, color: colors.status.success }} />
                      سائق
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
                onClick={loadUsers}
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
                onClick={handleCreateUser}
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
                إضافة مستخدم جديد
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* عرض المستخدمين بالكارد */}
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
              جاري تحميل المستخدمين
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
              حدث خطأ في تحميل المستخدمين
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
              onClick={loadUsers}
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
        ) : filteredUsers.length === 0 ? (
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
              <Person sx={{ fontSize: 40, color: colors.text.secondary }} />
            </Avatar>
            <Typography variant="h6" sx={{ 
              color: colors.text.primary,
              fontWeight: 600
            }}>
              لا توجد مستخدمين
            </Typography>
            <Typography variant="body2" sx={{ 
              color: colors.text.secondary,
              maxWidth: 400
            }}>
              {searchTerm || roleFilter !== 'all' ? 'لا توجد نتائج للبحث المحدد' : 'لم يتم العثور على مستخدمين في النظام'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateUser}
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
              إضافة أول مستخدم
            </Button>
          </Box>
        ) : (
          filteredUsers.map((user) => (
            <Card
                      key={user.id} 
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
                  '& .user-avatar': {
                    transform: 'scale(1.1) rotate(5deg)',
                    boxShadow: `0 8px 25px ${colors.shadows.medium}`,
                  },
                  '& .user-info': {
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
                    className="user-avatar"
                    sx={{ 
                      bgcolor: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.light})`,
                      width: 70,
                      height: 70,
                      boxShadow: colors.shadows.medium,
                      backgroundImage: user.profile_picture ? `url(${user.profile_picture})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
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
                        background: colors.status.success,
                        border: `3px solid ${colors.background.secondary}`,
                        borderRadius: '50%',
                        boxShadow: colors.shadows.small,
                      }
                    }}
                  >
                    {!user.profile_picture && (
                      user.first_name?.charAt(0) || user.username.charAt(0)
                    )}
                          </Avatar>
                  
                  <Box className="user-info" sx={{ flex: 1, transition: 'transform 0.3s ease' }}>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 800,
                              color: colors.text.primary,
                      mb: 1,
                      background: `linear-gradient(135deg, ${colors.text.primary}, ${colors.primary.main})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                            }}>
                              {user.first_name} {user.last_name}
                            </Typography>
                    <Typography variant="body2" sx={{ 
                              color: colors.text.secondary,
                      mb: 2,
                      fontWeight: 500,
                      fontSize: '0.9rem'
                            }}>
                              @{user.username}
                            </Typography>
                        <Chip
                          label={getRoleText(user.role)}
                          color={getRoleColor(user.role) as any}
                      size="small"
                      icon={getRoleIcon(user.role)}
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

                {/* معلومات المستخدم */}
                <Box className="user-info" sx={{ 
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
                      <Email sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ 
                        color: colors.text.secondary,
                        fontWeight: 500,
                        display: 'block',
                        mb: 0.5
                      }}>
                        البريد الإلكتروني
                        </Typography>
                      <Typography variant="body2" sx={{ 
                        color: colors.text.primary,
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {user.email}
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
                      <Phone sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ 
                        color: colors.text.secondary,
                        fontWeight: 500,
                        display: 'block',
                        mb: 0.5
                      }}>
                        رقم الهاتف
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: colors.text.primary,
                        fontWeight: 600
                      }}>
                        {user.phone_number || 'غير محدد'}
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
                      <CalendarToday sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ 
                        color: colors.text.secondary,
                        fontWeight: 500,
                        display: 'block',
                        mb: 0.5
                      }}>
                        تاريخ الإنشاء
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: colors.text.primary,
                        fontWeight: 600
                      }}>
                        {new Date(user.created_at).toLocaleDateString('ar-SA')}
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
                              onClick={() => handleViewUser(user)}
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
                  <Tooltip title="تعديل المستخدم" arrow placement="top">
                            <IconButton
                              size="medium"
                              onClick={() => handleEditUser(user)}
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
                  <Tooltip title="حذف المستخدم" arrow placement="top">
                            <IconButton
                              size="medium"
                              onClick={() => handleDeleteUser(user)}
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
                              disabled={user.id === currentUser?.id}
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

      {/* نموذج إنشاء مستخدم جديد */}
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
              إضافة مستخدم جديد
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
              أدخل بيانات المستخدم الجديد
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
                  <Person sx={{ fontSize: 20, color: colors.primary.main }} />
                  المعلومات الأساسية
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="اسم المستخدم"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    error={!!formErrors.username}
                    helperText={formErrors.username}
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
                    label="البريد الإلكتروني"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
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
                      label="الاسم الأول"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      error={!!formErrors.first_name}
                      helperText={formErrors.first_name}
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
                      label="اسم العائلة"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      error={!!formErrors.last_name}
                      helperText={formErrors.last_name}
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
                </Box>
              </CardContent>
            </Card>

            {/* كلمة المرور والدور */}
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
                  <AdminPanelSettings sx={{ fontSize: 20, color: colors.primary.main }} />
                  الأمان والصلاحيات
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="كلمة المرور"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
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
                    label="تأكيد كلمة المرور"
                    type="password"
                    value={formData.password2}
                    onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                    error={!!formErrors.password2}
                    helperText={formErrors.password2}
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
                  <FormControl fullWidth>
                    <InputLabel>الدور</InputLabel>
                    <Select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'manager' | 'driver' })}
                      label="الدور"
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          '&:hover': {
                            borderColor: colors.primary.main
                          }
                        }
                      }}
                    >
                      <MenuItem value="admin">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AdminPanelSettings sx={{ fontSize: 18, color: colors.status.error }} />
                          مدير النظام
                        </Box>
                      </MenuItem>
                      <MenuItem value="manager">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SupervisorAccount sx={{ fontSize: 18, color: colors.status.warning }} />
                          مشرف
                        </Box>
                      </MenuItem>
                      <MenuItem value="driver">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DirectionsCar sx={{ fontSize: 18, color: colors.status.success }} />
                          سائق
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* المعلومات الإضافية */}
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
                المعلومات الإضافية
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="رقم الهاتف"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
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
                  label="العنوان"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                  label="رقم الرخصة"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
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
                  label="تاريخ انتهاء الرخصة"
                  type="date"
                  value={formData.license_expiry}
                  onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
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
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setOpenCreateDialog(false)}
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
            onClick={handleSubmitCreate}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : <Add />}
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
              },
              '&:disabled': {
                background: colors.neutral[400]
              }
            }}
          >
            {submitting ? 'جاري الإنشاء...' : 'إنشاء المستخدم'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* نموذج تعديل المستخدم */}
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
              تعديل المستخدم
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
              تحديث بيانات المستخدم: {selectedUser?.first_name} {selectedUser?.last_name}
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
                  <Person sx={{ fontSize: 20, color: colors.primary.main }} />
                  المعلومات الأساسية
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="اسم المستخدم"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    error={!!formErrors.username}
                    helperText={formErrors.username}
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
                    label="البريد الإلكتروني"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
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
                      label="الاسم الأول"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      error={!!formErrors.first_name}
                      helperText={formErrors.first_name}
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
                      label="اسم العائلة"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      error={!!formErrors.last_name}
                      helperText={formErrors.last_name}
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
                </Box>
              </CardContent>
            </Card>

            {/* الدور */}
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
                  <AdminPanelSettings sx={{ fontSize: 20, color: colors.primary.main }} />
                  الصلاحيات
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>الدور</InputLabel>
                    <Select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'manager' | 'driver' })}
                      label="الدور"
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          '&:hover': {
                            borderColor: colors.primary.main
                          }
                        }
                      }}
                    >
                      <MenuItem value="admin">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AdminPanelSettings sx={{ fontSize: 18, color: colors.status.error }} />
                          مدير النظام
                        </Box>
                      </MenuItem>
                      <MenuItem value="manager">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SupervisorAccount sx={{ fontSize: 18, color: colors.status.warning }} />
                          مشرف
                        </Box>
                      </MenuItem>
                      <MenuItem value="driver">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DirectionsCar sx={{ fontSize: 18, color: colors.status.success }} />
                          سائق
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Alert severity="info" sx={{ 
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: colors.primary.main
                    }
                  }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      ملاحظة: لا يمكن تغيير كلمة المرور من هنا. استخدم صفحة الملف الشخصي لتغيير كلمة المرور.
                    </Typography>
                  </Alert>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* المعلومات الإضافية */}
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
                المعلومات الإضافية
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="رقم الهاتف"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
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
                  label="العنوان"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                  label="رقم الرخصة"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
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
                  label="تاريخ انتهاء الرخصة"
                  type="date"
                  value={formData.license_expiry}
                  onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
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
                background: colors.gradients.card4,
                transform: 'translateY(-1px)',
                boxShadow: colors.shadows.large
              },
              '&:disabled': {
                background: colors.neutral[400]
              }
            }}
          >
            {submitting ? 'جاري التحديث...' : 'تحديث المستخدم'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* عرض تفاصيل المستخدم المحسن */}
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
          تفاصيل المستخدم
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
              عرض جميع معلومات المستخدم
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          {selectedUser && (
            <>
              {/* رأس المعلومات */}
              <Card sx={{ 
                background: colors.background.secondary,
                border: `1px solid ${colors.border.light}`,
                borderRadius: 2,
                mb: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: colors.shadows.medium,
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar sx={{ 
                      bgcolor: colors.primary.main, 
                      width: 80, 
                      height: 80,
                      boxShadow: colors.shadows.medium,
                      backgroundImage: selectedUser.profile_picture ? `url(${selectedUser.profile_picture})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                }}>
                      {!selectedUser.profile_picture && (
                        selectedUser.first_name?.charAt(0) || selectedUser.username.charAt(0)
                      )}
                </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700,
                        color: colors.text.primary,
                        mb: 1
                      }}>
                    {selectedUser.first_name} {selectedUser.last_name}
                  </Typography>
                      <Typography variant="body1" sx={{ 
                        color: colors.text.secondary,
                        mb: 2
                      }}>
                    @{selectedUser.username}
                  </Typography>
                  <Chip
                    icon={getRoleIcon(selectedUser.role)}
                    label={getRoleText(selectedUser.role)}
                    color={getRoleColor(selectedUser.role) as any}
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
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: colors.shadows.medium,
                    transform: 'translateY(-2px)'
                  }
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
                      <Person sx={{ fontSize: 20, color: colors.primary.main }} />
                      المعلومات الأساسية
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                             <Box>
                         <Typography variant="subtitle2" sx={{ 
                           color: colors.text.secondary,
                           fontWeight: 600,
                           mb: 0.5,
                           display: 'flex',
                           alignItems: 'center',
                           gap: 1
                         }}>
                           <Email sx={{ fontSize: 16 }} />
                           البريد الإلكتروني
                         </Typography>
                         <Typography variant="body1" sx={{ 
                           color: colors.text.primary,
                           fontWeight: 500
                         }}>
                           {selectedUser.email}
                         </Typography>
                </Box>
                      
                                             <Box>
                         <Typography variant="subtitle2" sx={{ 
                           color: colors.text.secondary,
                           fontWeight: 600,
                           mb: 0.5,
                           display: 'flex',
                           alignItems: 'center',
                           gap: 1
                         }}>
                           <Phone sx={{ fontSize: 16 }} />
                           رقم الهاتف
                         </Typography>
                         <Typography variant="body1" sx={{ 
                           color: colors.text.primary,
                           fontWeight: 500
                         }}>
                           {selectedUser.phone_number || 'غير محدد'}
                         </Typography>
                       </Box>
                      
                                             <Box>
                         <Typography variant="subtitle2" sx={{ 
                           color: colors.text.secondary,
                           fontWeight: 600,
                           mb: 0.5,
                           display: 'flex',
                           alignItems: 'center',
                           gap: 1
                         }}>
                           <LocationOn sx={{ fontSize: 16 }} />
                           العنوان
                         </Typography>
                         <Typography variant="body1" sx={{ 
                           color: colors.text.primary,
                           fontWeight: 500
                         }}>
                           {selectedUser.address || 'غير محدد'}
                         </Typography>
                       </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* معلومات السائق */}
                <Card sx={{ 
                  background: colors.background.secondary,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: colors.shadows.medium,
                    transform: 'translateY(-2px)'
                  }
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
                      معلومات السائق
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {selectedUser.license_number ? (
                        <>
                                                     <Box>
                             <Typography variant="subtitle2" sx={{ 
                               color: colors.text.secondary,
                               fontWeight: 600,
                               mb: 0.5,
                               display: 'flex',
                               alignItems: 'center',
                               gap: 1
                             }}>
                               <Badge sx={{ fontSize: 16 }} />
                               رقم الرخصة
                             </Typography>
                            <Typography variant="body1" sx={{ 
                              fontFamily: 'monospace',
                              color: colors.primary.main,
                              fontWeight: 700,
                              fontSize: '1.1rem'
                            }}>
                              {selectedUser.license_number}
                            </Typography>
                    </Box>
                          
                                                     <Box>
                             <Typography variant="subtitle2" sx={{ 
                               color: colors.text.secondary,
                               fontWeight: 600,
                               mb: 0.5
                             }}>
                               تاريخ انتهاء الرخصة
                      </Typography>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                               <CalendarToday sx={{ 
                                 fontSize: 18, 
                                 color: selectedUser.license_expiry && new Date(selectedUser.license_expiry) < new Date() 
                                   ? colors.status.error 
                                   : colors.text.secondary 
                               }} />
                               <Typography variant="body1" sx={{ 
                                 color: selectedUser.license_expiry && new Date(selectedUser.license_expiry) < new Date() 
                                   ? colors.status.error 
                                   : colors.text.primary,
                                 fontWeight: 500
                               }}>
                                 {selectedUser.license_expiry ? 
                                   new Date(selectedUser.license_expiry).toLocaleDateString('ar-SA') : 
                                   'غير محدد'
                                 }
                               </Typography>
                               {selectedUser.license_expiry && new Date(selectedUser.license_expiry) < new Date() && (
                                 <Chip
                                   label="منتهية الصلاحية"
                                   size="small"
                                   color="error"
                                   sx={{ ml: 1, fontSize: '0.7rem' }}
                                 />
                               )}
                             </Box>
                    </Box>
                  </>
                      ) : (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 2,
                          color: colors.text.secondary
                        }}>
                          <DirectionsCar sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2">
                            لا توجد معلومات رخصة قيادة
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* معلومات النظام */}
              <Card sx={{ 
                background: colors.background.secondary,
                border: `1px solid ${colors.border.light}`,
                borderRadius: 2,
                mt: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: colors.shadows.medium,
                  transform: 'translateY(-2px)'
                }
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
                    <AdminPanelSettings sx={{ fontSize: 20, color: colors.primary.main }} />
                    معلومات النظام
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 18, color: colors.text.secondary }} />
                        <Typography variant="body1" sx={{ 
                          color: colors.text.primary,
                          fontWeight: 500
                        }}>
                    {new Date(selectedUser.created_at).toLocaleDateString('ar-SA')}
                  </Typography>
                </Box>
              </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" sx={{ 
                        color: colors.text.secondary,
                        fontWeight: 600,
                        mb: 0.5
                      }}>
                        آخر تحديث
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Update sx={{ fontSize: 18, color: colors.text.secondary }} />
                        <Typography variant="body1" sx={{ 
                          color: colors.text.primary,
                          fontWeight: 500
                        }}>
                          {new Date(selectedUser.updated_at).toLocaleDateString('ar-SA')}
                        </Typography>
            </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
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
            إغلاق
          </Button>
          <Button
            onClick={() => {
              setOpenViewDialog(false);
              handleEditUser(selectedUser!);
            }}
            variant="contained"
            startIcon={<Edit />}
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
              }
            }}
          >
            تعديل المستخدم
          </Button>
        </DialogActions>
      </Dialog>

      {/* تأكيد الحذف المحسن */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
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
          background: colors.status.error,
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
            <Delete />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          تأكيد الحذف
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
              حذف المستخدم نهائياً من النظام
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          {selectedUser && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              textAlign: 'center',
              gap: 3
            }}>
              <Avatar sx={{ 
                background: colors.status.error + '20',
                width: 80,
                height: 80,
                mb: 2
              }}>
                <Person sx={{ fontSize: 40, color: colors.status.error }} />
              </Avatar>
              
              <Box>
                <Typography variant="h6" sx={{ 
                  color: colors.text.primary,
                  fontWeight: 600,
                  mb: 1
                }}>
                  حذف المستخدم
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: colors.text.secondary,
                  mb: 2
                }}>
                  {selectedUser.first_name} {selectedUser.last_name}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: colors.text.secondary,
                  fontStyle: 'italic'
                }}>
                  @{selectedUser.username}
                </Typography>
              </Box>
              
              <Alert severity="warning" sx={{ 
                borderRadius: 2,
                width: '100%',
                '& .MuiAlert-icon': {
                  color: colors.status.warning
                }
              }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  تحذير: لا يمكن التراجع عن هذا الإجراء
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.85rem', mt: 0.5 }}>
                  سيتم حذف جميع بيانات المستخدم نهائياً من النظام
                </Typography>
              </Alert>
            </Box>
          )}
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
                borderColor: colors.text.primary,
                color: colors.text.primary
              }
            }}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : <Delete />}
            sx={{
              background: colors.status.error,
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: colors.status.error,
                transform: 'translateY(-1px)',
                boxShadow: colors.shadows.large
              },
              '&:disabled': {
                background: colors.neutral[400]
              }
            }}
          >
            {submitting ? 'جاري الحذف...' : 'حذف المستخدم'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* رسائل النجاح والخطأ */}
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