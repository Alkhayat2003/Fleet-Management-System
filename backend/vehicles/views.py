from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from .serializers import VehicleSerializer
from core.permissions import IsAdminOrManager
from core.models import Vehicle
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.models import LocationHistory, Trip



class VehicleListCreateView(generics.ListCreateAPIView):
    """
    API view to list all vehicles or create a new vehicle.
    Only accessible by authenticated admin or manager users.
    """
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManager]



class VehicleRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view to retrieve, update, or delete a vehicle by ID.
    Only accessible by authenticated admin or manager users.
    """
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManager]


class VehicleLocationAPIView(APIView):
    """
    API view to retrieve the latest location and active trip for a specific vehicle.
    """
    # permission_classes = [IsAuthenticated]
    
    def get(self, request, vehicle_id):
        """
        Returns the latest location and active trip for the given vehicle ID.
        """
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id)
            last_location = LocationHistory.objects.filter(
                vehicle=vehicle
            ).order_by('-timestamp').first()
            
            # الحصول على الرحلة النشطة للمركبة
            active_trip = Trip.objects.filter(
                vehicle=vehicle,
                status=Trip.Status.IN_PROGRESS
            ).first()
            
            vehicle_data = {
                'id': vehicle.id,
                'name': vehicle.name,
                'plate_number': vehicle.plate_number,
                'model': vehicle.model,
                'status': vehicle.status,
                'location': None,
                'active_trip': None
            }
            
            if last_location:
                vehicle_data['location'] = {
                    'latitude': last_location.latitude,
                    'longitude': last_location.longitude,
                    'speed': last_location.speed,
                    'accuracy': last_location.accuracy,
                    'timestamp': last_location.timestamp.isoformat()
                }
            
            if active_trip:
                vehicle_data['active_trip'] = {
                    'id': active_trip.id,
                    'driver': active_trip.driver.get_full_name() or active_trip.driver.username,
                    'start_time': active_trip.start_time.isoformat(),
                    'route_points': active_trip.route_points
                }
            
            return Response({
                'success': True,
                'vehicle': vehicle_data
            }, status=status.HTTP_200_OK)
            
        except Vehicle.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Vehicle not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VehicleHistoryAPIView(APIView):
    """
    API view to retrieve the location history for a specific vehicle.
    """
    # permission_classes = [IsAuthenticated]
    
    def get(self, request, vehicle_id):
        """
        Returns the location history for the given vehicle ID, limited by the 'limit' query parameter (default 100).
        """
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id)
            
            # الحصول على عدد النقاط المطلوبة (افتراضي: 100)
            limit = int(request.GET.get('limit', 100))
            
            # الحصول على سجل المواقع
            locations = LocationHistory.objects.filter(
                vehicle=vehicle
            ).order_by('-timestamp')[:limit]
            
            locations_data = []
            for location in locations:
                locations_data.append({
                    'latitude': location.latitude,
                    'longitude': location.longitude,
                    'speed': location.speed,
                    'accuracy': location.accuracy,
                    'timestamp': location.timestamp.isoformat()
                })
            
            return Response({
                'success': True,
                'vehicle_id': vehicle_id,
                'vehicle_name': vehicle.name,
                'locations': locations_data,
                'total_locations': len(locations_data)
            }, status=status.HTTP_200_OK)
            
        except Vehicle.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Vehicle not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
