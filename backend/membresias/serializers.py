from rest_framework import serializers
from .models import Membresia


class MembresiaSerializer(serializers.ModelSerializer):
    trabajador_id = serializers.IntegerField(source="trabajador.id_trabajador", read_only=True)
    trabajador_nombre = serializers.CharField(source="trabajador.usuario.nombre", read_only=True)

    class Meta:
        model = Membresia
        fields = [
            "id_membresia",
            "trabajador_id",
            "trabajador_nombre",
            "plan",
            "fecha_inicio",
            "fecha_fin",
            "estado",
        ]
        read_only_fields = ["trabajador_id", "trabajador_nombre", "fecha_inicio", "fecha_fin", "estado"]
