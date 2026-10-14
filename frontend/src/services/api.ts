import { 
  Vehicle, 
  Trip, 
  LocationHistory, 
  DashboardStats, 
  VehicleForm,
  TripForm,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  // تم حذف المتغيرات غير المستخدمة بناءً على تقرير ESLint
} from '@/types';

const IP = 'localhost'
const API_BASE_URL = `http://${IP}:8000/api`;

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'manager' | 'driver';
    phone_number: string;
    address: string;
    profile_picture?: string;
    license_number?: string;
    license_expiry?: string;
    created_at: string;
  };
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'driver';
  phone_number: string;
  address: string;
  profile_picture?: string;
  license_number?: string;
  license_expiry?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'driver';
  phone_number?: string;
  address?: string;
  profile_picture?: File;
  license_number?: string;
  license_expiry?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'manager' | 'driver';
  phone_number?: string;
  address?: string;
  profile_picture?: File;
  license_number?: string;
  license_expiry?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // إضافة token للمصادقة إذا كان موجوداً
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorBody;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = await response.text();
        }
        console.error('API Error:', errorBody); // طباعة الخطأ بالكامل
        const error: any = new Error(errorBody.message || `HTTP error! status: ${response.status}`);
        error.response = { data: errorBody, status: response.status };
        throw error;
      }

      if (response.status === 204) return undefined as T;
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('حدث خطأ في الاتصال بالخادم');
    }
  }

  // ===== المصادقة =====
  
  // تسجيل الدخول
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/accounts/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // تسجيل الخروج
  async logout(refreshToken: string): Promise<void> {
    return this.request<void>('/accounts/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  // تحديث token
  async refreshToken(refreshToken: string): Promise<{ access: string; refresh: string }> {
    return this.request<{ access: string; refresh: string }>('/accounts/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  }

  // ===== إدارة المستخدمين =====

  // الحصول على قائمة جميع المستخدمين
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/accounts/users/');
  }

  // الحصول على مستخدم واحد بواسطة ID
  async getUser(id: number): Promise<User> {
    return this.request<User>(`/accounts/users/${id}/`);
  }

  // إنشاء مستخدم جديد
  async createUser(userData: CreateUserRequest): Promise<User> {
    // إذا كان هناك ملف صورة، نستخدم FormData
    if (userData.profile_picture) {
      const formData = new FormData();
      
      // إضافة البيانات النصية
      Object.keys(userData).forEach(key => {
        if (key === 'profile_picture') {
          if (userData.profile_picture) {
            formData.append('profile_picture', userData.profile_picture);
          }
        } else {
          formData.append(key, String((userData as CreateUserRequest)[key as keyof CreateUserRequest]));
        }
      });

      return this.request<User>('/accounts/users/', {
        method: 'POST',
        headers: {}, // لا نضع Content-Type للسماح للمتصفح بتعيينه مع FormData
        body: formData,
      });
    }

    // إذا لم تكن هناك صورة، نستخدم JSON
    return this.request<User>('/accounts/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // تحديث مستخدم
  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    // إذا كان هناك ملف صورة، نستخدم FormData
    if (userData.profile_picture) {
      const formData = new FormData();
      
      // إضافة البيانات النصية
      Object.keys(userData).forEach(key => {
        if (key === 'profile_picture') {
          if (userData.profile_picture) {
            formData.append('profile_picture', userData.profile_picture);
          }
        } else {
          formData.append(key, String((userData as UpdateUserRequest)[key as keyof UpdateUserRequest]));
        }
      });

      return this.request<User>(`/accounts/users/${id}/`, {
        method: 'PUT',
        headers: {}, // لا نضع Content-Type للسماح للمتصفح بتعيينه مع FormData
        body: formData,
      });
    }

    // إذا لم تكن هناك صورة، نستخدم JSON
    return this.request<User>(`/accounts/users/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // حذف مستخدم
  async deleteUser(id: number): Promise<void> {
    return this.request<void>(`/accounts/users/${id}/`, {
      method: 'DELETE',
    });
  }

  // ===== الملف الشخصي =====

  // الحصول على معلومات المستخدم الحالي
  async getProfile(): Promise<User> {
    return this.request<User>('/accounts/profile/');
  }

  // تحديث معلومات المستخدم الحالي
  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>('/accounts/profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // تغيير كلمة المرور
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return this.request<void>('/accounts/password/change/', {
      method: 'PUT',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });
  }

  // ===== إدارة الرحلات =====

  // الحصول على قائمة جميع الرحلات
  async getTrips(): Promise<Trip[]> {
    return this.request<Trip[]>('/trips/');
  }

  // الحصول على رحلة واحدة بواسطة ID
  async getTrip(id: number): Promise<Trip> {
    return this.request<Trip>(`/trips/${id}/`);
  }

  // إنشاء رحلة جديدة
  async createTrip(tripData: TripForm): Promise<Trip> {
    return this.request<Trip>('/trips/', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  // تحديث رحلة
  async updateTrip(id: number, tripData: TripForm): Promise<Trip> {
    return this.request<Trip>(`/trips/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(tripData),
    });
  }

  // حذف رحلة
  async deleteTrip(id: number): Promise<void> {
    return this.request<void>(`/trips/${id}/`, {
      method: 'DELETE',
    });
  }

  // بدء رحلة
  async startTrip(id: number): Promise<Trip> {
    return this.request<Trip>(`/trips/${id}/start/`, {
      method: 'POST',
    });
  }

  // إنهاء رحلة
  async endTrip(id: number): Promise<Trip> {
    return this.request<Trip>(`/trips/${id}/end/`, {
      method: 'POST',
    });
  }

  // الحصول على رحلات السائق
  async getDriverTrips(): Promise<Trip[]> {
    return this.request<Trip[]>('/trips/driver-trips/');
  }

  // جلب آخر الرحلات (5)
  async getRecentTrips(): Promise<Array<{id: number, status: string, start_time: string, driver: string, vehicle: string}>> {
    return this.request('/trips/recent/');
  }

  // ===== إدارة المركبات =====

  // الحصول على قائمة جميع المركبات
  async getVehicles(): Promise<Vehicle[]> {
    return this.request<Vehicle[]>('/vehicles/');
  }

  // الحصول على مركبة واحدة بواسطة ID
  async getVehicle(id: number): Promise<Vehicle> {
    return this.request<Vehicle>(`/vehicles/${id}/`);
  }

  // إنشاء مركبة جديدة
  async createVehicle(vehicleData: CreateVehicleRequest): Promise<Vehicle> {
    return this.request<Vehicle>('/vehicles/', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  // تحديث مركبة
  async updateVehicle(id: number, vehicleData: UpdateVehicleRequest): Promise<Vehicle> {
    return this.request<Vehicle>(`/vehicles/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  // حذف مركبة
  async deleteVehicle(id: number): Promise<void> {
    return this.request<void>(`/vehicles/${id}/`, {
      method: 'DELETE',
    });
  }

  // جلب بيانات الرحلة النشطة ومسارها لمركبة محددة
  async getVehicleActiveTrip(vehicleId: number): Promise<any> {
    return this.request(`/vehicles/vehicle_location/${vehicleId}/`);
  }

  // ===== التتبع والموقع =====

  /**
   * إرسال موقع مركبة (يُستخدم من السائق)
   */
  async sendLocation(data: any): Promise<LocationHistory> {
    return this.request<LocationHistory>('/tracking/send_location/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * جلب المواقع الحية لجميع المركبات
   */
  async getLiveLocations(): Promise<LocationHistory[]> {
    return this.request<LocationHistory[]>('/tracking/live_locations/');
  }

  /**
   * جلب سجل المواقع لمركبة محددة
   */
  async getVehicleLocationHistory(vehicleId: number): Promise<LocationHistory[]> {
    return this.request<LocationHistory[]>(`/tracking/vehicle/${vehicleId}/history/`);
  }

  // الحصول على إحصائيات لوحة التحكم
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/');
  }
}

export const apiService = new ApiService(); 