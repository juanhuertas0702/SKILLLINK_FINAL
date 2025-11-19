from rest_framework import viewsets, permissions, serializers, generics
from rest_framework.exceptions import ValidationError
from rest_framework.filters import SearchFilter, OrderingFilter

from moderacion.palabras import PALABRAS_PROHIBIDAS
from moderacion.models import Moderacion
from perfiles.models import PerfilTrabajador
from membresias.models import Membresia

from .models import Servicio
from .serializers import ServicioSerializer, ServicioPublicoSerializer
from .filters import ServicioFilter


class ServiciosPublicosListView(generics.ListAPIView):
    """
    Lista de servicios públicos que los clientes pueden ver y contratar.
    Solo muestra servicios con estado_publicacion='aprobado'.
    Permite filtros por categoría y ciudad del trabajador.
    """
    serializer_class = ServicioPublicoSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Servicio.objects.filter(estado_publicacion="aprobado").select_related("trabajador__usuario")

        categoria = self.request.query_params.get("categoria")
        ciudad = self.request.query_params.get("ciudad")

        if categoria:
            qs = qs.filter(categoria__icontains=categoria)

        if ciudad:
            qs = qs.filter(trabajador__usuario__ciudad__icontains=ciudad)

        return qs


class ServicioPublicoDetailView(generics.RetrieveAPIView):
    """
    Detalle de UN servicio específico (sin autenticación).
    Muestra información básica del trabajador.
    """
    serializer_class = ServicioPublicoSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "id_servicio"

    def get_queryset(self):
        return Servicio.objects.filter(estado_publicacion="aprobado").select_related("trabajador__usuario")


class ServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer
    filterset_class = ServicioFilter
    ordering_fields = ['fecha_creacion', 'precio', 'titulo']
    search_fields = ['titulo', 'descripcion']

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Servicio.objects.none()
        
        # Admin ve todo
        if self.request.user.rol_base == "admin":
            return Servicio.objects.all()

        # Usuario normal solo ve sus servicios
        return Servicio.objects.filter(trabajador__usuario=self.request.user)

    def perform_create(self, serializer):
        # -----------------------------------------------------
        # 1) Verificar que el usuario tenga perfil trabajador
        # -----------------------------------------------------
        perfil = PerfilTrabajador.objects.filter(usuario=self.request.user).first()
        if not perfil:
            raise ValidationError("Debes tener un perfil de trabajador para publicar servicios.")

        # -----------------------------------------------------
        # 2) Verificar plan de membresía
        # -----------------------------------------------------
        membresia = getattr(perfil, "membresia", None)
        plan = membresia.plan if membresia else "free"

        if plan == "free":
            limite = 3
            servicios_publicados = Servicio.objects.filter(trabajador=perfil).count()

            if servicios_publicados >= limite:
                raise ValidationError(
                    f"Has alcanzado el límite de {limite} servicios con el plan Free."
                )

        # -----------------------------------------------------
        # 3) Crear el servicio inicialmente
        # -----------------------------------------------------
        servicio = serializer.save(trabajador=perfil)

        # -----------------------------------------------------
        # 4) Sistema de moderación automática
        # -----------------------------------------------------
        texto = f"{servicio.titulo.lower()} {servicio.descripcion.lower()}"
        palabras_encontradas = [p for p in PALABRAS_PROHIBIDAS if p in texto]

        if palabras_encontradas:
            servicio.palabras_detectadas = True
            servicio.estado_publicacion = "pendiente"
            servicio.save()

            Moderacion.objects.create(
                servicio=servicio,
                palabras_detectadas=", ".join(palabras_encontradas),
                estado="pendiente"
            )
        else:
            servicio.palabras_detectadas = False
            servicio.estado_publicacion = "aprobado"
            servicio.save()

        return servicio


