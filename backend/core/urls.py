from django.urls import path
from . import views
from .views import NotificationListView, NotificationMarkReadView

"""
URL configuration for the core app.
Defines endpoints for dashboard statistics and other core APIs.
"""
app_name = 'core'

urlpatterns = [
    # Dashboard statistics API
    path('dashboard/', views.DashboardStatsAPIView.as_view(), name='dashboard-stats'),
    # List notifications for the authenticated user
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    # Mark a notification as read
    path('notifications/<int:notification_id>/read/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
] 