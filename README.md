# WhatsApp Birthday Bot

Un bot de WhatsApp robusto y listo para producción que envía recordatorios automáticos de cumpleaños a grupos. Construido con Baileys, Node.js y SQLite.

## 🎯 Características

- ✅ Conexión persistente a WhatsApp usando Baileys (Linked Devices)
- ✅ Reconexión automática ante caídas de conexión
- ✅ Scheduler interno (sin dependencia de cron del sistema)
- ✅ Base de datos SQLite para persistencia
- ✅ Comandos administrativos por WhatsApp (soporta `/` y `!`)
- ✅ **Control de acceso por números autorizados**
- ✅ Comando simplificado: `!agregar 15/05 Juan Pérez`
- ✅ Ver cumpleaños por fecha con indicador de pasados/próximos (`!ver-cumples`)
- ✅ **Interfaz web moderna con autenticación obligatoria** (http://localhost:3000)
- ✅ **Visualización de QR en el panel web**
- ✅ **Selector de grupos de WhatsApp (sin escribir IDs manualmente)**
- ✅ API REST completa para integraciones
- ✅ Configuración personalizada por grupo (hora de envío, timezone, plantillas)
- ✅ Plantillas de mensaje customizables con emoji de robot (🤖)
- ✅ Evita envíos duplicados
- ✅ Logging completo (consola + archivo)
- ✅ Listo para VPS/producción con PM2
- ✅ Soporte completo para Docker
- ✅ Instalador automático e interactivo
- ✅ Importar/exportar cumpleaños en JSON

## 🚀 Instalación Rápida (Recomendado)

### Instalador Automático

El proyecto incluye un instalador interactivo que configura todo automáticamente:

```bash
bash install.sh
```

El instalador te guiará paso a paso:
- ✅ Verifica requisitos (Docker o Node.js)
- ✅ Te ayuda a obtener tu número de WhatsApp con instrucciones visuales
- ✅ Configura zona horaria de manera intuitiva
- ✅ Instala todas las dependencias
- ✅ Inicia el bot automáticamente
- ✅ Muestra el QR para vincular WhatsApp

**👉 [Ver guía completa del instalador](INSTALL_GUIDE.md)**

## 📚 Documentación

- **[Guía de Seguridad](SECURITY.md)** - Configuración de seguridad y mejores prácticas
- **[Guía de Instalación](INSTALL_GUIDE.md)** - Instalador automático paso a paso
- **[Guía de Docker](DOCKER_GUIDE.md)** - Configuración y despliegue con Docker
- **[Guía de Interfaz Web](WEB_GUIDE.md)** - Panel web y API REST
- **[Ejemplos de Comandos](COMMANDS_EXAMPLES.md)** - Ejemplos prácticos de todos los comandos
- **[Guía Rápida](QUICKSTART.md)** - Inicio rápido en 5 minutos
- **[Arquitectura](ARCHITECTURE.md)** - Arquitectura técnica del proyecto

---

## 📋 Requisitos

### Instalación Automática
- Bash (incluido en Linux/macOS/WSL)
- Docker O Node.js 18+ (el instalador te ayuda a instalarlos)

### Instalación Manual
- Node.js >= 18.x
- npm o yarn
- Sistema operativo: Linux (recomendado para VPS), macOS o Windows
- WhatsApp Business o WhatsApp personal

## 📖 Instalación Manual

Si prefieres instalar manualmente sin el script:

### 1. Clonar o descargar el proyecto

```bash
git clone <repository-url>
cd whatsapp-birthday-bot
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar el archivo de ejemplo y editarlo:

```bash
cp .env.example .env
```

Editar `.env` con tus valores:

```env
NODE_ENV=development
TZ=America/Argentina/Cordoba
DEFAULT_TIMEZONE=America/Argentina/Cordoba

# Números de admin (separados por coma, sin espacios, sin +)
ADMIN_NUMBERS=5491112345678,5491187654321

LOG_LEVEL=info
DB_PATH=./storage/database.sqlite
SCHEDULER_CHECK_INTERVAL=1
```

**Importante:**
- Los números deben incluir código de país (ej: 549 para Argentina)
- No usar el símbolo `+`
- No dejar espacios entre números

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Al iniciar, verás un código QR en la terminal. Escanéalo con tu WhatsApp:

1. Abre WhatsApp en tu teléfono
2. Ve a **Configuración > Dispositivos vinculados**
3. Toca **Vincular un dispositivo**
4. Escanea el código QR que aparece en la terminal

Una vez conectado, la sesión se guardará en `storage/auth/` y no necesitarás escanear el QR nuevamente.

## 🖥️ Despliegue en VPS (Producción)

### Usando PM2 (Recomendado)

PM2 es un administrador de procesos que mantendrá el bot corriendo 24/7 y lo reiniciará automáticamente si falla.

#### 1. Instalar PM2 globalmente

```bash
npm install -g pm2
```

#### 2. Configurar para producción

Asegúrate de que tu `.env` tenga `NODE_ENV=production`.

#### 3. Iniciar con PM2

```bash
npm run pm2:start
```

#### 4. Comandos útiles de PM2

```bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs whatsapp-birthday-bot

# Reiniciar bot
pm2 restart whatsapp-birthday-bot

# Detener bot
pm2 stop whatsapp-birthday-bot

# Eliminar bot de PM2
pm2 delete whatsapp-birthday-bot

# Guardar configuración de PM2 para que inicie al reiniciar el servidor
pm2 save
pm2 startup
```

### Sin PM2 (No recomendado para producción)

Si no quieres usar PM2, puedes ejecutar directamente:

```bash
npm start
```

Pero esto no reiniciará automáticamente el bot si falla o si reinicias el servidor.

## 📱 Comandos Administrativos

Todos los comandos deben ser ejecutados por números admin configurados en `.env`.

**Nota:** Puedes usar `/` o `!` como prefijo (ej: `/ping` o `!ping`)

### Consultas

- `!ping` o `/ping` - Verificar si el bot está activo
- `!status` o `/status` - Ver estado del sistema y estadísticas
- `!ver-cumples` - Ver cumpleaños ordenados por fecha (✅ = ya pasó, ⏳ = próximo)
- `/help` - Ver lista de comandos disponibles
- `/listar` - Listar todos los cumpleaños registrados
- `/proximos` - Mostrar los próximos 10 cumpleaños
- `/grupos` - Listar grupos con cumpleaños registrados

### Gestión de Cumpleaños

#### Agregar cumpleaños - Formato Rápido ⚡

```
!agregar 15/05 Juan Pérez
```

Este formato automáticamente usa el grupo donde envías el comando.

#### Agregar cumpleaños - Formato Completo

```
/agregar Juan Pérez|1990-05-15|5491112345678|Familia
```

Formato: `/agregar Nombre|YYYY-MM-DD|groupId|groupName`

- **Nombre**: Nombre completo de la persona
- **YYYY-MM-DD**: Fecha de nacimiento
- **groupId**: ID del grupo de WhatsApp (número sin @g.us)
- **groupName**: Nombre descriptivo del grupo

#### Eliminar cumpleaños

```
/eliminar 5
```

Donde `5` es el ID del cumpleaños (lo ves con `/listar`).

#### Editar cumpleaños

```
/editar 5 name María García
/editar 5 birth_date 1992-03-20
/editar 5 message_template 🎂 Feliz cumpleaños {name}! Hoy cumples {age} años
```

Formato: `/editar <id> <campo> <valor>`

Campos editables:
- `name` - Nombre
- `birth_date` - Fecha de nacimiento (YYYY-MM-DD)
- `group_id` - ID del grupo
- `group_name` - Nombre del grupo
- `message_template` - Plantilla personalizada (opcional)
- `enabled` - Activar/desactivar (1 o 0)

#### Activar/Desactivar

```
/activar 5
/desactivar 5
```

### Configuración de Grupos

```
/grupo-config 5491112345678|9|America/Argentina/Cordoba
```

Formato: `/grupo-config groupId|sendHour|timezone`

- **groupId**: ID del grupo
- **sendHour**: Hora de envío (0-23)
- **timezone**: Zona horaria (ej: America/Argentina/Cordoba, America/Buenos_Aires)

### Pruebas

```
/test-cumple 5
```

Envía un mensaje de prueba al grupo sin registrarlo como enviado.

### Importar/Exportar

#### Exportar cumpleaños

```
/backup
```

Genera un JSON con todos los cumpleaños que puedes guardar.

#### Importar cumpleaños

```
/importar [{"name":"Juan Pérez","birth_date":"1990-05-15","group_id":"5491112345678","group_name":"Familia"}]
```

Importa cumpleaños desde un JSON. Útil para migrar desde otro sistema.

## 🎨 Plantillas de Mensaje

### Plantilla por defecto del sistema

```
🎉 Hoy cumple {name}. ¡Feliz cumpleaños!
```

### Variables disponibles

- `{name}` - Nombre de la persona
- `{Name}` - Nombre con primera letra mayúscula
- `{NAME}` - Nombre en mayúsculas
- `{age}` - Edad actual
- `{años}` - Alias de {age}

### Prioridad de plantillas

1. **Plantilla personal** (si la persona tiene `message_template`)
2. **Plantilla del grupo** (si el grupo tiene `default_template`)
3. **Plantilla del sistema** (por defecto)

### Ejemplo de plantilla personalizada

```
🎂 ¡Feliz cumpleaños {name}! 🎉
Hoy cumples {age} años. Que tengas un día increíble 🎈
```

## 📂 Estructura del Proyecto

```
whatsapp-birthday-bot/
├── src/
│   ├── config/
│   │   ├── database.js       # Configuración y migración de SQLite
│   │   └── env.js            # Carga de variables de entorno
│   ├── bot/
│   │   ├── socket.js         # Conexión con WhatsApp (Baileys)
│   │   ├── handlers.js       # Manejo de mensajes entrantes
│   │   └── commands.js       # Parser y lógica de comandos admin
│   ├── services/
│   │   ├── birthdayService.js    # Lógica de negocio de cumpleaños
│   │   ├── groupService.js       # Gestión de grupos
│   │   ├── messageService.js     # Envío de mensajes
│   │   └── schedulerService.js   # Scheduler interno (cron)
│   ├── repositories/
│   │   ├── birthdayRepository.js        # Acceso a datos de birthdays
│   │   ├── sentLogRepository.js         # Acceso a datos de sent_logs
│   │   └── groupSettingsRepository.js   # Acceso a datos de group_settings
│   ├── utils/
│   │   ├── logger.js         # Logger centralizado (pino)
│   │   ├── dateUtils.js      # Utilidades de fechas
│   │   ├── template.js       # Renderizado de plantillas
│   │   └── validators.js     # Validaciones y sanitización
│   └── index.js              # Punto de entrada principal
├── storage/
│   ├── auth/                 # Sesión de WhatsApp (autogenerado)
│   ├── database.sqlite       # Base de datos SQLite
│   └── logs/                 # Archivos de log
├── .env                      # Variables de entorno (no incluir en git)
├── .env.example              # Ejemplo de variables de entorno
├── .gitignore
├── package.json
├── ecosystem.config.js       # Configuración de PM2
└── README.md
```

## 🗄️ Base de Datos

El bot usa SQLite con tres tablas principales:

### Tabla `birthdays`

Almacena los cumpleaños registrados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | ID único |
| name | TEXT | Nombre de la persona |
| birth_date | TEXT | Fecha de nacimiento (YYYY-MM-DD) |
| group_id | TEXT | ID del grupo de WhatsApp |
| group_name | TEXT | Nombre descriptivo del grupo |
| enabled | INTEGER | Activo (1) o desactivado (0) |
| message_template | TEXT | Plantilla personalizada (opcional) |
| created_at | TEXT | Fecha de creación |
| updated_at | TEXT | Fecha de última actualización |

### Tabla `sent_logs`

Registra los envíos realizados para evitar duplicados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | ID único |
| birthday_id | INTEGER | FK a birthdays |
| group_id | TEXT | ID del grupo |
| year | INTEGER | Año del envío |
| sent_at | TEXT | Timestamp del envío |

### Tabla `group_settings`

Configuración personalizada por grupo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | ID único |
| group_id | TEXT | ID del grupo (único) |
| group_name | TEXT | Nombre del grupo |
| send_hour | INTEGER | Hora de envío (0-23) |
| timezone | TEXT | Zona horaria |
| default_template | TEXT | Plantilla por defecto del grupo |
| enabled | INTEGER | Activo (1) o desactivado (0) |
| created_at | TEXT | Fecha de creación |
| updated_at | TEXT | Fecha de última actualización |

## ⚙️ Cómo Funciona el Scheduler

1. El scheduler se ejecuta cada N minutos (configurable con `SCHEDULER_CHECK_INTERVAL`)
2. Revisa si hay cumpleaños para hoy
3. Por cada grupo, verifica:
   - Si el grupo está habilitado
   - Si es la hora correcta según `send_hour` y `timezone` del grupo
   - Si el cumpleaños ya fue enviado este año
4. Si cumple todas las condiciones, envía el mensaje
5. Registra el envío en `sent_logs` para evitar duplicados

## 🌐 Interfaz Web

El bot incluye una interfaz web moderna para gestionar cumpleaños visualmente.

### Acceso

Una vez iniciado el bot, accede a:

```
http://localhost:3000
```

### Características

- ✅ Ver todos los cumpleaños en una lista ordenada
- ✅ Agregar cumpleaños con formulario visual
- ✅ Editar cumpleaños existentes
- ✅ Eliminar cumpleaños con confirmación
- ✅ Activar/desactivar cumpleaños
- ✅ Ver estado (Activo/Inactivo) con badges de colores
- ✅ Interfaz responsive (funciona en móviles)
- ✅ Actualización automática cada 30 segundos

### API REST

La interfaz web expone una API REST completa:

- `GET /api/birthdays` - Obtener todos los cumpleaños
- `POST /api/birthdays` - Agregar cumpleaños
- `PUT /api/birthdays/:id` - Actualizar cumpleaños
- `DELETE /api/birthdays/:id` - Eliminar cumpleaños
- `PATCH /api/birthdays/:id/toggle` - Activar/desactivar
- `GET /api/groups` - Obtener grupos
- `POST /api/groups/config` - Configurar grupo

**👉 [Ver guía completa de la interfaz web](WEB_GUIDE.md)**

### Configuración

Por defecto, la interfaz está habilitada en el puerto 3000. Para cambiar:

```env
WEB_PORT=8080
WEB_ENABLED=true
```

## 🔧 Troubleshooting

### El QR no aparece o no se conecta

- Asegúrate de tener Node.js >= 18.x
- Verifica que el firewall no bloquee las conexiones
- Intenta eliminar `storage/auth/` y reconectar

### El bot se desconecta constantemente

- Verifica tu conexión a internet
- Asegúrate de que no haya otro bot/instancia usando la misma sesión
- Revisa los logs en `storage/logs/app.log`

### Los comandos no funcionan

- Verifica que tu número esté correctamente configurado en `ADMIN_NUMBERS`
- El formato debe ser sin `+` y con código de país (ej: 5491112345678)
- Revisa los logs para ver si se están recibiendo los mensajes

### No se envían los cumpleaños automáticamente

- Verifica que el scheduler esté activo con `/status`
- Revisa que los grupos tengan configuración (`/grupos`)
- Verifica que la hora de envío sea correcta para tu timezone
- Chequea los logs para ver errores

### ¿Cómo obtengo el group_id?

El `group_id` es el número del grupo sin el sufijo `@g.us`. Puedes:

1. Usar herramientas de desarrollador de Baileys
2. Ver los logs cuando el bot recibe mensajes (aparece el JID)
3. Temporalmente agregar logging en `handlers.js` para ver el `remoteJid`

Una forma rápida: envía un mensaje en el grupo y revisa `storage/logs/app.log`, busca el `remoteJid` que termina en `@g.us`.

## 🛡️ Seguridad

- **Admin Numbers**: Solo números configurados pueden ejecutar comandos
- **Validación de entrada**: Todos los inputs se sanitizan
- **Sesión persistente**: La sesión de WhatsApp se guarda localmente de forma segura
- **No hardcoding**: Ninguna credencial está hardcodeada en el código

## 📝 Limitaciones

- SQLite es de un solo proceso, no uses múltiples instancias apuntando a la misma DB
- El scheduler interno depende del proceso Node.js corriendo
- Los mensajes solo se envían si el bot está conectado
- No hay interfaz web (todo por comandos de WhatsApp)

## 🤝 Mantenimiento

### Backup de la base de datos

```bash
cp storage/database.sqlite storage/database.sqlite.backup
```

### Limpiar logs antiguos

```bash
rm storage/logs/app.log
```

Los logs se recrearán automáticamente.

### Actualizar dependencias

```bash
npm update
```

## 📄 Licencia

MIT

## 🙋 Soporte

Si tienes problemas:

1. Revisa los logs en `storage/logs/app.log`
2. Verifica la configuración en `.env`
3. Asegúrate de que todos los comandos tengan el formato correcto
4. Prueba con `/ping` y `/status` para verificar que el bot esté funcionando

---

**¡Disfruta de tu bot de cumpleaños! 🎉**
