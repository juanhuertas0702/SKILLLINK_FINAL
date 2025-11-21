from rest_framework import generics, permissions, viewsets
from .models import Disponibilidad
from .serializers import DisponibilidadSerializer
from perfiles.models import PerfilTrabajador
from .filters import DisponibilidadFilter

class DisponibilidadListCreate(generics.ListCreateAPIView):
    serializer_class = DisponibilidadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Disponibilidad.objects.filter(trabajador__usuario=self.request.user)

    def perform_create(self, serializer):
        perfil = PerfilTrabajador.objects.filter(usuario=self.request.user).first()
        if not perfil:
            raise serializers.ValidationError("Debes tener un perfil de trabajador.")
        serializer.save(trabajador=perfil)

class DisponibilidadViewSet(viewsets.ModelViewSet):
    queryset = Disponibilidad.objects.all()
    serializer_class = DisponibilidadSerializer
    filterset_class = DisponibilidadFilter
    ordering_fields = ['fecha', 'dia_semana', 'hora_inicio']

class DisponibilidadPublicoListView(generics.ListAPIView):
    """
    Endpoint público para obtener todas las disponibilidades.
    Sin autenticación requerida.
    """
    queryset = Disponibilidad.objects.all()
    serializer_class = DisponibilidadSerializer
    permission_classes = [permissions.AllowAny]
    filterset_class = DisponibilidadFilter
