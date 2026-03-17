# Test de Seguridad del Panel Web

## Cómo Probar la Autenticación

### 1. Limpiar localStorage del Navegador

Antes de probar, abre la consola del navegador (F12) y ejecuta:

```javascript
localStorage.removeItem('authToken');
location.reload();
```

O simplemente abre el panel en modo incógnito:
```
http://localhost:3000
```

### 2. Verificar que Solicita Contraseña

Al abrir el panel, deberías ver:
- Una pantalla de login con un campo de contraseña
- Un mensaje: "Este panel está protegido. Ingresa la contraseña para continuar."

### 3. Obtener la Contraseña

**Opción A - Ver en los logs del bot:**
```bash
# La contraseña se muestra al iniciar el bot
npm start
```

**Opción B - Ver en el archivo .env:**
```bash
cat .env | grep WEB_PANEL_PASSWORD
```

Tu contraseña actual es: `RAEhYE1ksUWABTtOhc!z`

### 4. Probar Login Exitoso

1. Ingresa la contraseña correcta
2. Deberías ver el panel completo con:
   - Lista de cumpleaños
   - Botón "Cerrar Sesión" en la esquina superior derecha
   - Estado de conexión de WhatsApp

### 5. Probar Login Fallido

1. Limpia localStorage: `localStorage.removeItem('authToken')`
2. Recarga la página
3. Ingresa una contraseña incorrecta: `password123`
4. Deberías ver el mensaje de error: "Contraseña incorrecta"

### 6. Probar Cerrar Sesión

1. Haz login correctamente
2. Haz clic en el botón "🚪 Cerrar Sesión" (esquina superior derecha)
3. Confirma la acción
4. Deberías volver a la pantalla de login

### 7. Probar Acceso Directo a la API

Intenta acceder a la API sin autenticación:

```bash
# Esto debería devolver error 401
curl http://localhost:3000/api/birthdays

# Respuesta esperada:
# {"success":false,"error":"Authentication required","requiresAuth":true}
```

Intenta con la contraseña:

```bash
# Esto debería funcionar
curl -H "Authorization: Bearer RAEhYE1ksUWABTtOhc!z" \
     http://localhost:3000/api/birthdays

# Respuesta esperada:
# {"success":true,"data":[...]}
```

## Cambios Implementados

### Backend (src/web/server.js)
- ✅ Middleware `requireAuth` ahora SIEMPRE requiere autenticación
- ✅ Removida la opción de panel público
- ✅ Todas las rutas de la API están protegidas

### Frontend (src/web/public/index.html)
- ✅ Verifica la contraseña guardada en localStorage con el servidor
- ✅ Si la contraseña es inválida o no existe, muestra login
- ✅ Botón de "Cerrar Sesión" visible después del login
- ✅ Al cerrar sesión, limpia localStorage y recarga la página

### Configuración (src/config/env.js)
- ✅ Genera automáticamente una contraseña segura si no existe
- ✅ Guarda la contraseña en el archivo .env
- ✅ Muestra la contraseña en la consola al iniciar

### Generador de Contraseñas (src/utils/passwordGenerator.js)
- ✅ Genera contraseñas aleatorias de 20 caracteres
- ✅ Usa caracteres alfanuméricos y símbolos especiales
- ✅ Verifica si ya existe una contraseña antes de generar una nueva

## Resultados Esperados

### ✅ CORRECTO: Panel Seguro

- No se puede acceder al panel sin contraseña
- No se pueden ver cumpleaños sin autenticación
- No se pueden hacer cambios sin autenticación
- La contraseña incorrecta muestra error
- Cerrar sesión funciona correctamente

### ❌ INCORRECTO: Panel Inseguro

Si alguno de estos casos funciona, HAY UN PROBLEMA:

- Acceder al panel sin ingresar contraseña
- Ver la lista de cumpleaños sin autenticarse
- Llamar a la API sin el header Authorization
- Usar una contraseña incorrecta y que funcione

## Checklist de Seguridad

- [ ] Al abrir http://localhost:3000 se muestra el login
- [ ] Contraseña incorrecta muestra error
- [ ] Contraseña correcta da acceso al panel
- [ ] Botón "Cerrar Sesión" está visible después del login
- [ ] Cerrar sesión vuelve a pedir contraseña
- [ ] API rechaza peticiones sin Authorization header
- [ ] API acepta peticiones con Authorization header correcto
- [ ] La contraseña se generó automáticamente en .env
- [ ] La contraseña tiene al menos 20 caracteres

## Notas de Seguridad

1. La contraseña se guarda en **localStorage** del navegador
2. localStorage es específico del navegador y dominio
3. Usar modo incógnito SIEMPRE solicita contraseña
4. La contraseña viaja en el header `Authorization: Bearer <password>`
5. Para producción, se recomienda usar HTTPS

## Próximos Pasos (Opcional)

Para mejorar aún más la seguridad:

1. **Implementar JWT tokens** en lugar de contraseña directa
2. **Rate limiting** para prevenir ataques de fuerza bruta
3. **HTTPS obligatorio** en producción
4. **2FA (Two-Factor Authentication)** para acceso crítico
5. **Logs de auditoría** para rastrear accesos
