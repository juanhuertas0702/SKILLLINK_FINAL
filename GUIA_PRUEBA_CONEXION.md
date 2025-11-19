# 🚀 Guía de Prueba: Frontend + Backend

## ✅ Checklist de Configuración

Todos los cambios han sido implementados. Aquí está lo que se hizo:

### **✓ Archivos Creados/Modificados:**

1. ✅ `my-app/src/config/api.js` - Configuración de la API
2. ✅ `my-app/.env` - Variables de entorno
3. ✅ `my-app/src/pages/Login.js` - Integración con backend
4. ✅ `my-app/src/pages/Register.js` - Integración con backend
5. ✅ `my-app/src/pages/Home.js` - Carga de servicios desde API
6. ✅ `my-app/src/context/AuthContext.js` - Gestión de autenticación
7. ✅ `my-app/src/App.js` - AuthProvider agregado

---

## 🧪 Pasos para Probar

### **Terminal 1: Backend (Django)**

```powershell
cd d:\JUAN HUERTAS\7 semestre\Ingenieria del software I\PROYECTO_FINAL_SKILLINK\backend
.\.venv\Scripts\activate
python manage.py runserver
```

Verás:
```
Starting development server at http://127.0.0.1:8000/
```

### **Terminal 2: Frontend (React)**

```powershell
cd d:\JUAN HUERTAS\7 semestre\Ingenieria del software I\PROYECTO_FINAL_SKILLINK\my-app
npm start
```

Verás:
```
Compiled successfully!
Webpack compiled with 1 warning.
```

---

## 🧪 Test de Conexión - Paso a Paso

### **Test 1: Ver si se cargan los servicios**

1. Abre `http://localhost:3000` en el navegador
2. Deberías ver la página principal con servicios
3. Si los servicios se cargan = ✅ Conexión funcionando

### **Test 2: Probar Registro**

1. Haz clic en "Registrarse" en el header
2. Completa el formulario:
   - Nombre: Juan Pérez
   - Departamento: Santander
   - Ciudad: Bucaramanga
   - Teléfono: 3001234567
   - Edad: 25
   - Email: test@ejemplo.com
   - Contraseña: Test1234
3. Sube una foto (opcional)
4. Haz clic en "ACEPTAR"
5. Si ves "¡Registro exitoso!" = ✅ El registro funciona

### **Test 3: Probar Login**

1. Después del registro, vas a la página de Login
2. Ingresa:
   - Email: test@ejemplo.com
   - Contraseña: Test1234
3. Haz clic en "INICIAR SESIÓN"
4. Si ves "¡Inicio de sesión exitoso!" = ✅ Login funciona
5. El token se guarda en localStorage

### **Test 4: Verificar Token JWT**

1. Abre las DevTools (F12)
2. Ve a "Application" → "Local Storage"
3. Deberías ver una clave `token` con un valor largo = ✅ Token guardado

---

## 🔧 Si Algo No Funciona

### **Error: "Cannot find module '..."**
```powershell
# En my-app, instala las dependencias faltantes
npm install
```

### **Error: CORS o conexión rechazada**
```
- Verifica que Backend está corriendo en http://localhost:8000
- Verifica que el archivo .env tiene: REACT_APP_API_URL=http://localhost:8000/api
- Recarga la página (Ctrl+Shift+R en navegador)
```

### **Error: "Endpoint not found"**
```
- Verifica que los endpoints existen en Django
- Revisa los urls.py del backend
- El endpoint debe ser /api/usuarios/login/
```

---

## 📝 Endpoints Utilizados

| Función | Endpoint | Método |
|---------|----------|--------|
| Registro | `/api/usuarios/register/` | POST |
| Login | `/api/usuarios/login/` | POST |
| Servicios | `/api/servicios/` | GET |
| Mi Perfil | `/api/perfiles/me/` | GET |

---

## 🎉 Cuando Todo Funciona

- ✅ Servicios cargados desde Django
- ✅ Registro de usuarios funciona
- ✅ Login de usuarios funciona
- ✅ Token JWT se guarda
- ✅ Frontend y Backend conectados

¡Estás listo para continuar con el desarrollo! 🚀
