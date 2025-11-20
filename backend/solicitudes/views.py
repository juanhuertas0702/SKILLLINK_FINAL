from rest_framework import viewsets, permissions, status, exceptions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from .models import Solicitud
from .serializers import SolicitudSerializer, CrearSolicitudSerializer

class SolicitudViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CrearSolicitudSerializer
        return SolicitudSerializer

    def get_queryset(self):
        user = self.request.user
        
        # Si el usuario tiene perfil de trabajador, ve las solicitudes que LE han hecho
        # Y TAMBIÉN las que él ha hecho como cliente
        qs = Solicitud.objects.filter(cliente=user)
        
        if hasattr(user, 'perfil_trabajador'):
            qs_trabajador = Solicitud.objects.filter(trabajador=user.perfil_trabajador)
            qs = qs | qs_trabajador # Unimos ambas listas (Enviadas + Recibidas)
            
        return qs.distinct().order_by('-fecha_solicitud')

    def perform_create(self, serializer):
        servicio = serializer.validated_data['servicio']
        cliente = self.request.user
        
        # 1. Validar que no se solicite a sí mismo
        if servicio.trabajador.usuario == cliente:
            raise exceptions.ValidationError("No puedes solicitar tu propio servicio.")

        # 2. Guardar la solicitud asignando automáticamente el trabajador dueño del servicio
        serializer.save(
            cliente=cliente,
            trabajador=servicio.trabajador
        )

    # Acción personalizada para que el trabajador responda
    @action(detail=True, methods=['post'])
    def responder(self, request, pk=None):
        solicitud = self.get_object()
        nuevo_estado = request.data.get('estado')
        
        # Validar estado correcto
        if nuevo_estado not in ['aceptada', 'rechazada']:
            return Response(
                {'error': 'Estado inválido. Use "aceptada" o "rechazada".'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar que sea el trabajador quien responde
        if not hasattr(request.user, 'perfil_trabajador') or \
           solicitud.trabajador != request.user.perfil_trabajador:
            return Response(
                {'error': 'No tienes permiso para responder esta solicitud.'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        solicitud.estado = nuevo_estado
        solicitud.save()
        return Response(SolicitudSerializer(solicitud).data)

    # Acción para aceptar solicitud (alias corto)
    @action(detail=True, methods=['patch'])
    def aceptar(self, request, pk=None):
        solicitud = self.get_object()
        
        # Validar que sea el trabajador quien responde
        if not hasattr(request.user, 'perfil_trabajador') or \
           solicitud.trabajador != request.user.perfil_trabajador:
            return Response(
                {'error': 'No tienes permiso para responder esta solicitud.'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        solicitud.estado = 'aceptada'
        solicitud.save()
        return Response(SolicitudSerializer(solicitud).data)

    # Acción para rechazar solicitud
    @action(detail=True, methods=['patch'])
    def rechazar(self, request, pk=None):
        solicitud = self.get_object()
        
        # Validar que sea el trabajador quien responde
        if not hasattr(request.user, 'perfil_trabajador') or \
           solicitud.trabajador != request.user.perfil_trabajador:
            return Response(
                {'error': 'No tienes permiso para responder esta solicitud.'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        solicitud.estado = 'rechazada'
        solicitud.save()
        return Response(SolicitudSerializer(solicitud).data)

    # Acción para marcar como finalizada
    @action(detail=True, methods=['patch'])
    def finalizar(self, request, pk=None):
        solicitud = self.get_object()
        
        # Validar que sea el trabajador quien finaliza
        if not hasattr(request.user, 'perfil_trabajador') or \
           solicitud.trabajador != request.user.perfil_trabajador:
            return Response(
                {'error': 'No tienes permiso para finalizar esta solicitud.'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        solicitud.estado = 'finalizada'
        solicitud.save()
        return Response(SolicitudSerializer(solicitud).data)

    def destroy(self, request, *args, **kwargs):
        """
        Permitir que solo el cliente o el trabajador puedan eliminar una solicitud.
        """
        solicitud = self.get_object()
        
        # Validar que sea el cliente o el trabajador
        es_cliente = solicitud.cliente == request.user
        es_trabajador = (hasattr(request.user, 'perfil_trabajador') and 
                        solicitud.trabajador == request.user.perfil_trabajador)
        
        if not (es_cliente or es_trabajador):
            return Response(
                {'error': 'No tienes permiso para eliminar esta solicitud.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
