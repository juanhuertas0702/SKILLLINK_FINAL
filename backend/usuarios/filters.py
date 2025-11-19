import django_filters
from .models import Usuario


class UsuarioFilter(django_filters.FilterSet):
    email = django_filters.CharFilter(lookup_expr='icontains')
    nombre_completo = django_filters.CharFilter(lookup_expr='icontains')
    tipo_usuario = django_filters.CharFilter(field_name='tipo_usuario', lookup_expr='exact')
    is_active = django_filters.BooleanFilter()
    fecha_registro_desde = django_filters.DateFilter(field_name='fecha_registro', lookup_expr='gte')
    fecha_registro_hasta = django_filters.DateFilter(field_name='fecha_registro', lookup_expr='lte')
    
    class Meta:
        model = Usuario
        fields = ['email', 'nombre_completo', 'tipo_usuario', 'is_active']
