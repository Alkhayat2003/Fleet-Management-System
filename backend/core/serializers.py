from .models import Notification
from rest_framework import serializers

class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for the Notification model. Used for reading and writing notification data.
    """
    class Meta:
        model = Notification
        fields = '__all__' 