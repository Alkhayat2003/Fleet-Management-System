from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.views import APIView
from core.permissions import IsAdmin, IsDriver, DriverCanOnlyReadOwnData
from core.models import User
from .serializers import (
    UserSerializer, 
    UserCreateSerializer,
    LoginSerializer, 
    ChangePasswordSerializer
)

class UserListCreateView(generics.ListCreateAPIView):
    """
    API view to list all users or create a new user.
    Only accessible by authenticated admin users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_class(self):
        """
        Returns the serializer class based on the request method.
        POST uses UserCreateSerializer, others use UserSerializer.
        """
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer


class UserRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view to retrieve, update, or delete a user by ID.
    Only accessible by authenticated admin users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class LoginView(APIView):
    """
    API view for user login. Returns JWT tokens on success.
    """
    permission_classes = []
    
    def post(self, request):
        """
        Authenticates the user and returns access and refresh tokens.
        """
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    API view for users to retrieve or update their own profile.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """
        Returns the current authenticated user.
        """
        return self.request.user

    def update(self, request, *args, **kwargs):
        """
        Updates allowed profile fields for the authenticated user.
        """
        allowed_fields = ['first_name', 'last_name', 'phone_number', 'address']
        data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        serializer = self.get_serializer(self.get_object(), data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(UserSerializer(self.get_object()).data, status=status.HTTP_200_OK)


class ChangePasswordView(generics.UpdateAPIView):
    """
    API view to change the password for the authenticated user.
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """
        Returns the current authenticated user.
        """
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        """
        Changes the user's password and returns a success message.
        """
        super().update(request, *args, **kwargs)
        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    API view to log out a user by blacklisting their refresh token.
    """
    permission_classes = []
    def post(self, request):
        """
        Blacklists the provided refresh token to log out the user.
        """
        try:
            refresh_token = request.data.get("refresh_token") or request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Logout failed."}, status=status.HTTP_400_BAD_REQUEST)


class TokenRefreshView(APIView):
    """
    API view to refresh JWT access token using a valid refresh token.
    """
    permission_classes = []
    
    def post(self, request):
        """
        Returns a new access token for a valid refresh token.
        """
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({"error": "refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            access_token = str(token.access_token)
            
            return Response({
                'access': access_token,
                'refresh': refresh_token
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)