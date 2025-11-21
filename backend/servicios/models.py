from django.db import models
from django.core.validators import MinValueValidator  
from perfiles.models import PerfilTrabajador

class Servicio(models.Model):

    ESTADOS_PUBLICACION = [
        ("pendiente", "Pendiente"),
        ("aprobado", "Aprobado"),
        ("rechazado", "Rechazado"),
    ]

    id_servicio = models.AutoField(primary_key=True)
    
    trabajador = models.ForeignKey(
        PerfilTrabajador,
        on_delete=models.CASCADE,
        related_name="servicios"
    )

    titulo = models.CharField(max_length=150)
    descripcion = models.TextField()
    categoria = models.CharField(max_length=120)

    precio = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]  #subsanación
    )

    foto_servicio = models.ImageField(upload_to="fotos_servicios/", blank=True, null=True)

    estado_publicacion = models.CharField(
        max_length=20,
        choices=ESTADOS_PUBLICACION,
        default="pendiente"
    )

    palabras_detectadas = models.BooleanField(default=False)

    fecha_publicacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} - {self.trabajador.usuario.nombre}"


