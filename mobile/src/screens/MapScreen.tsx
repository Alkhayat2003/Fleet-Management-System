import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTrip } from '../contexts/TripContext';
import locationService from '../services/locationService';
import apiService from '../services/api';
import { LocationHistory, LocationData } from '../types';
import * as Location from 'expo-location';
import SimpleMapView from '../components/SimpleMapView';
import { PanGestureHandler as RNGHPanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

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

const { width, height } = Dimensions.get('window');

const MapScreen: React.FC = React.memo(() => {
  const { logout, user } = useAuth();
  const { currentTrip } = useTrip();
  const navigation = useNavigation();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(false);
  const [isLocationCardVisible, setIsLocationCardVisible] = useState(false);
  const [shouldFocusOnLocation, setShouldFocusOnLocation] = useState(false);

  // قيم متحركة للبطاقة
  const translateY = useSharedValue(height);
  const cardHeight = 200; // ارتفاع البطاقة

  // قيم متحركة لإشارة الموقع
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);
  const rotationValue = useSharedValue(0);

  useEffect(() => {
    loadCurrentLocation();
    loadLocationHistory();
    // التحقق من حالة التتبع عند تحميل الشاشة
    const checkTrackingStatus = () => {
      const trackingStatus = locationService.isLocationTracking();
      setIsTracking(trackingStatus);
    };
    
    checkTrackingStatus();
    
    // التحقق من حالة التتبع كل 5 ثواني
    const interval = setInterval(checkTrackingStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // تأثير النبض لإشارة الموقع
  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.2, { duration: 1000 }),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withTiming(0.7, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  // تأثير الدوران أثناء التحميل
  useEffect(() => {
    if (isLoading) {
      rotationValue.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
    } else {
      rotationValue.value = withTiming(0, { duration: 300 });
    }
  }, [isLoading]);

  const loadCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const location = await locationService.getCurrentLocation();
      if (location) {
        const locationInfo = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          speed: location.coords.speed || 0,
          accuracy: location.coords.accuracy || 0,
          address: `خط العرض: ${location.coords.latitude.toFixed(6)}, خط الطول: ${location.coords.longitude.toFixed(6)}`,
        };
        
        setCurrentLocation(locationInfo);
        setShouldFocusOnLocation(true); // تفعيل التركيز على الموقع
      }
    } catch (error) {
      console.error('خطأ في تحميل الموقع الحالي:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocationHistory = async () => {
    if (!currentTrip) return;

    try {
      const history = await apiService.getVehicleLocationHistory(currentTrip.vehicle.id);
      setLocationHistory(history);
    } catch (error) {
      console.error('خطأ في تحميل سجل المواقع:', error);
    }
  };

  const handleStartTracking = async () => {
    if (!currentTrip) {
      Alert.alert('خطأ', 'لا توجد رحلة نشطة');
      return;
    }

    try {
      await locationService.startLocationTracking();
      setIsTracking(true);
      Alert.alert('نجح', 'تم بدء تتبع الموقع (كل 10 ثواني)');
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء بدء تتبع الموقع');
    }
  };

  const handleStopTracking = async () => {
    try {
      setTrackingError(false);
      await locationService.stopLocationTracking();
      setTimeout(() => {
        const isStillTracking = locationService.isLocationTracking();
        setIsTracking(isStillTracking);
        if (!isStillTracking) {
          Alert.alert('نجح', 'تم إيقاف تتبع الموقع');
        } else {
          setTrackingError(true);
          Alert.alert('تحذير', 'فشل في إيقاف التتبع، يرجى المحاولة مرة أخرى');
        }
      }, 1500);
    } catch (error) {
      setTrackingError(true);
      Alert.alert('خطأ', 'حدث خطأ أثناء إيقاف تتبع الموقع');
    }
  };

  // زر إيقاف إجباري
  const handleForceStopTracking = async () => {
    try {
      await locationService.forceStopLocationTracking();
      setTimeout(() => {
        const isStillTracking = locationService.isLocationTracking();
        setIsTracking(isStillTracking);
        setTrackingError(isStillTracking);
        if (!isStillTracking) {
          Alert.alert('نجح', 'تم إيقاف التتبع إجباريًا');
        } else {
          Alert.alert('فشل', 'لم يتم إيقاف التتبع حتى بالإجبار!');
        }
      }, 1000);
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الإيقاف الإجباري');
    }
  };

  // دالة موحدة للتعامل مع التتبع
  const handleTrackingToggle = async () => {
    if (isTracking) {
      await handleStopTracking();
    } else {
      await handleStartTracking();
    }
  };

  const handleMapClick = useCallback((lat: number, lng: number) => {
    // يمكن إضافة وظائف إضافية هنا في المستقبل
  }, []);

  const handleLocationMarkerClick = useCallback(() => {
    // إظهار بطاقة معلومات الموقع عند الضغط على إشارة الموقع
    if (currentLocation) {
      translateY.value = withSpring(0);
      setIsLocationCardVisible(true);
    }
  }, [currentLocation]);

  // معالج الإيماءات للبطاقة
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startY = translateY.value;
    },
    onActive: (event, context: any) => {
      const newY = context.startY + event.translationY;
      translateY.value = Math.max(0, Math.min(height - cardHeight, newY));
    },
    onEnd: (event) => {
      const shouldShow = event.velocityY < -500 || translateY.value < height / 2;
      translateY.value = withSpring(shouldShow ? 0 : height - cardHeight);
      runOnJS(setIsLocationCardVisible)(shouldShow);
    },
  });

  // النمط المتحرك للبطاقة
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // النمط المتحرك لإشارة الموقع
  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
      opacity: pulseOpacity.value,
    };
  });

  // النمط المتحرك للدوران
  const rotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotationValue.value}deg` }],
    };
  });

  // إعداد بيانات الخريطة
  const mapData = useMemo(() => {
    const mapLatitude = currentLocation?.latitude || 24.7136; // الرياض كموقع افتراضي
    const mapLongitude = currentLocation?.longitude || 46.6753;
    const locationHistoryForMap = locationHistory.map(loc => ({
      latitude: loc.latitude,
      longitude: loc.longitude,
      timestamp: loc.timestamp,
    }));
    
    return {
      latitude: mapLatitude,
      longitude: mapLongitude,
      locationHistory: locationHistoryForMap,
    };
  }, [currentLocation, locationHistory]);

  // تحسين التركيز على الموقع
  useEffect(() => {
    if (currentLocation && shouldFocusOnLocation) {
      // تأخير قليل للتأكد من تحميل الخريطة
      const timer = setTimeout(() => {
        setShouldFocusOnLocation(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [currentLocation, shouldFocusOnLocation]);

  const handleRefresh = useCallback(async () => {
    await loadCurrentLocation();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* الخريطة الكاملة */}
      <View style={styles.mapContainer}>
        <SimpleMapView
          latitude={mapData.latitude}
          longitude={mapData.longitude}
          onMapClick={handleMapClick}
          locationHistory={mapData.locationHistory}
          shouldFocusOnLocation={shouldFocusOnLocation}
          onLocationFocused={() => setShouldFocusOnLocation(false)}
          onLocationMarkerClick={handleLocationMarkerClick}
        />
        
        {/* زر تحديث الموقع العائم */}
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="refresh" 
            size={28} 
            color={COLORS.text} 
          />
        </TouchableOpacity>
        
        {/* زر إخفاء التفاصيل عند الضغط خارجها */}
        {isLocationCardVisible && (
          <TouchableOpacity
            style={styles.overlayButton}
            onPress={() => {
              translateY.value = withSpring(height - cardHeight);
              setIsLocationCardVisible(false);
            }}
            activeOpacity={1}
          />
        )}
      </View>

      {/* بطاقة معلومات الموقع القابلة للسحب */}
      {currentLocation && (
        <RNGHPanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.locationCard, animatedStyle]}>
            {/* مقبض السحب */}
            <View style={styles.dragHandle}>
              <View style={styles.dragBar} />
            </View>
            
            <View style={styles.locationHeader}>
              <View style={styles.locationIconContainer}>
                <Ionicons name="location" size={20} color={COLORS.accent} />
              </View>
              <Text style={styles.locationTitle}>موقعك الحالي</Text>
              <View style={styles.trackingStatus}>
                <View style={[styles.trackingDot, { backgroundColor: isTracking ? COLORS.success : COLORS.danger }]} />
                <Text style={[styles.trackingText, { color: isTracking ? COLORS.success : COLORS.textLight }]}>
                  {isTracking ? 'جاري التتبع' : 'متوقف'}
                </Text>
              </View>
            </View>
            
            <View style={styles.locationInfo}>
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>الموقع:</Text>
                <Text style={styles.locationValue}>
                  {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                </Text>
              </View>
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>السرعة:</Text>
                <Text style={styles.locationValue}>{(currentLocation.speed * 3.6).toFixed(0)} كم/س</Text>
              </View>
            </View>
          </Animated.View>
        </RNGHPanGestureHandler>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // الخريطة
  mapContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  
  // بطاقة معلومات الموقع القابلة للسحب
  locationCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomWidth: 0,
    height: 200,
  },
  dragHandle: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dragBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.textLight,
    borderRadius: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.glass,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.glass,
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  trackingText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
  },
  locationInfo: {
    gap: 8,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '400',
  },
  locationValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  overlayButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  refreshButton: {
    position: 'absolute',
    top: 25,
    right: 25,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.glass,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
});

export default MapScreen; 