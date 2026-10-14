from django.urls import path
from . import views

urlpatterns = [
    path('', views.TripListCreateView.as_view(), name='trip-list'),
    path('<int:pk>/', views.TripRetrieveUpdateDestroyView.as_view(), name='trip-detail'),
    path('driver-trips/', views.DriverTripsView.as_view(), name='driver-trips'),
    path('<int:trip_id>/start/', views.StartTripView.as_view(), name='start-trip'),
    path('<int:trip_id>/end/', views.EndTripView.as_view(), name='end-trip'),
    path('recent/', views.recent_trips, name='recent-trips'),
]