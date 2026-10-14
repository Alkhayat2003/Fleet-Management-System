from django.urls import path
from .views import SendLocationView, LiveLocationsView, VehicleLocationHistoryView

"""
URL configuration for the tracking app.
Defines endpoints for sending locations, live locations, and vehicle location history.
"""
urlpatterns = [
    # Send current location for a vehicle
    path('send_location/', SendLocationView.as_view(), name='send-location'),
    # List latest locations for all vehicles
    path('live_locations/', LiveLocationsView.as_view(), name='live-locations'),
    # List location history for a specific vehicle
    path('vehicle/<int:vehicle_id>/history/', VehicleLocationHistoryView.as_view(), name='vehicle-location-history'),
]