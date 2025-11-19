from django.urls import path
from .views import RegistroUsuarioView, UsuarioMeView
from .views import GoogleLoginView

urlpatterns = [
    path('registro/', RegistroUsuarioView.as_view(), name='registro-usuario'),
    path('me/', UsuarioMeView.as_view(), name='usuario-me'),
    path('google-login/', GoogleLoginView.as_view()),
]

