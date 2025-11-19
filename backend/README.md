# 🚀 SkillLink - Backend API

API REST para la plataforma SkillLink, una aplicación de servicios profesionales que conecta trabajadores con clientes.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecutar el Proyecto](#ejecutar-el-proyecto)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Endpoints Principales](#endpoints-principales)
- [Autenticación](#autenticación)
- [Modelos de Datos](#modelos-de-datos)
- [Documentación API](#documentación-api)
- [Flujo de Negocio](#flujo-de-negocio)
- [Roles de Usuario](#roles-de-usuario)

---

## ✨ Características

- ✅ Autenticación con JWT (local y Google OAuth)
- ✅ Sistema de perfiles de trabajadores con calificaciones
- ✅ Publicación de servicios con moderación automática
- ✅ Membresías (Free con límite de 3 servicios, Premium ilimitado)
- ✅ Sistema de solicitudes con validación de disponibilidad
- ✅ Chat en tiempo real entre cliente y trabajador
- ✅ Sistema de calificaciones (1-5 estrellas)
- ✅ Panel de moderación para administradores
- ✅ Endpoints públicos para usuarios sin autenticación
- ✅ Documentación automática con Swagger/OpenAPI

---

## 🛠 Tecnologías

- **Python** 3.10+
- **Django** 5.2
- **Django REST Framework** (DRF)
- **JWT** (Simple JWT)
- **PostgreSQL** / SQLite (desarrollo)
- **Google OAuth2**
- **drf-yasg** (Swagger/OpenAPI)
- **django-filter**
- **django-cors-headers**

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Python 3.10 o superior**: [Descargar Python](https://www.python.org/downloads/)
- **pip** (viene con Python)
- **Git**: [Descargar Git](https://git-scm.com/downloads)
- **PostgreSQL** (opcional, usa SQLite para desarrollo)

---

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/skilllink-backend.git
cd skilllink-backend
```

### 2. Crear entorno virtual

**Windows:**
```bash
python -m venv .venv
.venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Crear archivo de dependencias (si no existe)

```bash
pip freeze > requirements.txt
```

**Dependencias principales:**
