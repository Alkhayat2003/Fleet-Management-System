import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LocationData } from '../types';
import apiService from './api';

const LOCATION_TASK_NAME = 'background-location-task';

// تعريف مهمة تتبع الموقع في الخلفية
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('خطأ في تتبع الموقع:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];

    if (location) {
      try {
        // إرسال الموقع إلى الخادم
        const locationData: LocationData = {
          vehicle: 1, // سيتم تحديثه من السياق
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          speed: location.coords.speed || 0,
          accuracy: location.coords.accuracy || 0,
        };

        await apiService.sendLocation(locationData);
        console.log('تم إرسال الموقع بنجاح');
      } catch (error) {
        console.error('خطأ في إرسال الموقع:', error);
      }
    }
  }
});

class LocationService {
  private locationSubscription: Location.LocationSubscription | null = null;
  private backgroundLocationSubscription: Location.LocationSubscription | null = null;
  private isTracking = false;
  private updateInterval = 10000; // 10 ثواني افتراضي
  private lastLocation: Location.LocationObject | null = null;
  private lastSentTime: number = 0;

  // طلب صلاحيات الموقع
  async requestPermissions(): Promise<boolean> {
    try {
      // طلب صلاحية الموقع عند الاستخدام
      const foregroundPermission = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundPermission.status !== 'granted') {
        return false;
      }

      // طلب صلاحية الموقع في الخلفية
      const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundPermission.status !== 'granted') {
        // يمكن الاستمرار بدون صلاحية الخلفية
      }

      return true;
    } catch (error) {
      console.error('خطأ في طلب صلاحيات الموقع:', error);
      return false;
    }
  }

  // بدء تتبع الموقع
  async startLocationTracking(): Promise<void> {
    try {
      if (this.isTracking) {
        return;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('لا توجد صلاحية للوصول للموقع');
      }

      // إيقاف أي تتبع سابق
      await this.stopLocationTracking();

      // إعدادات تتبع الموقع
      const locationOptions: Location.LocationTaskOptions = {
        accuracy: Location.Accuracy.High,
        timeInterval: this.updateInterval,
        distanceInterval: 10, // 10 متر
        foregroundService: {
          notificationTitle: 'تتبع الموقع',
          notificationBody: 'جاري تتبع موقعك لتحديث الرحلة',
          notificationColor: '#4c669f',
        },
        // إعدادات الخلفية
        activityType: Location.ActivityType.AutomotiveNavigation,
        showsBackgroundLocationIndicator: true,
      };

      // بدء تتبع الموقع في الخلفية
      this.backgroundLocationSubscription = await Location.watchPositionAsync(
        locationOptions,
        this.handleLocationUpdate.bind(this)
      );

      // بدء تتبع الموقع في المقدمة أيضاً
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: this.updateInterval,
          distanceInterval: 10,
        },
        this.handleLocationUpdate.bind(this)
      );

      this.isTracking = true;
    } catch (error) {
      console.error('خطأ في بدء تتبع الموقع:', error);
      this.isTracking = false;
      throw error;
    }
  }

  // إيقاف تتبع الموقع
  async stopLocationTracking(): Promise<void> {
    try {
      // إيقاف subscription المقدمة
      if (this.locationSubscription) {
        try {
          this.locationSubscription.remove();
        } catch (error) {
          console.error('خطأ في إزالة subscription المقدمة:', error);
        }
        this.locationSubscription = null;
      }

      // إيقاف subscription الخلفية
      if (this.backgroundLocationSubscription) {
        try {
          this.backgroundLocationSubscription.remove();
        } catch (error) {
          console.error('خطأ في إزالة subscription الخلفية:', error);
        }
        this.backgroundLocationSubscription = null;
      }

      // إيقاف مهمة الخلفية إذا كانت تعمل
      try {
        const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
        if (isTaskRegistered) {
          await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        }
      } catch (error) {
        console.error('خطأ في إيقاف مهمة الخلفية:', error);
      }

      this.isTracking = false;
    } catch (error) {
      console.error('خطأ في إيقاف تتبع الموقع:', error);
      this.isTracking = false;
    }
  }

  // معالجة تحديث الموقع
  private async handleLocationUpdate(location: Location.LocationObject): Promise<void> {
    try {
      // حساب الفرق بين الموقع الحالي والسابق
      const now = Date.now();
      const speed = location.coords.speed || 0;
      const distance = this.lastLocation
        ? this.getDistance(
            this.lastLocation.coords.latitude,
            this.lastLocation.coords.longitude,
            location.coords.latitude,
            location.coords.longitude
          )
        : 0;

      // تكييف الفترة حسب السرعة
      if (speed > 5) {
        this.updateInterval = 5000; // أسرع عند الحركة
      } else if (speed > 1) {
        this.updateInterval = 10000;
      } else {
        this.updateInterval = 60000; // أبطأ عند التوقف
      }

      // إرسال الموقع فقط إذا تحرك أكثر من 10 متر أو مر أكثر من 60 ثانية
      if (distance > 10 || now - this.lastSentTime > 60000) {
        const locationData: LocationData = {
          vehicle: 1, // سيتم تحديثه من السياق لاحقاً
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || 0,
          speed: speed,
        };
        await apiService.sendLocation(locationData);
        this.lastSentTime = now;
        this.lastLocation = location;
      }
    } catch (error) {
      console.error('خطأ في معالجة تحديث الموقع:', error);
    }
  }

  // دالة لحساب المسافة بين نقطتين (Haversine)
  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371e3; // نصف قطر الأرض بالمتر
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // الحصول على الموقع الحالي
  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('لا توجد صلاحية للوصول للموقع');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return location;
    } catch (error) {
      console.error('خطأ في الحصول على الموقع الحالي:', error);
      return null;
    }
  }

  // التحقق من حالة التتبع
  isLocationTracking(): boolean {
    return this.isTracking;
  }

  // تعيين فاصل التحديث
  setUpdateInterval(interval: number): void {
    this.updateInterval = interval;
  }

  // دالة إجبارية لإيقاف التتبع حتى لو لم يكن هناك اشتراك
  async forceStopLocationTracking(): Promise<void> {
    this.locationSubscription = null;
    this.backgroundLocationSubscription = null;
    try {
      const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (isTaskRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
    } catch (error) {
      console.error('خطأ في forceStopLocationTracking:', error);
    }
    this.isTracking = false;
  }
}

export default new LocationService(); 