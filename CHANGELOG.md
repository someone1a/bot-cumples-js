# Changelog

## [1.3.0] - 2024-03-17

### Nuevas Características

- ✅ **Autenticación con Código QR**
  - Login con código QR para acceso rápido al panel web
  - Escanea el código con tu móvil y accede instantáneamente
  - Sesiones de 24 horas con tokens seguros
  - Temporizador de expiración de 5 minutos
  - Alternativa de login con contraseña manual
  - Cambio dinámico entre QR y contraseña

- ✅ **Visualización de Group IDs en Panel Web**
  - Lista completa de grupos de WhatsApp con sus IDs
  - Información detallada: nombre, ID y número de participantes
  - IDs en formato copiable para uso en comandos
  - Actualización automática al conectar el bot

- ✅ **Mejoras de Seguridad**
  - Sistema de sesiones con tokens únicos
  - Validación de tokens en servidor
  - Sesiones temporales con expiración automática
  - Soporte para múltiples métodos de autenticación

### Documentación

- Actualizado WEB_GUIDE.md con sistema de autenticación QR
- Añadida sección sobre lista de grupos y Group IDs
- Actualizado README.md con nuevas características
- Documentación de API para endpoints de autenticación

## [1.2.0] - 2024-03-16

### Nuevas Características

- ✅ **Interfaz Web Moderna**
  - Panel de control visual en `http://localhost:3000`
  - Gestión completa de cumpleaños desde el navegador
  - Agregar, editar, eliminar y activar/desactivar
  - Diseño responsive para móviles y tablets
  - Actualización automática cada 30 segundos

- ✅ **API REST Completa**
  - 8 endpoints para gestión de cumpleaños y grupos
  - Documentación completa en WEB_GUIDE.md
  - Health check endpoint
  - CORS habilitado para integraciones

- ✅ **Comando `!ver-cumples`**
  - Ver cumpleaños ordenados por fecha
  - Indicadores visuales (✅ = ya pasó, ⏳ = próximo)
  - Muestra días restantes para próximos cumpleaños

- ✅ **Comando `!agregar` Simplificado**
  - Formato rápido: `!agregar 15/05 Juan Pérez`
  - Detección automática del grupo actual
  - Soporta `/` y `-` como separadores

- ✅ **Mensajes con Emoji de Robot**
  - Todos los mensajes comienzan con 🤖 por defecto
  - Personalizable vía `message_template`

### Mejoras

- 🔧 Soporte completo para prefijos `/` y `!` en todos los comandos
- 📝 Comando `/help` actualizado con nuevas funcionalidades
- 🎨 Mejores indicadores visuales en todos los comandos
- 📖 Documentación expandida con WEB_GUIDE.md

### Archivos Nuevos

- `src/web/server.js` - Servidor Express con API REST
- `src/web/public/index.html` - Interfaz web moderna
- `WEB_GUIDE.md` - Guía completa de la interfaz web
- `RELEASE_NOTES_v1.2.0.md` - Notas detalladas de la versión

### Archivos Modificados

- `src/index.js` - Integración del servidor web
- `src/config/env.js` - Nuevas variables WEB_ENABLED y WEB_PORT
- `src/bot/commands.js` - Nuevos comandos y mejoras
- `.env.example` - Variables de configuración web
- `package.json` - Versión 1.2.0, dependencias express y cors
- `README.md` - Documentación completa actualizada

### Configuración

Nuevas variables de entorno:
```env
WEB_ENABLED=true
WEB_PORT=3000
```

## [1.1.0] - 2024-03-16

### Nuevas Características

- ✅ **Soporte completo para Docker**
  - Agregado `Dockerfile` optimizado con Alpine Linux
  - Agregado `docker-compose.yml` para despliegue fácil
  - Agregado `.dockerignore` para builds optimizados
  - Logs rotativos automáticos en Docker

- ✅ **Soporte para comandos con `!`**
  - Ahora puedes usar `/ping` o `!ping`
  - Todos los comandos soportan ambos prefijos (`/` y `!`)
  - Útil para compatibilidad con otros bots

- ✅ **Documentación expandida**
  - Agregada [DOCKER_GUIDE.md](DOCKER_GUIDE.md) con guía completa de Docker
  - Agregada [COMMANDS_EXAMPLES.md](COMMANDS_EXAMPLES.md) con ejemplos prácticos
  - Actualizado README con mejores referencias

### Mejoras

- 🔧 Mejorado `install.sh` - solucionados errores de sintaxis bash
- 🔧 Mejorado `.gitignore` para excluir archivos de storage
- 📝 Actualizado `/help` para mencionar soporte de `!`
- 📝 Actualizado README con sección de documentación

### Correcciones

- 🐛 Corregidos errores de sintaxis en `install.sh` línea 251
- 🐛 Corregida validación de comandos en `handlers.js`

## [1.0.0] - 2024-03-15

### Lanzamiento Inicial

#### Características Principales

- ✅ Conexión a WhatsApp usando Baileys (Linked Devices)
- ✅ Autenticación persistente con QR code
- ✅ Reconexión automática ante caídas
- ✅ Base de datos SQLite con 3 tablas (birthdays, sent_logs, group_settings)
- ✅ Scheduler interno con node-cron
- ✅ Sistema de comandos administrativos completo
- ✅ Configuración por grupo (hora, timezone, plantillas)
- ✅ Plantillas personalizables con variables
- ✅ Prevención de mensajes duplicados
- ✅ Logging completo con pino (consola + archivo)
- ✅ Soporte para PM2
- ✅ Importar/exportar cumpleaños en JSON

#### Comandos Implementados

**Consultas:**
- `/ping` - Estado del bot
- `/help` - Lista de comandos
- `/listar` - Todos los cumpleaños
- `/proximos` - Próximos cumpleaños
- `/grupos` - Grupos configurados
- `/status` - Estado del sistema

**Gestión:**
- `/agregar` - Agregar cumpleaños
- `/eliminar` - Eliminar cumpleaños
- `/editar` - Editar campo de cumpleaños
- `/activar` - Activar cumpleaños
- `/desactivar` - Desactivar cumpleaños

**Configuración:**
- `/grupo-config` - Configurar grupo

**Pruebas:**
- `/test-cumple` - Enviar mensaje de prueba

**Importar/Exportar:**
- `/backup` - Exportar a JSON
- `/importar` - Importar desde JSON

#### Estructura del Proyecto

```
src/
  ├── config/          # Configuración (env, database)
  ├── bot/             # Capa de WhatsApp (socket, handlers, commands)
  ├── services/        # Lógica de negocio
  ├── repositories/    # Acceso a datos
  └── utils/           # Utilidades (logger, validators, templates, dates)
```

#### Tecnologías

- Node.js (ES Modules)
- Baileys 6.7.9 (WhatsApp library)
- SQLite (better-sqlite3)
- Pino (logging)
- node-cron (scheduler)
- dotenv (environment variables)

#### Configuración

Variables de entorno:
- `NODE_ENV` - Entorno (development/production)
- `TZ` - Timezone del sistema
- `DEFAULT_TIMEZONE` - Timezone por defecto para grupos
- `ADMIN_NUMBERS` - Números autorizados (comma-separated)
- `LOG_LEVEL` - Nivel de logging (info, debug, error)
- `DB_PATH` - Ruta de la base de datos SQLite
- `SCHEDULER_CHECK_INTERVAL` - Intervalo del scheduler en minutos

#### Base de Datos

**Tabla: birthdays**
- Almacena cumpleaños con nombre, fecha, grupo, plantilla opcional

**Tabla: sent_logs**
- Registra envíos para evitar duplicados anuales

**Tabla: group_settings**
- Configuración personalizada por grupo (hora, timezone, plantilla)

#### Seguridad

- Control de acceso por números admin
- Sanitización de inputs
- Validación de datos antes de insertar
- No expone credenciales

#### Limitaciones Conocidas

- SQLite es single-process (no usar múltiples instancias)
- No hay interfaz web (solo comandos de WhatsApp)
- No hay retry automático de mensajes fallidos
- Scheduler interno depende del proceso Node.js

#### Documentación

- README.md - Documentación completa
- QUICKSTART.md - Guía rápida de inicio
- ARCHITECTURE.md - Explicación de la arquitectura
- CHANGELOG.md - Este archivo

---

## Próximas Versiones (Roadmap)

### [1.1.0] - Futuro

**Posibles mejoras:**
- [ ] Tests automatizados (Jest/Mocha)
- [ ] Interfaz web para gestión de cumpleaños
- [ ] Reintentos automáticos de mensajes fallidos
- [ ] Backup automático de base de datos
- [ ] Estadísticas de envíos
- [ ] Soporte para múltiples idiomas
- [ ] Recordatorios con X días de anticipación
- [ ] Notificaciones a admins de errores
- [ ] Health check endpoint HTTP
- [ ] Docker support
- [ ] Webhook para integración con otros sistemas

---

Para sugerencias o bugs, contacta al desarrollador o abre un issue en el repositorio.
