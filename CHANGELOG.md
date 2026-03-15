# Changelog

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
