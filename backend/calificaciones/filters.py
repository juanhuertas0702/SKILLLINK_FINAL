import django_filters
from .models import Calificacion


class CalificacionFilter(django_filters.FilterSet):
    evaluador = django_filters.NumberFilter(field_name='evaluador__id_usuario')
    evaluado = django_filters.NumberFilter(field_name='evaluado__id_usuario')
    solicitud = django_filters.NumberFilter(field_name='solicitud__id_solicitud')
    puntuacion_min = django_filters.NumberFilter(field_name='puntuacion', lookup_expr='gte')
    puntuacion_max = django_filters.NumberFilter(field_name='puntuacion', lookup_expr='lte')
    fecha_desde = django_filters.DateFilter(field_name='fecha_calificacion', lookup_expr='gte')
    fecha_hasta = django_filters.DateFilter(field_name='fecha_calificacion', lookup_expr='lte')
    comentario = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = Calificacion
        fields = ['evaluador', 'evaluado', 'solicitud', 'puntuacion_min', 'puntuacion_max']
