from rest_framework import serializers
from core.models import LocationHistory, Vehicle

class SendLocationSerializer(serializers.ModelSerializer):
    """
    Serializer for sending and saving a new location record for a vehicle.
    """
    class Meta:
        model = LocationHistory
        fields = ['vehicle', 'latitude', 'longitude', 'speed', 'accuracy', 'timestamp']
        
    def create(self, validated_data):
        """
        Creates a new LocationHistory instance. If vehicle is not provided, logic can be added to assign a default vehicle.
        """
        # إذا لم يتم توفير vehicle، استخدم مركبة افتراضية أو اتركه فارغاً
        if 'vehicle' not in validated_data or not validated_data['vehicle']:
            # يمكن إضافة منطق هنا للحصول على مركبة السائق الحالي
            pass
        return super().create(validated_data)
        

class LiveLocationSerializer(serializers.ModelSerializer):
    """
    Serializer for reading location history data, including related vehicle and trip info (depth=2).
    """
    class Meta:
        model = LocationHistory
        fields = '__all__'
        depth = 2