from django.urls import path
from .views import DashboardSummaryView, SupplierLedgerReportView, ZReportView

urlpatterns = [
    path('dashboard/', DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('supplier-ledger/', SupplierLedgerReportView.as_view(), name='supplier_ledger'),
    path('z-report/', ZReportView.as_view(), name='z_report'),
]
