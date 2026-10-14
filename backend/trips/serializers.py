from rest_framework import serializers
from core.models import Trip, User
        

class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'


class TripWriteSerializer(serializers.ModelSerializer):
    driver = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Roles.DRIVER)
    )
    created_by = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role__in=[User.Roles.ADMIN, User.Roles.MANAGER])
    )
    route_points = serializers.JSONField(required=False)
    
    class Meta:
        model = Trip
        fields = (
            'id', 'driver', 'vehicle', 
            'start_time', 'end_time', 'status', 'created_by', 
            'estimated_distance', 'route_points'
        )