from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServicioViewSet, ServiciosPublicosListView, ServicioPublicoDetailView

# El router maneja las rutas estándar (GET, POST, PUT, DELETE) para usuarios autenticados
router = DefaultRouter()
router.register(r'', ServicioViewSet, basename='servicios')

urlpatterns = [
    # ✅ RUTAS PÚBLICAS (Estas son las que le faltaban a tu Home)
    # Es importante ponerlas ANTES del router.urls para que Django las encuentre primero
    path('publicos/', ServiciosPublicosListView.as_view(), name='servicios-publicos-lista'),
    path('publicos/<int:id_servicio>/', ServicioPublicoDetailView.as_view(), name='servicio-publico-detalle'),

    # Rutas del ViewSet (Mis servicios, crear, editar, borrar)
    path('', include(router.urls)),
]