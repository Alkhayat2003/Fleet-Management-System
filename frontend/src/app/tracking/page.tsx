/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Card, Typography, Snackbar, Alert, IconButton, Drawer, Button, CircularProgress, Chip } from '@mui/material';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DirectionsCar, Close, Room, Flag } from '@mui/icons-material';
import { apiService } from '@/services/api';
import { colors } from '../../styles/colors';
import { WebSocketService } from '@/services/websocket';

const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE || 'ws://localhost:8000';

function getVehicleIcon(color = '#1976d2') {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #0002;"><svg width='20' height='20' fill='white'><g><rect width='20' height='8' y='6' rx='3'/><rect width='5' height='5' x='2' y='14' rx='2.5'/><rect width='5' height='5' x='13' y='14' rx='2.5'/></g></svg></div>`
  });
}

// تحديث دالة الأيقونة: SVG حديث وملون مع تأثير Glow وحسب حالة المركبة
function getVehicleIconByStatus(status: string = 'active') {
  let color = '#1976d2';
  let glow = '#1976d288';
  let svg = '';
  if (status === 'maintenance') {
    color = '#f59e42';
    glow = '#f59e4288';
    svg = `<svg width='24' height='24' viewBox='0 0 24 24'><g><rect x='2' y='10' width='20' height='7' rx='3' fill='#f59e42'/><circle cx='7' cy='20' r='2' fill='#f59e42'/><circle cx='17' cy='20' r='2' fill='#f59e42'/></g></svg>`;
  } else if (status === 'inactive') {
    color = '#bdbdbd';
    glow = '#bdbdbd88';
    svg = `<svg width='24' height='24' viewBox='0 0 24 24'><g><rect x='2' y='10' width='20' height='7' rx='3' fill='#bdbdbd'/><circle cx='7' cy='20' r='2' fill='#bdbdbd'/><circle cx='17' cy='20' r='2' fill='#bdbdbd'/></g></svg>`;
  } else {
    // active
    color = '#1976d2';
    glow = '#1976d288';
    svg = `<svg width='24' height='24' viewBox='0 0 24 24'><g><rect x='2' y='10' width='20' height='7' rx='3' fill='#1976d2'/><circle cx='7' cy='20' r='2' fill='#1976d2'/><circle cx='17' cy='20' r='2' fill='#1976d2'/></g></svg>`;
  }
  return L.divIcon({
    className: '',
    html: `<div style="background:rgba(255,255,255,0.7);border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px 4px ${glow};backdrop-filter:blur(2px);border:2px solid ${color};transition:transform 0.2s;">${svg}</div>`
  });
}

export default function TrackingPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [liveLocations, setLiveLocations] = useState<Record<number, any>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [vehicleHistory, setVehicleHistory] = useState<any[]>([]);
  const [polyline, setPolyline] = useState<any[]>([]);
  const [plannedRoute, setPlannedRoute] = useState<any[]>([]);
  const [activeTrip, setActiveTrip] = useState<any | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocketService | null>(null);
  const wsSingleRef = useRef<WebSocketService | null>(null);

  // جلب قائمة المركبات
  useEffect(() => {
    apiService.getVehicles().then(setVehicles);
  }, []);

  // جلب المواقع الحية عند التحميل
  useEffect(() => {
    apiService.getLiveLocations()
      .then((data: any[]) => {
        const locs: Record<number, any> = {};
        (data as any[]).forEach(function(loc: any) { locs[loc.vehicle.id || loc.vehicle] = loc; });
        setLiveLocations(locs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // WebSocket لجميع المركبات
  useEffect(() => {
    if (selectedVehicle) return; // لا تشغل WebSocket العام إذا كنت في وضع تتبع مركبة
    const ws = new WebSocketService(`${WS_BASE}/ws/all-vehicles/`);
    wsRef.current = ws;
    ws.connect();
    ws.onMessage((msg) => {
      if (msg.type === 'all_vehicles_update' && Array.isArray(msg.data)) {
        const locs: Record<number, any> = {};
        msg.data.forEach((loc: any) => { locs[loc.vehicle_id] = loc; });
        setLiveLocations(locs);
      } else if (msg.type === 'location_update' && msg.data) {
        setLiveLocations(prev => ({ ...prev, [msg.data.vehicle_id]: msg.data }));
      } else if (msg.type === 'notification' && msg.data) {
        setNotification(msg.data.message || 'تنبيه جديد');
      }
    });
    return () => ws.disconnect();
  }, [selectedVehicle]);

  // عند اختيار مركبة:
  useEffect(() => {
    if (!selectedVehicle) return;
    setVehicleHistory([]);
    setPolyline([]);
    setPlannedRoute([]);
    setActiveTrip(null);
    // جلب سجل المواقع (تعديل: استخدم apiService بدلاً من fetch، endpoint الصحيح)
    apiService.getVehicleLocationHistory(selectedVehicle.id)
      .then((data: any[]) => {
        console.log('vehicleHistory:', data);
        setVehicleHistory(data);
        setPolyline((data as any[]).map(function(loc: any) { return [loc.latitude, loc.longitude]; }));
      });
    // جلب المسار المخطط (route_points) ومعلومات الرحلة النشطة
    apiService.getVehicleActiveTrip(selectedVehicle.id).then((res) => {
      if (res && res.vehicle && res.vehicle.active_trip) {
        setActiveTrip(res.vehicle.active_trip);
        if (Array.isArray(res.vehicle.active_trip.route_points)) {
          setPlannedRoute(res.vehicle.active_trip.route_points);
        } else {
          setPlannedRoute([]);
        }
      } else {
        setActiveTrip(null);
        setPlannedRoute([]);
      }
    });
    // WebSocket فردي
    if (wsSingleRef.current) wsSingleRef.current.disconnect();
    const ws = new WebSocketService(`${WS_BASE}/ws/location/${selectedVehicle.id}/`);
    wsSingleRef.current = ws;
    ws.connect();
    ws.onMessage((msg) => {
      if (msg.latitude && msg.longitude) {
        setLiveLocations(prev => ({ ...prev, [selectedVehicle.id]: msg }));
        setPolyline(prev => [...prev, [msg.latitude, msg.longitude]]);
      }
    });
    return () => ws.disconnect();
  }, [selectedVehicle]);

  // إغلاق WebSocket الفردي عند العودة
  const handleBackToAll = () => {
    setSelectedVehicle(null);
    setVehicleHistory([]);
    setPolyline([]);
    setPlannedRoute([]);
    setActiveTrip(null);
    if (wsSingleRef.current) wsSingleRef.current.disconnect();
  };

  // مركز الخريطة
  const center = selectedVehicle && liveLocations[selectedVehicle.id]
    ? [liveLocations[selectedVehicle.id].latitude, liveLocations[selectedVehicle.id].longitude]
    : Object.values(liveLocations)[0]
      ? [Object.values(liveLocations)[0].latitude, Object.values(liveLocations)[0].longitude]
      : [24.7136, 46.6753]; // الرياض

  return (
    <Box sx={{ width: '100%', height: '100vh', position: 'relative', background: colors.background.primary }}>
      <MapContainer center={center as any} zoom={selectedVehicle ? 15 : 8} style={{ height: '100vh', width: '100%' }} scrollWheelZoom>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {/* جميع المركبات */}
        {!selectedVehicle && Object.values(liveLocations).map((loc: any) => (
          (() => {
            const vehicleId = loc.vehicle_id ?? (loc.vehicle && loc.vehicle.id) ?? loc.vehicle;
            return (
              <Marker
                key={vehicleId}
                position={[loc.latitude, loc.longitude]}
                icon={getVehicleIconByStatus(loc.vehicle_status || 'active')}
                eventHandlers={{
                  click: () => {
                    const v = vehicles.find(v => v.id === vehicleId || v.id === String(vehicleId) || String(v.id) === String(vehicleId));
                    if (v) {
                      setSelectedVehicle(v);
                    } else {
                      alert('تعذر العثور على بيانات المركبة. تحقق من تطابق معرف المركبة في liveLocations و vehicles.');
                    }
                  }
                }}
              >
                <Popup>
                  <Box sx={{ minWidth: 180 }}>
                    <Typography fontWeight={700}>{loc.vehicle_plate} - {loc.vehicle_model}</Typography>
                    <Typography variant="body2">السرعة: {loc.speed || '-'} كم/س</Typography>
                    <Typography variant="body2">آخر تحديث: {loc.timestamp ? new Date(loc.timestamp).toLocaleString('ar-EG') : '-'}</Typography>
                    <Button size="small" onClick={() => {
                      const v = vehicles.find(v => v.id === vehicleId || v.id === String(vehicleId) || String(v.id) === String(vehicleId));
                      if (v) setSelectedVehicle(v);
                    }}>تتبع هذه المركبة</Button>
                  </Box>
                </Popup>
              </Marker>
            );
          })()
        ))}
        {/* مركبة واحدة */}
        {selectedVehicle && liveLocations[selectedVehicle.id] && (
          <Marker
            position={[liveLocations[selectedVehicle.id].latitude, liveLocations[selectedVehicle.id].longitude]}
            icon={L.divIcon({
              className: '',
              html: `<div style="background:rgba(255,255,255,0.9);border-radius:50%;width:48px;height:48px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 24px 8px #1976d2cc,0 0 0 6px #fff8;animation:track-glow 1.2s infinite alternate;">${getVehicleIconByStatus(selectedVehicle.status || 'active').options.html}</div>`
            })}
          >
            <Popup>
              <Box sx={{ minWidth: 180 }}>
                <Typography fontWeight={700}>{selectedVehicle.plate_number} - {selectedVehicle.model}</Typography>
                <Typography variant="body2">السرعة: {liveLocations[selectedVehicle.id].speed || '-'} كم/س</Typography>
                <Typography variant="body2">آخر تحديث: {liveLocations[selectedVehicle.id].timestamp ? new Date(liveLocations[selectedVehicle.id].timestamp).toLocaleString('ar-EG') : '-'}</Typography>
                <Button size="small" onClick={handleBackToAll}>عودة لجميع المركبات</Button>
              </Box>
            </Popup>
          </Marker>
        )}
        {/* المسار المخطط (route_points) */}
        {selectedVehicle && plannedRoute.length > 1 && (
          <Polyline positions={plannedRoute} color="#2563eb" weight={8} dashArray="12 10" opacity={0.85} />
        )}
        {/* المسار الفعلي (سجل المواقع) */}
        {selectedVehicle && polyline.length > 1 && (
          <Polyline positions={polyline} color="#d32f2f" weight={8} opacity={0.85} />
        )}
        {/* Marker البداية والنهاية فقط عند تتبع مركبة */}
        {selectedVehicle && plannedRoute.length > 0 && (
          <>
            {/* Marker البداية */}
            <Marker position={plannedRoute[0]} icon={L.divIcon({className:'',html:`<div style='background:rgba(0,200,83,0.15);border:3px solid #00c853;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px 2px #00c85399;'><svg width='22' height='22'><circle cx='11' cy='11' r='9' fill='#00c853' stroke='#fff' stroke-width='2'/></svg></div>`})}>
              <Popup>نقطة البداية (Start Point)</Popup>
            </Marker>
            <Marker position={plannedRoute[0]} icon={L.divIcon({className:'',html:`<div style='background:transparent;'><span style='background:#00c853;color:#fff;padding:2px 10px;border-radius:10px;font-size:13px;font-weight:800;box-shadow:0 1px 4px #00c85355;'>بداية</span></div>`})} />
          </>
        )}
        {selectedVehicle && plannedRoute.length > 1 && (
          <>
            {/* Marker النهاية */}
            <Marker position={plannedRoute[plannedRoute.length-1]} icon={L.divIcon({className:'',html:`<div style='background:rgba(244,67,54,0.15);border:3px solid #f44336;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px 2px #f4433699;'><svg width='22' height='22'><circle cx='11' cy='11' r='9' fill='#f44336' stroke='#fff' stroke-width='2'/></svg></div>`})}>
              <Popup>نقطة النهاية (End Point)</Popup>
            </Marker>
            <Marker position={plannedRoute[plannedRoute.length-1]} icon={L.divIcon({className:'',html:`<div style='background:transparent;'><span style='background:#f44336;color:#fff;padding:2px 10px;border-radius:10px;font-size:13px;font-weight:800;box-shadow:0 1px 4px #f4433655;'>نهاية</span></div>`})} />
          </>
        )}
      </MapContainer>
      {/* Sidebar أو Drawer لمعلومات المركبة */}
      {selectedVehicle && (
        <Drawer anchor="left" open={!!selectedVehicle} onClose={handleBackToAll} variant="persistent" PaperProps={{sx:{boxShadow:'0 0 32px 8px #1976d244', borderTopRightRadius: 18, borderBottomRightRadius: 18, transition:'all 0.4s cubic-bezier(.4,2,.6,1)', background:'rgba(255,255,255,0.92)'}}} ModalProps={{ hideBackdrop: true }}>
          <Box sx={{ width: 390, p: 0, background: 'transparent', height: '100%', display: 'flex', flexDirection: 'column', position:'relative' }}>
            {/* صورة أو أيقونة كبيرة */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4, pb: 2, bgcolor: 'rgba(255,255,255,0.5)', borderBottom: '1px solid #e0e7ef' }}>
              <span style={{marginBottom:8, display:'block'}} dangerouslySetInnerHTML={{__html: getVehicleIconByStatus(selectedVehicle.status || 'active').options.html as string}} />
              <Typography variant="h6" fontWeight={800}>{selectedVehicle.plate_number} - {selectedVehicle.model}</Typography>
              <Chip label={selectedVehicle.status === 'maintenance' ? 'في الصيانة' : selectedVehicle.status === 'inactive' ? 'متوقفة' : 'نشطة'} color={selectedVehicle.status === 'maintenance' ? 'warning' : selectedVehicle.status === 'inactive' ? 'default' : 'success'} size="small" sx={{ mt: 1 }} />
            </Box>
            <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
              {/* بيانات السائق */}
              <Card sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px #1976d211' }}>
                <Room sx={{ color: colors.primary.main, mr: 1 }} />
                <Box>
                  <Typography fontWeight={700} fontSize={15}>السائق</Typography>
                  <Typography variant="body2">{selectedVehicle.driver?.first_name || '-'} {selectedVehicle.driver?.last_name || ''}</Typography>
                </Box>
              </Card>
              {/* بيانات السرعة والتحديث */}
              <Card sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px #1976d211' }}>
                <Flag sx={{ color: colors.primary.main, mr: 1 }} />
                <Box>
                  <Typography fontWeight={700} fontSize={15}>السرعة الحالية</Typography>
                  <Typography variant="body2">{liveLocations[selectedVehicle.id]?.speed || '-'} كم/س</Typography>
                  <Typography variant="caption" color="text.secondary">آخر تحديث: {liveLocations[selectedVehicle.id]?.timestamp ? new Date(liveLocations[selectedVehicle.id].timestamp).toLocaleString('ar-EG') : '-'}</Typography>
                </Box>
              </Card>
              {/* بيانات الرحلة النشطة */}
              {activeTrip && (
                <Card sx={{ mb: 2, p: 2, boxShadow: '0 2px 8px #1976d211' }}>
                  <Typography fontWeight={700} fontSize={15} mb={1} sx={{ display: 'flex', alignItems: 'center' }}><DirectionsCar sx={{ mr: 1 }} />معلومات الرحلة النشطة</Typography>
                  <Typography variant="body2">رقم الرحلة: {activeTrip.id}</Typography>
                  <Typography variant="body2">بداية الرحلة: {activeTrip.start_time ? new Date(activeTrip.start_time).toLocaleString('ar-EG') : '-'}</Typography>
                  <Typography variant="body2">عدد نقاط المسار المخطط: {plannedRoute.length}</Typography>
                </Card>
              )}
              {/* سجل المواقع */}
              <Card sx={{ p: 2, boxShadow: '0 2px 8px #1976d211' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>سجل المواقع (آخر 50 نقطة):</Typography>
                {vehicleHistory.length === 0 ? <Typography color="text.secondary">لا يوجد سجل</Typography> : (
                  <Box sx={{ maxHeight: 120, overflowY: 'auto', pr: 1 }}>
                    {vehicleHistory.map((loc, idx) => (
                      <Typography key={idx} variant="caption" display="block">
                        {loc.timestamp ? new Date(loc.timestamp).toLocaleString('ar-EG') : '-'} | {loc.latitude}, {loc.longitude}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Card>
            </Box>
            {/* زر العودة دائري وعائم */}
            <Box sx={{ position: 'absolute', top: 18, left: 18, zIndex: 2000 }}>
              <IconButton onClick={handleBackToAll} sx={{ bgcolor: '#fff', boxShadow: '0 4px 16px #1976d244', width: 60, height: 60, border: '2px solid #1976d2', transition:'all 0.2s', '&:hover':{bgcolor:'#f3f6fa'} }}>
                <Close sx={{ fontSize: 36, color: colors.primary.main }} />
              </IconButton>
            </Box>
          </Box>
        </Drawer>
      )}
      {/* إشعارات */}
      <Snackbar open={!!notification} autoHideDuration={6000} onClose={() => setNotification(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setNotification(null)} severity="info" sx={{ width: '100%' }}>{notification}</Alert>
      </Snackbar>
      {/* تحميل أولي */}
      {loading && (
        <Box sx={{ position: 'absolute', top: 64, left: 0, width: '100%', height: 'calc(100% - 64px)', background: '#fff8', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={60} />
        </Box>
      )}
    </Box>
  );
} 