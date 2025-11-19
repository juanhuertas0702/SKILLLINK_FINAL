from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Usuario

class UsuarioAdmin(BaseUserAdmin):
    model = Usuario
    list_display = ("email", "nombre", "rol_base", "estado", "fecha_registro")
    list_filter = ("rol_base", "estado", "metodo_registro")
    ordering = ("-fecha_registro",)
    search_fields = ("email", "nombre")  # Ya lo tienes - correcto

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Información personal", {"fields": ("nombre", "fecha_nacimiento", "ciudad", "foto_perfil")}),
        ("Permisos", {"fields": ("rol_base", "estado", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Información Adicional", {"fields": ("metodo_registro", "fecha_registro")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "nombre", "password1", "password2", "rol_base"),
        }),
    )

    readonly_fields = ("fecha_registro",)

admin.site.register(Usuario, UsuarioAdmin)

