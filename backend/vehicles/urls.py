from django.urls import path
from . import views

"""
URL configuration for the vehicles app.
Defines endpoints for vehicle management, location, and history.
"""
urlpatterns = [
    # List all vehicles or create a new vehicle
    path('', views.VehicleListCreateView.as_view(), name='vehicle-list'),
    # Retrieve, update, or delete a vehicle by ID
    path('<int:pk>/', views.VehicleRetrieveUpdateDestroyView.as_view(), name='vehicle-detail'),
    # Retrieve the latest location for a vehicle
    path('vehicle_location/<int:vehicle_id>/', views.VehicleLocationAPIView.as_view(), name='vehicle-location'),
    # Retrieve the location history for a vehicle
    path('vehicle_history/<int:vehicle_id>/', views.VehicleHistoryAPIView.as_view(), name='vehicle-history'),
]