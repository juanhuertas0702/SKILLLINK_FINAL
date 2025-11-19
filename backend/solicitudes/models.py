from django.db import models
from usuarios.models import Usuario
from perfiles.models import PerfilTrabajador
from servicios.models import Servicio

class Solicitud(models.Model):

    ESTADOS = [
        ("pendiente", "Pendiente"),
        ("aceptada", "Aceptada"),
        ("rechazada", "Rechazada"),
        ("completada", "Completada"),
        ("cancelada", "Cancelada"),
    ]

    id_solicitud = models.AutoField(primary_key=True)

    cliente = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name="solicitudes_realizadas"
    )

    trabajador = models.ForeignKey(
        PerfilTrabajador,
        on_delete=models.CASCADE,
        related_name="solicitudes_recibidas"
    )

    servicio = models.ForeignKey(
        Servicio,
        on_delete=models.CASCADE,
        related_name="solicitudes"
    )

    dia = models.CharField(max_length=20, blank=True, null=True)  # ej: 'lunes'
    hora_inicio = models.TimeField(blank=True, null=True)
    hora_fin = models.TimeField(blank=True, null=True)
    fecha_solicitud = models.DateTimeField(auto_now_add=True)

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default="pendiente"
    )

    def __str__(self):
        return f"Solicitud {self.id_solicitud} - {self.cliente.nombre} → {self.trabajador.usuario.nombre}"
    
    class Meta:
        verbose_name = "Solicitud"
        verbose_name_plural = "Solicitudes"

