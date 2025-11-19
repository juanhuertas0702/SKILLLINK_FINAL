import django_filters
from .models import Solicitud


class SolicitudFilter(django_filters.FilterSet):
    cliente = django_filters.NumberFilter(field_name='cliente__id_usuario')
    trabajador = django_filters.NumberFilter(field_name='trabajador__id_usuario')
    servicio = django_filters.NumberFilter(field_name='servicio__id_servicio')
    estado = django_filters.ChoiceFilter(choices=Solicitud.ESTADO_CHOICES if hasattr(Solicitud, 'ESTADO_CHOICES') else [])
    fecha_solicitud_desde = django_filters.DateFilter(field_name='fecha_solicitud', lookup_expr='gte')
    fecha_solicitud_hasta = django_filters.DateFilter(field_name='fecha_solicitud', lookup_expr='lte')
    fecha_servicio_desde = django_filters.DateFilter(field_name='fecha_servicio', lookup_expr='gte')
    fecha_servicio_hasta = django_filters.DateFilter(field_name='fecha_servicio', lookup_expr='lte')
    precio_min = django_filters.NumberFilter(field_name='precio_acordado', lookup_expr='gte')
    precio_max = django_filters.NumberFilter(field_name='precio_acordado', lookup_expr='lte')
    
    class Meta:
        model = Solicitud
        fields = ['cliente', 'trabajador', 'servicio', 'estado']
