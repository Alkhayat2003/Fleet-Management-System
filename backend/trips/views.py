from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import TripSerializer, TripWriteSerializer
from core.permissions import IsAdminOrManager, IsDriver, DriverCanOnlyReadOwnData
from core.models import Trip
from rest_framework.decorators import api_view, permission_classes



class TripListCreateView(generics.ListCreateAPIView):
    """
    API view to list all trips or create a new trip.
    Only accessible by authenticated admin or manager users.
    """
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    # permission_classes = [IsAuthenticated, IsAdminOrManager]

    def get_serializer_class(self):
        """
        Returns the serializer class based on the request method.
        POST uses TripWriteSerializer, others use TripSerializer.
        """
        if self.request.method in ['POST']:
            return TripWriteSerializer
        return TripSerializer



class TripRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view to retrieve, update, or delete a trip by ID.
    Admins/managers can update/delete, drivers can only read their own trips.
    """
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    # permission_classes = [IsAuthenticated, DriverCanOnlyReadOwnData]

    def get_serializer_class(self):
        """
        Returns the serializer class based on the request method.
        PUT/PATCH uses TripWriteSerializer, others use TripSerializer.
        """
        if self.request.method in ['PUT', 'PATCH']:
            return TripWriteSerializer
        return TripSerializer

    def get_queryset(self):
        """
        Returns trips for the current user if driver, else all trips.
        """
        if self.request.user.role == self.request.user.Roles.DRIVER:
            return Trip.objects.filter(driver=self.request.user)
        return Trip.objects.all()



# View مخصص للسائقين لرؤية رحلاتهم فقط
class DriverTripsView(generics.ListAPIView):
    """
    API view for drivers to list only their own trips.
    """
    serializer_class = TripSerializer
    # permission_classes = [IsAuthenticated, IsDriver]

    def get_queryset(self):
        """
        Returns trips assigned to the current driver.
        """
        return Trip.objects.filter(driver=self.request.user.pk)

    def list(self, request, *args, **kwargs):
        """
        Returns a list of trips for the current driver.
        """
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": f"Error retrieving trips: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# View لبدء رحلة
class StartTripView(APIView):
    """
    API view for drivers to start a trip.
    """
    permission_classes = [IsAuthenticated, IsDriver]

    def post(self, request, trip_id):
        """
        Starts the trip if it is in planned status.
        """
        try:
            trip = Trip.objects.get(id=trip_id, driver=request.user)
            if trip.status == 'planned':
                trip.status = 'in_progress'
                trip.save()
                return Response(TripSerializer(trip).data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Cannot start a trip that is not planned or already completed."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Trip.DoesNotExist:
            return Response(
                {"error": "Trip not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )


# View لإنهاء رحلة
class EndTripView(APIView):
    """
    API view for drivers to end a trip.
    """
    permission_classes = [IsAuthenticated, IsDriver]

    def post(self, request, trip_id):
        """
        Ends the trip if it is in progress.
        """
        try:
            trip = Trip.objects.get(id=trip_id, driver=request.user)
            if trip.status == 'in_progress':
                trip.status = 'completed'
                trip.save()
                return Response(TripSerializer(trip).data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Cannot end a trip that is not in progress."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Trip.DoesNotExist:
            return Response(
                {"error": "Trip not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )


# API endpoint: /api/trips/recent/
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_trips(request):
    """
    Returns the latest 5 trips (any status), newest first, with driver and vehicle info.
    """
    trips = Trip.objects.select_related('driver', 'vehicle').order_by('-start_time')[:5]
    data = []
    for trip in trips:
        data.append({
            'id': trip.id,
            'status': trip.status,
            'start_time': trip.start_time,
            'driver': trip.driver.get_full_name() or trip.driver.username,
            'vehicle': trip.vehicle.name,
        })
    return Response(data)