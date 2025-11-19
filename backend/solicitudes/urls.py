from django.urls import path
from .views import (
    CrearSolicitudView,
    MisSolicitudesClienteView,
    SolicitudesTrabajadorView,
    CambiarEstadoSolicitudView
)

urlpatterns = [
    path('crear/', CrearSolicitudView.as_view(), name='crear-solicitud'),
    path('mis/', MisSolicitudesClienteView.as_view(), name='mis-solicitudes-cliente'),
    path('trabajador/', SolicitudesTrabajadorView.as_view(), name='solicitudes-trabajador'),
    path('<int:id_solicitud>/cambiar-estado/', CambiarEstadoSolicitudView.as_view(), name='cambiar-estado-solicitud'),
]
