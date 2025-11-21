from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

# ---------------------------------------
# Custom User Manager
# ---------------------------------------

class UsuarioManager(BaseUserManager):
    def create_user(self, email, nombre, password=None, **extra_fields):
        if not email:
            raise ValueError("El usuario debe tener un email")

        email = self.normalize_email(email)
        user = self.model(email=email, nombre=nombre, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nombre, password, **extra_fields):
        extra_fields.setdefault("rol_base", "admin")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, nombre, password, **extra_fields)


# ---------------------------------------
# Modelo Usuario
# ---------------------------------------

class Usuario(AbstractBaseUser, PermissionsMixin):
    ROL_USUARIO = "usuario"
    ROL_ADMIN = "admin"

    ROLES = [
        (ROL_USUARIO, "Usuario"),
        (ROL_ADMIN, "Administrador"),
    ]

    ESTADOS = [
        ("activo", "Activo"),
        ("bloqueado", "Bloqueado"),
        ("eliminado", "Eliminado"),
    ]

    id_usuario = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    # Cambiar 'contraseña' por 'password' - Django lo requiere internamente
    password = models.CharField(max_length=255, blank=True)

    rol_base = models.CharField(max_length=20, choices=ROLES, default=ROL_USUARIO)

    metodo_registro = models.CharField(max_length=20, default="local")  # local/google

    foto_perfil = models.ImageField(upload_to="fotos_perfiles/", blank=True, null=True)

    fecha_nacimiento = models.DateField(blank=True, null=True)
    ciudad = models.CharField(max_length=120, blank=True, null=True)
    departamento = models.CharField(max_length=120, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    edad = models.IntegerField(blank=True, null=True)

    estado = models.CharField(max_length=20, choices=ESTADOS, default="activo")

    fecha_registro = models.DateTimeField(auto_now_add=True)

    # campos necesarios para que Django admin funcione
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UsuarioManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nombre"]

    def __str__(self):
        return f"{self.nombre} ({self.email})"
