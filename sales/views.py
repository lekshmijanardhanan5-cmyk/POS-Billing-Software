# ==============================================================================
# SALES APPLICATION - VIEWS & BUSINESS LOGIC
# Textile POS Billing System
# Contains: Atomic checkout, inventory deduction, and stock replenishment logic.
# ==============================================================================

from django.db import transaction
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Customer, Invoice, InvoiceItem, ProductReturn
from .serializers import CustomerSerializer, InvoiceSerializer, ProductReturnSerializer
from inventory.models import Product
from accounts.permissions import IsAdminUserRole

class CustomerViewSet(viewsets.ModelViewSet):
    """
    API ViewSet for managing retail customer records.
    Accessible to authenticated staff members.
    """
    queryset = Customer.objects.all().order_by('-created_at')
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'phone']

    @action(detail=False, methods=['get'])
    def lookup(self, request):
        phone = request.query_params.get('phone', '').strip()
        if not phone:
            return Response({'error': 'Phone number required'}, status=status.HTTP_400_BAD_REQUEST)
        customer = Customer.objects.filter(phone=phone).first()
        if customer:
            return Response(CustomerSerializer(customer).data)
        return Response({'found': False, 'message': 'New customer'})

    @action(detail=True, methods=['get'])
    def invoices(self, request, pk=None):
        customer = self.get_object()
        invoices = customer.invoices.prefetch_related('items__product').order_by('-created_at')
        return Response(InvoiceSerializer(invoices, many=True).data)

class InvoiceViewSet(viewsets.ModelViewSet):
    """
    API ViewSet for handling Sales Invoices.
    The create action implements an atomic transaction to validate stock,
    decrement inventory levels, and generate line items reliably.
    """
    queryset = Invoice.objects.all().prefetch_related('items__product').order_by('-created_at')
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['invoice_number', 'customer__name', 'customer__phone']

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Atomic Checkout Logic:
        1. Validate cart items.
        2. Resolve or create customer (by phone).
        3. Lock product rows with select_for_update to prevent race conditions.
        4. Validate that sufficient stock is available.
        5. Deduct stock and commit invoice.
        6. Award and balance loyalty points.
        """
        data = request.data
        items_data = data.get('items', [])

        if not items_data or len(items_data) == 0:
            return Response({'error': 'Cart is empty. Please add products.'}, status=status.HTTP_400_BAD_REQUEST)

        # Step A: Associate or create customer record
        customer = None
        cust_phone = data.get('customer_phone', '').strip()
        cust_name = data.get('customer_name', '').strip()
        if cust_phone:
            customer, _ = Customer.objects.get_or_create(
                phone=cust_phone,
                defaults={'name': cust_name or 'Walk-in Customer'}
            )
            if cust_name and customer.name != cust_name:
                customer.name = cust_name
                customer.save()

        # Step B: Create Master Invoice Header
        invoice = Invoice.objects.create(
            cashier=request.user,
            customer=customer,
            subtotal=data.get('subtotal', 0),
            discount=data.get('discount', 0),
            promo_code=data.get('promo_code', None),
            tax_amount=data.get('tax_amount', 0),
            grand_total=data.get('grand_total', 0),
            payment_mode=data.get('payment_mode', 'CASH'),
            notes=data.get('notes', '')
        )

        # Step C: Iterate through items, lock stock, deduct inventory
        for item in items_data:
            product_id = item.get('product_id')
            qty = int(item.get('quantity', 1))
            unit_price = item.get('unit_price')

            try:
                # Row-level database lock
                product = Product.objects.select_for_update().get(id=product_id, is_active=True)
            except Product.DoesNotExist:
                transaction.set_rollback(True)
                return Response({'error': f'Product ID {product_id} not found.'}, status=status.HTTP_400_BAD_REQUEST)

            # Stock check
            if product.stock_quantity < qty:
                transaction.set_rollback(True)
                return Response(
                    {'error': f'Insufficient stock for "{product.name}". Available: {product.stock_quantity}, Requested: {qty}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Deduct stock
            product.stock_quantity -= qty
            product.save()

            # Record line item
            InvoiceItem.objects.create(
                invoice=invoice,
                product=product,
                quantity=qty,
                unit_price=unit_price,
                total_price=float(unit_price) * qty
            )

        # Step D: Process Loyalty Points
        loyalty_earned = 0
        loyalty_balance = 0
        if customer:
            points_redeemed = int(data.get('points_redeemed', 0) or 0)
            if points_redeemed > 0:
                customer.loyalty_points = max(0, customer.loyalty_points - points_redeemed)
            loyalty_earned = int(float(invoice.grand_total) // 100)
            customer.loyalty_points += loyalty_earned
            customer.save()
            loyalty_balance = customer.loyalty_points

        resp_data = self.get_serializer(invoice).data
        resp_data['loyalty_earned'] = loyalty_earned
        resp_data['loyalty_balance'] = loyalty_balance
        return Response(resp_data, status=status.HTTP_201_CREATED)

class ProductReturnViewSet(viewsets.ModelViewSet):
    """
    API ViewSet for handling Product Returns.
    Restores product inventory count automatically upon return.
    """
    queryset = ProductReturn.objects.all().order_by('-created_at')
    serializer_class = ProductReturnSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Return Logic:
        1. Find original invoice and product.
        2. Atomically replenish product.stock_quantity += quantity.
        3. Save return log and update invoice status.
        """
        data = request.data
        invoice_id = data.get('invoice_id')
        product_id = data.get('product_id')
        qty = int(data.get('quantity', 1))
        refund_amount = data.get('refund_amount')
        reason = data.get('reason', '')

        try:
            invoice = Invoice.objects.get(id=invoice_id)
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            product = Product.objects.select_for_update().get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Replenish stock
        product.stock_quantity += qty
        product.save()

        # Update invoice status flag
        invoice.status = 'RETURNED'
        invoice.save()

        # Create return entry
        ret = ProductReturn.objects.create(
            invoice=invoice,
            product=product,
            quantity=qty,
            refund_amount=refund_amount,
            reason=reason
        )

        return Response(ProductReturnSerializer(ret).data, status=status.HTTP_201_CREATED)
