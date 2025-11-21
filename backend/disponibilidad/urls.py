from django.urls import path
from .views import DisponibilidadListCreate, DisponibilidadPublicoListView

urlpatterns = [
    path('', DisponibilidadListCreate.as_view(), name='disponibilidad'),
    path('publico/', DisponibilidadPublicoListView.as_view(), name='disponibilidad-publico'),
]

