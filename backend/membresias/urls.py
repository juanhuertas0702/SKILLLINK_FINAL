from django.urls import path
from .views import MiMembresiaView, CambiarPlanMembresiaView

urlpatterns = [
    path('me/', MiMembresiaView.as_view(), name='mi-membresia'),
    path('cambiar-plan/', CambiarPlanMembresiaView.as_view(), name='cambiar-plan-membresia'),
]
