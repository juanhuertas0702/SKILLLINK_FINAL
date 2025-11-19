from rest_framework import generics, permissions, serializers
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q

from .models import Mensaje
from .serializers import MensajeSerializer
from .filters import MensajeFilter
from solicitudes.models import Solicitud
from usuarios.models import Usuario


class EnviarMensajeView(generics.CreateAPIView):
    serializer_class = MensajeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        solicitud = serializer.validated_data["solicitud"]

        # Validar que el usuario sea cliente o trabajador de esta solicitud
        # CORREGIDO: trabajador.usuario para comparar con Usuario
        if solicitud.cliente != self.request.user and solicitud.trabajador.usuario != self.request.user:
            raise serializers.ValidationError("No perteneces a esta solicitud.")

        serializer.save(
            remitente=self.request.user,
            leido=False
        )


class MensajesDeSolicitudView(generics.ListAPIView):
    serializer_class = MensajeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        solicitud_id = self.kwargs["solicitud_id"]
        solicitud = Solicitud.objects.get(pk=solicitud_id)

        # CORREGIDO: trabajador.usuario para comparar con Usuario
        if solicitud.cliente != self.request.user and solicitud.trabajador.usuario != self.request.user:
            raise serializers.ValidationError("No puedes ver este chat.")

        return Mensaje.objects.filter(solicitud=solicitud).order_by("fecha_envio")


class MarcarLeidosView(generics.UpdateAPIView):
    serializer_class = MensajeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        solicitud_id = self.kwargs["solicitud_id"]
        solicitud = Solicitud.objects.get(pk=solicitud_id)

        # CORREGIDO: trabajador.usuario para comparar con Usuario
        if solicitud.cliente != request.user and solicitud.trabajador.usuario != request.user:
            return Response({"error": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)

        mensajes = Mensaje.objects.filter(
            solicitud=solicitud
        ).exclude(remitente=request.user)

        mensajes.update(leido=True)

        return Response({"mensajes_leidos": mensajes.count()})


class MensajeViewSet(ModelViewSet):
    serializer_class = MensajeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = MensajeFilter
    ordering_fields = ['fecha_envio']
    search_fields = ['contenido']

    def get_queryset(self):
        usuario = self.request.user
        # CORREGIDO: trabajador.usuario para comparar con Usuario
        return Mensaje.objects.filter(
            Q(remitente=usuario) | Q(solicitud__cliente=usuario) | Q(solicitud__trabajador__usuario=usuario)
        ).distinct()

