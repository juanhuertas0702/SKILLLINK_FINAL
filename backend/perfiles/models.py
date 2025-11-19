from django.db import models
from usuarios.models import Usuario

class PerfilTrabajador(models.Model):
    id_trabajador = models.AutoField(primary_key=True)
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE)

    descripcion = models.TextField(blank=True, null=True)
    experiencia = models.TextField(blank=True, null=True)
    habilidades = models.TextField(blank=True, null=True)
    categoria_principal = models.CharField(max_length=120)
    estado = models.CharField(max_length=20, default="activo")  # activo/inactivo

    def rating_promedio(self):
        from django.db.models import Avg
        resultado = self.calificaciones_recibidas.aggregate(Avg("puntaje"))["puntaje__avg"]
        return round(resultado, 2) if resultado else 0

    def __str__(self):
        return f"Perfil de {self.usuario.nombre}"
    
    class Meta:
        verbose_name = "Perfil de trabajador"
        verbose_name_plural = "Perfiles de trabajador"