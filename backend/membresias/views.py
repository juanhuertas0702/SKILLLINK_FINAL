from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework import viewsets
from .filters import MembresiaFilter

from .models import Membresia
from .serializers import MembresiaSerializer
from perfiles.models import PerfilTrabajador
from rest_framework.exceptions import ValidationError

class MiMembresiaView(generics.RetrieveAPIView):
    """
    Devuelve la membresía del trabajador actual.
    Si no tiene, la crea como FREE por defecto.
    """
    serializer_class = MembresiaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Verificar que el usuario tenga perfil trabajador
        perfil = PerfilTrabajador.objects.filter(usuario=self.request.user).first()
        if not perfil:
            raise ValidationError("No tienes perfil de trabajador.")

        membresia, created = Membresia.objects.get_or_create(
            trabajador=perfil,
            defaults={
                "plan": "free",
                "fecha_inicio": timezone.now(),
                "estado": "activo",
            }
        )
        return membresia


class CambiarPlanMembresiaView(APIView):
    """
    SOLO ADMIN puede cambiar el plan de membresía de un trabajador.
    POST /api/membresias/cambiar-plan/
    Body: { "trabajador_id": 1, "nuevo_plan": "premium" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Validar que sea admin
        if request.user.rol_base != "admin":
            return Response(
                {"error": "Solo administradores pueden cambiar planes de membresía."},
                status=status.HTTP_403_FORBIDDEN
            )

        trabajador_id = request.data.get("trabajador_id")
        nuevo_plan = request.data.get("nuevo_plan")

        if not trabajador_id or not nuevo_plan:
            return Response(
                {"error": "Debes enviar trabajador_id y nuevo_plan."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if nuevo_plan not in ["free", "premium"]:
            return Response(
                {"error": "Plan inválido. Usa 'free' o 'premium'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Buscar el perfil trabajador
        perfil = PerfilTrabajador.objects.filter(id_trabajador=trabajador_id).first()
        if not perfil:
            return Response(
                {"error": "Trabajador no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Obtener o crear membresía
        membresia, created = Membresia.objects.get_or_create(
            trabajador=perfil,
            defaults={
                "plan": nuevo_plan,
                "fecha_inicio": timezone.now(),
                "estado": "activo",
            }
        )

        # Actualizar plan
        membresia.plan = nuevo_plan
        membresia.fecha_inicio = timezone.now()
        membresia.estado = "activo"
        membresia.save()

        serializer = MembresiaSerializer(membresia)
        return Response({
            "mensaje": f"Plan cambiado a {nuevo_plan} exitosamente.",
            "membresia": serializer.data
        }, status=status.HTTP_200_OK)


class MembresiaViewSet(viewsets.ModelViewSet):
    """
    Solo ADMIN puede ver/editar todas las membresías.
    """
    serializer_class = MembresiaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = MembresiaFilter
    ordering_fields = ['fecha_inicio', 'plan']
    search_fields = ['trabajador__usuario__nombre']
    pagination_class = PageNumberPagination

    def get_queryset(self):
        # Solo admin ve todas las membresías
        if self.request.user.rol_base == "admin":
            return Membresia.objects.all()
        
        # Trabajadores solo ven la suya
        perfil = PerfilTrabajador.objects.filter(usuario=self.request.user).first()
        if perfil:
            return Membresia.objects.filter(trabajador=perfil)
        
        return Membresia.objects.none()

