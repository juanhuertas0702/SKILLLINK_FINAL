from django.db import models
from usuarios.models import Usuario
from servicios.models import Servicio

class Moderacion(models.Model):

    ESTADOS = [
        ("pendiente", "Pendiente"),
        ("aprobado", "Aprobado"),
        ("rechazado", "Rechazado"),
    ]

    id_moderacion = models.AutoField(primary_key=True)

    servicio = models.OneToOneField(
        Servicio,
        on_delete=models.CASCADE,
        related_name="moderacion"
    )

    palabras_detectadas = models.TextField(blank=True, null=True)

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default="pendiente"
    )

    admin = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"rol_base": "admin"},
        related_name="moderaciones_realizadas"
    )

    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Moderación de {self.servicio.titulo} — {self.estado}"

    class Meta:
        verbose_name = "Moderación"
        verbose_name_plural = "Moderaciones"

