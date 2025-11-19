import django_filters
from .models import Disponibilidad


class DisponibilidadFilter(django_filters.FilterSet):
    trabajador = django_filters.NumberFilter(field_name='trabajador__id_usuario')
    dia_semana = django_filters.ChoiceFilter(choices=Disponibilidad.DIA_SEMANA_CHOICES if hasattr(Disponibilidad, 'DIA_SEMANA_CHOICES') else [])
    fecha_desde = django_filters.DateFilter(field_name='fecha', lookup_expr='gte')
    fecha_hasta = django_filters.DateFilter(field_name='fecha', lookup_expr='lte')
    disponible = django_filters.BooleanFilter()
    
    class Meta:
        model = Disponibilidad
        fields = ['trabajador', 'dia_semana', 'disponible']
