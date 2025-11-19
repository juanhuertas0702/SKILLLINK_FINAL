from django.urls import path
from .views import DisponibilidadListCreate

urlpatterns = [
    path('', DisponibilidadListCreate.as_view(), name='disponibilidad'),
]

