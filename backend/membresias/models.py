from django.db import models
from perfiles.models import PerfilTrabajador
from django.utils import timezone

class Membresia(models.Model):

    PLANES = [
        ("free", "Free"),
        ("premium", "Premium"),
    ]

    id_membresia = models.AutoField(primary_key=True)

    trabajador = models.OneToOneField(
        PerfilTrabajador,
        on_delete=models.CASCADE,
        related_name="membresia"
    )

    plan = models.CharField(max_length=20, choices=PLANES, default="free")

    fecha_inicio = models.DateTimeField(default=timezone.now)
    fecha_fin = models.DateTimeField(blank=True, null=True)

    estado = models.CharField(
        max_length=20,
        default="activo"  # activo / vencido
    )

    def __str__(self):
        return f"{self.trabajador.usuario.nombre} — {self.plan}"

    class Meta:
        verbose_name = "Membresía"
        verbose_name_plural = "Membresías"

