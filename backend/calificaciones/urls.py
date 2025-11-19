from django.urls import path
from .views import CrearCalificacionView

urlpatterns = [
    path('crear/', CrearCalificacionView.as_view(), name='crear-calificacion'),
]

