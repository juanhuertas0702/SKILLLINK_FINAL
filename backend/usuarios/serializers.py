from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para ver/editar datos básicos del usuario (perfil)."""
    es_trabajador = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            "id_usuario",
            "nombre",
            "email",
            "foto_perfil",
            "fecha_nacimiento",
            "ciudad",
            "departamento",
            "telefono",
            "edad",
            "estado",
            "rol_base",
            "metodo_registro",
            "fecha_registro",
            'es_trabajador'
        ]
        read_only_fields = ["rol_base", "metodo_registro", "estado", "fecha_registro", "email"]

    def get_es_trabajador(self, obj):
        # Devuelve True si el usuario tiene perfil de trabajador
        return hasattr(obj, 'perfil_trabajador') and obj.perfil_trabajador is not None


class RegistroUsuarioSerializer(serializers.ModelSerializer):
    """Serializer para registrar usuarios nuevos (registro local, no Google)."""

    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = Usuario
        fields = ["id_usuario", "nombre", "email", "password", "ciudad", "departamento", "telefono", "edad", "foto_perfil"]

    def create(self, validated_data):
        # Siempre se crea como usuario normal, metodo_registro = local
        password = validated_data.pop("password")
        user = Usuario(
            email=validated_data["email"],
            nombre=validated_data["nombre"],
            ciudad=validated_data.get("ciudad"),
            departamento=validated_data.get("departamento"),
            telefono=validated_data.get("telefono"),
            edad=validated_data.get("edad"),
            foto_perfil=validated_data.get("foto_perfil"),
            rol_base=Usuario.ROL_USUARIO,
            metodo_registro="local",
        )
        user.set_password(password)
        user.save()
        return user

