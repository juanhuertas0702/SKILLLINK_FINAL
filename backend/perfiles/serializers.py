from rest_framework import serializers
from .models import PerfilTrabajador

class PerfilTrabajadorSerializer(serializers.ModelSerializer):
    usuario_id = serializers.IntegerField(source="usuario.id_usuario", read_only=True)
    usuario_nombre = serializers.CharField(source="usuario.nombre", read_only=True)
    calificacion_promedio = serializers.SerializerMethodField()
    total_calificaciones = serializers.SerializerMethodField()

    class Meta:
        model = PerfilTrabajador
        fields = [
            "id_trabajador",
            "usuario_id",
            "usuario_nombre",
            "descripcion",
            "experiencia",
            "habilidades",
            "categoria_principal",
            "estado",
            "calificacion_promedio",
            "total_calificaciones",
        ]
        read_only_fields = ["estado", "calificacion_promedio", "total_calificaciones"]

    def get_calificacion_promedio(self, obj):
        return obj.rating_promedio()

    def get_total_calificaciones(self, obj):
        return obj.calificaciones_recibidas.count()


class PerfilTrabajadorPublicoSerializer(serializers.ModelSerializer):
    """
    Serializer público con información limitada del trabajador.
    SIN datos personales (email, teléfono, dirección).
    """
    nombre = serializers.CharField(source="usuario.nombre", read_only=True)
    calificacion_promedio = serializers.SerializerMethodField()
    total_calificaciones = serializers.SerializerMethodField()

    class Meta:
        model = PerfilTrabajador
        fields = [
            "id_trabajador",
            "nombre",
            "descripcion",
            "experiencia",
            "categoria_principal",
            "calificacion_promedio",
            "total_calificaciones",
        ]

    def get_calificacion_promedio(self, obj):
        return obj.rating_promedio()

    def get_total_calificaciones(self, obj):
        return obj.calificaciones_recibidas.count()
