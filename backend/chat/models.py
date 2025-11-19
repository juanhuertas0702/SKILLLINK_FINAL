from django.db import models
from usuarios.models import Usuario
from solicitudes.models import Solicitud

class Mensaje(models.Model):
    id_mensaje = models.AutoField(primary_key=True)

    solicitud = models.ForeignKey(
        Solicitud,
        on_delete=models.CASCADE,
        related_name="mensajes"
    )

    remitente = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name="mensajes_enviados"
    )

    texto = models.TextField(blank=True, null=True)

    archivo = models.FileField(
        upload_to="chat_archivos/",
        blank=True,
        null=True
    )

    fecha_envio = models.DateTimeField(auto_now_add=True)

    leido = models.BooleanField(default=False)

    def __str__(self):
        return f"Msg {self.id_mensaje} | Solicitud {self.solicitud.id_solicitud} | {self.remitente.email}"

    class Meta:
        verbose_name = "Mensaje"
        verbose_name_plural = "Mensajes"
        ordering = ["fecha_envio"]
