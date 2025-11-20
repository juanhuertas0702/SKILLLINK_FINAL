from rest_framework import generics, permissions, viewsets, serializers
from .models import Calificacion
from .serializers import CalificacionSerializer
from .filters import CalificacionFilter
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import models

class CrearCalificacionView(generics.CreateAPIView):
    serializer_class = CalificacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        solicitud = serializer.validated_data["solicitud"]

        # Validar que el cliente sea el dueño de la solicitud
        if solicitud.cliente != self.request.user:
            raise serializers.ValidationError("No puedes calificar una solicitud que no es tuya.")

        # Solo se puede calificar si está finalizada
        if solicitud.estado != "finalizada":
            raise serializers.ValidationError("Solo puedes calificar solicitudes finalizadas.")

        # Validar que no exista ya una calificación para esta solicitud
        if hasattr(solicitud, 'calificacion'):
            raise serializers.ValidationError("Esta solicitud ya ha sido calificada.")

        # Guardar con los campos correctos
        serializer.save(
            cliente=solicitud.cliente,
            trabajador=solicitud.trabajador
        )


class CalificacionViewSet(viewsets.ModelViewSet):
    queryset = Calificacion.objects.all()
    serializer_class = CalificacionSerializer
    filterset_class = CalificacionFilter
    ordering_fields = ['fecha', 'puntaje']
    search_fields = ['comentario']

@receiver(post_save, sender=Calificacion)
def actualizar_promedio_calificacion(sender, instance, created, **kwargs):
    if created:
        solicitud = instance.solicitud
        calificaciones = Calificacion.objects.filter(solicitud=solicitud)
        promedio = calificaciones.aggregate(promedio=models.Avg('puntaje'))['promedio']
        solicitud.promedio_calificacion = promedio
        solicitud.save()

