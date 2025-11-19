from rest_framework import serializers
from .models import Moderacion

class ModeracionSerializer(serializers.ModelSerializer):
    servicio_titulo = serializers.CharField(source="servicio.titulo", read_only=True)
    trabajador_nombre = serializers.CharField(source="servicio.trabajador.usuario.nombre", read_only=True)
    admin_nombre = serializers.CharField(source="admin.nombre", read_only=True, allow_null=True)
    
    class Meta:
        model = Moderacion
        fields = [
            "id_moderacion",
            "servicio",
            "servicio_titulo",
            "trabajador_nombre",
            "palabras_detectadas",
            "estado",
            "admin",
            "admin_nombre",
            "fecha",
        ]
        read_only_fields = ["fecha"]
