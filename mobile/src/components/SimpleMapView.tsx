import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-reanimated';

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

interface SimpleMapViewProps {
  latitude: number;
  longitude: number;
  onMapClick: (lat: number, lng: number) => void;
  locationHistory: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
  }>;
  shouldFocusOnLocation?: boolean;
  onLocationFocused?: () => void;
  onLocationMarkerClick?: () => void;
}

const { width, height } = Dimensions.get('window');

const SimpleMapView: React.FC<SimpleMapViewProps> = ({
  latitude,
  longitude,
  onMapClick,
  locationHistory,
  shouldFocusOnLocation,
  onLocationFocused,
  onLocationMarkerClick,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // التركيز على الموقع عند الطلب
  useEffect(() => {
    if (shouldFocusOnLocation && mapLoaded && webViewRef.current) {
      setTimeout(() => {
        webViewRef.current?.postMessage(JSON.stringify({
          type: 'focusOnLocation',
          latitude,
          longitude
        }));
        onLocationFocused?.();
      }, 500);
    }
  }, [shouldFocusOnLocation, mapLoaded, latitude, longitude, onLocationFocused]);

  // إنشاء HTML للخريطة
  const createMapHTML = () => {
    const pathCoordinates = locationHistory.length > 1 
      ? locationHistory.map(location => [location.latitude, location.longitude])
      : [];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>خريطة الأسطول</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #0F0F23;
          }
          #map { 
            width: 100%; 
            height: 100vh; 
            background: #1A1A2E;
          }
          .custom-popup {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            text-align: center;
            background: #16213E;
            border: 1px solid #2A2A3E;
            border-radius: 12px;
            padding: 12px;
          }
          .custom-popup h3 {
            margin: 0 0 8px 0;
            color: #4FACFE;
            font-size: 14px;
            font-weight: 600;
          }
          .custom-popup p {
            margin: 0;
            color: #B8B8B8;
            font-size: 12px;
          }
          .leaflet-popup-content-wrapper {
            background: #16213E;
            border-radius: 12px;
            border: 1px solid #2A2A3E;
          }
          .leaflet-popup-tip {
            background: #16213E;
            border: 1px solid #2A2A3E;
          }
          .pulse-animation {
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.7;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // إنشاء الخريطة
          const map = L.map('map').setView([${latitude}, ${longitude}], 15);
          
          // إضافة طبقة الخريطة الأساسية
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          // إضافة موقع السائق الحالي
          const currentLocation = L.marker([${latitude}, ${longitude}], {
            icon: L.divIcon({
              className: 'custom-div-icon',
              html: '<div style="background: #4FACFE; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff;"></div>',
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            })
          }).addTo(map);

          // إضافة حدث النقر على إشارة الموقع
          currentLocation.on('click', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'locationMarkerClick',
              latitude: ${latitude},
              longitude: ${longitude}
            }));
          });

          currentLocation.bindPopup('<div class="custom-popup"><h3>موقعك الحالي</h3><p>أنت هنا الآن</p><p style="font-size: 10px; color: #888; margin-top: 8px;">اضغط على الإشارة لعرض التفاصيل</p></div>');

          // إضافة مسار المواقع السابقة
          ${pathCoordinates.length > 1 ? `
          const pathCoordinates = ${JSON.stringify(pathCoordinates)};
          const path = L.polyline(pathCoordinates, {
            color: '#43E97B',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 5'
          }).addTo(map);
          ` : ''}

          // إضافة نقاط المواقع السابقة
          ${locationHistory.slice(0, -1).map((location, index) => `
          L.marker([${location.latitude}, ${location.longitude}], {
            icon: L.divIcon({
              className: 'custom-div-icon',
              html: '<div style="background: linear-gradient(135deg, #43E97B, #38F9D7); width: 12px; height: 12px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.5); box-shadow: 0 2px 6px rgba(67, 233, 123, 0.3);"></div>',
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            })
          }).addTo(map).bindPopup('<div class="custom-popup"><h3>موقع سابق ${index + 1}</h3><p>${new Date(location.timestamp).toLocaleString('ar-SA')}</p></div>');
          `).join('')}

          // معالجة النقر على الخريطة
          map.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapClick',
              latitude: lat,
              longitude: lng
            }));
          });

          // إرسال رسالة عند تحميل الخريطة
          map.whenReady(function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapLoaded'
            }));
          });

          // دالة التركيز على الموقع
          function focusOnLocation(lat, lng) {
            map.setView([lat, lng], 16, {
              animate: true,
              duration: 1
            });
            currentLocation.setLatLng([lat, lng]);
            currentLocation.openPopup();
          }

          // استقبال الرسائل من React Native
          window.addEventListener('message', function(event) {
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'focusOnLocation') {
                focusOnLocation(data.latitude, data.longitude);
              } else if (data.type === 'centerMap') {
                map.setView([data.latitude, data.longitude], map.getZoom());
              } else if (data.type === 'zoomIn') {
                map.zoomIn();
              } else if (data.type === 'zoomOut') {
                map.zoomOut();
              }
            } catch (error) {
              console.log('Error parsing message:', error);
            }
          });
        </script>
      </body>
      </html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapClick') {
        onMapClick(data.latitude, data.longitude);
      } else if (data.type === 'mapLoaded') {
        setMapLoaded(true);
      } else if (data.type === 'locationMarkerClick') {
        onLocationMarkerClick?.();
      }
    } catch (error) {
      console.log('Error parsing message:', error);
    }
  };

  const centerMap = () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'centerMap',
        latitude,
        longitude
      }));
    }
  };

  const zoomIn = () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'zoomIn'
      }));
    }
  };

  const zoomOut = () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'zoomOut'
      }));
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: createMapHTML() }}
        style={styles.map}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        bounces={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />

      {/* أزرار التحكم على الخريطة */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.controlButton} onPress={centerMap} activeOpacity={0.8}>
          <Ionicons name="locate" size={20} color={COLORS.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={zoomIn} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color={COLORS.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={zoomOut} activeOpacity={0.8}>
          <Ionicons name="remove" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* مؤشر التحميل */}
      {!mapLoaded && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <Ionicons name="map" size={32} color={COLORS.accent} />
            <Text style={styles.loadingText}>جاري تحميل الخريطة...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  
  // أزرار التحكم
  mapControls: {
    position: 'absolute',
    right: 16,
    top: 16,
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glass,
  },
  
  // مؤشر التحميل
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 12,
  },
});

export default SimpleMapView; 