# views.py
from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from core.permissions import IsDriver, IsAdminOrManager, IsDriverWithWriteAccess
from .serializers import SendLocationSerializer, LiveLocationSerializer
from rest_framework import serializers
from core.models import LocationHistory, Vehicle
from core.models import Trip
from django.utils import timezone
from rest_framework import status
from django.db.models import Max, Q

class SendLocationView(CreateAPIView):
    """
    API view for drivers to send their current location.
    Automatically assigns a vehicle if not provided.
    """
    queryset = LocationHistory.objects.all()
    serializer_class = SendLocationSerializer
    # permission_classes = [IsAuthenticated, IsDriverWithWriteAccess]

    def create(self, request, *args, **kwargs):
        """
        Creates a new location record for the driver.
        Adds a timestamp if not provided and assigns a vehicle if missing.
        """
        print(f"SendLocationView.create() called by {request.user.username}")
        print(f"Request data: {request.data}")
        
        try:
            # إضافة timestamp إذا لم يكن موجوداً
            data = request.data.copy()
            if 'timestamp' not in data:
                data['timestamp'] = timezone.now().isoformat()
            
            # إذا لم يكن هناك vehicle، استخدم مركبة افتراضية للسائق
            if 'vehicle' not in data or not data['vehicle']:
                # البحث عن رحلة نشطة للسائق
                try:
                    active_trip = Trip.objects.filter(
                        driver=request.user,
                        status='in_progress'
                    ).first()
                    if active_trip:
                        data['vehicle'] = active_trip.vehicle.id
                        print(f"Using vehicle from active trip: {active_trip.vehicle.id}")
                    else:
                        # استخدام مركبة افتراضية
                        default_vehicle = Vehicle.objects.filter(status='active').first()
                        if default_vehicle:
                            data['vehicle'] = default_vehicle.id
                            print(f"Using default vehicle: {default_vehicle.id}")
                        else:
                            return Response(
                                {"error": "No available vehicle found."}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                except Exception as e:
                    print(f"Error finding vehicle: {e}")
                    return Response(
                        {"error": "Error finding vehicle."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            print(f"Location saved successfully: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Error in SendLocationView.create(): {e}")
            return Response(
                {"error": f"Error saving location: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer):
        """
        Saves the validated location data to the database.
        """
        serializer.save()


class LiveLocationsView(ListAPIView):
    """
    API view to list the latest location for each vehicle.
    Only accessible by admin or manager users.
    """
    serializer_class = LiveLocationSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManager]

    def get_queryset(self):
        """
        Returns the latest location for each vehicle (متوافق مع جميع قواعد البيانات).
        """
        latest = LocationHistory.objects.values('vehicle').annotate(last=Max('timestamp'))
        q = Q()
        for x in latest:
            q |= Q(vehicle=x['vehicle'], timestamp=x['last'])
        return LocationHistory.objects.filter(q)


class VehicleLocationHistoryView(ListAPIView):
    """
    API view to list the location history for a specific vehicle.
    Admins/managers can view any vehicle, drivers can view vehicles they have driven.
    """
    serializer_class = LiveLocationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Returns the location history for the given vehicle if the user has access.
        """
        vehicle_id = self.kwargs.get('vehicle_id')
        user = self.request.user

        # المدير أو المشرف يمكنهم رؤية سجل أي مركبة
        if user.role in [user.Roles.ADMIN, user.Roles.MANAGER]:
            return LocationHistory.objects.filter(vehicle_id=vehicle_id).order_by('-timestamp')[:50]

        # السائق يرى فقط سجل مركبة قادها في رحلة (نشطة أو سابقة)
        has_trip = Trip.objects.filter(driver=user, vehicle_id=vehicle_id).exists()
        if user.role == user.Roles.DRIVER and has_trip:
            return LocationHistory.objects.filter(vehicle_id=vehicle_id).order_by('-timestamp')[:50]

        # غير مصرح
        return LocationHistory.objects.none()