from rest_framework import serializers

class DashboardMetricsSerializer(serializers.Serializer):
    today_revenue = serializers.FloatField()
    today_orders_count = serializers.IntegerField()
    month_revenue = serializers.FloatField()
    today_returns_amount = serializers.FloatField()
    total_products = serializers.IntegerField()
    total_suppliers = serializers.IntegerField()
