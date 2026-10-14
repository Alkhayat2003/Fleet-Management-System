import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LoginCredentials,
  LoginResponse,
  User,
  Trip,
  Vehicle,
  LocationData,
  LocationHistory,
  ApiResponse,
  DashboardStats,
  Notification
} from '../types';

const PORT : string = '8000';
const IP : string = '192.168.24.225';
const API_BASE_URL = `http://${IP}:${PORT}/api`;

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (originalRequest.url?.includes('/token/refresh/')) {
          this.isRefreshing = false;
          await this.logout();
          return Promise.reject(error);
        }
        
        if (error.response?.status === 401 && !originalRequest._retry && !this.isRefreshing) {
          originalRequest._retry = true;
          this.isRefreshing = true;
          
          try {
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              await AsyncStorage.setItem('access_token', response.access);
              originalRequest.headers.Authorization = `Bearer ${response.access}`;
              this.isRefreshing = false;
              return this.api(originalRequest);
            } else {
              this.isRefreshing = false;
              await this.logout();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            this.isRefreshing = false;
            await this.logout();
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await this.api.post('/accounts/login/', credentials);
      return response.data;
    } catch (error: any) {
      console.error('خطأ في تسجيل الدخول:', error.response?.data || error.message);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ access: string; refresh: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/token/refresh/`, {
        refresh: refreshToken,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      return response.data;
    } catch (error: any) {
      console.error('خطأ في تحديث التوكن:', error.response?.data || error.message);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        await axios.post(`${API_BASE_URL}/accounts/logout/`, {
          refresh: refreshToken
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        });
      }
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await this.api.get('/accounts/profile/');
      return response.data;
    } catch (error: any) {
      console.error('خطأ في الحصول على المستخدم:', error.response?.data || error.message);
      throw error;
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response: AxiosResponse<{ success: boolean; stats: DashboardStats }> = await this.api.get('/dashboard/');
      return response.data.stats;
    } catch (error: any) {
      console.error('خطأ في الحصول على الإحصائيات:', error.response?.data || error.message);
      return {
        total_vehicles: 0,
        active_trips: 0,
        tracked_vehicles: 0,
        vehicles_in_maintenance: 0,
        completed_trips_today: 0,
        last_update: new Date().toISOString(),
      };
    }
  }

  async getDriverTrips(): Promise<Trip[]> {
    try {
      const response: AxiosResponse<Trip[]> = await this.api.get('/trips/driver-trips/');
      return response.data || [];
    } catch (error: any) {
      console.error('خطأ في الحصول على الرحلات:', error.response?.data || error.message);
      return [];
    }
  }

  async getTrip(tripId: number): Promise<Trip> {
    try {
      const response: AxiosResponse<Trip> = await this.api.get(`/trips/${tripId}/`);
      return response.data;
    } catch (error: any) {
      console.error('خطأ في الحصول على الرحلة:', error.response?.data || error.message);
      throw error;
    }
  }

  async startTrip(tripId: number): Promise<Trip> {
    try {
      const response: AxiosResponse<Trip> = await this.api.post(`/trips/${tripId}/start/`);
      return response.data;
    } catch (error: any) {
      console.error('خطأ في بدء الرحلة:', error.response?.data || error.message);
      throw error;
    }
  }

  async endTrip(tripId: number): Promise<Trip> {
    try {
      const response: AxiosResponse<Trip> = await this.api.post(`/trips/${tripId}/end/`);
      return response.data;
    } catch (error: any) {
      console.error('خطأ في إنهاء الرحلة:', error.response?.data || error.message);
      throw error;
    }
  }

  async getVehicles(): Promise<Vehicle[]> {
    try {
      const response: AxiosResponse<{ results: Vehicle[] }> = await this.api.get('/vehicles/');
      return response.data.results || [];
    } catch (error: any) {
      console.error('خطأ في الحصول على المركبات:', error.response?.data || error.message);
      return [];
    }
  }

  // الحصول على مركبة محددة
  async getVehicle(vehicleId: number): Promise<Vehicle> {
    try {
      const response: AxiosResponse<Vehicle> = await this.api.get(`/vehicles/${vehicleId}/`);
      return response.data;
    } catch (error: any) {
      console.error('خطأ في الحصول على المركبة:', error.response?.data || error.message);
      throw error;
    }
  }

  // إرسال موقع جديد
  async sendLocation(locationData: LocationData): Promise<LocationHistory> {
    try {
      const response: AxiosResponse<LocationHistory> = await this.api.post('/tracking/send_location/', locationData);
      return response.data;
    } catch (error: any) {
      console.error('خطأ في إرسال الموقع:', error.response?.data || error.message);
      throw error;
    }
  }

  // الحصول على المواقع الحية
  async getLiveLocations(): Promise<LocationHistory[]> {
    try {
      const response: AxiosResponse<LocationHistory[]> = await this.api.get('/tracking/live_locations/');
      return response.data || [];
    } catch (error: any) {
      console.error('خطأ في الحصول على المواقع الحية:', error.response?.data || error.message);
      return [];
    }
  }

  // الحصول على سجل المواقع لمركبة محددة
  async getVehicleLocationHistory(vehicleId: number): Promise<LocationHistory[]> {
    try {
      const response: AxiosResponse<LocationHistory[]> = await this.api.get(`/tracking/vehicle/${vehicleId}/history/`);
      return response.data || [];
    } catch (error: any) {
      console.error('خطأ في الحصول على سجل المواقع:', error.response?.data || error.message);
      return [];
    }
  }

  // تحديث الملف الشخصي
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response: AxiosResponse<User> = await this.api.put('/accounts/profile/', userData);
      return response.data;
    } catch (error: any) {
      console.error('خطأ في تحديث الملف الشخصي:', error.response?.data || error.message);
      throw error;
    }
  }

  // تغيير كلمة المرور
  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.api.post('/accounts/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error: any) {
      console.error('خطأ في تغيير كلمة المرور:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get notifications for the current user
   * @param unreadOnly if true, fetch only unread notifications
   */
  async getNotifications(unreadOnly = false): Promise<Notification[]> {
    const url = unreadOnly ? '/core/notifications/?unread=1' : '/notifications/';
    const response = await this.api.get(url);
    return response.data;
  }

  /**
   * Mark a notification as read
   * @param notificationId
   */
  async markNotificationAsRead(notificationId: number): Promise<any> {
    const response = await this.api.post(`/notifications/${notificationId}/read/`);
    return response.data;
  }
}

export default new ApiService(); 