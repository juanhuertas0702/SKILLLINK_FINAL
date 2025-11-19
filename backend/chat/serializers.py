from rest_framework import serializers
from .models import Mensaje

class MensajeSerializer(serializers.ModelSerializer):
    remitente_nombre = serializers.CharField(source="remitente.nombre", read_only=True)

    class Meta:
        model = Mensaje
        fields = [
            "id_mensaje",
            "solicitud",
            "remitente",
            "remitente_nombre",
            "texto",
            "archivo",
            "fecha_envio",
            "leido"
        ]
        read_only_fields = ["remitente", "fecha_envio", "leido"]
