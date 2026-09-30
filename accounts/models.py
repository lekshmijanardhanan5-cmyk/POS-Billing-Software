# ==============================================================================
# ACCOUNTS APPLICATION - MODELS
# Textile POS Billing System
# Contains: Custom User Model with Role-Based Access Control (ADMIN & STAFF).
# ==============================================================================

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Distinguishes between Admin (Store Managers) and Staff (Cashiers).
    """
    ROLE_CHOICES = (
        ('ADMIN', 'Admin / Store Manager'),
        ('STAFF', 'Staff / Cashier'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='STAFF')
    phone = models.CharField(max_length=15, blank=True, null=True)

    def is_admin_user(self):
        """
        Helper method to verify if user has Admin privileges.
        """
        return self.role == 'ADMIN' or self.is_superuser

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
