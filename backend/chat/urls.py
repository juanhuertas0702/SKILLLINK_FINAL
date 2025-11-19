from django.urls import path
from .views import EnviarMensajeView, MensajesDeSolicitudView, MarcarLeidosView

urlpatterns = [
    path('enviar/', EnviarMensajeView.as_view(), name='enviar-mensaje'),
    path('<int:solicitud_id>/', MensajesDeSolicitudView.as_view(), name='mensajes-solicitud'),
    path('<int:solicitud_id>/leer/', MarcarLeidosView.as_view(), name='leer-mensajes'),
]
