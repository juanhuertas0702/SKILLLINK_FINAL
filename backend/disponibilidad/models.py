from django.db import models
from perfiles.models import PerfilTrabajador

class Disponibilidad(models.Model):
    DIAS = [
        ("lunes", "Lunes"),
        ("martes", "Martes"),
        ("miercoles", "Miércoles"),
        ("jueves", "Jueves"),
        ("viernes", "Viernes"),
        ("sabado", "Sábado"),
        ("domingo", "Domingo"),
    ]

    id_disponibilidad = models.AutoField(primary_key=True)

    trabajador = models.ForeignKey(
        PerfilTrabajador,
        on_delete=models.CASCADE,
        related_name="disponibilidades"
    )

    dia = models.CharField(max_length=20, choices=DIAS)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()

    def __str__(self):
        return f"{self.trabajador.usuario.nombre} - {self.dia}"
    
    class Meta:
        verbose_name = "Disponibilidad"
        verbose_name_plural = "Disponibilidades"