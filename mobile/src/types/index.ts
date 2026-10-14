// أنواع المستخدمين
export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'manager' | 'driver';
  phone_number: string;
  address: string;
  profile_picture?: string;
  license_number?: string;
  license_expiry?: string;
  created_at: string;
  updated_at: string;
}

// أنواع المركبات
export interface Vehicle {
  id: number;
  name: string;
  model: string;
  year: number;
  plate_number: string;
  vin: string;
  status: 'active' | 'maintenance' | 'inactive';
  odometer: number;
  fuel_type: string;
  insurance_expiry: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// أنواع الرحلات
export interface Trip {
  id: number;
  driver: User;
  vehicle: Vehicle;
  start_time: string;
  end_time?: string;
  status: 'planned' | 'in_progress' | 'completed';
  created_by: User;
  estimated_distance?: number;
  route_points?: Array<[number, number]>;
  created_at: string;
  updated_at: string;
}

// أنواع تتبع الموقع
export interface LocationHistory {
  id: number;
  vehicle: Vehicle;
  latitude: number;
  longitude: number;
  speed: number;
  accuracy: number;
  timestamp: string;
}

// أنواع الاستجابة من API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// أنواع تسجيل الدخول
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

// أنواع إرسال الموقع
export interface LocationData {
  vehicle?: number;
  latitude: number;
  longitude: number;
  speed: number;
  accuracy: number;
  heading?: number;
  altitude?: number;
  timestamp?: string;
}


// أنواع التنبيهات
export interface Alert {
  id: number;
  type: 'geofence' | 'speed' | 'maintenance' | 'fuel';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  is_read: boolean;
}

// أنواع إحصائيات لوحة التحكم
export interface DashboardStats {
  total_vehicles: number;
  active_trips: number;
  tracked_vehicles: number;
  vehicles_in_maintenance: number;
  completed_trips_today: number;
  last_update: string;
}

// أنواع حالة التطبيق
export interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  currentTrip: Trip | null;
  isLocationTracking: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
    speed: number;
    accuracy: number;
  } | null;
}

export interface Notification {
  id: number;
  user: number | User;
  type: string;
  message: string;
  is_read: boolean;
  timestamp: string;
  data?: any;
} 