export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'driver';
  phone_number?: string;
  address?: string;
  profile_picture?: string;
  license_number?: string;
  license_expiry?: string;
  created_at: string;
  updated_at?: string;
}

export interface Vehicle {
  id: number;
  name: string;
  model: string;
  year: number;
  plate_number: string;
  vin: string;
  status: 'active' | 'maintenance' | 'inactive';
  odometer?: number;
  fuel_type: string;
  insurance_expiry: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  current_speed?: number;
  fuel_level?: number;
  driver?: User;
  created_at: string;
  updated_at?: string;
}export interface CreateVehicleRequest {  name: string;  model: string;  year: number;  plate_number: string;  vin: string;  status: 'active' | 'maintenance' | 'inactive';  odometer?: number;  fuel_type: string;  insurance_expiry: string;  notes?: string;}export interface UpdateVehicleRequest {  name?: string;  model?: string;  year?: number;  plate_number?: string;  vin?: string;  status?: 'active' | 'maintenance' | 'inactive';  odometer?: number;  fuel_type?: string;  insurance_expiry?: string;  notes?: string;}export interface Trip {
  id: number;
  driver: number;
  vehicle: number;
  start_time: string;
  end_time?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  estimated_distance?: number;
  route_points?: any;
  created_by?: number;
  created_at: string;
  updated_at?: string;
  notes?: string;
}export interface LocationHistory {  id: number;  vehicle: number;  timestamp: string;  latitude?: number;  longitude?: number;  speed?: number;  accuracy?: number;}export interface DashboardStats {  total_vehicles: number;  active_trips: number;  tracked_vehicles: number;  vehicles_in_maintenance: number;  completed_trips_today: number;  last_update: string;}export interface AuthResponse {  access: string;  refresh: string;  user: User;}export interface ApiResponse<T> {  success: boolean;  data?: T;  message?: string;  errors?: Record<string, string[]>;}export interface LoginForm {  username: string;  password: string;}export interface VehicleForm {  name: string;  model: string;  year: number;  plate_number: string;  vin: string;  status: 'active' | 'maintenance' | 'inactive';  odometer?: number;  fuel_type: string;  insurance_expiry: string;  notes?: string;}export interface TripForm {
  driver: string;
  vehicle: string;
  start_time: string;
  end_time: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  estimated_distance?: string;
  created_by?: string;
  start_location?: string;
  end_location?: string;
} 