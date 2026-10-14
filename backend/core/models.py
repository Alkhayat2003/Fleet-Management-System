"""
Models for the Fleet Management System.
Defines User, Vehicle, Trip, and LocationHistory models with business logic.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models.fields.json import JSONField
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework_simplejwt.tokens import RefreshToken
from geopy.distance import geodesic



class User(AbstractUser):
    """
    Custom user model for the fleet management system.
    Extends Django's AbstractUser and adds fields for role, phone, address, license, etc.
    Roles: admin, manager, driver.
    """
    class Roles(models.TextChoices):
        ADMIN = 'admin', _('Manager')
        MANAGER = 'manager', _('Supervisor')
        DRIVER = 'driver', _('Driver')

    role = models.CharField(
        max_length=10,
        choices=Roles.choices,
        default=Roles.DRIVER,
        verbose_name=_('الدور')
    )
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        verbose_name=_('رقم الهاتف')
    )
    address = models.TextField(
        blank=True,
        verbose_name=_('العنوان')
    )
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True,
        null=True,
        verbose_name=_('الصورة الشخصية')
    )
    license_number = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        verbose_name=_('رقم الرخصة')
    )
    license_expiry = models.DateField(
        null=True,
        blank=True,
        verbose_name=_('تاريخ انتهاء الرخصة')
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('تاريخ الإنشاء')
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('تاريخ التحديث')
    )

    class Meta:
        verbose_name = _('مستخدم')
        verbose_name_plural = _('المستخدمين')
        ordering = ['-date_joined']

    def __str__(self):
        """
        Returns the full name or username of the user.
        """
        return f"{self.get_full_name() or self.username}"

    @property
    def full_name(self):
        """
        Returns the user's full name.
        """
        return self.get_full_name()

    def is_admin(self):
        """
        Checks if the user is an admin.
        Returns: bool
        """
        return self.role == self.Roles.ADMIN

    def is_manager(self):
        """
        Checks if the user is a manager.
        Returns: bool
        """
        return self.role == self.Roles.MANAGER

    def is_driver(self):
        """
        Checks if the user is a driver.
        Returns: bool
        """
        return self.role == self.Roles.DRIVER

    def tokens(self):
        """
        Returns JWT tokens for the user (refresh and access).
        Returns: dict
        """
        refresh = RefreshToken.for_user(self)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }


class Vehicle(models.Model):
    """
    Represents a vehicle in the fleet.
    Includes details such as model, year, plate number, VIN, status, odometer, etc.
    """
    class Status(models.TextChoices):
        ACTIVE = 'active', _('Active')
        MAINTENANCE = 'maintenance', _('In Maintenance')
        INACTIVE = 'inactive', _('Inactive')

    name = models.CharField(
        max_length=100,
        verbose_name=_('اسم المركبة')
    )
    model = models.CharField(
        max_length=50,
        verbose_name=_('الموديل')
    )
    year = models.IntegerField(
        verbose_name=_('سنة الصنع')
    )
    plate_number = models.CharField(
        max_length=20,
        unique=True,
        verbose_name=_('رقم اللوحة')
    )
    vin = models.CharField(
        max_length=17,
        unique=True,
        verbose_name=_('رقم الهيكل')
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        verbose_name=_('الحالة')
    )
    odometer = models.PositiveIntegerField(
        default=0,
        verbose_name=_('عداد المسافة')
    )
    fuel_type = models.CharField(
        max_length=20,
        verbose_name=_('نوع الوقود')
    )
    insurance_expiry = models.DateField(
        verbose_name=_('تاريخ انتهاء التأمين')
    )
    notes = models.TextField(
        blank=True,
        verbose_name=_('ملاحظات')
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('تاريخ الإضافة')
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('تاريخ التحديث')
    )

    class Meta:
        verbose_name = _('مركبة')
        verbose_name_plural = _('المركبات')
        ordering = ['-created_at']

    def __str__(self):
        """
        Returns a string representation of the vehicle (name and plate number).
        """
        return f"{self.name} - {self.plate_number}"



class Trip(models.Model):
    """
    Represents a trip assigned to a driver and vehicle.
    Includes start/end time, status, route points, and creator.
    """
    class Status(models.TextChoices):
        PLANNED = 'planned', 'Planned'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'

    driver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='trips_as_driver',
        verbose_name="السائق"
    )
    vehicle = models.ForeignKey(
        'Vehicle',
        on_delete=models.CASCADE,
        related_name='trips',
        verbose_name="المركبة"
    )
    start_time = models.DateTimeField(verbose_name="وقت البدء")
    end_time = models.DateTimeField(null=True, blank=True, verbose_name="وقت الانتهاء")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLANNED,
        verbose_name="الحالة"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_trips',
        verbose_name="المنشئ"
    )
    estimated_distance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="المسافة التقديرية (كم)"
    )
    route_points = JSONField(
        null=True,
        blank=True,
        verbose_name="نقاط مسار الرحلة (قائمة إحداثيات)"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    def __str__(self):
        """
        Returns a string representation of the trip (driver, vehicle, status).
        """
        return f'{self.driver} - {self.vehicle} ({self.status})'

    class Meta:
        verbose_name = "رحلة"
        verbose_name_plural = "الرحلات"
        ordering = ['-start_time']



class Notification(models.Model):
    """
    Model representing a notification sent to a user.
    Stores type, message, read status, timestamp, and optional extra data.
    """
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=50)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    data = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Notification to {self.user} - {self.type} - {self.timestamp}."
    

class LocationHistory(models.Model):
    """
    Stores the location history of a vehicle at a specific timestamp.
    Used for live tracking and route deviation detection.
    """
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name='location_history',
        verbose_name=_('المركبة')
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name=_('وقت التحديث')
    )
    latitude = models.FloatField(
        null=True,
        blank=True,
        verbose_name=_('خط العرض')
    )
    longitude = models.FloatField(
        null=True,
        blank=True,
        verbose_name=_('خط الطول')
    )
    speed = models.FloatField(
        null=True,
        blank=True,
        verbose_name=_('السرعة')
    )
    accuracy = models.FloatField(
        null=True,
        blank=True,
        verbose_name=_('دقة الموقع')
    )

    class Meta:
        verbose_name = _('تتبع الموقع')
        verbose_name_plural = _('تتبع المواقع')
        ordering = ['-timestamp']

    def __str__(self):
        """
        Returns a string representation of the location record (vehicle plate and timestamp).
        """
        return f"{self.vehicle.plate_number} - {self.timestamp}"

    def save(self, *args, **kwargs):
        """
        Saves the location record and triggers route deviation check and WebSocket update.
        Calls TripRouteService to check if the vehicle deviated from its route.
        Calls LocationService to broadcast the new location.
        """
        super().save(*args, **kwargs)
        from tracking.services import TripRouteService
        TripRouteService.check_route_deviation(self.vehicle_id, self.latitude, self.longitude)
        from tracking.services import LocationService
        LocationService.send_vehicle_location_update(self)


