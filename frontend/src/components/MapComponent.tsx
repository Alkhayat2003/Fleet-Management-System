'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { colors } from '../styles/colors';
import { Vehicle } from '@/types';
import { apiService } from '@/services/api';

// إصلاح مشكلة أيقونات Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// أيقونات SVG حديثة حسب نوع المركبة
const vehicleSVGs: Record<string, string> = {
  car: `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="28" width="48" height="16" rx="8" fill="url(#carBody)"/>
    <ellipse cx="20" cy="48" rx="6" ry="6" fill="#222"/>
    <ellipse cx="44" cy="48" rx="6" ry="6" fill="#222"/>
    <rect x="16" y="20" width="32" height="12" rx="6" fill="#e0e7ef"/>
    <defs>
      <linearGradient id="carBody" x1="8" y1="28" x2="56" y2="44" gradientUnits="userSpaceOnUse">
        <stop stop-color="#4f8cff"/>
        <stop offset="1" stop-color="#38bdf8"/>
      </linearGradient>
    </defs>
  </svg>`,
  truck: `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="28" width="30" height="16" rx="6" fill="url(#truckBody)"/>
    <rect x="36" y="34" width="18" height="10" rx="3" fill="#e0e7ef"/>
    <ellipse cx="16" cy="48" rx="6" ry="6" fill="#222"/>
    <ellipse cx="46" cy="48" rx="6" ry="6" fill="#222"/>
    <defs>
      <linearGradient id="truckBody" x1="6" y1="28" x2="36" y2="44" gradientUnits="userSpaceOnUse">
        <stop stop-color="#fbbf24"/>
        <stop offset="1" stop-color="#f59e42"/>
      </linearGradient>
    </defs>
  </svg>`,
  bus: `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="24" width="48" height="20" rx="8" fill="url(#busBody)"/>
    <ellipse cx="20" cy="50" rx="6" ry="6" fill="#222"/>
    <ellipse cx="44" cy="50" rx="6" ry="6" fill="#222"/>
    <rect x="16" y="16" width="32" height="12" rx="6" fill="#e0e7ef"/>
    <defs>
      <linearGradient id="busBody" x1="8" y1="24" x2="56" y2="44" gradientUnits="userSpaceOnUse">
        <stop stop-color="#22d3ee"/>
        <stop offset="1" stop-color="#0ea5e9"/>
      </linearGradient>
    </defs>
  </svg>`
};

function getVehicleType(modelOrName: string = ''): 'car' | 'truck' | 'bus' {
  const str = modelOrName.toLowerCase();
  if (str.includes('شاحنة') || str.includes('truck')) return 'truck';
  if (str.includes('حافلة') || str.includes('باص') || str.includes('bus')) return 'bus';
  return 'car';
}

const createVehicleIcon = (status: string, modelOrName?: string) => {
  const color = status === 'active' ? colors.status.success : status === 'maintenance' ? colors.status.warning : colors.status.error;
  const type = getVehicleType(modelOrName);
  const svg = vehicleSVGs[type] || vehicleSVGs.car;
  return L.divIcon({
    className: 'custom-vehicle-icon',
    html: `
      <div style="
        width: 44px;
        height: 44px;
        background: rgba(255,255,255,0.18);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 24px 0 rgba(0,0,0,0.18), 0 1.5px 8px 0 rgba(0,0,0,0.10) inset;
        position: relative;
        backdrop-filter: blur(6px);
        border: 2.5px solid ${status === 'active' ? 'rgba(34,197,94,0.7)' : status === 'maintenance' ? 'rgba(251,191,36,0.7)' : 'rgba(239,68,68,0.7)'};
        transition: box-shadow 0.2s;
        ${status === 'active' ? 'box-shadow: 0 0 0 4px rgba(34,197,94,0.18), 0 6px 24px 0 rgba(0,0,0,0.18);' : ''}
        animation: ${status === 'active' ? 'pulse 2s infinite' : 'none'};
      ">
        <div style="
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${svg}
        </div>
        <div style="
          position: absolute;
          top: 4px;
          right: 4px;
          width: 10px;
          height: 10px;
          background: ${status === 'active' ? '#22c55e' : status === 'maintenance' ? '#fbbf24' : '#ef4444'};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 8px 2px ${status === 'active' ? 'rgba(34,197,94,0.4)' : status === 'maintenance' ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)'};
        "></div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

interface MapComponentProps {
  vehicles: Vehicle[];
}

const MapComponent: React.FC<MapComponentProps> = ({ vehicles }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const [trackingVehicleId, setTrackingVehicleId] = useState<number | null>(null);
  const [trackingRoute, setTrackingRoute] = useState<Array<[number, number]>>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // إنشاء الخريطة مع خيارات محسنة
    const map = L.map(mapRef.current, {
      center: [24.7136, 46.6753], // الرياض كمركز افتراضي
      zoom: 10,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      touchZoom: true,
    });

    // إضافة طبقة خريطة محسنة
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 3,
    }).addTo(map);

    // إضافة طبقة خريطة إضافية للتبديل
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri',
      maxZoom: 19,
    });

    // إضافة أزرار التحكم
    const baseMaps = {
      "الخريطة العادية": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
      "الصور الجوية": satelliteLayer
    };

    L.control.layers(baseMaps).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // إزالة العلامات القديمة
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // إضافة علامات جديدة للمركبات
    vehicles.forEach(vehicle => {
      if (vehicle.latitude && vehicle.longitude) {
        const icon = createVehicleIcon(vehicle.status, vehicle.model || vehicle.name);
        const marker = L.marker([vehicle.latitude, vehicle.longitude], { icon })
          .addTo(mapInstanceRef.current!)
          .bindPopup(`
            <div style="text-align: center; min-width: 220px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl;">
              <div style="background: ${colors.gradients.header}; color: white; padding: 12px; margin: -12px -12px 12px -12px; border-radius: 6px 6px 0 0; position: relative;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 700;">${vehicle.plate_number}</h3>
                <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 12px;">${vehicle.name}</p>
                <div style="position: absolute; top: 8px; left: 8px; width: 10px; height: 10px; background: ${vehicle.status === 'active' ? colors.status.success : vehicle.status === 'maintenance' ? colors.status.warning : colors.status.error}; border: 1px solid white; border-radius: 50%; animation: ${vehicle.status === 'active' ? 'pulse 2s infinite' : 'none'};"></div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                <div style="background: #f5f5f5; padding: 8px; border-radius: 4px; text-align: center;"><div style="font-size: 10px; color: #666; margin-bottom: 4px;">النوع</div><div style="font-weight: 600; color: #333; font-size: 12px;">${vehicle.model || 'غير محدد'}</div></div>
                <div style="background: #f5f5f5; padding: 8px; border-radius: 4px; text-align: center;"><div style="font-size: 10px; color: #666; margin-bottom: 4px;">الحالة</div><div style="font-weight: 600; color: ${vehicle.status === 'active' ? colors.status.success : vehicle.status === 'maintenance' ? colors.status.warning : colors.status.error}; font-size: 12px;">${vehicle.status === 'active' ? 'نشط' : vehicle.status === 'maintenance' ? 'صيانة' : 'غير نشط'}</div></div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div style="background: #e3f2fd; padding: 8px; border-radius: 4px; text-align: center; border-left: 3px solid #1976d2;"><div style="font-size: 10px; color: #666; margin-bottom: 4px;">السرعة</div><div style="font-weight: 700; color: #1976d2; font-size: 14px;">${vehicle.current_speed || 0} كم/س</div></div>
                <div style="background: #fff3e0; padding: 8px; border-radius: 4px; text-align: center; border-left: 3px solid #ff9800;"><div style="font-size: 10px; color: #666; margin-bottom: 4px;">الوقود</div><div style="font-weight: 700; color: #ff9800; font-size: 14px;">${vehicle.fuel_level || 0}%</div></div>
              </div>
              ${vehicle.driver ? `<div style="margin-top: 12px; padding: 8px; background: #f8f9fa; border-radius: 4px; border: 1px solid #e9ecef;"><div style="font-size: 10px; color: #666; margin-bottom: 4px;">السائق</div><div style="font-weight: 600; color: #333; font-size: 12px;">${vehicle.driver.first_name} ${vehicle.driver.last_name}</div></div>` : ''}
              <button id="track-vehicle-${vehicle.id}" style="margin-top: 12px; padding: 6px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; font-size: 13px; font-weight: 600; cursor: pointer;">تتبع هذه المركبة</button>
            </div>
          `, {
            maxWidth: 250,
            className: 'custom-popup'
          });

        marker.on('popupopen', () => {
          setTimeout(() => {
            const btn = document.getElementById(`track-vehicle-${vehicle.id}`);
            if (btn) {
              btn.onclick = async () => {
                setTrackingVehicleId(vehicle.id);
                setTrackingLoading(true);
                try {
                  const res = await apiService.getVehicleActiveTrip(vehicle.id);
                  if (res && res.vehicle && res.vehicle.active_trip && Array.isArray(res.vehicle.active_trip.route_points)) {
                    setTrackingRoute(res.vehicle.active_trip.route_points.map((pt: any) => [pt[0], pt[1]]));
                  } else {
                    setTrackingRoute([]);
                  }
                } catch {
                  setTrackingRoute([]);
                }
                setTrackingLoading(false);
                // Zoom to vehicle
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setView([vehicle.latitude!, vehicle.longitude!], 15, { animate: true });
                }
              };
            }
          }, 100);
        });

        markersRef.current.push(marker);
      }
    });

    // تحريك الخريطة لتظهر جميع المركبات (إلا إذا كنا نتابع مركبة)
    if (markersRef.current.length > 0 && !trackingVehicleId) {
      const group = new L.FeatureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    // رسم مسار التتبع إذا كان موجوداً
    if (mapInstanceRef.current) {
      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
        routeLayerRef.current = null;
      }
      if (trackingRoute && trackingRoute.length > 1) {
        routeLayerRef.current = L.polyline(trackingRoute, { color: '#2563eb', weight: 5, opacity: 0.85, dashArray: '8 8' }).addTo(mapInstanceRef.current);
        // Zoom to route
        mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds().pad(0.2));
      }
    }
  }, [vehicles, trackingVehicleId, trackingRoute]);

  // زر إيقاف التتبع
  const stopTracking = () => {
    setTrackingVehicleId(null);
    setTrackingRoute([]);
  };

  return (
    <>
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        
        .custom-vehicle-icon {
          background: transparent !important;
          border: none !important;
        }
        .track-btn {
          margin-top: 12px;
          padding: 6px 16px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .track-btn:disabled {
          background: #a5b4fc;
          cursor: not-allowed;
        }
      `}</style>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '300px',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
        }} 
      />
      {trackingVehicleId && (
        <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 1000 }}>
          <button className="track-btn" onClick={stopTracking} disabled={trackingLoading}>
            إيقاف تتبع المركبة
          </button>
        </div>
      )}
    </>
  );
};

export default MapComponent; 