from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ServiciosPendientesModeracionView,
    AprobarServicioView,
    RechazarServicioView,
    ModeracionViewSet
)

router = DefaultRouter()
router.register(r'', ModeracionViewSet, basename='moderacion')

urlpatterns = [
    path('pendientes/', ServiciosPendientesModeracionView.as_view(), name='servicios-pendientes'),
    path('<int:id_moderacion>/aprobar/', AprobarServicioView.as_view(), name='aprobar-servicio'),
    path('<int:id_moderacion>/rechazar/', RechazarServicioView.as_view(), name='rechazar-servicio'),
    path('', include(router.urls)),
]
