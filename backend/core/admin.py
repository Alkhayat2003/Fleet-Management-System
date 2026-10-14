from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Vehicle, Trip, LocationHistory, Notification


# 1. Custom User Admin
class CustomUserAdmin(UserAdmin):
    """
    Custom admin interface for the User model.
    Adds extra fields and customizes list display and filters for user management.
    """
    list_display = ('username', 'email', 'full_name', 'role', 'is_staff', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        (_('Additional Information'), {
            'fields': ('phone_number', 'address', 'license_number', 'license_expiry', 'profile_picture'),
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (_('Additional Information'), {
            'fields': ('phone_number', 'address', 'license_number', 'license_expiry', 'profile_picture'),
        }),
    )
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    filter_horizontal = ()


# 2. Vehicle Admin
class VehicleAdmin(admin.ModelAdmin):
    """
    Custom admin interface for the Vehicle model.
    Configures list display, filters, search, and fieldsets for vehicle management.
    """
    list_display = ('name', 'plate_number', 'model', 'year', 'status', 'fuel_type', 'insurance_expiry')
    list_filter = ('status', 'fuel_type', 'year')
    search_fields = ('name', 'plate_number', 'vin')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('name', 'model', 'year', 'plate_number', 'vin', 'status')
        }),
        (_('Details'), {
            'fields': ('odometer', 'fuel_type', 'insurance_expiry', 'notes')
        }),
        (_('Time'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# 3. Trip Admin
class TripAdmin(admin.ModelAdmin):
    """
    Custom admin interface for the Trip model.
    Configures list display, filters, search, and fieldsets for trip management.
    """
    list_display = ('driver', 'vehicle', 'created_by', 'start_time', 'end_time', 'status')
    list_filter = ('status', 'start_time', 'end_time')
    search_fields = ('driver__username', 'vehicle__plate_number')
    readonly_fields = ()  # لا توجد حقول created_at و updated_at في النموذج
    fieldsets = (
        (None, {
            'fields': ('driver', 'vehicle', 'created_by', 'start_time', 'end_time', 'status')
        }),
        (_('Details'), {
            'fields': ('estimated_distance',)
        }),
    )


# # 4. MaintenanceRequest Admin
# class MaintenanceRequestAdmin(admin.ModelAdmin):
#     list_display = ('vehicle', 'description', 'reported_by', 'status', 'created_at')
#     list_filter = ('status', 'created_at')
#     search_fields = ('vehicle__plate_number', 'description', 'reported_by__username')
#     readonly_fields = ('created_at', 'updated_at')
#     fieldsets = (
#         (None, {
#             'fields': ('vehicle', 'description', 'status')
#         }),
#         (_('التاريخ'), {
#             'fields': ('reported_by', 'created_at', 'updated_at'),
#             'classes': ('collapse',)
#         }),
#     )


# # 5. TripReport Admin
# class TripReportAdmin(admin.ModelAdmin):
#     list_display = ('driver', 'trip', 'departure_time', 'arrival_time')
#     list_filter = ('driver', 'trip', 'departure_time')
#     search_fields = ('driver__username', 'trip__id')
#     fieldsets = (
#         (None, {
#             'fields': ('driver', 'trip', 'departure_time', 'arrival_time', 'notes')
#         }),
#     )


# 6. LocationHistory Admin
class LocationHistoryAdmin(admin.ModelAdmin):
    """
    Custom admin interface for the LocationHistory model.
    Configures list display, filters, search, and fieldsets for location tracking.
    """
    list_display = ('vehicle', 'timestamp', 'latitude', 'longitude', 'speed', 'accuracy')
    list_filter = ('timestamp',)
    search_fields = ('vehicle__plate_number',)
    readonly_fields = ('timestamp',)
    fieldsets = (
        (None, {
            'fields': ('vehicle', 'timestamp', 'latitude', 'longitude', 'speed', 'accuracy')
        }),
    )
    ordering = ('-timestamp',)


# 7. Notification Admin
class NotificationAdmin(admin.ModelAdmin):
    """
    Custom admin interface for the Notification model.
    Displays user, type, message, read status, and timestamp.
    """
    list_display = ('user', 'type', 'message', 'is_read', 'timestamp')
    list_filter = ('type', 'is_read', 'timestamp')
    search_fields = ('user__username', 'message', 'type')
    readonly_fields = ('timestamp',)
    ordering = ('-timestamp',)


admin.site.register(User, CustomUserAdmin)
admin.site.register(Vehicle, VehicleAdmin)
admin.site.register(Trip, TripAdmin)
# admin.site.register(MaintenanceRequest, MaintenanceRequestAdmin)
# admin.site.register(TripReport, TripReportAdmin)
admin.site.register(LocationHistory, LocationHistoryAdmin)
admin.site.register(Notification, NotificationAdmin)