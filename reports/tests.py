from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User

class ReportsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(username='rep_admin', email='r@t.com', password='pwd', role='ADMIN')
        self.staff = User.objects.create_user(username='rep_staff', email='rs@t.com', password='pwd', role='STAFF')

    def test_dashboard_access_by_admin(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/reports/dashboard/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('today_revenue', res.data)

    def test_dashboard_forbidden_for_staff(self):
        self.client.force_authenticate(user=self.staff)
        res = self.client.get('/api/reports/dashboard/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
