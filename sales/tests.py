from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from inventory.models import Category, Product
from sales.models import Invoice, ProductReturn

class POSBillingBackendTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(username='admin', email='admin@test.com', password='password123', role='ADMIN')
        self.staff = User.objects.create_user(username='cashier', email='cashier@test.com', password='password123', role='STAFF')
        
        self.category = Category.objects.create(name='Mens Wear')
        self.product = Product.objects.create(
            name='Cotton Shirt',
            barcode='BC1001',
            category=self.category,
            size='L',
            color='Blue',
            cost_price=500.0,
            selling_price=1000.0,
            stock_quantity=10,
        )

    def test_login_returns_jwt_and_role(self):
        response = self.client.post('/api/auth/login/', {'username': 'cashier', 'password': 'password123'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['role'], 'STAFF')

    def test_checkout_deducts_stock(self):
        # Authenticate cashier
        self.client.force_authenticate(user=self.staff)
        payload = {
            'subtotal': 2000.0,
            'discount': 0.0,
            'tax_amount': 100.0,
            'grand_total': 2100.0,
            'payment_mode': 'CASH',
            'items': [
                {'product_id': self.product.id, 'quantity': 2, 'unit_price': 1000.0}
            ]
        }
        response = self.client.post('/api/sales/invoices/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 8) # 10 - 2 = 8

    def test_insufficient_stock_fails(self):
        self.client.force_authenticate(user=self.staff)
        payload = {
            'subtotal': 20000.0,
            'grand_total': 20000.0,
            'payment_mode': 'UPI',
            'items': [
                {'product_id': self.product.id, 'quantity': 99, 'unit_price': 1000.0}
            ]
        }
        response = self.client.post('/api/sales/invoices/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 10) # unchanged

    def test_return_restores_stock(self):
        self.client.force_authenticate(user=self.admin)
        # Create an invoice first
        inv = Invoice.objects.create(
            cashier=self.staff, subtotal=1000.0, grand_total=1000.0, payment_mode='CASH'
        )
        self.product.stock_quantity = 5
        self.product.save()

        # Return 1 quantity
        return_payload = {
            'invoice_id': inv.id,
            'product_id': self.product.id,
            'quantity': 1,
            'refund_amount': 1000.0,
            'reason': 'Size mismatch'
        }
        response = self.client.post('/api/sales/returns/', return_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 6) # 5 + 1 = 6
