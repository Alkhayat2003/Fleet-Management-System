from django.urls import path
from accounts import views

"""
URL configuration for the accounts app.
Defines endpoints for user management, authentication, profile, and password change.
"""
urlpatterns = [
    # List all users or create a new user
    path('users/', views.UserListCreateView.as_view(), name='user-list-create'),
    # Retrieve, update, or delete a user by ID
    path('users/<int:pk>/', views.UserRetrieveUpdateDestroyView.as_view(), name='user-detail'),

    # User login
    path('login/', views.LoginView.as_view(), name='login'),
    # User logout
    path('logout/', views.LogoutView.as_view(), name='logout'),
    # Refresh JWT token
    path('token/refresh/', views.TokenRefreshView.as_view(), name='token-refresh'),
    
    # Retrieve or update user profile
    path('profile/', views.ProfileView.as_view(), name='profile'),
    
    # Change user password
    path('password/change/', views.ChangePasswordView.as_view(), name='change-password'),
]