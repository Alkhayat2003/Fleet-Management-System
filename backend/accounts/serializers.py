from django.contrib.auth import authenticate
from rest_framework import serializers
from core.models import User
from django.contrib.auth.password_validation import validate_password



class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model. Used for reading user data.
    """
    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name',
            'role', 
            'phone_number', 
            'address', 
            'profile_picture',
            'license_number', 
            'license_expiry', 
            'created_at'
        ]
        read_only_fields = ['id']



class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new user. Includes password validation and confirmation.
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm Password")

    class Meta:
        model = User
        fields = (
            'username', 'password', 'password2', 'email', 'first_name', 'last_name', 'role',
            'phone_number', 'address', 'profile_picture', 'license_number', 'license_expiry'
        )

    def validate(self, attrs):
        """
        Validates that the two password fields match.
        Raises ValidationError if not.
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        """
        Creates a new user with the validated data.
        """
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user



class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login. Authenticates user and returns tokens on success.
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Authenticates the user and returns user data and tokens if valid.
        Raises ValidationError if authentication fails.
        """
        user = authenticate(**data)
        if user and user.is_active:
            tokens = user.tokens()
            return {
                'user': UserSerializer(user).data,
                'access': tokens['access'],
                'refresh': tokens['refresh']
            }
        raise serializers.ValidationError("Invalid username or password.")



class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing user password. Validates old and new passwords.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])

    def validate(self, data):
        """
        Validates the old password and ensures the new password is different.
        Raises ValidationError if checks fail.
        """
        user = self.context['request'].user
        if not user.check_password(data['old_password']):
            raise serializers.ValidationError({'old_password': 'Old password is incorrect.'})
        
        if data['old_password'] == data['new_password']:
            raise serializers.ValidationError({'new_password': 'New password cannot be the same as the old password.'})
            
        return data

    def update(self, instance, validated_data):
        """
        Sets the new password for the user instance.
        """
        instance.set_password(validated_data['new_password'])
        instance.save()
        return instance