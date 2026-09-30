# ==============================================================================
# REPORTS & DASHBOARD APPLICATION - VIEWS
# Textile POS Billing System
# Contains: KPI metrics aggregation, low-stock scanning, and supplier ledger.
# ==============================================================================

from django.utils import timezone
from django.db.models import Sum, Count, F, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsAdminUserRole
from sales.models import Invoice, InvoiceItem, ProductReturn
from inventory.models import Product, Supplier, PurchaseOrder

class DashboardSummaryView(APIView):
    """
    Returns aggregated KPI metrics for the Admin Dashboard and Mobile Admin view:
    - Today's revenue and sales order count
    - Monthly revenue
    - Payment mode breakdown (Cash, UPI, Card)
    - Low-stock inventory alerts (< 10 units)
    - Top 5 selling textile products
    """
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        now = timezone.now()
        today = now.date()
        first_day_of_month = today.replace(day=1)

        # 1. Sales and Revenue Aggregations
        all_invoices = Invoice.objects.filter(status__in=['COMPLETED', 'RETURNED'])
        total_revenue = all_invoices.aggregate(total=Sum('grand_total'))['total'] or 0
        total_invoices_count = all_invoices.count()

        today_invoices = Invoice.objects.filter(created_at__date=today, status__in=['COMPLETED', 'RETURNED'])
        today_revenue = today_invoices.aggregate(total=Sum('grand_total'))['total'] or 0
        today_orders_count = today_invoices.count()

        month_invoices = Invoice.objects.filter(created_at__date__gte=first_day_of_month, status__in=['COMPLETED', 'RETURNED'])
        month_revenue = month_invoices.aggregate(total=Sum('grand_total'))['total'] or 0

        # Returns Value
        today_returns_amount = ProductReturn.objects.filter(created_at__date=today).aggregate(total=Sum('refund_amount'))['total'] or 0

        # 2. Payment Method Split
        payment_modes = list(
            today_invoices.values('payment_mode')
            .annotate(total=Sum('grand_total'), count=Count('id'))
            .order_by('-total')
        )

        # 3. Low Stock Alert (< 10 items remaining)
        low_stock_products = list(
            Product.objects.filter(stock_quantity__lte=10, is_active=True)
            .values('id', 'name', 'barcode', 'size', 'color', 'stock_quantity')
            [:10]
        )

        # 4. Top 5 Best Selling Products
        top_selling = list(
            InvoiceItem.objects.filter(invoice__status__in=['COMPLETED', 'RETURNED'])
            .values(product_name=F('product__name'), product_code=F('product__barcode'))
            .annotate(total_sold=Sum('quantity'), total_amount=Sum('total_price'))
            .order_by('-total_sold')[:5]
        )

        # 5. Inventory and Supplier Totals
        total_products_count = Product.objects.filter(is_active=True).count()
        total_suppliers_count = Supplier.objects.count()

        return Response({
            "today_revenue": float(today_revenue),
            "today_orders_count": today_orders_count,
            "month_revenue": float(month_revenue),
            "total_revenue": float(total_revenue),
            "total_invoices_count": total_invoices_count,
            "today_returns_amount": float(today_returns_amount),
            "total_products": total_products_count,
            "total_suppliers": total_suppliers_count,
            "payment_modes": payment_modes,
            "low_stock_products": low_stock_products,
            "top_selling": top_selling,
        })

class SupplierLedgerReportView(APIView):
    """
    Returns balance sheet and accounts payable ledger across all suppliers.
    """
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        suppliers = Supplier.objects.annotate(
            total_purchases=Sum('purchases__total_amount'),
            total_paid=Sum('purchases__paid_amount')
        ).values('id', 'name', 'phone', 'gst_number', 'balance', 'total_purchases', 'total_paid')

        return Response(list(suppliers))

class ZReportView(APIView):
    """
    Day-End Cashier Z-Report (Shift Closure & Cash Drawer Reconciliation)
    Calculates today's cash drawer balance, payment split, tax breakdown, and discounts.
    Accessible to both Cashier and Admin.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        today_invoices = Invoice.objects.filter(created_at__date=today, status__in=['COMPLETED', 'RETURNED'])
        
        cash_sales = today_invoices.filter(payment_mode='CASH').aggregate(s=Sum('grand_total'))['s'] or 0
        upi_sales = today_invoices.filter(payment_mode='UPI').aggregate(s=Sum('grand_total'))['s'] or 0
        card_sales = today_invoices.filter(payment_mode='CARD').aggregate(s=Sum('grand_total'))['s'] or 0
        split_sales = today_invoices.filter(payment_mode='SPLIT').aggregate(s=Sum('grand_total'))['s'] or 0
        
        gross_sales = today_invoices.aggregate(s=Sum('subtotal'))['s'] or 0
        total_discount = today_invoices.aggregate(s=Sum('discount'))['s'] or 0
        total_tax = today_invoices.aggregate(s=Sum('tax_amount'))['s'] or 0
        grand_total = today_invoices.aggregate(s=Sum('grand_total'))['s'] or 0
        total_bills = today_invoices.count()

        returns = ProductReturn.objects.filter(created_at__date=today)
        returns_refund = returns.aggregate(s=Sum('refund_amount'))['s'] or 0
        returns_count = returns.count()

        net_cash_in_drawer = float(cash_sales) - float(returns_refund)

        return Response({
            "report_date": str(today),
            "generated_at": timezone.now().isoformat(),
            "cashier": request.user.username,
            "total_bills": total_bills,
            "gross_sales": float(gross_sales),
            "total_discount": float(total_discount),
            "total_tax": float(total_tax),
            "grand_total": float(grand_total),
            "payment_breakdown": {
                "cash": float(cash_sales),
                "upi": float(upi_sales),
                "card": float(card_sales),
                "split": float(split_sales),
            },
            "returns_count": returns_count,
            "returns_refund": float(returns_refund),
            "net_cash_in_drawer": max(0.0, net_cash_in_drawer),
        })
