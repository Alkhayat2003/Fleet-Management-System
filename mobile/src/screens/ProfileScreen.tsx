import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTrip } from '../contexts/TripContext';
import apiService from '../services/api';
import { Trip } from '../types';

// نظام الألوان الجديد - تصميم عصري وجذاب
const COLORS = {
  primary: '#667EEA', // أزرق بنفسجي جذاب
  primaryGradient: '#764BA2', // بنفسجي للتدريج
  secondary: '#F093FB', // وردي جذاب
  secondaryGradient: '#F5576C', // أحمر وردي للتدريج
  accent: '#4FACFE', // أزرق فاتح
  accentGradient: '#00F2FE', // أزرق سماوي للتدريج
  success: '#43E97B', // أخضر نيون
  successGradient: '#38F9D7', // أخضر سماوي للتدريج
  warning: '#FA709A', // وردي للتنبيهات
  danger: '#FF6B6B', // أحمر نيون
  background: '#0F0F23', // أسود مائل للأزرق
  surface: '#1A1A2E', // رمادي داكن
  card: '#16213E', // أزرق داكن للبطاقات
  text: '#FFFFFF', // أبيض للنصوص الرئيسية
  textLight: '#B8B8B8', // رمادي فاتح للنصوص الثانوية
  border: '#2A2A3E', // رمادي داكن للحدود
  shadow: '#000000', // أسود للظلال
  glass: 'rgba(255, 255, 255, 0.1)', // زجاجي شفاف
  glassDark: 'rgba(0, 0, 0, 0.3)', // زجاجي داكن
};

const ProfileScreen: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    license_number: user?.license_number || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateUser(editedUser);
      setIsEditing(false);
      Alert.alert('نجح', 'تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الملف الشخصي');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  return (
    <ScrollView style={styles.container}>
      {/* معلومات المستخدم */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person-circle" size={100} color={COLORS.accent} />
          </View>
          <View style={styles.avatarGlow} />
        </View>
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text style={styles.userRole}>سائق محترف</Text>
        </View>
      </View>

      {/* معلومات السائق */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <Ionicons name="person" size={24} color={COLORS.accent} />
          </View>
          <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            style={styles.editButton}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isEditing ? 'close' : 'create'}
              size={20}
              color={COLORS.accent}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.infoLabel}>الاسم الأول:</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedUser.first_name}
                onChangeText={(text) => setEditedUser({ ...editedUser, first_name: text })}
                placeholder="الاسم الأول"
                placeholderTextColor={COLORS.textLight}
              />
            ) : (
              <Text style={styles.infoValue}>{user?.first_name}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.infoLabel}>الاسم الأخير:</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedUser.last_name}
                onChangeText={(text) => setEditedUser({ ...editedUser, last_name: text })}
                placeholder="الاسم الأخير"
                placeholderTextColor={COLORS.textLight}
              />
            ) : (
              <Text style={styles.infoValue}>{user?.last_name}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="at" size={16} color={COLORS.textLight} />
              <Text style={styles.infoLabel}>اسم المستخدم:</Text>
            </View>
            <Text style={styles.infoValue}>{user?.username}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="mail" size={16} color={COLORS.textLight} />
              <Text style={styles.infoLabel}>البريد الإلكتروني:</Text>
            </View>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="call" size={16} color={COLORS.textLight} />
              <Text style={styles.infoLabel}>رقم الهاتف:</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedUser.phone_number}
                onChangeText={(text) => setEditedUser({ ...editedUser, phone_number: text })}
                placeholder="رقم الهاتف"
                placeholderTextColor={COLORS.textLight}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoValue}>{user?.phone_number || 'غير محدد'}</Text>
            )}
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <View style={styles.saveButtonContent}>
              {isLoading ? (
                <Ionicons name="refresh" size={20} color={COLORS.text} style={styles.saveButtonIcon} />
              ) : (
                <Ionicons name="checkmark" size={20} color={COLORS.text} style={styles.saveButtonIcon} />
              )}
              <Text style={styles.saveButtonText}>
                {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* معلومات الرخصة */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <Ionicons name="card" size={24} color={COLORS.success} />
          </View>
          <Text style={styles.sectionTitle}>معلومات الرخصة</Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="card-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.infoLabel}>رقم الرخصة:</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedUser.license_number}
                onChangeText={(text) => setEditedUser({ ...editedUser, license_number: text })}
                placeholder="رقم الرخصة"
                placeholderTextColor={COLORS.textLight}
              />
            ) : (
              <Text style={styles.infoValue}>{user?.license_number || 'غير محدد'}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="calendar" size={16} color={COLORS.textLight} />
              <Text style={styles.infoLabel}>تاريخ انتهاء الرخصة:</Text>
            </View>
            <Text style={styles.infoValue}>
              {user?.license_expiry ? formatDate(user.license_expiry) : 'غير محدد'}
            </Text>
          </View>
        </View>
      </View>

      {/* معلومات إضافية */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>معلومات مهمة</Text>
        <View style={styles.infoItem}>
          <Ionicons name="information-circle" size={16} color="#666" />
          <Text style={styles.infoText}>
            يمكنك تحديث معلوماتك الشخصية فقط
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="warning" size={16} color="#FF9800" />
          <Text style={styles.infoText}>
            معلومات الرخصة والدور لا يمكن تعديلها
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  
  // رأس الصفحة
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.glass,
  },
  avatarGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 66,
    backgroundColor: COLORS.accent,
    opacity: 0.2,
    zIndex: -1,
  },
  userInfoContainer: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: COLORS.accent,
    fontWeight: '600',
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '400',
  },
  
  // الأقسام
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.glass,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glass,
  },
  
  // معلومات المستخدم
  infoContainer: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    textAlign: 'left',
    flex: 1,
  },
  input: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    textAlign: 'left',
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  // زر الحفظ
  saveButton: {
    backgroundColor: COLORS.success,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonIcon: {
    marginLeft: 8,
  },
  saveButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  actionsSection: {
    margin: 15,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoSection: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});

export default ProfileScreen; 