from rest_framework import serializers
from .models import Servicio

class ServicioSerializer(serializers.ModelSerializer):
    trabajador_id = serializers.IntegerField(source="trabajador.id_trabajador", read_only=True)

    class Meta:
        model = Servicio
        fields = [
            "id_servicio",
            "trabajador_id",
            "titulo",
            "descripcion",
            "categoria",
            "precio",
            "foto_servicio",
            "estado_publicacion",
            "palabras_detectadas",
            "fecha_publicacion",
        ]
        read_only_fields = ["estado_publicacion", "palabras_detectadas", "fecha_publicacion"]


class ServicioPublicoSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar servicios a usuarios NO autenticados.
    Incluye información básica del trabajador (nombre, calificación).
    """
    trabajador_nombre = serializers.CharField(source="trabajador.usuario.nombre", read_only=True)
    trabajador_calificacion = serializers.SerializerMethodField()
    trabajador_experiencia = serializers.CharField(source="trabajador.experiencia", read_only=True)
    trabajador_categoria = serializers.CharField(source="trabajador.categoria_principal", read_only=True)

    owner_id = serializers.ReadOnlyField(source='trabajador.usuario.id_usuario')

    class Meta:
        model = Servicio
        fields = [
            "id_servicio",
            "titulo",
            "descripcion",
            "categoria",
            "precio",
            "foto_servicio",
            "trabajador_nombre",
            "trabajador_calificacion",
            "trabajador_experiencia",
            "trabajador_categoria",
            "fecha_publicacion",
            "owner_id"
        ]

    def get_trabajador_calificacion(self, obj):
        return obj.trabajador.rating_promedio()
