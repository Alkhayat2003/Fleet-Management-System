import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

interface MapViewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  showUserLocation?: boolean;
  locationHistory?: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
  }>;
}

const { width, height } = Dimensions.get('window');

const MapView: React.FC<MapViewProps> = ({
  latitude,
  longitude,
  zoom = 15,
  onMapClick,
  showUserLocation = true,
  locationHistory = [],
}) => {
  const webViewRef = useRef<WebView>(null);
  const [mapHtml, setMapHtml] = useState('');

  useEffect(() => {
    generateMapHTML();
  }, [latitude, longitude, locationHistory]);

  const generateMapHTML = () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>خريطة الموقع</title>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            #map {
              width: 100%;
              height: 100vh;
              direction: rtl;
            }
            .leaflet-popup-content {
              text-align: right;
              direction: rtl;
            }
            .location-info {
              background: white;
              padding: 10px;
              border-radius: 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            .location-info h3 {
              margin: 0 0 5px 0;
              color: #333;
            }
            .location-info p {
              margin: 5px 0;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            // إنشاء الخريطة
            const map = L.map('map').setView([${latitude}, ${longitude}], ${zoom});
            
            // إضافة طبقة الخريطة الأساسية
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 18
            }).addTo(map);
            
            // إضافة علامة موقع السائق الحالي
            const driverMarker = L.marker([${latitude}, ${longitude}], {
              icon: L.divIcon({
                className: 'driver-marker',
                html: '<div style="background: #4c669f; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })
            }).addTo(map);
            
            // إضافة معلومات الموقع
            const locationInfo = \`
              <div class="location-info">
                <h3>موقع السائق</h3>
                <p><strong>خط العرض:</strong> ${latitude.toFixed(6)}</p>
                <p><strong>خط الطول:</strong> ${longitude.toFixed(6)}</p>
                <p><strong>التاريخ:</strong> ${new Date().toLocaleString('ar-SA')}</p>
              </div>
            \`;
            
            driverMarker.bindPopup(locationInfo);
            
            // إضافة مسار سجل المواقع إذا كان موجوداً
            ${locationHistory.length > 0 ? `
              const pathCoordinates = ${JSON.stringify(
                locationHistory.map(loc => [loc.latitude, loc.longitude])
              )};
              
              if (pathCoordinates.length > 1) {
                const path = L.polyline(pathCoordinates, {
                  color: '#4c669f',
                  weight: 3,
                  opacity: 0.8
                }).addTo(map);
                
                // إضافة علامات للمواقع السابقة
                pathCoordinates.forEach((coord, index) => {
                  if (index < pathCoordinates.length - 1) { // لا نضيف علامة للموقع الحالي
                    const historyMarker = L.circleMarker(coord, {
                      radius: 4,
                      fillColor: '#666',
                      color: '#fff',
                      weight: 2,
                      opacity: 1,
                      fillOpacity: 0.8
                    }).addTo(map);
                    
                    const timestamp = '${locationHistory[0]?.timestamp || new Date().toISOString()}';
                    const historyInfo = \`
                      <div class="location-info">
                        <h3>موقع سابق</h3>
                        <p><strong>خط العرض:</strong> \${coord[0].toFixed(6)}</p>
                        <p><strong>خط الطول:</strong> \${coord[1].toFixed(6)}</p>
                        <p><strong>التاريخ:</strong> \${new Date(timestamp).toLocaleString('ar-SA')}</p>
                      </div>
                    \`;
                    
                    historyMarker.bindPopup(historyInfo);
                  }
                });
                
                // توسيط الخريطة على المسار
                map.fitBounds(path.getBounds());
              }
            ` : ''}
            
            // إضافة حدث النقر على الخريطة
            ${onMapClick ? `
              map.on('click', function(e) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'mapClick',
                  latitude: lat,
                  longitude: lng
                }));
              });
            ` : ''}
            
            // إضافة أزرار التحكم
            const zoomControl = L.control.zoom({
              position: 'bottomright'
            }).addTo(map);
            
            // إضافة زر لتوسيط الخريطة على موقع السائق
            const centerButton = L.control({
              position: 'bottomright'
            });
            
            centerButton.onAdd = function() {
              const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
              div.innerHTML = '<a href="#" title="توسيط على السائق" style="display: block; width: 30px; height: 30px; line-height: 30px; text-align: center; background: white; border: 2px solid rgba(0,0,0,0.2); border-radius: 4px; color: #333; text-decoration: none;">📍</a>';
              div.onclick = function() {
                map.setView([${latitude}, ${longitude}], ${zoom});
              };
              return div;
            };
            
            centerButton.addTo(map);
          </script>
        </body>
      </html>
    `;
    
    setMapHtml(html);
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapClick' && onMapClick) {
        onMapClick(data.latitude, data.longitude);
      }
    } catch (error) {
      console.error('خطأ في معالجة رسالة الخريطة:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
  },
});

export default MapView; 