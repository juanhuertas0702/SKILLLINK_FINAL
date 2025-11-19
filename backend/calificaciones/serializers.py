from rest_framework import serializers
from .models import Calificacion

class CalificacionSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source="cliente.nombre", read_only=True)
    trabajador_nombre = serializers.CharField(source="trabajador.usuario.nombre", read_only=True)
    
    class Meta:
        model = Calificacion
        fields = [
            "id_calificacion",
            "solicitud",
            "cliente",
            "trabajador",
            "cliente_nombre",
            "trabajador_nombre",
            "puntaje",
            "comentario",
            "fecha"
        ]
        read_only_fields = ["fecha", "cliente", "trabajador", "cliente_nombre", "trabajador_nombre"]
