from django.contrib import admin
from .models import PerfilTrabajador

class PerfilAdmin(admin.ModelAdmin):
    list_display = ("id_trabajador", "usuario", "categoria_principal", "estado", "mostrar_rating")

    def mostrar_rating(self, obj):
        return obj.rating_promedio()

admin.site.register(PerfilTrabajador, PerfilAdmin)

