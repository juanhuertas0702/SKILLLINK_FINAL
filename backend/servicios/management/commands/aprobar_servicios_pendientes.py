from django.core.management.base import BaseCommand
from servicios.models import Servicio
from moderacion.models import Moderacion

class Command(BaseCommand):
    help = 'Aprueba automáticamente todos los servicios pendientes sin palabras prohibidas'

    def handle(self, *args, **options):
        # Obtener todos los servicios pendientes
        servicios_pendientes = Servicio.objects.filter(
            estado_publicacion="pendiente",
            palabras_detectadas=False
        )
        
        count = 0
        for servicio in servicios_pendientes:
            # Cambiar estado a aprobado
            servicio.estado_publicacion = "aprobado"
            servicio.save()
            
            # Actualizar o crear el registro de moderación
            Moderacion.objects.filter(servicio=servicio).update(estado="aprobado")
            
            count += 1
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Aprobado: "{servicio.titulo}" (ID: {servicio.id_servicio})'
                )
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'\n✅ Total servicios aprobados: {count}')
        )
