# Arquitectura del Proyecto

Este documento explica la arquitectura y el flujo de datos del bot de cumpleaños de WhatsApp.

## Estructura de Capas

El proyecto sigue una arquitectura en capas clara y modular:

```
┌─────────────────────────────────────────┐
│        Entry Point (index.js)           │
│   - Inicialización                      │
│   - Manejo de señales                   │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│          Bot Layer (bot/)               │
│   - socket.js: Conexión WhatsApp        │
│   - handlers.js: Manejo de mensajes     │
│   - commands.js: Parser de comandos     │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│       Services Layer (services/)        │
│   - birthdayService: Lógica de negocio  │
│   - groupService: Gestión de grupos     │
│   - messageService: Envío de mensajes   │
│   - schedulerService: Cron interno      │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│    Repositories Layer (repositories/)   │
│   - birthdayRepository: CRUD birthdays  │
│   - sentLogRepository: CRUD sent_logs   │
│   - groupSettingsRepository: CRUD groups│
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      Database Layer (config/)           │
│   - database.js: SQLite connection      │
│   - Migrations automáticas              │
└─────────────────────────────────────────┘
```

## Flujo de Datos

### 1. Conexión a WhatsApp

```
index.js
  └─> connectToWhatsApp() [socket.js]
       └─> Baileys makeWASocket()
            ├─> Muestra QR si no hay sesión
            ├─> Carga sesión desde storage/auth/
            └─> Emite eventos de conexión
```

### 2. Inicio del Scheduler

```
socket.js (on connection.open)
  └─> startScheduler(sock) [schedulerService.js]
       └─> cron.schedule()
            └─> checkAndSendBirthdays() cada N minutos
                 ├─> getTodaysBirthdays() [birthdayService.js]
                 ├─> Filtra por grupo y hora
                 ├─> sendBirthdayMessage() [messageService.js]
                 └─> markBirthdayAsSent() [birthdayService.js]
```

### 3. Recepción de Comandos Administrativos

```
socket.js (on messages.upsert)
  └─> handleIncomingMessage() [handlers.js]
       ├─> Extrae texto del mensaje
       ├─> Verifica si es admin (isAdmin)
       └─> parseCommand() [commands.js]
            ├─> Switch por comando
            ├─> Llama al servicio correspondiente
            └─> Envía respuesta por sendTextMessage()
```

### 4. Ejemplo: Agregar Cumpleaños

```
Usuario envía: /agregar Juan|1990-05-15|123|Familia
                ↓
         parseCommand() [commands.js]
                ↓
         handleAgregar()
                ↓
    birthdayService.addBirthday()
                ↓
    validateBirthdayData() [validators.js]
                ↓
    birthdayRepository.createBirthday()
                ↓
         SQLite INSERT
                ↓
    Respuesta enviada al usuario
```

### 5. Ejemplo: Envío Automático de Cumpleaños

```
Scheduler tick (cada N minutos)
        ↓
checkAndSendBirthdays() [schedulerService.js]
        ↓
getTodaysBirthdays() [birthdayService.js]
        ↓
birthdayRepository.getBirthdaysByDate()
        ↓
sentLogRepository.wasSentThisYear() (filtro)
        ↓
Agrupa por grupo
        ↓
Por cada grupo:
  ├─> getGroupConfig() [groupService.js]
  ├─> isTimeToSend() [dateUtils.js]
  └─> Si es la hora correcta:
       ├─> renderTemplate() [template.js]
       ├─> sendBirthdayMessage() [messageService.js]
       │    └─> sock.sendMessage() (Baileys)
       └─> markBirthdayAsSent() [birthdayService.js]
            └─> sentLogRepository.createSentLog()
```

## Componentes Principales

### socket.js (Bot Layer)

**Responsabilidad:** Gestionar la conexión con WhatsApp

- Inicializa Baileys
- Maneja QR y autenticación
- Reconexión automática
- Emite eventos de mensajes

**Dependencias:**
- `@whiskeysockets/baileys`
- `qrcode-terminal`

### handlers.js (Bot Layer)

**Responsabilidad:** Procesar mensajes entrantes

- Extrae texto de mensajes
- Identifica número del remitente
- Valida si es admin
- Delega a `parseCommand()`

### commands.js (Bot Layer)

**Responsabilidad:** Parser y ejecución de comandos

- Switch de comandos disponibles
- Parsea argumentos
- Llama a servicios correspondientes
- Formatea respuestas para el usuario

### birthdayService.js (Service Layer)

**Responsabilidad:** Lógica de negocio de cumpleaños

- Agregar/editar/eliminar cumpleaños
- Validar datos antes de guardar
- Obtener cumpleaños de hoy
- Marcar como enviado
- Importar/exportar

**No hace:**
- No accede directamente a la DB (usa repositorios)
- No envía mensajes (usa messageService)

### groupService.js (Service Layer)

**Responsabilidad:** Gestión de configuración de grupos

- Crear/actualizar configuración
- Obtener configuración por grupo
- Listar grupos

### messageService.js (Service Layer)

**Responsabilidad:** Envío de mensajes

- Seleccionar plantilla correcta
- Renderizar variables
- Enviar mensaje vía Baileys
- Logging de envíos

### schedulerService.js (Service Layer)

**Responsabilidad:** Automatización de envíos

- Iniciar/detener cron
- Revisar cumpleaños del día
- Verificar hora de envío por grupo
- Coordinar servicios para envío

### birthdayRepository.js (Repository Layer)

**Responsabilidad:** Acceso a datos de `birthdays`

- CRUD completo
- Queries especializadas (por fecha, por grupo, próximos)
- Importación masiva

**Usa:** SQLite via `better-sqlite3`

### sentLogRepository.js (Repository Layer)

**Responsabilidad:** Acceso a datos de `sent_logs`

- Crear logs de envío
- Verificar si fue enviado este año
- Consultas por año

### groupSettingsRepository.js (Repository Layer)

**Responsabilidad:** Acceso a datos de `group_settings`

- CRUD de configuraciones
- Upsert (crear o actualizar)
- Listar grupos con cumpleaños

## Utilidades (utils/)

### logger.js

Logger centralizado usando `pino`:
- Escribe en consola (con formato pretty)
- Escribe en archivo `storage/logs/app.log`
- Niveles: debug, info, warn, error

### dateUtils.js

Utilidades de fechas:
- Validación de fechas
- Obtener fecha de hoy (MM-DD)
- Calcular edad
- Calcular días hasta próximo cumpleaños
- Manejo de timezones

### template.js

Renderizado de plantillas:
- Reemplaza variables `{name}`, `{age}`, etc.
- Plantilla por defecto del sistema

### validators.js

Validaciones y sanitización:
- Validar datos de cumpleaños
- Validar configuración de grupos
- Verificar si un número es admin
- Sanitizar inputs (eliminar caracteres especiales)

## Configuración (config/)

### env.js

Carga y valida variables de entorno:
- `dotenv` para cargar `.env`
- Exporta objeto de configuración tipado
- Validaciones básicas (ej: warn si no hay admins)

### database.js

Inicialización de SQLite:
- Crea conexión
- Ejecuta migraciones automáticas
- Crea tablas e índices
- Exporta funciones para obtener/cerrar DB

## Flujo de Reconexión

```
WhatsApp cierra conexión
        ↓
socket.js recibe evento connection.close
        ↓
Verifica si debe reconectar:
  ├─> Si fue logout: NO reconecta
  └─> Si fue error de red: SÍ reconecta
        ↓
stopScheduler()
        ↓
setTimeout(() => connectToWhatsApp(), 5000)
        ↓
Intenta reconectar después de 5 segundos
        ↓
Si conecta exitosamente:
  └─> startScheduler()
```

## Manejo de Errores

### Nivel Bot (socket.js, handlers.js)

- Try-catch en handlers
- Log de errores
- No propaga errores que rompan el proceso

### Nivel Service

- Validación antes de operaciones
- Throw de errores con mensajes claros
- Los errores se capturan en commands.js

### Nivel Repository

- Manejo de errores de SQLite
- Errores de constraint (UNIQUE) se manejan específicamente

### Nivel Command

- Try-catch general
- Responde al usuario con mensaje de error
- Log del error

## Persistencia

### Sesión de WhatsApp

Guardada en `storage/auth/` por Baileys:
- `creds.json` - Credenciales
- `keys/` - Keys de encriptación

**Importante:** No borrar esto o tendrás que escanear QR de nuevo.

### Base de Datos

SQLite en `storage/database.sqlite`:
- Archivo único
- WAL mode para mejor concurrencia
- Auto-migración en cada inicio

### Logs

Archivo en `storage/logs/app.log`:
- Rotación manual (no automática)
- Formato JSON (pero pretty en consola)

## Seguridad

### Control de Acceso

Solo números en `ADMIN_NUMBERS` pueden ejecutar comandos:
- Verificado en `handlers.js` con `isAdmin()`
- Comparación flexible (con/sin código de país)

### Sanitización

Todos los inputs del usuario pasan por `sanitizeInput()`:
- Trim
- Elimina caracteres de control
- Limita longitud a 500 caracteres

### Validación

Datos validados antes de insertar en DB:
- Fechas en formato correcto
- Campos requeridos presentes
- Tipos correctos

## Performance

### Consultas Optimizadas

Índices en SQLite:
- `idx_birthdays_enabled` - Para filtros rápidos de activos
- `idx_birthdays_group_id` - Para búsquedas por grupo
- `idx_sent_logs_birthday_year` - Para evitar duplicados

### Scheduler Eficiente

- Solo revisa cumpleaños 1 vez por minuto (configurable)
- Filtra en DB antes de procesar
- Sleep de 1 segundo entre mensajes de un mismo grupo

### Logging Inteligente

- Nivel `debug` desactivado en producción
- Nivel `info` para eventos importantes
- Nivel `error` para fallos

## Escalabilidad

### Limitaciones Actuales

- **Un solo proceso:** SQLite no soporta múltiples procesos escribiendo
- **Sin queue:** Envíos se hacen sincrónicamente
- **Sin retry automático:** Si falla un envío, se loggea pero no reintenta

### Posibles Mejoras Futuras

1. **Cola de mensajes:** Bull/BullMQ para reintentos
2. **PostgreSQL:** Para múltiples instancias
3. **Health checks:** Endpoint HTTP para monitoreo
4. **Métricas:** Prometheus para estadísticas
5. **Backup automático:** Cron job para backup de DB

## Testing

Actualmente no hay tests automatizados. Para testear manualmente:

1. **Comandos:** Envía cada comando y verifica respuesta
2. **Scheduler:** Ajusta `SCHEDULER_CHECK_INTERVAL=1` y verifica logs
3. **Test de envío:** Usa `/test-cumple <id>` para probar sin registrar
4. **Reconexión:** Desconecta internet y verifica que reconecte

---

Este documento debe actualizarse conforme evolucione el proyecto.
