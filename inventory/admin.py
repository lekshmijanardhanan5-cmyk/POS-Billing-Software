from django.contrib import admin
from .models import Category, Supplier, Product, PurchaseOrder

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description')

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'phone', 'gst_number', 'balance')
    search_fields = ('name', 'phone', 'gst_number')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'barcode', 'category', 'size', 'color', 'cost_price', 'selling_price', 'stock_quantity', 'is_active')
    list_filter = ('category', 'size', 'is_active')
    search_fields = ('name', 'barcode', 'color')

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'supplier', 'bill_number', 'total_amount', 'paid_amount', 'purchase_date')
    list_filter = ('supplier', 'purchase_date')
