from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from inventory.models import Category, Product, Supplier

class InventoryAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(username='inv_admin', email='a@t.com', password='pwd', role='ADMIN')
        self.staff = User.objects.create_user(username='inv_staff', email='s@t.com', password='pwd', role='STAFF')
        self.cat = Category.objects.create(name='Fabrics')
        self.prod = Product.objects.create(
            name='Pure Silk', barcode='SKU999', category=self.cat,
            size='FREE', cost_price=1000, selling_price=2000, stock_quantity=10
        )

    def test_barcode_lookup(self):
        self.client.force_authenticate(user=self.staff)
        res = self.client.get('/api/inventory/products/by_barcode/?code=SKU999')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['name'], 'Pure Silk')

    def test_admin_can_create_product(self):
        self.client.force_authenticate(user=self.admin)
        data = {
            'name': 'Cotton Dhoti',
            'barcode': 'SKU888',
            'category': self.cat.id,
            'size': 'FREE',
            'cost_price': '250.00',
            'selling_price': '500.00',
            'stock_quantity': 50,
            'tax_rate': '5.00'
        }
        res = self.client.post('/api/inventory/products/', data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
