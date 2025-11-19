from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import Solicitud
from .serializers import SolicitudSerializer
from servicios.models import Servicio
from disponibilidad.models import Disponibilidad


class CrearSolicitudView(generics.CreateAPIView):
    serializer_class = SolicitudSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        cliente = self.request.user
        servicio = serializer.validated_data["servicio"]
        dia = serializer.validated_data.get("dia")
        hora_inicio = serializer.validated_data.get("hora_inicio")
        hora_fin = serializer.validated_data.get("hora_fin")

        # 1) No puedes solicitar tu propio servicio
        trabajador_usuario = servicio.trabajador.usuario
        if trabajador_usuario == cliente:
            raise ValidationError("No puedes solicitar tu propio servicio.")

        # 2) Solo servicios APROBADOS se pueden contratar
        if servicio.estado_publicacion != "aprobado":
            raise ValidationError("Solo puedes solicitar servicios que estén aprobados.")

        # 3) Validar disponibilidad
        existe_dispo = Disponibilidad.objects.filter(
            trabajador=servicio.trabajador,
            dia=dia,
            hora_inicio__lte=hora_inicio,
            hora_fin__gte=hora_fin,
        ).exists()

        if not existe_dispo:
            raise ValidationError("El trabajador no está disponible en el horario seleccionado.")

        # 4) Crear la solicitud - CORREGIDO: usar servicio.trabajador (PerfilTrabajador)
        serializer.save(
            cliente=cliente,
            trabajador=servicio.trabajador,  # ✅ Ya es PerfilTrabajador
            estado="pendiente"
        )


class MisSolicitudesClienteView(generics.ListAPIView):
    """
    Lista de solicitudes creadas por el cliente actual.
    """
    serializer_class = SolicitudSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Solicitud.objects.filter(cliente=self.request.user).select_related("servicio", "trabajador")


class SolicitudesTrabajadorView(generics.ListAPIView):
    """
    Lista de solicitudes donde el usuario actual es el trabajador.
    """
    serializer_class = SolicitudSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # CORREGIDO: trabajador.usuario es el Usuario
        return Solicitud.objects.filter(trabajador__usuario=self.request.user).select_related("servicio", "cliente")


class CambiarEstadoSolicitudView(generics.UpdateAPIView):
    """
    Permite SOLO al trabajador cambiar el estado de la solicitud.
    Estados: pendiente → aceptada/rechazada → completada
    """
    serializer_class = SolicitudSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Solicitud.objects.all()
    lookup_field = "id_solicitud"

    def update(self, request, *args, **kwargs):
        solicitud = self.get_object()
        nuevo_estado = request.data.get("estado")

        # Solo el trabajador dueño puede cambiar el estado
        if solicitud.trabajador.usuario != request.user:
            return Response({"error": "No autorizado. Solo el trabajador puede cambiar el estado."}, status=status.HTTP_403_FORBIDDEN)

        # Validar transiciones de estado
        if solicitud.estado == "pendiente" and nuevo_estado not in ["aceptada", "rechazada"]:
            return Response({"error": "Una solicitud pendiente solo puede ser aceptada o rechazada"}, status=status.HTTP_400_BAD_REQUEST)
        
        if solicitud.estado == "aceptada" and nuevo_estado != "completada":
            return Response({"error": "Una solicitud aceptada solo puede marcarse como completada"}, status=status.HTTP_400_BAD_REQUEST)
        
        if solicitud.estado in ["rechazada", "completada", "cancelada"]:
            return Response({"error": "No puedes cambiar el estado de una solicitud finalizada"}, status=status.HTTP_400_BAD_REQUEST)

        solicitud.estado = nuevo_estado
        solicitud.save()

        return Response(SolicitudSerializer(solicitud).data)


