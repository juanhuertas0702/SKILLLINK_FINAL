from rest_framework import generics, permissions, viewsets, serializers
from .models import PerfilTrabajador
from .serializers import PerfilTrabajadorSerializer, PerfilTrabajadorPublicoSerializer
from .filters import PerfilTrabajadorFilter

class PerfilTrabajadorPublicoView(generics.RetrieveAPIView):
    """
    Vista pública del perfil de un trabajador (sin autenticación).
    Muestra solo información básica: nombre, calificación, experiencia.
    """
    serializer_class = PerfilTrabajadorPublicoSerializer
    permission_classes = [permissions.AllowAny]
    queryset = PerfilTrabajador.objects.filter(estado="activo")
    lookup_field = "id_trabajador"


class PerfilTrabajadorViewSet(viewsets.ModelViewSet):
    queryset = PerfilTrabajador.objects.all()
    serializer_class = PerfilTrabajadorSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = PerfilTrabajadorFilter
    ordering_fields = ['calificacion_promedio', 'tarifa_hora', 'anos_experiencia']
    search_fields = ['descripcion', 'ubicacion']

    def perform_create(self, serializer):
        # Evita que un usuario tenga más de un perfil
        if PerfilTrabajador.objects.filter(usuario=self.request.user).exists():
            raise serializers.ValidationError("Este usuario ya tiene un perfil de trabajador.")

        serializer.save(usuario=self.request.user)

class CrearPerfilTrabajadorView(generics.CreateAPIView):
    serializer_class = PerfilTrabajadorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Evita que un usuario tenga más de un perfil
        if PerfilTrabajador.objects.filter(usuario=self.request.user).exists():
            raise serializers.ValidationError("Este usuario ya tiene un perfil de trabajador.")

        serializer.save(usuario=self.request.user)


class MiPerfilTrabajadorView(generics.RetrieveUpdateAPIView):
    serializer_class = PerfilTrabajadorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        perfil = PerfilTrabajador.objects.filter(usuario=self.request.user).first()
        if not perfil:
            raise serializers.ValidationError("Este usuario no tiene perfil de trabajador.")
        return perfil
