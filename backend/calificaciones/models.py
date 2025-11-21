from django.db import models
from usuarios.models import Usuario
from perfiles.models import PerfilTrabajador
from solicitudes.models import Solicitud
from django.core.validators import MinValueValidator, MaxValueValidator

class Calificacion(models.Model):
    id_calificacion = models.AutoField(primary_key=True)

    solicitud = models.OneToOneField(
        Solicitud,
        on_delete=models.SET_NULL,
        related_name="calificacion",
        null=True,
        blank=True
    )

    cliente = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name="calificaciones_realizadas"
    )

    trabajador = models.ForeignKey(
        PerfilTrabajador,
        on_delete=models.CASCADE,
        related_name="calificaciones_recibidas"
    )

    puntaje = models.IntegerField(
    validators=[MinValueValidator(1), MaxValueValidator(5)]
    )

    comentario = models.TextField(blank=True, null=True)

    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Calificación {self.puntaje}/5 - {self.cliente.nombre} → {self.trabajador.usuario.nombre}"

    class Meta:
        verbose_name = "Calificación"
        verbose_name_plural = "Calificaciones"
