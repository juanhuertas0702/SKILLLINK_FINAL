#!/usr/bin/env python
"""
Script para probar los endpoints de solicitudes
"""
import os
import sys
import django
import json

# Agregar el directorio backend al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import Client
from usuarios.models import Usuario
from perfiles.models import PerfilTrabajador
from servicios.models import Servicio
from solicitudes.models import Solicitud
from rest_framework_simplejwt.tokens import RefreshToken

# Crear cliente HTTP
client = Client()

# Obtener un usuario existente
print("[*] Buscando usuarios...")
usuarios = Usuario.objects.all()
print(f"[+] Se encontraron {usuarios.count()} usuarios:")
for u in usuarios:
    print(f"   - {u.email} (id={u.id_usuario})")

if usuarios.count() < 2:
    print("[-] Se necesitan al menos 2 usuarios para las pruebas")
    exit(1)

usuario_cliente = usuarios[0]
usuario_trabajador = usuarios[1]

print(f"\n[*] Usuario Cliente: {usuario_cliente.email}")
print(f"[*] Usuario Trabajador: {usuario_trabajador.email}")

# Obtener tokens JWT
print("\n[*] Generando tokens JWT...")
refresh_cliente = RefreshToken.for_user(usuario_cliente)
access_cliente = str(refresh_cliente.access_token)

refresh_trabajador = RefreshToken.for_user(usuario_trabajador)
access_trabajador = str(refresh_trabajador.access_token)

# Verificar perfiles
print("\n[*] Verificando perfiles...")
perfil_cliente = PerfilTrabajador.objects.filter(usuario=usuario_cliente).first()
perfil_trabajador = PerfilTrabajador.objects.filter(usuario=usuario_trabajador).first()

print(f"Perfil cliente: {perfil_cliente}")
print(f"Perfil trabajador: {perfil_trabajador}")

# Obtener servicios
print("\n[*] Buscando servicios...")
servicios = Servicio.objects.all()
print(f"[+] Se encontraron {servicios.count()} servicios:")
for s in servicios[:3]:
    print(f"   - {s.titulo} (id={s.id_servicio}, estado={s.estado_publicacion})")

if servicios.count() == 0:
    print("[-] No hay servicios disponibles")
    exit(1)

# Obtener un servicio aprobado
servicio = servicios.filter(estado_publicacion='aprobado').first()
if not servicio:
    print("[-] No hay servicios aprobados")
    exit(1)

print(f"\n[*] Servicio a usar: {servicio.titulo} (id={servicio.id_servicio})")

# ==================== TEST 1: Crear Solicitud ====================
print("\n" + "="*60)
print("TEST 1: Crear Solicitud")
print("="*60)

solicitud_data = {
    "servicio": servicio.id_servicio,
    # Sin horarios - primer contacto
}

response = client.post(
    '/api/solicitudes/',
    data=json.dumps(solicitud_data),
    content_type='application/json',
    HTTP_AUTHORIZATION=f'Bearer {access_cliente}'
)

print(f"Status: {response.status_code}")
try:
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")
except:
    print(f"Response (no JSON): {response.content.decode()[:200]}")

if response.status_code in [200, 201]:
    solicitud_id = response.json()['id_solicitud']
    print(f"✅ Solicitud creada con ID: {solicitud_id}")
else:
    print("❌ Error creando solicitud")
    # No salir, continuar con otros tests
    solicitud_id = None

# ==================== TEST 2: Listar Mis Solicitudes ====================
print("\n" + "="*60)
print("TEST 2: Listar Mis Solicitudes (Cliente)")
print("="*60)

response = client.get(
    '/api/solicitudes/',
    HTTP_AUTHORIZATION=f'Bearer {access_cliente}'
)

print(f"Status: {response.status_code}")
data = response.json()
print(f"Response: {json.dumps(data, indent=2)}")

if response.status_code == 200:
    print(f"✅ Se obtuvieron {len(data) if isinstance(data, list) else 0} solicitudes")
else:
    print("❌ Error listando solicitudes")

# ==================== TEST 3: Listar Solicitudes Recibidas ====================
print("\n" + "="*60)
print("TEST 3: Listar Solicitudes Recibidas (Trabajador)")
print("="*60)

response = client.get(
    '/api/solicitudes/recibidas/',
    HTTP_AUTHORIZATION=f'Bearer {access_trabajador}'
)

print(f"Status: {response.status_code}")
data = response.json()
print(f"Response: {json.dumps(data, indent=2)}")

if response.status_code == 200:
    print(f"✅ Se obtuvieron {len(data) if isinstance(data, list) else 0} solicitudes recibidas")
else:
    print("❌ Error listando solicitudes recibidas")

# ==================== TEST 4: Aceptar Solicitud ====================
print("\n" + "="*60)
print("TEST 4: Aceptar Solicitud")
print("="*60)

response = client.patch(
    f'/api/solicitudes/{solicitud_id}/aceptar/',
    data=json.dumps({}),
    content_type='application/json',
    HTTP_AUTHORIZATION=f'Bearer {access_trabajador}'
)

print(f"Status: {response.status_code}")
print(f"Response: {response.content.decode()}")

if response.status_code in [200, 202]:
    print(f"✅ Solicitud aceptada")
else:
    print("❌ Error aceptando solicitud")

# ==================== TEST 5: Rechazar Solicitud (crear otra) ====================
print("\n" + "="*60)
print("TEST 5: Rechazar Solicitud (nueva)")
print("="*60)

# Crear otra solicitud para rechazar
solicitud_data2 = {
    "servicio": servicio.id_servicio,
}

response = client.post(
    '/api/solicitudes/',
    data=json.dumps(solicitud_data2),
    content_type='application/json',
    HTTP_AUTHORIZATION=f'Bearer {access_cliente}'
)

if response.status_code in [200, 201]:
    solicitud_id2 = response.json()['id_solicitud']
    
    response = client.patch(
        f'/api/solicitudes/{solicitud_id2}/rechazar/',
        data=json.dumps({}),
        content_type='application/json',
        HTTP_AUTHORIZATION=f'Bearer {access_trabajador}'
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.content.decode()}")
    
    if response.status_code in [200, 202]:
        print(f"✅ Solicitud rechazada")
    else:
        print("❌ Error rechazando solicitud")
else:
    print("❌ Error creando solicitud para rechazar")

print("\n✅ Pruebas completadas")
