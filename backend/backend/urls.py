"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from usuarios.token import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

# ✅ IMPORTAR SWAGGER
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# ✅ CONFIGURACIÓN DE SWAGGER
schema_view = get_schema_view(
    openapi.Info(
        title="SkillLink API",
        default_version='v1',
        description="""
        ## API de SkillLink - Plataforma de Servicios
        
        ### Autenticación
        - Registro de usuarios (local y Google)
        - Login con JWT
        
        ### Funcionalidades principales
        - **Perfiles de trabajadores** con sistema de calificaciones
        - **Servicios** con moderación automática de contenido
        - **Solicitudes** con validación de disponibilidad
        - **Chat** entre cliente y trabajador
        - **Membresías** (Free y Premium)
        - **Moderación** para administradores
        
        ### Endpoints públicos (sin autenticación)
        - Ver servicios aprobados
        - Buscar por categoría/ciudad
        - Ver perfiles públicos de trabajadores
        
        ### Autenticación requerida
        Usa el botón "Authorize" e ingresa: `Bearer <tu_token_jwt>`
        """,
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contacto@skilllink.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    # ✅ SWAGGER URLS (PRIMERO)
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('', schema_view.with_ui('swagger', cache_timeout=0), name='api-docs'),  # ✅ PÁGINA PRINCIPAL
    
    path('admin/', admin.site.urls),

    # Auth JWT
    path('api/auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Rutas por app
    path('api/usuarios/', include('usuarios.urls')),
    path('api/perfiles/', include('perfiles.urls')),
    path('api/servicios/', include('servicios.urls')),
    path('api/disponibilidad/', include('disponibilidad.urls')),
    path('api/solicitudes/', include('solicitudes.urls')),
    path('api/calificaciones/', include('calificaciones.urls')),
    path('api/moderacion/', include('moderacion.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/membresias/', include('membresias.urls')),
    
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
