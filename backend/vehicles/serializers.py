from rest_framework import serializers
from core.models import Vehicle
from datetime import datetime

class VehicleSerializer(serializers.ModelSerializer):
    """
    Serializer for the Vehicle model. Used for reading and writing vehicle data.
    """
    insurance_expiry = serializers.DateField(
        input_formats=['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y'],
        format='%Y-%m-%d'
    )
    
    class Meta:
        model = Vehicle
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_insurance_expiry(self, value):
        """
        Validate that insurance expiry date is not in the past.
        """
        if value < datetime.now().date():
            raise serializers.ValidationError("تاريخ انتهاء التأمين لا يمكن أن يكون في الماضي")
        return value
    
    def validate_year(self, value):
        """
        Validate that year is reasonable.
        """
        current_year = datetime.now().year
        if value < 1900 or value > current_year + 1:
            raise serializers.ValidationError("سنة الصنع يجب أن تكون بين 1900 و " + str(current_year + 1))
        return value
    
    def validate_odometer(self, value):
        """
        Validate that odometer is not negative.
        """
        if value is not None and value < 0:
            raise serializers.ValidationError("عداد المسافة لا يمكن أن يكون سالب")
        return value