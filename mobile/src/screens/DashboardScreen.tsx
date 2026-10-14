import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTrip } from '../contexts/TripContext';
import apiService from '../services/api';
import locationService from '../services/locationService';
import { Trip, DashboardStats } from '../types';

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

const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentTrip, setCurrentTrip } = useTrip();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationTracking, setIsLocationTracking] = useState(false);

  useEffect(() => {
    loadDashboardData();
    checkLocationTrackingStatus();
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statsData, tripsData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getDriverTrips(),
      ]);
      setStats(statsData);
      setTrips(tripsData);
    } catch (error) {
      console.error('خطأ في تحميل بيانات لوحة التحكم:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkLocationTrackingStatus = async () => {
    const tracking = locationService.isLocationTracking();
    setIsLocationTracking(tracking);
  };

  const handleStartLocationTracking = async () => {
    try {
      await locationService.startLocationTracking();
      setIsLocationTracking(true);
      Alert.alert('نجح', 'تم بدء تتبع الموقع بنجاح (كل 10 ثواني)');
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء بدء تتبع الموقع');
    }
  };

  const handleStopLocationTracking = async () => {
    try {
      await locationService.stopLocationTracking();
      setIsLocationTracking(false);
      Alert.alert('نجح', 'تم إيقاف تتبع الموقع');
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إيقاف تتبع الموقع');
    }
  };

  const handleStartTrip = async (trip: Trip) => {
    try {
      const updatedTrip = await apiService.startTrip(trip.id);
      setCurrentTrip(updatedTrip);
      Alert.alert('نجح', 'تم بدء الرحلة بنجاح');
      loadDashboardData(); // تحديث البيانات
    } catch (error) {
      Alert.alert('خطأ', 'فشل في بدء الرحلة');
    }
  };

  const handleEndTrip = async (trip: Trip) => {
    try {
      await apiService.endTrip(trip.id);
      setCurrentTrip(null);
      loadDashboardData(); // تحديث البيانات
    } catch (error) {
      Alert.alert('خطأ', 'فشل في إنهاء الرحلة');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return COLORS.warning;
      case 'in_progress':
        return COLORS.success;
      case 'completed':
        return COLORS.accent;
      default:
        return COLORS.textLight;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned':
        return 'مخطط';
      case 'active':
        return 'نشط';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return 'غير محدد';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={isLoading} 
          onRefresh={loadDashboardData}
          colors={[COLORS.accent, COLORS.success, COLORS.warning]}
          tintColor={COLORS.accent}
          progressBackgroundColor={COLORS.card}
        />
      }
    >
      {/* معلومات السائق */}
      <View style={styles.userCard}>
        {isLoading ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonTextContainer}>
              <View style={styles.skeletonText} />
              <View style={[styles.skeletonText, { width: '60%' }]} />
            </View>
          </View>
        ) : (
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person-circle" size={70} color={COLORS.accent} />
              </View>
              <View style={styles.avatarGlow} />
              <View style={[styles.statusIndicator, { backgroundColor: COLORS.success }]} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text style={styles.userRole}>سائق محترف</Text>
            </View>
          </View>
        )}
      </View>

      {/* حالة تتبع الموقع */}
      <View style={styles.trackingCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="location" size={24} color={COLORS.accent} />
          </View>
          <Text style={styles.sectionTitle}>تتبع الموقع</Text>
        </View>
        <View style={styles.trackingStatus}>
          <View style={[styles.statusDot, { backgroundColor: isLocationTracking ? COLORS.success : COLORS.danger }]} />
          <Text style={[styles.trackingText, { color: isLocationTracking ? COLORS.success : COLORS.textLight }]}>
            {isLocationTracking ? 'جاري التتبع (كل 10 ثواني)' : 'متوقف'}
          </Text>
        </View>
        
        <View style={styles.trackingActions}>
          {!isLocationTracking ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={handleStartLocationTracking}
              activeOpacity={0.8}
            >
              <Ionicons name="play" size={20} color={COLORS.text} />
              <Text style={styles.actionButtonText}>بدء التتبع</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.stopButton]}
              onPress={handleStopLocationTracking}
              activeOpacity={0.8}
            >
              <Ionicons name="stop" size={20} color={COLORS.text} />
              <Text style={styles.actionButtonText}>إيقاف التتبع</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* الرحلة الحالية */}
      {currentTrip && (
        <View style={styles.currentTripCard}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="car-sport" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.sectionTitle}>الرحلة الحالية</Text>
          </View>
          <View style={styles.tripInfo}>
            <Text style={styles.tripVehicle}>
              {currentTrip.vehicle.name} - {currentTrip.vehicle.plate_number}
            </Text>
            <Text style={styles.tripTime}>
              بدأت: {new Date(currentTrip.start_time).toLocaleString('ar-SA')}
            </Text>
            <View style={styles.tripActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.endTripButton]}
                onPress={() => handleEndTrip(currentTrip)}
                activeOpacity={0.8}
              >
                <Ionicons name="flag" size={20} color={COLORS.text} />
                <Text style={styles.actionButtonText}>إنهاء الرحلة</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* الرحلات القادمة */}
      <View style={styles.tripsCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="calendar" size={24} color={COLORS.warning} />
          </View>
          <Text style={styles.sectionTitle}>الرحلات القادمة</Text>
        </View>
        {trips.length > 0 ? (
          trips.slice(0, 3).map((trip) => (
            <View key={trip.id} style={styles.tripItem}>
              <View style={styles.tripHeader}>
                <Text style={styles.tripVehicle}>
                  {trip.vehicle.name} - {trip.vehicle.plate_number}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(trip.status)}</Text>
                </View>
              </View>
              <Text style={styles.tripTime}>
                {new Date(trip.start_time).toLocaleString('ar-SA')}
              </Text>
              {trip.status === 'planned' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.startTripButton]}
                  onPress={() => handleStartTrip(trip)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="play" size={16} color={COLORS.text} />
                  <Text style={styles.actionButtonText}>بدء الرحلة</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>لا توجد رحلات قادمة</Text>
          </View>
        )}
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
  
  // بطاقة معلومات المستخدم
  userCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.glass,
  },
  avatarGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 44,
    backgroundColor: COLORS.accent,
    opacity: 0.2,
    zIndex: -1,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: COLORS.card,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  // بطاقة تتبع الموقع
  trackingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconContainer: {
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
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  trackingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  trackingActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: 120,
  },
  startButton: {
    backgroundColor: COLORS.success,
  },
  stopButton: {
    backgroundColor: COLORS.danger,
  },
  actionButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // بطاقة الرحلة الحالية
  currentTripCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tripInfo: {
    marginTop: 8,
  },
  tripVehicle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  tripTime: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  tripActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  endTripButton: {
    backgroundColor: COLORS.warning,
  },
  
  // بطاقة الرحلات
  tripsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tripItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    color: COLORS.text,
    fontWeight: '600',
  },
  startTripButton: {
    backgroundColor: COLORS.primary,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  
  // حالة فارغة
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 16,
    fontWeight: '400',
  },
  skeletonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.glass,
    marginRight: 16,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonText: {
    height: 16,
    backgroundColor: COLORS.glass,
    borderRadius: 8,
  },
});

export default DashboardScreen; 