from django.urls import path
from .views import RegistroUsuarioView, UsuarioMeView, LoginView, EsTrabajadorView
from .views import GoogleLoginView

urlpatterns = [
    path('registro/', RegistroUsuarioView.as_view(), name='registro-usuario'),
    path('login/', LoginView.as_view(), name='login-usuario'),
    path('me/', UsuarioMeView.as_view(), name='usuario-me'),
    path('es-trabajador/', EsTrabajadorView.as_view(), name='es-trabajador'),
    path('google-login/', GoogleLoginView.as_view()),
]

