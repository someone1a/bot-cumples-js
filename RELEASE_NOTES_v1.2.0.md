# Release Notes v1.2.0 - WhatsApp Birthday Bot

**Fecha de lanzamiento:** 16 de Marzo de 2024

## 🎉 Nuevas Características Principales

### 📱 Comandos Mejorados

#### 1. Comando `!ver-cumples` - Ver Cumpleaños por Fecha

Nuevo comando para visualizar todos los cumpleaños ordenados cronológicamente con indicadores visuales:

```
!ver-cumples
```

**Características:**
- ✅ **Indicador visual**: Muestra ✅ para cumpleaños que ya pasaron este año
- ⏳ **Indicador de próximos**: Muestra ⏳ para cumpleaños pendientes
- 📅 **Ordenamiento por fecha**: Todos los cumpleaños se muestran ordenados por mes y día
- 📊 **Información completa**: Muestra nombre, fecha, grupo y días restantes

**Ejemplo de respuesta:**
```
📅 Cumpleaños por Fecha:

✅ Juan Pérez - 15/05
   👥 Familia
   Ya pasó este año

⏳ María González - 22/07
   👥 Amigos
   En 45 días
```

#### 2. Comando `!agregar` Simplificado - Agregar Rápido

Nuevo formato simplificado para agregar cumpleaños más rápidamente:

```
!agregar 15/05 Juan Pérez
```

**Características:**
- ⚡ **Super rápido**: Solo necesitas día/mes y nombre
- 🎯 **Detección automática**: Usa el grupo donde envías el comando
- 📝 **Formato flexible**: Acepta `/` o `-` como separador (15/05 o 15-05)
- ✨ **Año automático**: Usa año 2000 por defecto (solo importa día y mes)

**Comparación:**

**Antes:**
```
/agregar Juan Pérez|1990-05-15|5491112345678|Familia
```

**Ahora:**
```
!agregar 15/05 Juan Pérez
```

**Ambos formatos siguen funcionando** - Usa el que prefieras según la situación.

### 🌐 Interfaz Web Moderna

¡Nueva interfaz web completamente funcional para gestionar cumpleaños!

#### Acceso

Una vez iniciado el bot:
```
http://localhost:3000
```

#### Características de la Interfaz

1. **Panel de Control Visual**
   - Vista de todos los cumpleaños en tarjetas
   - Diseño moderno con gradiente púrpura
   - Tarjetas blancas con sombras suaves
   - Completamente responsive (funciona en móviles)

2. **Gestión Completa**
   - ➕ Agregar cumpleaños con formulario visual
   - ✏️ Editar cualquier campo de cumpleaños existentes
   - 🗑️ Eliminar con confirmación
   - ✓/✗ Activar/desactivar sin eliminar

3. **Indicadores Visuales**
   - **Badge Verde**: Cumpleaños activo
   - **Badge Rojo**: Cumpleaños inactivo
   - **Botones de acción** con colores intuitivos

4. **Actualización Automática**
   - Se refresca cada 30 segundos
   - Sincronización con la base de datos
   - No necesitas recargar manualmente

5. **Formulario Inteligente**
   - Validación de campos en tiempo real
   - Placeholder con ejemplos
   - Mensajes de error claros
   - Tip visual del comando rápido de WhatsApp

### 🔌 API REST Completa

Nueva API REST para integraciones y automatización:

#### Endpoints de Cumpleaños

```http
GET    /api/birthdays          # Listar todos
GET    /api/birthdays/:id      # Obtener uno específico
POST   /api/birthdays          # Agregar nuevo
PUT    /api/birthdays/:id      # Actualizar
DELETE /api/birthdays/:id      # Eliminar
PATCH  /api/birthdays/:id/toggle # Activar/desactivar
```

#### Endpoints de Grupos

```http
GET  /api/groups            # Listar grupos
POST /api/groups/config     # Configurar grupo
```

#### Health Check

```http
GET /api/health             # Estado del servidor
```

**Ejemplo de uso:**

```bash
# Agregar cumpleaños vía API
curl -X POST http://localhost:3000/api/birthdays \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "birth_date": "1990-05-15",
    "group_id": "5491112345678",
    "group_name": "Familia"
  }'
```

## 🔄 Mejoras

### Comandos con `!` y `/`

Ahora **todos los comandos** soportan ambos prefijos:

- `!ping` = `/ping`
- `!status` = `/status`
- `!ver-cumples`
- `!agregar`
- `!help` = `/help`

### Mensaje con Emoji de Robot

Todos los mensajes de cumpleaños ahora comienzan con el emoji 🤖 por defecto:

```
🤖 ¡Feliz cumpleaños Juan Pérez! 🎂🎉
```

Personalizable editando el `message_template`.

### Comando `/help` Actualizado

El comando de ayuda ahora incluye:
- Nota sobre soporte de `/` y `!`
- Nuevo comando `!ver-cumples`
- Formato rápido de `!agregar`
- Leyenda de íconos (✅ = ya pasó, ⏳ = próximo)

## 📦 Archivos Nuevos

```
src/web/server.js                    # Servidor Express con API REST
src/web/public/index.html            # Interfaz web
WEB_GUIDE.md                         # Guía completa de la interfaz web
RELEASE_NOTES_v1.2.0.md              # Este archivo
```

## 📝 Archivos Modificados

```
src/index.js                         # Integración del servidor web
src/config/env.js                    # Variables WEB_ENABLED y WEB_PORT
src/bot/commands.js                  # Nuevos comandos y mejoras
src/bot/handlers.js                  # Soporte para ! prefix (ya estaba)
.env.example                         # Nuevas variables de configuración
package.json                         # Versión 1.2.0, dependencias express/cors
README.md                            # Documentación actualizada
CHANGELOG.md                         # Historial de versiones
```

## ⚙️ Configuración

### Nuevas Variables de Entorno

```env
# Web Interface
WEB_ENABLED=true      # Habilitar/deshabilitar interfaz web
WEB_PORT=3000         # Puerto del servidor web
```

### Actualizar desde v1.1.0

1. **Detener el bot**
   ```bash
   npm run pm2:stop
   # o
   docker-compose down
   ```

2. **Actualizar código**
   ```bash
   git pull
   # o descargar nueva versión
   ```

3. **Instalar nuevas dependencias**
   ```bash
   npm install
   ```

4. **Actualizar .env** (opcional)
   ```env
   WEB_ENABLED=true
   WEB_PORT=3000
   ```

5. **Reiniciar el bot**
   ```bash
   npm run pm2:start
   # o
   docker-compose up -d
   ```

6. **Acceder a la interfaz web**
   ```
   http://localhost:3000
   ```

## 💡 Casos de Uso

### Caso 1: Agregar Rápido desde Grupo

Estás en el grupo "Familia" y quieres agregar un cumpleaños:

```
!agregar 15/05 Juan Pérez
```

El bot automáticamente usa el grupo actual.

### Caso 2: Revisar Cumpleaños Pendientes

Quieres ver qué cumpleaños ya pasaron y cuáles faltan:

```
!ver-cumples
```

Te muestra todo ordenado con indicadores visuales.

### Caso 3: Gestión Visual desde PC

Tienes que agregar 20 cumpleaños:

1. Abre `http://localhost:3000`
2. Usa el formulario para agregar rápidamente
3. Edita/elimina fácilmente con clicks
4. Activa/desactiva según necesites

### Caso 4: Integración con Otro Sistema

Quieres sincronizar cumpleaños desde tu CRM:

```python
import requests

birthdays = get_birthdays_from_crm()

for birthday in birthdays:
    requests.post('http://localhost:3000/api/birthdays', json={
        'name': birthday['name'],
        'birth_date': birthday['date'],
        'group_id': '5491112345678',
        'group_name': 'Clientes'
    })
```

## 🔒 Seguridad

### Interfaz Web Local por Defecto

La interfaz web solo es accesible localmente (`localhost`) por defecto.

Para acceso remoto seguro, considera:

1. **Túnel SSH**
   ```bash
   ssh -L 3000:localhost:3000 usuario@servidor
   ```

2. **VPN** para acceso seguro

3. **Reverse Proxy** con autenticación (Nginx + Basic Auth)

⚠️ **Importante**: No expongas la interfaz directamente a Internet sin autenticación.

## 🐛 Correcciones

- Normalización de comandos con `!` ahora funciona correctamente
- Mejor validación de formato de fecha en agregar simple
- Mensajes de error más claros en todos los comandos
- Manejo correcto de cierre del servidor web

## 📊 Estadísticas de la Versión

- **Nuevas funcionalidades**: 3 principales
- **Nuevos comandos**: 2 (`!ver-cumples`, `!agregar` simplificado)
- **Nuevos archivos**: 3
- **Archivos modificados**: 9
- **Líneas de código agregadas**: ~600
- **API endpoints**: 8 nuevos
- **Mejoras de UX**: Múltiples

## 🚀 Próximas Versiones

Planeado para v1.3.0:

- 🔐 Autenticación en interfaz web
- 🔍 Búsqueda y filtros en la interfaz
- 📊 Gráficos y estadísticas
- 📤 Exportar a CSV/Excel
- 🌍 Múltiples idiomas
- 📱 PWA (Progressive Web App)
- 🎨 Temas personalizables

## 📞 Soporte

### Documentación

- [README.md](README.md) - Documentación principal
- [WEB_GUIDE.md](WEB_GUIDE.md) - Guía de la interfaz web
- [COMMANDS_EXAMPLES.md](COMMANDS_EXAMPLES.md) - Ejemplos de comandos
- [DOCKER_GUIDE.md](DOCKER_GUIDE.md) - Guía de Docker

### Problemas Conocidos

Ninguno reportado en esta versión.

### Reportar Bugs

Si encuentras un problema:

1. Revisa la documentación
2. Consulta los logs: `npm run pm2:logs` o `docker-compose logs -f`
3. Reporta en GitHub Issues con:
   - Versión del bot (1.2.0)
   - Método de instalación (Docker/Nativo)
   - Logs del error
   - Pasos para reproducir

## 🙏 Agradecimientos

Gracias a todos los usuarios que solicitaron estas funcionalidades.

---

**Versión:** 1.2.0
**Fecha:** 16 de Marzo de 2024
**Compatibilidad:** Node.js 18+, Docker 20.10+
**Migración desde v1.1.0:** Simple (ver sección "Actualizar desde v1.1.0")
