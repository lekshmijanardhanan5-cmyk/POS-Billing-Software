# ==============================================================================
# INVENTORY APPLICATION - MODELS
# Textile POS Billing System
# Contains: Category, Supplier, Product (with Sizes, Colors & Images), and PurchaseOrder.
# ==============================================================================

from django.db import models

class Category(models.Model):
    """
    Product categorization tailored for apparel retail
    (e.g., Men's Wear, Women's Wear, Kids Wear, Fabrics).
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Supplier(models.Model):
    """
    Wholesale suppliers and vendors for raw materials and garments.
    Tracks contact information and current outstanding ledger balance.
    """
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    gst_number = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    """
    Textile retail product entity.
    Stores barcode for barcode scanning, textile size choices, color variations,
    image URL for visual POS billing, cost vs selling margins, stock count, and GST tax rate.
    """
    SIZE_CHOICES = (
        ('XS', 'Extra Small'),
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
        ('XL', 'Extra Large'),
        ('XXL', 'Double XL'),
        ('FREE', 'Free Size / Unstitched'),
    )

    name = models.CharField(max_length=200)
    barcode = models.CharField(max_length=60, unique=True, db_index=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    size = models.CharField(max_length=10, choices=SIZE_CHOICES, default='FREE')
    color = models.CharField(max_length=50, blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)      # Wholesale/Purchased price
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)   # Retail billing price
    stock_quantity = models.IntegerField(default=0)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=5.0) # GST percentage (e.g. 5%)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.size} / {self.color or 'N/A'}) - {self.barcode}"

class PurchaseOrder(models.Model):
    """
    Supplier stock purchase ledger entries.
    Records incoming stock batches and updates vendor balance automatically.
    """
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchases')
    bill_number = models.CharField(max_length=100)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    purchase_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Purchase #{self.bill_number} - {self.supplier.name}"
