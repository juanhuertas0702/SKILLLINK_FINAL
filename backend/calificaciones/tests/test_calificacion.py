import pytest
from django.core.exceptions import ValidationError
from calificaciones.models import Calificacion
from usuarios.models import Usuario
from perfiles.models import PerfilTrabajador
from solicitudes.models import Solicitud
from servicios.models import Servicio

@pytest.mark.django_db
def test_calificacion_puntaje_fuera_de_rango():
    cliente = Usuario.objects.create_user(email="cli@test.com", nombre="C", password="123")
    trabajador_usuario = Usuario.objects.create_user(email="tra@test.com", nombre="T", password="123")
    perfil = PerfilTrabajador.objects.create(usuario=trabajador_usuario, categoria_principal="Hogar")

    servicio = Servicio.objects.create(
        trabajador=perfil,
        titulo="S1",
        descripcion="desc",
        categoria="Hogar",
        precio=10
    )

    solicitud = Solicitud.objects.create(
        cliente=cliente,
        trabajador=perfil,
        servicio=servicio
    )

    # Test puntaje mayor a 5
    cali = Calificacion(
        solicitud=solicitud,
        cliente=cliente,
        trabajador=perfil,
        puntaje=10  # Fuera de rango
    )

    with pytest.raises(ValidationError):
        cali.full_clean()

@pytest.mark.django_db
def test_calificacion_puntaje_cero():
    """Test adicional: validar que puntaje 0 también falla"""
    cliente = Usuario.objects.create_user(email="cli2@test.com", nombre="C2", password="123")
    trabajador_usuario = Usuario.objects.create_user(email="tra2@test.com", nombre="T2", password="123")
    perfil = PerfilTrabajador.objects.create(usuario=trabajador_usuario, categoria_principal="Hogar")

    servicio = Servicio.objects.create(
        trabajador=perfil,
        titulo="S2",
        descripcion="desc",
        categoria="Hogar",
        precio=10
    )

    solicitud = Solicitud.objects.create(
        cliente=cliente,
        trabajador=perfil,
        servicio=servicio
    )

    cali = Calificacion(
        solicitud=solicitud,
        cliente=cliente,
        trabajador=perfil,
        puntaje=0  # Menor al mínimo (1)
    )

    with pytest.raises(ValidationError):
        cali.full_clean()

@pytest.mark.django_db
def test_calificacion_valida():
    """Test adicional: validar que puntajes válidos SÍ funcionan"""
    cliente = Usuario.objects.create_user(email="cli3@test.com", nombre="C3", password="123")
    trabajador_usuario = Usuario.objects.create_user(email="tra3@test.com", nombre="T3", password="123")
    perfil = PerfilTrabajador.objects.create(usuario=trabajador_usuario, categoria_principal="Hogar")

    servicio = Servicio.objects.create(
        trabajador=perfil,
        titulo="S3",
        descripcion="desc",
        categoria="Hogar",
        precio=10
    )

    solicitud = Solicitud.objects.create(
        cliente=cliente,
        trabajador=perfil,
        servicio=servicio
    )

    # Puntajes válidos: 1-5
    for puntaje in [1, 2, 3, 4, 5]:
        cali = Calificacion(
            solicitud=solicitud,
            cliente=cliente,
            trabajador=perfil,
            puntaje=puntaje
        )
        cali.full_clean()  # No debe lanzar error

@pytest.mark.django_db
def test_calificacion_duplicada():
    """
    Test para validar que NO se puedan crear dos calificaciones
    para la misma solicitud (OneToOneField constraint).
    """
    cliente = Usuario.objects.create_user(email="cli4@test.com", nombre="C4", password="123")
    trabajador_usuario = Usuario.objects.create_user(email="tra4@test.com", nombre="T4", password="123")
    perfil = PerfilTrabajador.objects.create(usuario=trabajador_usuario, categoria_principal="Hogar")

    servicio = Servicio.objects.create(
        trabajador=perfil,
        titulo="S4",
        descripcion="desc",
        categoria="Hogar",
        precio=10
    )

    solicitud = Solicitud.objects.create(
        cliente=cliente,
        trabajador=perfil,
        servicio=servicio
    )

    # Primera calificación - debe funcionar
    cali1 = Calificacion.objects.create(
        solicitud=solicitud,
        cliente=cliente,
        trabajador=perfil,
        puntaje=5
    )

    # Segunda calificación - debe fallar por OneToOneField
    from django.db import IntegrityError
    with pytest.raises(IntegrityError):
        cali2 = Calificacion.objects.create(
            solicitud=solicitud,
            cliente=cliente,
            trabajador=perfil,
            puntaje=4
        )

@pytest.mark.django_db
def test_calificacion_comentario_opcional():
    """Test para verificar que el comentario es opcional"""
    cliente = Usuario.objects.create_user(email="cli5@test.com", nombre="C5", password="123")
    trabajador_usuario = Usuario.objects.create_user(email="tra5@test.com", nombre="T5", password="123")
    perfil = PerfilTrabajador.objects.create(usuario=trabajador_usuario, categoria_principal="Hogar")

    servicio = Servicio.objects.create(
        trabajador=perfil,
        titulo="S5",
        descripcion="desc",
        categoria="Hogar",
        precio=10
    )

    solicitud = Solicitud.objects.create(
        cliente=cliente,
        trabajador=perfil,
        servicio=servicio
    )

    # Sin comentario debe funcionar
    cali = Calificacion.objects.create(
        solicitud=solicitud,
        cliente=cliente,
        trabajador=perfil,
        puntaje=3
    )
    
    assert cali.comentario is None or cali.comentario == ""