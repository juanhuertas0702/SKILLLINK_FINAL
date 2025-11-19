from rest_framework import serializers
from .models import Solicitud
from servicios.models import Servicio


class SolicitudSerializer(serializers.ModelSerializer):
    cliente_id = serializers.IntegerField(source="cliente.id_usuario", read_only=True)
    trabajador_id = serializers.IntegerField(source="trabajador.id_usuario", read_only=True)
    servicio_titulo = serializers.CharField(source="servicio.titulo", read_only=True)

    class Meta:
        model = Solicitud
        fields = [
            "id_solicitud",
            "cliente_id",
            "trabajador_id",
            "servicio",
            "servicio_titulo",
            "dia",             
            "hora_inicio",     
            "hora_fin",        
            "fecha_solicitud",
            "estado"
        ]
        read_only_fields = ["fecha_solicitud", "estado", "cliente_id", "trabajador_id"]

    def validate(self, attrs):
        dia = attrs.get("dia")
        hi = attrs.get("hora_inicio")
        hf = attrs.get("hora_fin")

        if not dia or not hi or not hf:
            raise serializers.ValidationError("Debes especificar día, hora_inicio y hora_fin.")

        if hi >= hf:
            raise serializers.ValidationError("La hora_fin debe ser mayor que la hora_inicio.")

        return attrs

