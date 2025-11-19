from rest_framework import routers
from django.urls import path, include
from .views import ServicioViewSet, ServiciosPublicosListView, ServicioPublicoDetailView

router = routers.DefaultRouter()
router.register(r'', ServicioViewSet, basename='servicio')

urlpatterns = [
    path('publicos/', ServiciosPublicosListView.as_view(), name='servicios-publicos'),
    path('publicos/<int:id_servicio>/', ServicioPublicoDetailView.as_view(), name='servicio-publico-detalle'),
]

urlpatterns += router.urls
