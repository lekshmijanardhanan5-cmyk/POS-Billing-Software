# ==============================================================================
# SEED DATA MANAGEMENT COMMAND
# Textile POS Billing System
# Populates initial Admin, Cashier, Categories, Suppliers, and Products with images.
# ==============================================================================

from django.core.management.base import BaseCommand
from accounts.models import User
from inventory.models import Category, Supplier, Product
from sales.models import Customer, Invoice, InvoiceItem

class Command(BaseCommand):
    help = 'Seeds initial test data for POS Billing interview review'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding comprehensive retail data...")

        # 1. Create Default Admin User
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@pos.com',
                'first_name': 'Store',
                'last_name': 'Manager',
                'role': 'ADMIN',
                'phone': '+91 9876543210',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('Admin@123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created Admin: admin / Admin@123"))

        # 2. Create Default Staff/Cashier User
        staff_user, created = User.objects.get_or_create(
            username='cashier',
            defaults={
                'email': 'cashier@pos.com',
                'first_name': 'Rahul',
                'last_name': 'Kumar',
                'role': 'STAFF',
                'phone': '+91 9876500001',
                'is_staff': False,
            }
        )
        if created:
            staff_user.set_password('Staff@123')
            staff_user.save()
            self.stdout.write(self.style.SUCCESS("Created Cashier: cashier / Staff@123"))

        # 3. Product Categories
        cat_mens, _ = Category.objects.get_or_create(name="Men's Wear", defaults={'description': 'Shirts, Trousers, Suits'})
        cat_womens, _ = Category.objects.get_or_create(name="Women's Wear", defaults={'description': 'Sarees, Kurtis, Tops'})
        cat_kids, _ = Category.objects.get_or_create(name="Kids Wear", defaults={'description': 'Boys & Girls clothing'})
        cat_fabrics, _ = Category.objects.get_or_create(name="Fabrics & Materials", defaults={'description': 'Pure Cotton & Silk dress materials'})

        # 4. Wholesale Suppliers
        sup1, _ = Supplier.objects.get_or_create(
            name="Raymond Mills Distribution",
            defaults={'phone': '9845012345', 'email': 'sales@raymond.in', 'gst_number': '32AABCR1234F1Z5', 'balance': 25000.0}
        )
        sup2, _ = Supplier.objects.get_or_create(
            name="Surat Textile Wholesale Hub",
            defaults={'phone': '9845067890', 'email': 'order@surattextile.in', 'gst_number': '24AABCS5678G1Z2', 'balance': 12500.0}
        )

        # 5. Products with Real Textile Images
        products_data = [
            {
                'name': 'Classic Formal Cotton Shirt',
                'barcode': '8901001',
                'category': cat_mens,
                'size': 'L',
                'color': 'Sky Blue',
                'image_url': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80',
                'cost_price': 650.00,
                'selling_price': 1299.00,
                'stock_quantity': 45
            },
            {
                'name': 'Slim Fit Chinos Trouser',
                'barcode': '8901002',
                'category': cat_mens,
                'size': 'XL',
                'color': 'Beige Khaki',
                'image_url': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80',
                'cost_price': 750.00,
                'selling_price': 1599.00,
                'stock_quantity': 30
            },
            {
                'name': 'Kanchipuram Silk Bridal Saree',
                'barcode': '8901003',
                'category': cat_womens,
                'size': 'FREE',
                'color': 'Deep Maroon',
                'image_url': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
                'cost_price': 2800.00,
                'selling_price': 5499.00,
                'stock_quantity': 15
            },
            {
                'name': 'Embroidered Anarkali Kurti',
                'barcode': '8901004',
                'category': cat_womens,
                'size': 'M',
                'color': 'Mustard Yellow',
                'image_url': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
                'cost_price': 450.00,
                'selling_price': 999.00,
                'stock_quantity': 28
            },
            {
                'name': 'Boys Washed Denim Jacket',
                'barcode': '8901005',
                'category': cat_kids,
                'size': 'S',
                'color': 'Ocean Indigo',
                'image_url': 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80',
                'cost_price': 500.00,
                'selling_price': 1149.00,
                'stock_quantity': 20
            },
            {
                'name': 'Casual Linen Striped Shirt',
                'barcode': '8901006',
                'category': cat_mens,
                'size': 'M',
                'color': 'White Navy',
                'image_url': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
                'cost_price': 700.00,
                'selling_price': 1399.00,
                'stock_quantity': 4  # Low stock test case
            },
        ]

        products = []
        for p in products_data:
            prod, _ = Product.objects.update_or_create(barcode=p['barcode'], defaults=p)
            products.append(prod)

        # 6. Sample Completed Invoice for Reporting
        cust, _ = Customer.objects.get_or_create(phone='9895112233', defaults={'name': 'Vipin Das', 'email': 'vipin@example.com'})

        if not Invoice.objects.filter(customer=cust).exists():
            inv = Invoice.objects.create(
                cashier=staff_user,
                customer=cust,
                subtotal=2698.00,
                discount=100.00,
                tax_amount=129.90,
                grand_total=2727.90,
                payment_mode='UPI',
                status='COMPLETED'
            )
            InvoiceItem.objects.create(invoice=inv, product=products[0], quantity=1, unit_price=1299.00, total_price=1299.00)
            InvoiceItem.objects.create(invoice=inv, product=products[5], quantity=1, unit_price=1399.00, total_price=1399.00)
            self.stdout.write(self.style.SUCCESS("Created sample completed invoice."))

        self.stdout.write(self.style.SUCCESS("Data seeding with product images completed successfully!"))
