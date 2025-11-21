import pytest
from django.core.exceptions import ValidationError
from solicitudes.models import Solicitud
from usuarios.models import Usuario
from perfiles.models import PerfilTrabajador
from servicios.models import Servicio

@pytest.mark.django_db
def test_solicitud_estado_invalido():
    """✅ Test mejorado: validar que estados inválidos lanzan ValidationError específico"""
    cliente = Usuario.objects.create_user(email="c@test.com", nombre="C", password="123")
    tra_u = Usuario.objects.create_user(email="t@test.com", nombre="T", password="123")
    perfil = PerfilTrabajador.objects.create(usuario=tra_u, categoria_principal="Hogar")

    servicio = Servicio.objects.create(
        trabajador=perfil,
        titulo="Servicio Test",
        descripcion="desc",
        categoria="Hogar",
        precio=20
    )

    solicitud = Solicitud(
        cliente=cliente,
        trabajador=perfil,
        servicio=servicio,
        estado="xxxx"  #ESTADO INVÁLIDO
    )

    # Cambiado de Exception genérica a ValidationError específico
    with pytest.raises(ValidationError) as exc_info:
        solicitud.full_clean()
    
    # Verificar que el error es específicamente del campo 'estado'
    assert 'estado' in exc_info.value.message_dict

@pytest.mark.django_db
def test_solicitud_creacion_exitosa():
    """✅ Test para verificar que solicitudes válidas se crean correctamente"""
    cliente = Usuario.objects.create_user(email="c2@test.com", nombre="C2", password="123")
    tra_u = Usuario.objects.create_user(email="t2@test.com", nombre="T2", password="123")
    perfil = PerfilTrabajador.objects.create(usuario=tra_u, categoria_principal="Hogar")

    servicio = Servicio.objects.create(
        trabajador=perfil,
        titulo="Servicio Test 2",
        descripcion="desc",
        categoria="Hogar",
        precio=20
    )

    solicitud = Solicitud.objects.create(
        cliente=cliente,
        trabajador=perfil,
        servicio=servicio,
        mensaje="Solicito este servicio"
    )

    assert solicitud.id is not None
    assert solicitud.estado == 'pendiente'  # Estado por defecto
    assert solicitud.mensaje == "Solicito este servicio"

@pytest.mark.django_db
def test_solicitud_estados_validos():
    """✅ Test para verificar que todos los estados válidos funcionan"""
    cliente = Usuario.objects.create_user(email="c3@test.com", nombre="C3", password="123")
    tra_u = Usuario.objects.create_user(email="t3@test.com", nombre="T3", password="123")
    perfil = PerfilTrabajador.objects.create(usuario=tra_u, categoria_principal="Hogar")

    servicio = Servicio.objects.create(
        trabajador=perfil,
        titulo="Servicio Test 3",
        descripcion="desc",
        categoria="Hogar",
        precio=20
    )

    estados_validos = ['pendiente', 'aceptada', 'rechazada', 'finalizada']
    
    for estado in estados_validos:
        solicitud = Solicitud(
            cliente=cliente,
            trabajador=perfil,
            servicio=servicio,
            estado=estado
        )
        solicitud.full_clean()  # No debe lanzar error
        solicitud.save()
        assert solicitud.estado == estado

@pytest.mark.django_db
def test_solicitud_mensaje_opcional():
    """✅ Test para verificar que el mensaje es opcional"""
    cliente = Usuario.objects.create_user(email="c4@test.com", nombre="C4", password="123")
    tra_u = Usuario.objects.create_user(email="t4@test.com", nombre="T4", password="123")
    perfil = PerfilTrabajador.objects.create(usuario=tra_u, categoria_principal="Hogar")

    servicio = Servicio.objects.create(
        trabajador=perfil,
        titulo="Servicio Test 4",
        descripcion="desc",
        categoria="Hogar",
        precio=20
    )

    solicitud = Solicitud.objects.create(
        cliente=cliente,
        trabajador=perfil,
        servicio=servicio
        # mensaje NO proporcionado
    )

    assert solicitud.mensaje is None or solicitud.mensaje == ""

