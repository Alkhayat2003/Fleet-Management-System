from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        """
        Checks if the user is authenticated and has the admin role.
        """
        return request.user.is_authenticated and request.user.role == request.user.Roles.ADMIN

class IsManager(permissions.BasePermission):
    """
    Allows access only to manager users.
    """
    def has_permission(self, request, view):
        """
        Checks if the user is authenticated and has the manager role.
        """
        return request.user.is_authenticated and request.user.role == request.user.Roles.MANAGER

class IsDriver(permissions.BasePermission):
    """
    Allows access only to driver users.
    """
    def has_permission(self, request, view):
        """
        Checks if the user is authenticated and has the driver role.
        """
        return request.user.is_authenticated and request.user.role == request.user.Roles.DRIVER

class IsDriverWithWriteAccess(permissions.BasePermission):
    """
    Allows drivers to have both read and write access.
    """
    def has_permission(self, request, view):
        """
        Checks if the user is authenticated and is a driver, allowing all operations.
        """
        if not request.user.is_authenticated:
            return False
        if request.user.role == request.user.Roles.DRIVER:
            return True
        return False

class IsAdminOrManager(permissions.BasePermission):
    """
    Allows access to admin or manager users.
    """
    def has_permission(self, request, view):
        """
        Checks if the user is authenticated and is either admin or manager.
        """
        return request.user.is_authenticated and request.user.role in [request.user.Roles.ADMIN, request.user.Roles.MANAGER]

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Allows access to the owner of the object or admin users.
    """
    def has_object_permission(self, request, view, obj):
        """
        Checks if the user is authenticated and is either admin or the owner/driver of the object.
        """
        return (
            request.user.is_authenticated and 
            (request.user.role == request.user.Roles.ADMIN or 
             getattr(obj, 'user', None) == request.user or
             getattr(obj, 'driver', None) == request.user)
        )

class DriverCanOnlyReadOwnData(permissions.BasePermission):
    """
    Allows drivers to only read their own data, while admins/managers have full access.
    """
    def has_permission(self, request, view):
        """
        Checks if the user is authenticated. Drivers can only perform safe (read) methods.
        """
        if not request.user.is_authenticated:
            return False
        if request.user.role == request.user.Roles.DRIVER:
            return request.method in permissions.SAFE_METHODS
        return True

    def has_object_permission(self, request, view, obj):
        """
        Checks if the user is authenticated. Drivers can only view their own data; admins/managers have full access.
        """
        if not request.user.is_authenticated:
            return False
        if request.user.role == request.user.Roles.DRIVER:
            return (
                request.method in permissions.SAFE_METHODS and
                (getattr(obj, 'user', None) == request.user or
                 getattr(obj, 'driver', None) == request.user)
            )
        return True

