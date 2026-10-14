from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from core.models import Vehicle, LocationHistory
from django.utils import timezone
# import json


class LocationService:
    """
    Service for managing vehicle location updates and notifications via WebSocket.
    Provides methods to broadcast location updates and notifications to clients.
    """
    
    @staticmethod
    def send_all_vehicles_update():
        """
        Broadcasts the latest location of all active vehicles to all connected clients via WebSocket.
        Returns: True if successful, False otherwise.
        """
        try:
            # الحصول على المركبات النشطة مع آخر موقع معروف
            active_vehicles = Vehicle.objects.filter(status=Vehicle.Status.ACTIVE)
            
            vehicles_data = []
            for vehicle in active_vehicles:
                last_location = LocationHistory.objects.filter(
                    vehicle=vehicle
                ).order_by('-timestamp').first()
                
                if last_location:
                    vehicle_data = {
                        'vehicle_id': vehicle.id,
                        'vehicle_name': vehicle.name,
                        'vehicle_plate': vehicle.plate_number,
                        'vehicle_model': vehicle.model,
                        'vehicle_status': vehicle.status,
                        'latitude': last_location.latitude,
                        'longitude': last_location.longitude,
                        'speed': last_location.speed,
                        'accuracy': last_location.accuracy,
                        'timestamp': last_location.timestamp.isoformat(),
                    }
                    vehicles_data.append(vehicle_data)
            
            # إرسال التحديث عبر WebSocket
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                'all_vehicles_locations',
                {
                    'type': 'all_vehicles_update',
                    'data': vehicles_data
                }
            )
            
            return True
            
        except Exception as e:
            print(f"Error sending all vehicles update: {e}")
            return False
    
    @staticmethod
    def send_notification(vehicle_id, notification_type, message):
        """
        Sends a notification message for a specific vehicle via WebSocket.
        Args:
            vehicle_id (int): The ID of the vehicle.
            notification_type (str): The type of notification (e.g., 'route_deviation').
            message (str): The notification message.
        Returns: True if successful, False otherwise.
        """
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id)
            
            notification_data = {
                'vehicle_id': vehicle_id,
                'vehicle_name': vehicle.name,
                'vehicle_plate': vehicle.plate_number,
                'type': notification_type,  # 'route_deviation', 'geofence_enter', 'geofence_exit'
                'message': message,
                'timestamp': timezone.now().isoformat()
            }
            
            # إرسال الإشعار عبر WebSocket
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                'all_vehicles_locations',
                {
                    'type': 'notification',
                    'notification': notification_data
                }
            )
            
            return True
            
        except Exception as e:
            print(f"Error sending notification: {e}")
            return False

    @staticmethod
    def send_vehicle_location_update(location_history):
        """
        Broadcasts the latest location of a single vehicle to all connected clients via WebSocket.
        Args:
            location_history (LocationHistory): The location history instance to broadcast.
        Returns: True if successful, False otherwise.
        """
        try:
            location_data = {
                "vehicle_id": location_history.vehicle_id,
                "vehicle_name": location_history.vehicle.name,
                "vehicle_plate": location_history.vehicle.plate_number,
                "latitude": location_history.latitude,
                "longitude": location_history.longitude,
                "timestamp": location_history.timestamp.isoformat(),
                "speed": location_history.speed,
                "accuracy": location_history.accuracy,
            }
            
            channel_layer = get_channel_layer()
            
            # إرسال تحديث للمركبة الفردية
            group_name = f'location_{location_history.vehicle_id}'
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": "location_update",
                    "location": location_data
                }
            )

            # إرسال تحديث لجميع المركبات
            async_to_sync(channel_layer.group_send)(
                'all_vehicles_locations',
                {
                    "type": "location_update",
                    "location": location_data
                }
            )
            
            return True
            
        except Exception as e:
            print(f"Error sending vehicle location update: {e}")
            return False


class TripRouteService:
    """
    Service for monitoring and validating trip routes for vehicles.
    Provides method to check if a vehicle has deviated from its planned route.
    """
    
    @staticmethod
    def check_route_deviation(vehicle_id, current_lat, current_lng):
        """
        Checks if the vehicle has deviated more than 1 km from its planned route.
        If deviation is detected, sends a notification via LocationService.
        Args:
            vehicle_id (int): The ID of the vehicle.
            current_lat (float): Current latitude.
            current_lng (float): Current longitude.
        Returns: (bool, float or None) - (True if deviated, distance in km or None)
        """
        from core.models import Trip
        from geopy.distance import geodesic
        
        try:
            # الحصول على الرحلة النشطة للمركبة
            trip = Trip.objects.filter(
                vehicle_id=vehicle_id,
                status=Trip.Status.IN_PROGRESS
            ).first()
            
            if not trip or not trip.route_points:
                return False, None
            
            # حساب أقرب مسافة للمسار
            current_point = (current_lat, current_lng)
            min_distance = float('inf')
            
            for point in trip.route_points:
                route_point = (point[0], point[1])  # [lat, lng]
                distance = geodesic(current_point, route_point).km
                if distance < min_distance:
                    min_distance = distance
            
            # إذا تجاوزت المسافة 1 كم
            if min_distance > 1:
                message = f"المركبة خرجت عن مسار الرحلة بأكثر من 1 كم (المسافة: {min_distance:.2f} كم)"
                LocationService.send_notification(vehicle_id, 'route_deviation', message)
                return True, min_distance
            
            return False, min_distance
            
        except Exception as e:
            print(f"Error checking route deviation: {e}")
            return False, None 