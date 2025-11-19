from rest_framework import serializers
from .models import Disponibilidad

class DisponibilidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disponibilidad
        fields = [
            "id_disponibilidad",
            "trabajador",
            "dia",
            "hora_inicio",
            "hora_fin",
        ]
        read_only_fields = ["trabajador"]
