# ==============================================================================
# CONFIG ROOT URL ROUTING
# Textile POS Billing System
# Serves: API endpoints, Django Admin, and Frontend pages with clean routing.
# ==============================================================================

from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.views.static import serve
from django.views.generic import TemplateView, RedirectView

urlpatterns = [
    # Django Admin Panel
    path('admin/', admin.site.urls),

    # REST Framework API Endpoints
    path('api/auth/', include('accounts.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/sales/', include('sales.urls')),
    path('api/reports/', include('reports.urls')),

    # Frontend Clean Routes (No .html in URL!)
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('login/', TemplateView.as_view(template_name='login.html'), name='login'),
    path('billing/', TemplateView.as_view(template_name='billing.html'), name='billing'),
    path('admin-portal/', TemplateView.as_view(template_name='admin.html'), name='admin_portal'),
    path('admin-mobile/', TemplateView.as_view(template_name='mobile-admin.html'), name='admin_mobile'),

    # Graceful redirects for relative or legacy .html URLs (prevents 404 on relative links)
    re_path(r'^(?:.+/)?billing(?:\.html)/?$', RedirectView.as_view(url='/billing/', permanent=False)),
    re_path(r'^(?:.+/)?admin-portal(?:\.html)/?$', RedirectView.as_view(url='/admin-portal/', permanent=False)),
    re_path(r'^(?:.+/)?admin(?:\.html)/?$', RedirectView.as_view(url='/admin-portal/', permanent=False)),
    re_path(r'^(?:.+/)?login(?:\.html)/?$', RedirectView.as_view(url='/login/', permanent=False)),
    re_path(r'^(?:.+/)?admin-mobile(?:\.html)/?$', RedirectView.as_view(url='/admin-mobile/', permanent=False)),

    # Direct static file serving for CSS, JS & Images from client/ folder (supports relative & absolute paths)
    re_path(r'^(?:.+/)?(?P<path>(css|js|images)/.*)$', serve, {'document_root': settings.BASE_DIR / 'client'}),
    re_path(r'^client/(?P<path>.*)$', serve, {'document_root': settings.BASE_DIR / 'client'}),
]
