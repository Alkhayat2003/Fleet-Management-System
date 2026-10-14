"use client";

import React, { useEffect, useState } from "react";
import { apiService, User } from "@/services/api";
import { Box, Paper, Avatar, Typography, Divider, Grid, TextField, Button, CircularProgress, Alert, Fade } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';

export default function ProfilePage() {
  const { user: authUser, refreshUser } = useAuth();
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone_number: "", address: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await apiService.getProfile();
        setUserState(data);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          phone_number: data.phone_number || "",
          address: data.address || "",
        });
      } catch (err: any) {
        setError("فشل في تحميل بيانات الملف الشخصي");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    try {
      setLoading(true);
      const updated = await apiService.updateProfile(form);
      setUserState(updated);
      refreshUser && refreshUser(); // update context
      setEditMode(false);
      setSuccess("تم تحديث الملف الشخصي بنجاح");
    } catch (err: any) {
      setError("فشل في تحديث الملف الشخصي");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#fff" }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!user) return null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#fff',
        display: 'block',
        p: 0,
        overflowX: 'hidden',
        boxSizing: 'border-box',
        ml: { xs: 1.5, md: 3 }, // margin-left for sidebar space (12px mobile, 24px desktop)
      }}
    >
      <Fade in timeout={700}>
        <Box sx={{ width: '100%', mt: 6, px: { xs: 2, md: 4 }, overflowX: 'hidden', boxSizing: 'border-box' }}>
          {/* Header: Avatar, Name, Role */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 3,
              mb: 5,
              width: '100%',
              minWidth: 0,
              overflowX: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <Avatar
              src={user.profile_picture || undefined}
              sx={{ width: 90, height: 90, bgcolor: "#fbbf24", fontSize: 48, flexShrink: 0 }}
            >
              {!user.profile_picture && <PersonIcon sx={{ fontSize: 48, color: "#fff" }} />}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
              <Typography variant="h5" fontWeight={800} color="#222" sx={{ mb: 0.5, mt: { xs: 2, sm: 0 }, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                {user.first_name} {user.last_name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                {user.role === 'admin' ? 'مدير' : user.role === 'manager' ? 'مشرف' : 'سائق'}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 4 }} />
          {/* Account Info Section */}
          <Typography variant="h6" fontWeight={700} color="#444" sx={{ mb: 2, letterSpacing: 1 }}>
            معلومات الحساب
          </Typography>
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {editMode ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              mb: 3,
              bgcolor: '#fafafa',
              borderRadius: 3,
              p: { xs: 2, md: 4 },
              alignItems: 'flex-start',
              boxShadow: 1,
              width: '100%',
              overflowX: 'hidden',
              boxSizing: 'border-box',
            }}>
              <Box component="form" noValidate autoComplete="off" sx={{ width: '100%' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField label="الاسم الأول" name="first_name" value={form.first_name} onChange={handleChange} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="اسم العائلة" name="last_name" value={form.last_name} onChange={handleChange} fullWidth />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="البريد الإلكتروني" name="email" value={form.email} onChange={handleChange} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="رقم الهاتف" name="phone_number" value={form.phone_number} onChange={handleChange} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="العنوان" name="address" value={form.address} onChange={handleChange} fullWidth />
                  </Grid>
                </Grid>
                <Box sx={{ display: "flex", gap: 2, mt: 4, justifyContent: "flex-start" }}>
                  <Button variant="contained" color="warning" size="large" sx={{ px: 6, fontWeight: 700, fontSize: 18, borderRadius: 3 }} onClick={handleSave}>
                    حفظ التعديلات
                  </Button>
                  <Button variant="outlined" color="inherit" size="large" sx={{ px: 4, fontWeight: 700, borderRadius: 3 }} onClick={() => setEditMode(false)}>
                    إلغاء
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                mb: 3,
                bgcolor: '#fafafa',
                borderRadius: 3,
                p: 3,
                alignItems: 'flex-start',
                boxShadow: 1,
                width: '100%',
                overflowX: 'hidden',
                boxSizing: 'border-box',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', minWidth: 0 }}>
                  <EmailIcon color="action" sx={{ fontSize: 28, flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0, maxWidth: '100%' }}>
                    <Typography variant="subtitle2" color="text.secondary">البريد الإلكتروني</Typography>
                    <Typography variant="body1" sx={{ mb: 1, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{user.email}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', minWidth: 0 }}>
                  <PhoneIcon color="action" sx={{ fontSize: 28, flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0, maxWidth: '100%' }}>
                    <Typography variant="subtitle2" color="text.secondary">رقم الهاتف</Typography>
                    <Typography variant="body1" sx={{ mb: 1, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{user.phone_number || "-"}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', minWidth: 0 }}>
                  <HomeIcon color="action" sx={{ fontSize: 28, flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0, maxWidth: '100%' }}>
                    <Typography variant="subtitle2" color="text.secondary">العنوان</Typography>
                    <Typography variant="body1" sx={{ mb: 1, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{user.address || "-"}</Typography>
                  </Box>
                </Box>
              </Box>
              <Divider sx={{ my: 4 }} />
              <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                <Button variant="contained" color="warning" size="large" sx={{ px: 6, fontWeight: 700, fontSize: 18, borderRadius: 3 }} onClick={() => setEditMode(true)}>
                  تعديل الملف الشخصي
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Fade>
    </Box>
  );
} 