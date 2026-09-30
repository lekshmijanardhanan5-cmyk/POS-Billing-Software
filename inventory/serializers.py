# ==============================================================================
# INVENTORY APPLICATION - SERIALIZERS
# Textile POS Billing System
# Contains: Serializers for Category, Supplier, Product (with image_url), and PurchaseOrder.
# ==============================================================================

from rest_framework import serializers
from .models import Category, Supplier, Product, PurchaseOrder

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'product_count']

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'phone', 'email', 'gst_number', 'address', 'balance', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    image_url = serializers.CharField(max_length=500, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'barcode', 'category', 'category_name', 
            'size', 'color', 'image_url', 'cost_price', 'selling_price', 
            'stock_quantity', 'tax_rate', 'is_active', 'created_at', 'updated_at'
        ]

class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'supplier', 'supplier_name', 'bill_number', 'total_amount', 'paid_amount', 'purchase_date', 'notes']

    def create(self, validated_data):
        purchase = super().create(validated_data)
        due = purchase.total_amount - purchase.paid_amount
        supplier = purchase.supplier
        supplier.balance += due
        supplier.save()
        return purchase
