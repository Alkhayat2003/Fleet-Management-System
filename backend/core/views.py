from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Vehicle, LocationHistory, Trip, Notification
from django.db.models import Max
import json
from django.utils import timezone
from .serializers import NotificationSerializer
from rest_framework import generics



class DashboardStatsAPIView(APIView):
    """
    API view to retrieve dashboard statistics for the fleet management system.
    Returns counts of vehicles, trips, tracked vehicles, and other key metrics.
    """
    # permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Returns dashboard statistics as a JSON response.
        """
        try:
            # إحصائيات المركبات
            total_vehicles = Vehicle.objects.all().count()
            active_trips = Trip.objects.filter(status=Trip.Status.IN_PROGRESS).count()
            tracked_vehicles = LocationHistory.objects.values('vehicle').distinct().count()
            
            # إحصائيات إضافية
            vehicles_in_maintenance = Vehicle.objects.filter(status=Vehicle.Status.MAINTENANCE).count()
            completed_trips_today = Trip.objects.filter(
                status=Trip.Status.COMPLETED,
                end_time__date=timezone.now().date()
            ).count()
            
            return Response({
                'success': True,
                'stats': {
                    'total_vehicles': total_vehicles,
                    'active_trips': active_trips,
                    'tracked_vehicles': tracked_vehicles,
                    'vehicles_in_maintenance': vehicles_in_maintenance,
                    'completed_trips_today': completed_trips_today,
                    'last_update': timezone.now().isoformat()
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NotificationListView(generics.ListAPIView):
    """
    API view to list all notifications for the authenticated user.
    Supports filtering unread notifications with ?unread=1.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(user=user)
        unread = self.request.query_params.get('unread')
        if unread == '1':
            queryset = queryset.filter(is_read=False)
        return queryset


class NotificationMarkReadView(APIView):
    """
    API view to mark a notification as read for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({'success': True, 'notification_id': notification_id})
        except Notification.DoesNotExist:
            return Response({'success': False, 'error': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)

