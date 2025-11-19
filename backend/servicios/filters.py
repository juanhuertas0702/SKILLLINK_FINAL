import django_filters
from .models import Servicio


class ServicioFilter(django_filters.FilterSet):
    titulo = django_filters.CharFilter(lookup_expr='icontains')
    descripcion = django_filters.CharFilter(lookup_expr='icontains')
    precio_min = django_filters.NumberFilter(field_name='precio', lookup_expr='gte')
    precio_max = django_filters.NumberFilter(field_name='precio', lookup_expr='lte')
    ubicacion = django_filters.CharFilter(lookup_expr='icontains')
    activo = django_filters.BooleanFilter()
    trabajador = django_filters.NumberFilter(field_name='trabajador__id_usuario')
    trabajador_nombre = django_filters.CharFilter(field_name='trabajador__usuario__nombre_completo', lookup_expr='icontains')
    fecha_creacion_desde = django_filters.DateFilter(field_name='fecha_creacion', lookup_expr='gte')
    fecha_creacion_hasta = django_filters.DateFilter(field_name='fecha_creacion', lookup_expr='lte')
    
    class Meta:
        model = Servicio
        fields = ['titulo', 'activo', 'trabajador']
