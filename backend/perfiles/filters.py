import django_filters
from .models import PerfilTrabajador


class PerfilTrabajadorFilter(django_filters.FilterSet):
    ubicacion = django_filters.CharFilter(lookup_expr='icontains')
    descripcion = django_filters.CharFilter(lookup_expr='icontains')
    anos_experiencia_min = django_filters.NumberFilter(field_name='anos_experiencia', lookup_expr='gte')
    anos_experiencia_max = django_filters.NumberFilter(field_name='anos_experiencia', lookup_expr='lte')
    calificacion_promedio_min = django_filters.NumberFilter(field_name='calificacion_promedio', lookup_expr='gte')
    tarifa_hora_min = django_filters.NumberFilter(field_name='tarifa_hora', lookup_expr='gte')
    tarifa_hora_max = django_filters.NumberFilter(field_name='tarifa_hora', lookup_expr='lte')
    disponible = django_filters.BooleanFilter()
    verificado = django_filters.BooleanFilter()
    
    class Meta:
        model = PerfilTrabajador
        fields = ['ubicacion', 'disponible', 'verificado']
