from django.db import models
from django.conf import settings
# ❌ BORRAMOS ESTAS DOS LÍNEAS QUE CAUSAN EL BUCLE:
# from servicios.models import Servicio
# from perfiles.models import PerfilTrabajador

class Solicitud(models.Model):
    ESTADOS = (
        ('pendiente', 'Pendiente'),
        ('aceptada', 'Aceptada'),
        ('rechazada', 'Rechazada'),
        ('finalizada', 'Finalizada'),
    )

    cliente = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='solicitudes_enviadas'
    )
    
    # ✅ CAMBIO AQUÍ: Usamos comillas 'app.Modelo' en lugar de importar la clase
    servicio = models.ForeignKey(
        'servicios.Servicio', 
        on_delete=models.CASCADE, 
        related_name='solicitudes'
    )
    
    # ✅ CAMBIO AQUÍ: Lo mismo para el perfil del trabajador
    trabajador = models.ForeignKey(
        'perfiles.PerfilTrabajador', 
        on_delete=models.CASCADE, 
        related_name='solicitudes_recibidas'
    )
    
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    mensaje = models.TextField(blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')

    def __str__(self):
        # Nota: Aquí no podemos usar self.servicio.titulo directamente si da problemas, 
        # pero generalmente funciona bien dentro de los métodos.
        return f"Solicitud #{self.id} - {self.estado}"