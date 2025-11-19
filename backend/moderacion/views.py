from django.shortcuts import render
from rest_framework import viewsets, permissions, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import Moderacion
from .serializers import ModeracionSerializer
from servicios.models import Servicio


class ServiciosPendientesModeracionView(generics.ListAPIView):
    """
    Lista de servicios pendientes de moderación (SOLO ADMIN).
    """
    serializer_class = ModeracionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.rol_base != "admin":
            raise ValidationError("Solo administradores pueden acceder.")
        
        return Moderacion.objects.filter(estado="pendiente").select_related(
            "servicio", "servicio__trabajador__usuario", "admin"
        ).order_by("-fecha")


class AprobarServicioView(APIView):
    """
    Aprobar un servicio (SOLO ADMIN).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id_moderacion):
        if request.user.rol_base != "admin":
            return Response(
                {"error": "Solo administradores pueden aprobar servicios."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            moderacion = Moderacion.objects.get(id_moderacion=id_moderacion)
        except Moderacion.DoesNotExist:
            return Response(
                {"error": "Moderación no encontrada."},
                status=status.HTTP_404_NOT_FOUND
            )

        if moderacion.estado != "pendiente":
            return Response(
                {"error": f"Este servicio ya fue {moderacion.estado}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        moderacion.estado = "aprobado"
        moderacion.admin = request.user
        moderacion.save()

        servicio = moderacion.servicio
        servicio.estado_publicacion = "aprobado"
        servicio.save()

        return Response({
            "mensaje": f"Servicio '{servicio.titulo}' aprobado.",
            "moderacion": ModeracionSerializer(moderacion).data
        })


class RechazarServicioView(APIView):
    """
    Rechazar un servicio (SOLO ADMIN).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id_moderacion):
        if request.user.rol_base != "admin":
            return Response(
                {"error": "Solo administradores pueden rechazar servicios."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            moderacion = Moderacion.objects.get(id_moderacion=id_moderacion)
        except Moderacion.DoesNotExist:
            return Response(
                {"error": "Moderación no encontrada."},
                status=status.HTTP_404_NOT_FOUND
            )

        if moderacion.estado != "pendiente":
            return Response(
                {"error": f"Este servicio ya fue {moderacion.estado}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        moderacion.estado = "rechazado"
        moderacion.admin = request.user
        moderacion.save()

        servicio = moderacion.servicio
        servicio.estado_publicacion = "rechazado"
        servicio.save()

        return Response({
            "mensaje": f"Servicio '{servicio.titulo}' rechazado.",
            "moderacion": ModeracionSerializer(moderacion).data
        })


class ModeracionViewSet(viewsets.ModelViewSet):
    """
    Historial de moderaciones (SOLO ADMIN).
    """
    serializer_class = ModeracionSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering_fields = ['fecha', 'estado']
    search_fields = ['servicio__titulo', 'palabras_detectadas']

    def get_queryset(self):
        if self.request.user.rol_base != "admin":
            return Moderacion.objects.none()
        
        return Moderacion.objects.all().select_related(
            "servicio", "servicio__trabajador__usuario", "admin"
        )
