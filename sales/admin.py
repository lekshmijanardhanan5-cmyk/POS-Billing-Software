from django.contrib import admin
from .models import Customer, Invoice, InvoiceItem, ProductReturn

class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 0

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'phone', 'email', 'created_at')
    search_fields = ('name', 'phone')

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'cashier', 'customer', 'grand_total', 'payment_mode', 'status', 'created_at')
    list_filter = ('payment_mode', 'status', 'created_at')
    search_fields = ('invoice_number', 'customer__name', 'customer__phone')
    inlines = [InvoiceItemInline]

@admin.register(ProductReturn)
class ProductReturnAdmin(admin.ModelAdmin):
    list_display = ('id', 'invoice', 'product', 'quantity', 'refund_amount', 'created_at')
    list_filter = ('created_at',)
