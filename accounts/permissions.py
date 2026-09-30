# ==============================================================================
# ACCOUNTS APPLICATION - PERMISSIONS
# Textile POS Billing System
# Contains: Role-Based DRF Permissions for Admin and Staff Users.
# ==============================================================================

from rest_framework.permissions import BasePermission

class IsAdminUserRole(BasePermission):
    """
    Grants permission only to users with the 'ADMIN' role or superuser status.
    Used for Staff CRUD, Reports, Product Management, and Supplier Ledgers.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_user())

class IsStaffOrAdmin(BasePermission):
    """
    Grants permission to any authenticated user (both Cashiers and Admins).
    Used for product lookup and billing checkout operations.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
