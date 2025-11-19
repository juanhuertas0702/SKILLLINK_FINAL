import django_filters
from .models import Mensaje


class MensajeFilter(django_filters.FilterSet):
    solicitud = django_filters.NumberFilter(field_name='solicitud__id_solicitud')
    remitente = django_filters.NumberFilter(field_name='remitente__id_usuario')
    fecha_desde = django_filters.DateTimeFilter(field_name='fecha_envio', lookup_expr='gte')
    fecha_hasta = django_filters.DateTimeFilter(field_name='fecha_envio', lookup_expr='lte')
    leido = django_filters.BooleanFilter()
    contenido = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = Mensaje
        fields = ['solicitud', 'remitente', 'leido']
