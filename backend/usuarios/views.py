from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from .models import Usuario
from .serializers import UsuarioSerializer, RegistroUsuarioSerializer
from .filters import UsuarioFilter

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings

from .models import Usuario

import requests  # 👈 nuevo import
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        id_token_value = request.data.get("id_token")
        access_token = request.data.get("access_token")

        # 1) Si viene id_token (más adelante desde el frontend)
        if id_token_value:
            try:
                info = id_token.verify_oauth2_token(
                    id_token_value,
                    google_requests.Request(),
                    settings.GOOGLE_CLIENT_ID
                )
                email = info.get("email")
                nombre = info.get("name")
            except Exception:
                return Response({"error": "id_token inválido"}, status=status.HTTP_400_BAD_REQUEST)

        # 2) Si NO viene id_token pero SÍ access_token (caso OAuth Playground)
        elif access_token:
            try:
                resp = requests.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                if resp.status_code != 200:
                    return Response({"error": "access_token inválido"}, status=status.HTTP_400_BAD_REQUEST)

                data = resp.json()
                email = data.get("email")
                nombre = data.get("name") or data.get("given_name") or "Usuario Google"
            except Exception:
                return Response({"error": "Error al validar access_token"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "Debes enviar id_token o access_token"}, status=status.HTTP_400_BAD_REQUEST)

        if not email:
            return Response({"error": "No se pudo obtener el email desde Google"}, status=status.HTTP_400_BAD_REQUEST)

        # 3) Buscar o crear usuario
        user, created = Usuario.objects.get_or_create(
            email=email,
            defaults={
                "nombre": nombre,
                "rol_base": "usuario",
                "metodo_registro": "google",
            }
        )

        # Si ya existe pero fue creado como 'local', no permitimos mezclar
        if not created and user.metodo_registro != "google":
            return Response(
                {"error": "Este email ya está registrado con otro método de acceso."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4) Generar tokens JWT
        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "email": user.email,
            "nombre": user.nombre,
            "rol": user.rol_base,
        })


class RegistroUsuarioView(generics.CreateAPIView):
    """
    Endpoint público para registrar un usuario nuevo (correo + nombre + password).
    """
    queryset = Usuario.objects.all()
    serializer_class = RegistroUsuarioSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        
        # Después de crear el usuario, generar token JWT
        user = Usuario.objects.get(email=request.data.get('email'))
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id_usuario,
                'email': user.email,
                'nombre': user.nombre,
                'rol': user.rol_base,
            }
        }, status=status.HTTP_201_CREATED)


class LoginUsuarioView(APIView):
    """
    Endpoint para login con email y password.
    POST /api/auth/token/
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'error': 'Email y contraseña son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.check_password(password):
            return Response(
                {'error': 'Contraseña incorrecta'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id_usuario,
                'email': user.email,
                'nombre': user.nombre,
                'rol': user.rol_base,
            }
        }, status=status.HTTP_200_OK)


class UsuarioMeView(generics.RetrieveUpdateAPIView):
    """
    Endpoint para ver/editar el perfil del usuario logueado.
    GET /api/usuarios/me/
    PUT/PATCH /api/usuarios/me/
    """

    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Siempre retorna el usuario autenticado (request.user)
        return self.request.user


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    Endpoint para gestionar usuarios.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = UsuarioFilter
    ordering_fields = ['fecha_registro', 'nombre_completo', 'email']
    search_fields = ['email', 'nombre_completo']
