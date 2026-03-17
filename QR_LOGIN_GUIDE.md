# Guía de Login con Código QR

## Nuevo Sistema de Autenticación

El panel web ahora soporta autenticación mediante código QR, haciendo más fácil y rápido el acceso al panel de control.

## Cómo Funciona

### 1. Acceder al Panel Web

Abre tu navegador y ve a:
```
http://localhost:3000
```

O si estás en un servidor remoto:
```
http://TU_IP_SERVIDOR:3000
```

### 2. Ver el Código QR

Al cargar la página, verás automáticamente un código QR en la pantalla de login.

### 3. Escanear el Código

Tienes dos opciones para escanear:

**Opción A: Con cualquier app de cámara**
1. Abre la cámara de tu teléfono
2. Apunta al código QR en la pantalla
3. Toca la notificación que aparece
4. Se abrirá una página de validación

**Opción B: Con WhatsApp (escanear desde chat)**
1. Abre WhatsApp
2. Toca el ícono de adjuntar (📎)
3. Selecciona "Documento" o "Cámara"
4. Apunta al código QR
5. Se abrirá el enlace de validación

### 4. Validación Automática

Al abrir el enlace del QR:
- Verás el mensaje "✓ Autenticación exitosa"
- Puedes cerrar esa ventana/pestaña
- El panel web se actualizará automáticamente
- Tendrás acceso completo durante 24 horas

## Características del Login con QR

### Seguridad
- Cada QR contiene un token único y temporal
- El código expira en 5 minutos
- Las sesiones duran 24 horas
- El QR se regenera automáticamente al expirar

### Ventajas
- No necesitas escribir contraseña
- Acceso más rápido desde móvil
- Ideal para tablets y dispositivos táctiles
- No guarda contraseñas en el navegador (más seguro)

### Temporizador
- El QR muestra un contador regresivo (5:00)
- Cuando expira, aparece un botón para generar uno nuevo
- Puedes generar QRs ilimitados

## Método Alternativo: Contraseña Manual

Si prefieres usar contraseña tradicional:

1. En la pantalla de login, haz clic en **"Usar contraseña en su lugar"**
2. Ingresa la contraseña (la puedes ver con: `cat .env | grep WEB_PANEL_PASSWORD`)
3. El sistema recordará tu sesión en este navegador

Para volver al QR desde el login de contraseña:
- Haz clic en **"Usar código QR en su lugar"**

## Gestión de Sesión

### Ver tu Sesión Actual
- Una vez autenticado, verás el botón "🚪 Cerrar Sesión" en la esquina superior derecha

### Cerrar Sesión
1. Haz clic en "🚪 Cerrar Sesión"
2. Confirma la acción
3. Volverás a la pantalla de login

### Sesión Expirada
Si tu sesión expira (después de 24 horas):
- Se te pedirá autenticarte nuevamente
- Puedes usar QR o contraseña
- Tus datos están protegidos

## Modo Incógnito

Si usas modo incógnito del navegador:
- SIEMPRE se pedirá autenticación
- No se guarda ninguna sesión
- Útil para acceso temporal desde dispositivos compartidos

## Problemas Comunes

### El QR no se carga
- Verifica que el bot esté iniciado (`npm start`)
- Revisa que el puerto 3000 esté disponible
- Recarga la página (F5)

### El QR expiró
- Haz clic en "Generar nuevo código"
- El nuevo QR aparecerá inmediatamente

### La validación no funciona
- Verifica tu conexión a internet
- Asegúrate de que el enlace se abra en un navegador
- Intenta con el método de contraseña alternativo

### No puedo escanear el QR
- Aumenta el brillo de la pantalla donde aparece el QR
- Aleja o acerca la cámara para mejor enfoque
- Usa el método de contraseña como alternativa

## Seguridad y Privacidad

### El QR contiene:
- URL de validación única
- Token temporal (expira en 5 minutos)
- Tu contraseña encriptada en el enlace

### No compartas:
- Capturas de pantalla del QR
- El enlace de validación con nadie
- Tu contraseña con terceros

### Buenas Prácticas:
- Cierra sesión al terminar
- Usa modo incógnito en dispositivos compartidos
- Cambia la contraseña periódicamente
- Mantén tu .env seguro

## Ver Grupos de WhatsApp

Una vez autenticado en el panel web, verás:

### Selector de Grupos
- Lista desplegable con todos tus grupos
- Número de participantes de cada grupo
- Selección visual sin necesidad de copiar IDs

### Lista Detallada de Grupos
Debajo del formulario encontrarás:
- **Nombre de cada grupo**
- **ID del grupo** (en formato código)
- **Número de participantes**

### Copiar Group IDs
1. Busca el grupo en la lista
2. El ID está en formato de código (fondo blanco)
3. Haz triple clic sobre el ID para seleccionarlo
4. Copia con Ctrl+C (o Cmd+C en Mac)
5. Usa el ID en comandos de WhatsApp si lo necesitas

## Comandos Útiles

### Ver la contraseña actual
```bash
cat .env | grep WEB_PANEL_PASSWORD
```

### Cambiar la contraseña
```bash
nano .env
# Edita la línea WEB_PANEL_PASSWORD
# Guarda con Ctrl+O, Enter, Ctrl+X
```

### Reiniciar el bot
```bash
npm start
# o con PM2:
pm2 restart whatsapp-birthday-bot
```

## Soporte

Si tienes problemas:
1. Revisa los logs del bot: `pm2 logs whatsapp-birthday-bot`
2. Verifica que el bot esté conectado a WhatsApp
3. Intenta reiniciar el bot: `pm2 restart whatsapp-birthday-bot`
4. Usa el método de contraseña como alternativa

## Más Información

- [Guía Completa del Panel Web](WEB_GUIDE.md)
- [Guía de Seguridad](SECURITY.md)
- [Documentación de la API](WEB_GUIDE.md#-api-rest)
