import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from servicios.models import Servicio
from usuarios.models import Usuario
from perfiles.models import PerfilTrabajador

# Obtener usuario Luis
luis = Usuario.objects.filter(nombre__icontains='Luis').first()
if luis:
    print(f"Usuario encontrado: {luis.nombre} (ID: {luis.id_usuario})")
    
    # Obtener perfil de trabajador
    perfil = PerfilTrabajador.objects.filter(usuario=luis).first()
    if perfil:
        print(f"Perfil trabajador encontrado: {perfil.id_trabajador}")
        
        # Obtener servicios
        servicios = Servicio.objects.filter(trabajador=perfil)
        print(f"\nServicios: {servicios.count()}")
        for srv in servicios:
            print(f"  - ID: {srv.id_servicio}, Título: {srv.titulo}, Estado: {srv.estado_publicacion}")
        
        # Borrar el primer servicio
        if servicios.exists():
            srv_a_borrar = servicios.first()
            print(f"\n✗ Borrando: {srv_a_borrar.titulo}")
            srv_a_borrar.delete()
            print("✅ Servicio borrado\n")
            
            # Verificar
            nuevos_servicios = Servicio.objects.filter(trabajador=perfil).count()
            print(f"Servicios restantes: {nuevos_servicios}")
else:
    print("Usuario Luis no encontrado")
