from rest_framework import serializers
from .models import Customer, Invoice, InvoiceItem, ProductReturn
from inventory.serializers import ProductSerializer

from django.db.models import Sum

class CustomerSerializer(serializers.ModelSerializer):
    total_orders = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = ['id', 'name', 'phone', 'email', 'loyalty_points', 'total_orders', 'total_spent', 'created_at']

    def get_total_orders(self, obj):
        return obj.invoices.count()

    def get_total_spent(self, obj):
        val = obj.invoices.aggregate(total=Sum('grand_total'))['total']
        return float(val) if val else 0.0

class InvoiceItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_barcode = serializers.CharField(source='product.barcode', read_only=True)
    product_size = serializers.CharField(source='product.size', read_only=True)

    class Meta:
        model = InvoiceItem
        fields = ['id', 'product', 'product_name', 'product_barcode', 'product_size', 'quantity', 'unit_price', 'total_price']

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    cashier_name = serializers.CharField(source='cashier.username', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'cashier', 'cashier_name',
            'customer', 'customer_name', 'customer_phone',
            'subtotal', 'discount', 'promo_code', 'tax_amount', 'grand_total',
            'payment_mode', 'status', 'notes', 'created_at', 'items'
        ]
        read_only_fields = ['id', 'invoice_number', 'created_at']

class ProductReturnSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)

    class Meta:
        model = ProductReturn
        fields = ['id', 'invoice', 'invoice_number', 'product', 'product_name', 'quantity', 'refund_amount', 'reason', 'created_at']
