import pytest
from decimal import Decimal
from django.core.exceptions import ValidationError
from servicios.models import Servicio
from perfiles.models import PerfilTrabajador
from usuarios.models import Usuario

@pytest.mark.django_db
def test_servicio_precio_negativo():
    """
    BUG DETECTADO: El modelo Servicio NO tiene validador de precio mínimo.
    Este test FALLA porque actualmente se pueden crear servicios con precio negativo.
    
    RESULTADO ESPERADO: ValidationError
    RESULTADO OBTENIDO: Sin error (el servicio se crea correctamente)
    """
    usuario = Usuario.objects.create_user(email="a@test.com", nombre="A", password="123")
    perfil = PerfilTrabajador.objects.create(usuario=usuario, categoria_principal="Hogar")

    servicio = Servicio(
        trabajador=perfil,
        titulo="Servicio Negativo",
        descripcion="Este servicio tiene precio negativo",
        categoria="Hogar",
        precio=-50  #Precio inválido
    )

    # Este test DEBERÍA pasar si el modelo tuviera MinValueValidator
    # Actualmente FALLA porque no hay validación
    try:
        servicio.full_clean()
        # Si llegamos aquí, el bug está presente
        pytest.fail("BUG: Se creó un servicio con precio negativo. Falta MinValueValidator en el modelo.")
    except ValidationError:
        # Este es el comportamiento esperado
        pass

@pytest.mark.django_db
def test_servicio_precio_cero():
    """
    BUG DETECTADO: Se pueden crear servicios gratis (precio=0).
    
    RESULTADO ESPERADO: ValidationError (precio debe ser > 0)
    RESULTADO OBTENIDO: Sin error (el servicio se crea)
    """
    usuario = Usuario.objects.create_user(email="c@test.com", nombre="C", password="123")
    perfil = PerfilTrabajador.objects.create(usuario=usuario, categoria_principal="Hogar")

    servicio = Servicio(
        trabajador=perfil,
        titulo="Servicio Gratis",
        descripcion="Precio cero",
        categoria="Hogar",
        precio=0  # Debería fallar
    )

    try:
        servicio.full_clean()
        pytest.fail("BUG: Se creó un servicio con precio cero. Debería requerir precio > 0.")
    except ValidationError:
        pass

@pytest.mark.django_db
def test_servicio_creacion_exitosa():
    """Test para verificar que servicios válidos SÍ se crean correctamente"""
    usuario = Usuario.objects.create_user(email="b@test.com", nombre="B", password="123")
    perfil = PerfilTrabajador.objects.create(usuario=usuario, categoria_principal="Hogar")

    servicio = Servicio.objects.create(
        trabajador=perfil,
        titulo="Servicio válido",
        descripcion="Descripción del servicio",
        categoria="Hogar",
        precio=100.50
    )

    assert servicio.id_servicio is not None
    assert servicio.precio == Decimal("100.50")
    assert servicio.estado_publicacion == "pendiente"

@pytest.mark.django_db
def test_servicio_precio_positivo_valido():
    """Test para verificar precios válidos (0.01, 1, 1000, etc)"""
    usuario = Usuario.objects.create_user(email="d@test.com", nombre="D", password="123")
    perfil = PerfilTrabajador.objects.create(usuario=usuario, categoria_principal="Hogar")

    precios_validos = [0.01, 1, 10, 99.99, 1000, 999999.99]
    
    for i, precio in enumerate(precios_validos):
        servicio = Servicio.objects.create(
            trabajador=perfil,
            titulo=f"Servicio {i}",
            descripcion="desc",
            categoria="Hogar",
            precio=precio
        )
        assert float(servicio.precio) == float(str(precio))

@pytest.mark.django_db
def test_servicio_campos_requeridos():
    """Test para validar que los campos obligatorios están presentes"""
    usuario = Usuario.objects.create_user(email="e@test.com", nombre="E", password="123")
    perfil = PerfilTrabajador.objects.create(usuario=usuario, categoria_principal="Hogar")

    # Sin título
    servicio = Servicio(
        trabajador=perfil,
        descripcion="desc",
        categoria="Hogar",
        precio=10
    )
    
    with pytest.raises(ValidationError):
        servicio.full_clean()

