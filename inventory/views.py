import os
import uuid
from django.conf import settings
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Category, Supplier, Product, PurchaseOrder
from .serializers import CategorySerializer, SupplierSerializer, ProductSerializer, PurchaseOrderSerializer
from accounts.permissions import IsAdminUserRole

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminUserRole()]

class SupplierViewSet(viewsets.ModelViewSet):
    """Admin Only: Manage Suppliers & Balances"""
    queryset = Supplier.objects.all().order_by('-created_at')
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated, IsAdminUserRole]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'phone', 'gst_number']

class ProductViewSet(viewsets.ModelViewSet):
    """
    Staff can list and search products for POS billing.
    Admin can perform full CRUD (Create, Update, Delete).
    """
    queryset = Product.objects.filter(is_active=True).order_by('-id')
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'barcode', 'color', 'category__name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'by_barcode']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminUserRole()]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

    @action(detail=False, methods=['get'])
    def by_barcode(self, request):
        barcode = request.query_params.get('code', '').strip()
        if not barcode:
            return Response({'error': 'Barcode code is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Product.objects.get(barcode=barcode, is_active=True)
            return Response(ProductSerializer(product).data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsAdminUserRole])
    def low_stock(self, request):
        threshold = int(request.query_params.get('threshold', 5))
        products = Product.objects.filter(stock_quantity__lte=threshold, is_active=True)
        return Response(ProductSerializer(products, many=True).data)

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser], permission_classes=[IsAuthenticated, IsAdminUserRole])
    def upload_image(self, request):
        file_obj = request.FILES.get('image') or request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure uploads folder exists
        upload_dir = settings.BASE_DIR / 'client' / 'images' / 'uploads'
        os.makedirs(upload_dir, exist_ok=True)
        
        ext = os.path.splitext(file_obj.name)[1].lower()
        if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
            return Response({'error': 'Invalid file format. Only JPG, PNG, and WEBP are supported.'}, status=status.HTTP_400_BAD_REQUEST)
        
        filename = f"prod_{uuid.uuid4().hex[:10]}{ext}"
        filepath = upload_dir / filename
        
        with open(filepath, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)
                
        relative_url = f"/images/uploads/{filename}"
        return Response({'image_url': relative_url}, status=status.HTTP_201_CREATED)

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """Admin Only: Supplier purchase ledger"""
    queryset = PurchaseOrder.objects.all().order_by('-purchase_date')
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated, IsAdminUserRole]
