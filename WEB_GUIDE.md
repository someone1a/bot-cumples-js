# Guía de la Interfaz Web - WhatsApp Birthday Bot

El bot incluye una interfaz web moderna para gestionar cumpleaños de forma visual con autenticación opcional.

## 🌐 Acceso

Una vez iniciado el bot, la interfaz web estará disponible en:

```
http://localhost:3000
```

Si estás en un servidor remoto, reemplaza `localhost` con la IP de tu servidor.

## 🔐 Seguridad del Panel Web

### Autenticación con Código QR

**El panel web SIEMPRE requiere autenticación para proteger tus datos.**

El bot ofrece DOS métodos de autenticación:

#### 1. Código QR (Recomendado)

Al abrir el panel web, se mostrará automáticamente un código QR:

1. Escanea el código QR con tu teléfono
2. El código contiene un enlace seguro con tu contraseña
3. Al abrir el enlace, se validará automáticamente tu sesión
4. El código QR expira en 5 minutos
5. Tu sesión durará 24 horas desde la autenticación

**Ventajas del QR:**
- No necesitas escribir la contraseña manualmente
- Más rápido y cómodo desde el móvil
- La sesión se valida automáticamente

#### 2. Contraseña Manual (Alternativa)

Si prefieres usar contraseña:

1. Haz clic en "Usar contraseña en su lugar"
2. Ingresa la contraseña generada automáticamente
3. La contraseña se guarda en tu navegador para futuros accesos

**Ver tu contraseña:**
```bash
cat .env | grep WEB_PANEL_PASSWORD
```

**Cambiar la contraseña:**
Edita el archivo `.env` y cambia el valor de `WEB_PANEL_PASSWORD`:
```bash
WEB_PANEL_PASSWORD=tu_nueva_contraseña_segura
```

### Gestión de Sesión

**Cerrar sesión:**
- Usa el botón "🚪 Cerrar Sesión" en la esquina superior derecha del panel
- También puedes usar modo incógnito del navegador para no guardar la sesión

**Importante:**
- La autenticación es OBLIGATORIA, no puede desactivarse
- El código QR contiene tu contraseña de forma segura
- Las sesiones QR duran 24 horas desde la autenticación
- Si pierdes la contraseña, puedes verla en el archivo `.env`
- Puedes alternar entre QR y contraseña en cualquier momento

### Control de Acceso a Comandos del Bot

Los comandos del bot están protegidos por una lista de números autorizados:

```bash
# En el archivo .env
AUTHORIZED_NUMBERS=5491112345678,5491187654321
```

Solo los números en esta lista pueden ejecutar comandos del bot. Cualquier otro número recibirá un mensaje de "No autorizado".

## ✨ Características

### 📱 Visualización del Código QR

- El código QR aparece automáticamente en el panel cuando el bot no está conectado
- Se actualiza cada 3 segundos
- Instrucciones paso a paso para vincular WhatsApp
- Desaparece automáticamente cuando el bot se conecta exitosamente

### 📋 Panel de Control Visual

- **Indicador de conexión** en tiempo real (Conectado/Desconectado)
- **Lista completa** de todos los cumpleaños registrados
- **Ordenamiento** por mes y día
- **Indicadores de estado** (Activo/Inactivo)
- **Búsqueda rápida** (próximamente)
- **Actualización automática** cada 30 segundos

### ➕ Agregar Cumpleaños

Dos formas de agregar cumpleaños:

1. **Desde la interfaz web** - Formulario completo con selector de grupos de WhatsApp
2. **Desde WhatsApp** - Comando rápido `!agregar 15/05 Juan Pérez`

**Ventaja del selector de grupos:**
- Ya no necesitas saber el ID del grupo
- Selecciona visualmente de una lista de tus grupos de WhatsApp
- Muestra el número de participantes de cada grupo

### 📱 Lista de Grupos de WhatsApp

El panel web muestra una lista completa de todos tus grupos de WhatsApp con información detallada:

- **Nombre del grupo**
- **ID del grupo** (útil para usar en comandos directos)
- **Número de participantes**

Esta lista aparece debajo del formulario de agregar cumpleaños y se actualiza automáticamente cuando el bot se conecta.

**Cómo copiar un Group ID:**
1. Busca el grupo en la lista
2. El ID aparece en formato de código (fondo blanco)
3. Puedes copiar el ID directamente desde ahí
4. Útil si necesitas usar comandos desde WhatsApp como `!agregar 15/05 Juan Pérez [GROUP_ID]`

### ✏️ Editar Cumpleaños

- Click en el botón ✏️ para editar
- Los campos se cargarán automáticamente
- Modifica lo que necesites y guarda

### 🗑️ Eliminar Cumpleaños

- Click en el botón 🗑️
- Confirmación antes de eliminar
- Sin recuperación (usa backup antes)

### ✓/✗ Activar/Desactivar

- Click en ✓ para desactivar
- Click en ✗ para reactivar
- No elimina el cumpleaños, solo lo pausa

## 🎨 Interfaz

### Colores

- **Gradiente verde WhatsApp** - Fondo moderno
- **Tarjetas blancas** - Contenido limpio
- **Badges de estado**:
  - Verde = Activo/Conectado
  - Rojo = Inactivo/Desconectado

### Botones

- **Verde** - Agregar nuevo (colores de WhatsApp)
- **Amarillo** - Editar
- **Rojo** - Eliminar
- **Verde/Gris** - Activar/Desactivar

## 📱 Responsive

La interfaz funciona perfectamente en:

- 💻 Desktop
- 📱 Tablets
- 📱 Móviles

## 🔧 Configuración

### Puerto del Servidor Web

Por defecto: `3000`

Para cambiar el puerto, edita `.env`:

```env
WEB_PORT=8080
```

### Deshabilitar Interfaz Web

Si no quieres la interfaz web, edita `.env`:

```env
WEB_ENABLED=false
```

## 🔒 Seguridad

### Acceso Local

Por defecto, el servidor solo es accesible localmente (`localhost`).

### Acceso Remoto

Si necesitas acceso remoto, considera:

1. **Túnel SSH**:
```bash
ssh -L 3000:localhost:3000 usuario@servidor
```

2. **Reverse Proxy** (Nginx/Apache):
```nginx
location /birthday-bot {
    proxy_pass http://localhost:3000;
}
```

3. **VPN** para acceso seguro

⚠️ **Importante**: No expongas la interfaz directamente a Internet sin autenticación.

## 📊 API REST

La interfaz web usa una API REST que también puedes usar directamente.

### Endpoints Disponibles

#### Obtener todos los cumpleaños
```
GET /api/birthdays
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "birth_date": "1990-05-15",
      "group_id": "5491112345678",
      "group_name": "Familia",
      "enabled": 1
    }
  ]
}
```

#### Obtener un cumpleaños específico
```
GET /api/birthdays/:id
```

#### Agregar cumpleaños
```
POST /api/birthdays
Content-Type: application/json

{
  "name": "Juan Pérez",
  "birth_date": "1990-05-15",
  "group_id": "5491112345678",
  "group_name": "Familia",
  "message_template": "🤖 ¡Feliz cumpleaños {name}! 🎂"
}
```

#### Actualizar cumpleaños
```
PUT /api/birthdays/:id
Content-Type: application/json

{
  "name": "Juan Carlos Pérez",
  "group_name": "Familia Extendida"
}
```

#### Eliminar cumpleaños
```
DELETE /api/birthdays/:id
```

#### Activar/Desactivar cumpleaños
```
PATCH /api/birthdays/:id/toggle
Content-Type: application/json

{
  "enabled": true
}
```

#### Obtener grupos
```
GET /api/groups
```

#### Configurar grupo
```
POST /api/groups/config
Content-Type: application/json

{
  "group_id": "5491112345678",
  "group_name": "Familia",
  "send_hour": 9,
  "timezone": "America/Argentina/Cordoba"
}
```

#### Health Check
```
GET /api/health
```

## 💡 Tips de Uso

### 1. Backup antes de ediciones masivas

Antes de hacer muchos cambios, haz backup desde WhatsApp:
```
/backup
```

### 2. Usa el formato rápido desde WhatsApp

Para agregar rápido:
```
!agregar 15/05 Juan Pérez
```

### 3. Edita desde la web

Para cambios complejos (mensajes personalizados, etc.), usa la interfaz web.

### 4. Verifica el estado

Usa `!ver-cumples` en WhatsApp para ver qué cumpleaños ya pasaron este año.

## 🐛 Solución de Problemas

### No puedo acceder a la interfaz

1. Verifica que el bot esté corriendo
2. Verifica el puerto en `.env`
3. Prueba: `http://localhost:3000` (reemplaza 3000 con tu puerto)
4. Revisa los logs: `npm run pm2:logs` o `docker-compose logs -f`

### No aparecen los cumpleaños

1. Verifica que hay cumpleaños en la base de datos
2. Refresca la página (F5)
3. Abre la consola del navegador (F12) para ver errores

### Error al agregar/editar

1. Completa todos los campos requeridos (*)
2. Verifica el formato de la fecha (YYYY-MM-DD)
3. Verifica el formato del Group ID (solo números)

### La página está en blanco

1. Limpia caché del navegador
2. Abre en modo incógnito
3. Revisa los logs del servidor

## 🚀 Características Futuras

Planeadas para próximas versiones:

- 🔐 Autenticación con usuario/contraseña
- 🔍 Búsqueda y filtros avanzados
- 📊 Estadísticas y reportes
- 🌍 Múltiples idiomas
- 📤 Exportar a CSV/Excel
- 📥 Importar desde CSV/Excel
- 🎨 Temas personalizables
- 📱 App móvil nativa

## 📞 Soporte

Si tienes problemas:

1. Revisa esta guía
2. Consulta [README.md](README.md)
3. Revisa los logs del bot
4. Reporta en GitHub Issues

---

**Versión:** 1.2.0
**Última actualización:** 16 de Marzo de 2024
