import django_filters
from .models import Membresia


class MembresiaFilter(django_filters.FilterSet):
    nombre = django_filters.CharFilter(lookup_expr='icontains')
    precio_min = django_filters.NumberFilter(field_name='precio_mensual', lookup_expr='gte')
    precio_max = django_filters.NumberFilter(field_name='precio_mensual', lookup_expr='lte')
    activa = django_filters.BooleanFilter()
    
    class Meta:
        model = Membresia
        fields = ['nombre', 'activa']
