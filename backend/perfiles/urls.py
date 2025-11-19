from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CrearPerfilTrabajadorView, 
    MiPerfilTrabajadorView, 
    PerfilTrabajadorViewSet,
    PerfilTrabajadorPublicoView
)

router = DefaultRouter()
router.register(r'', PerfilTrabajadorViewSet, basename='perfil-trabajador')

urlpatterns = [
    path('crear/', CrearPerfilTrabajadorView.as_view(), name='crear-perfil-trabajador'),
    path('mi-perfil/', MiPerfilTrabajadorView.as_view(), name='mi-perfil-trabajador'),
    path('publico/<int:id_trabajador>/', PerfilTrabajadorPublicoView.as_view(), name='perfil-trabajador-publico'),
    path('', include(router.urls)),
]