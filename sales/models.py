# ==============================================================================
# SALES APPLICATION - MODELS
# Textile POS Billing System
# Contains: Customer, Invoice (Orders), InvoiceItem, and ProductReturn.
# ==============================================================================

import uuid
from django.db import models
from django.conf import settings
from inventory.models import Product

class Customer(models.Model):
    """
    Retail customer registry for capturing loyalty and purchase records.
    """
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=20, unique=True)
    email = models.EmailField(blank=True, null=True)
    loyalty_points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.phone}) - {self.loyalty_points} pts"

class Invoice(models.Model):
    """
    Master invoice header representing a retail sale transaction.
    Stores auto-generated invoice IDs, cashier reference, payment details, and totals.
    """
    PAYMENT_CHOICES = (
        ('CASH', 'Cash'),
        ('UPI', 'UPI / QR Code'),
        ('CARD', 'Debit/Credit Card'),
        ('SPLIT', 'Split Payment'),
    )
    STATUS_CHOICES = (
        ('COMPLETED', 'Completed'),
        ('RETURNED', 'Partially/Fully Returned'),
        ('CANCELLED', 'Cancelled'),
    )

    invoice_number = models.CharField(max_length=50, unique=True, editable=False)
    cashier = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='invoices')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    promo_code = models.CharField(max_length=50, blank=True, null=True)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2)
    
    payment_mode = models.CharField(max_length=15, choices=PAYMENT_CHOICES, default='CASH')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='COMPLETED')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Automatically generate a unique Invoice number like 'INV-A1B2C3D4'
        if not self.invoice_number:
            self.invoice_number = f"INV-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.invoice_number} - ₹{self.grand_total}"

class InvoiceItem(models.Model):
    """
    Line items attached to an Invoice.
    Records snapshot of unit price and quantity at time of sale.
    """
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='invoice_items')
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"

class ProductReturn(models.Model):
    """
    Product returns registry.
    Handles customer returns, stores refund value, and automatically
    restores product inventory count back to the shelf.
    """
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='returns')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='returns')
    quantity = models.PositiveIntegerField(default=1)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Return #{self.id} for {self.invoice.invoice_number} ({self.product.name})"
