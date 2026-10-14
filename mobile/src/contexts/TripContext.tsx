import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Trip } from '../types';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

interface TripContextType {
  currentTrip: Trip | null;
  trips: Trip[];
  isLoading: boolean;
  startTrip: (tripId: number) => Promise<boolean>;
  endTrip: (tripId: number) => Promise<boolean>;
  refreshTrips: () => Promise<void>;
  setCurrentTrip: (trip: Trip | null) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const useTrip = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};

interface TripProviderProps {
  children: ReactNode;
}

export const TripProvider: React.FC<TripProviderProps> = ({ children }) => {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // استخدام useAuth داخل المكون
  const authContext = useAuth();
  const { user, isAuthenticated } = authContext;

  // تحميل الرحلات عند تسجيل الدخول
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshTrips();
    }
  }, [isAuthenticated, user]);

  const refreshTrips = async (): Promise<void> => {
    if (!user) return;

    try {
      setIsLoading(true);
      const driverTrips = await apiService.getDriverTrips();
      setTrips(driverTrips);

      // البحث عن رحلة نشطة
      const activeTrip = driverTrips.find(trip => trip.status === 'in_progress');
      if (activeTrip) {
        setCurrentTrip(activeTrip);
      }
    } catch (error) {
      console.error('خطأ في تحميل الرحلات:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startTrip = async (tripId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      const updatedTrip = await apiService.startTrip(tripId);
      
      // تحديث قائمة الرحلات
      setTrips(prevTrips => 
        prevTrips.map(trip => 
          trip.id === tripId ? updatedTrip : trip
        )
      );
      
      setCurrentTrip(updatedTrip);
      return true;
    } catch (error) {
      console.error('خطأ في بدء الرحلة:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const endTrip = async (tripId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      const updatedTrip = await apiService.endTrip(tripId);
      
      // تحديث قائمة الرحلات
      setTrips(prevTrips => 
        prevTrips.map(trip => 
          trip.id === tripId ? updatedTrip : trip
        )
      );
      
      // إزالة الرحلة الحالية إذا كانت هي نفسها
      if (currentTrip?.id === tripId) {
        setCurrentTrip(null);
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في إنهاء الرحلة:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: TripContextType = {
    currentTrip,
    trips,
    isLoading,
    startTrip,
    endTrip,
    refreshTrips,
    setCurrentTrip,
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
}; 