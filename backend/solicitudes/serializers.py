from rest_framework import serializers
from .models import Solicitud

class SolicitudSerializer(serializers.ModelSerializer):
    # Campos de solo lectura para mostrar información bonita en el frontend
    titulo_servicio = serializers.CharField(source='servicio.titulo', read_only=True)
    nombre_cliente = serializers.CharField(source='cliente.nombre', read_only=True)
    email_cliente = serializers.CharField(source='cliente.email', read_only=True)
    foto_cliente = serializers.ImageField(source='cliente.foto_perfil', read_only=True)
    
    class Meta:
        model = Solicitud
        fields = [
            'id', 'cliente', 'servicio', 'trabajador', 
            'fecha_solicitud', 'mensaje', 'estado',
            'titulo_servicio', 'nombre_cliente', 'email_cliente', 'foto_cliente'
        ]
        read_only_fields = ['cliente', 'trabajador', 'fecha_solicitud', 'estado']

class CrearSolicitudSerializer(serializers.ModelSerializer):
    titulo_servicio = serializers.CharField(source='servicio.titulo', read_only=True)
    nombre_cliente = serializers.CharField(source='cliente.nombre', read_only=True)
    email_cliente = serializers.CharField(source='cliente.email', read_only=True)
    foto_cliente = serializers.ImageField(source='cliente.foto_perfil', read_only=True)
    
    class Meta:
        model = Solicitud
        fields = [
            'id', 'servicio', 'mensaje', 'cliente', 'trabajador', 
            'fecha_solicitud', 'estado',
            'titulo_servicio', 'nombre_cliente', 'email_cliente', 'foto_cliente'
        ]
        read_only_fields = ['id', 'cliente', 'trabajador', 'fecha_solicitud', 'estado', 'titulo_servicio', 'nombre_cliente', 'email_cliente', 'foto_cliente']