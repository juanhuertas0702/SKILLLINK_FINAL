import django_filters
from .models import Moderacion


class ModeracionFilter(django_filters.FilterSet):
    estado = django_filters.ChoiceFilter(choices=Moderacion.ESTADOS)
    servicio = django_filters.NumberFilter(field_name='servicio__id_servicio')
    admin = django_filters.NumberFilter(field_name='admin__id_usuario')
    fecha_desde = django_filters.DateFilter(field_name='fecha', lookup_expr='gte')
    fecha_hasta = django_filters.DateFilter(field_name='fecha', lookup_expr='lte')
    
    class Meta:
        model = Moderacion
        fields = ['estado', 'servicio', 'admin']
