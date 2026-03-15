# Guía de Despliegue en CasaOS

Esta guía te ayudará a subir y ejecutar el WhatsApp Birthday Bot en tu VPS con CasaOS.

## 📋 Requisitos Previos

- CasaOS instalado en tu VPS
- Acceso SSH o SFTP a tu VPS
- Espacio en disco: ~500MB
- RAM disponible: ~512MB

## 🚀 Método 1: Subir por SSH/SCP (Más Rápido)

### 1. Crear paquete de despliegue

En tu máquina local, dentro del proyecto:

```bash
bash scripts/create-upload-package.sh
```

Esto creará `whatsapp-bot-casaos.tar.gz` (~5-10MB).

### 2. Subir al VPS

```bash
scp whatsapp-bot-casaos.tar.gz usuario@ip-de-tu-vps:/home/usuario/
```

Reemplaza:
- `usuario` con tu usuario del VPS
- `ip-de-tu-vps` con la IP de tu servidor

### 3. Conectar por SSH y descomprimir

```bash
ssh usuario@ip-de-tu-vps

# Crear directorio para el bot
mkdir -p ~/apps/whatsapp-birthday-bot
cd ~/apps/whatsapp-birthday-bot

# Descomprimir
tar -xzf ~/whatsapp-bot-casaos.tar.gz

# Limpiar archivo comprimido
rm ~/whatsapp-bot-casaos.tar.gz
```

### 4. Configurar variables de entorno

```bash
cp .env.example .env
nano .env
```

Edita al menos:
```env
ADMIN_NUMBERS=5491112345678
```

### 5. Ejecutar con Docker Compose

```bash
docker-compose up -d
```

### 6. Ver logs y escanear QR

```bash
docker-compose logs -f
```

Aparecerá un código QR. Escanéalo con WhatsApp:
1. Abre WhatsApp en tu teléfono
2. Ve a **Configuración > Dispositivos vinculados**
3. Toca **Vincular un dispositivo**
4. Escanea el QR

Presiona `Ctrl+C` para salir de los logs (el bot seguirá corriendo).

## 🌐 Método 2: Subir por SFTP/Web (Interfaz Gráfica)

### 1. Usar un cliente FTP

Descarga e instala uno de estos clientes:
- **FileZilla** (Windows/Mac/Linux) - https://filezilla-project.org/
- **WinSCP** (Windows) - https://winscp.net/
- **Cyberduck** (Mac) - https://cyberduck.io/

### 2. Conectar a tu VPS

En el cliente FTP:
- **Protocolo**: SFTP
- **Host**: IP de tu VPS
- **Puerto**: 22
- **Usuario**: tu usuario
- **Contraseña**: tu contraseña

### 3. Crear carpeta en el servidor

Navega a `/home/tu-usuario/apps/` y crea la carpeta `whatsapp-birthday-bot`.

### 4. Subir archivos

Arrastra y suelta estos archivos/carpetas desde tu proyecto local:

**Archivos obligatorios:**
- `Dockerfile`
- `docker-compose.yml`
- `.env.example`
- `package.json`
- `package-lock.json`
- Carpeta `src/` completa
- Carpeta `storage/` (vacía está bien)

**Opcionales pero recomendados:**
- `README.md`
- `DOCKER.md`
- `ecosystem.config.js`

### 5. Continuar desde SSH

Una vez subidos los archivos, conéctate por SSH y ejecuta:

```bash
cd ~/apps/whatsapp-birthday-bot

# Configurar
cp .env.example .env
nano .env

# Crear directorios storage si no existen
mkdir -p storage/auth storage/logs

# Ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## 🎨 Método 3: Usar CasaOS App Store (Si está disponible)

Si CasaOS tiene una interfaz de App Store:

### 1. Acceder a CasaOS

Abre tu navegador y ve a:
```
http://ip-de-tu-vps
```

### 2. Ir a "Custom Install" o "Import"

Busca la opción de instalar una aplicación personalizada con Docker Compose.

### 3. Pegar configuración Docker Compose

Pega el contenido de `docker-compose.yml` y ajusta:

```yaml
version: '3.8'

services:
  whatsapp-bot:
    build: .
    # O usa una imagen pre-construida si la subiste a Docker Hub:
    # image: tu-usuario/whatsapp-birthday-bot:latest
    container_name: whatsapp-birthday-bot
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - TZ=America/Argentina/Cordoba
      - DEFAULT_TIMEZONE=America/Argentina/Cordoba
      - ADMIN_NUMBERS=5491112345678  # CAMBIAR AQUÍ
      - LOG_LEVEL=info
      - DB_PATH=/app/storage/database.sqlite
      - SCHEDULER_CHECK_INTERVAL=1
    volumes:
      - /DATA/AppData/whatsapp-bot/storage:/app/storage
    networks:
      - whatsapp-network

networks:
  whatsapp-network:
    driver: bridge
```

### 4. Instalar y configurar

CasaOS instalará la aplicación. Luego:

1. Ve a los logs del contenedor
2. Escanea el código QR con WhatsApp
3. Listo

## 📊 Verificar que está funcionando

### Desde CasaOS Web

1. Ve a la sección de contenedores
2. Busca `whatsapp-birthday-bot`
3. Verifica que esté "Running"
4. Haz clic para ver logs

### Desde terminal

```bash
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Ver recursos
docker stats whatsapp-birthday-bot
```

### Probar el bot

Envía un mensaje privado al bot (tu número que escaneó el QR):

```
/ping
```

Deberías recibir: "🏓 Pong! Bot activo."

## 🔧 Comandos Útiles en CasaOS

### Reiniciar el bot

```bash
cd ~/apps/whatsapp-birthday-bot
docker-compose restart
```

### Detener el bot

```bash
docker-compose stop
```

### Iniciar el bot

```bash
docker-compose start
```

### Ver logs en tiempo real

```bash
docker-compose logs -f
```

### Actualizar el bot

```bash
# Detener
docker-compose down

# Subir nuevos archivos (si actualizaste el código)

# Reconstruir imagen
docker-compose build --no-cache

# Iniciar
docker-compose up -d
```

### Hacer backup

```bash
cd ~/apps/whatsapp-birthday-bot
tar -czf backup-$(date +%Y%m%d).tar.gz storage/
```

Descarga el archivo `backup-YYYYMMDD.tar.gz` a tu máquina local.

### Restaurar backup

```bash
cd ~/apps/whatsapp-birthday-bot
docker-compose stop
tar -xzf backup-20240315.tar.gz
docker-compose start
```

## 🗂️ Estructura en el VPS

```
/home/usuario/apps/whatsapp-birthday-bot/
├── docker-compose.yml
├── Dockerfile
├── .env
├── package.json
├── package-lock.json
├── src/
│   ├── index.js
│   ├── config/
│   ├── bot/
│   ├── services/
│   ├── repositories/
│   └── utils/
└── storage/
    ├── auth/              # Sesión de WhatsApp
    ├── logs/              # Archivos de log
    └── database.sqlite    # Base de datos
```

## 🔐 Seguridad

### Proteger el archivo .env

```bash
chmod 600 .env
```

### Limitar acceso a storage

```bash
chmod 700 storage/
```

### Firewall

CasaOS maneja el firewall, pero si tienes uno personalizado, NO necesitas abrir puertos. El bot se conecta a WhatsApp saliente.

## 🆘 Troubleshooting

### El QR no aparece

1. Ver logs completos:
```bash
docker-compose logs --tail=100
```

2. Reiniciar:
```bash
docker-compose restart
docker-compose logs -f
```

### Error "No such file or directory"

Verifica que creaste los directorios:
```bash
mkdir -p storage/auth storage/logs
```

### Error de permisos

```bash
sudo chown -R $(whoami):$(whoami) storage/
chmod -R 755 storage/
```

### El contenedor se detiene constantemente

```bash
# Ver por qué falló
docker-compose logs

# Verificar recursos
docker stats
```

### No puedo conectar por SFTP

1. Verifica que SSH esté habilitado en CasaOS
2. Verifica el puerto (generalmente 22)
3. Usa la IP correcta del VPS
4. Verifica usuario y contraseña

## 📱 Obtener el ID de un grupo de WhatsApp

Una vez que el bot esté corriendo:

1. Envía un mensaje en el grupo donde quieres cumpleaños
2. Ve los logs:
```bash
docker-compose logs | grep "Message received"
```
3. Busca el `remoteJid` que termina en `@g.us`
4. El número antes de `@g.us` es tu `group_id`

Ejemplo: `120363123456789@g.us` → group_id = `120363123456789`

## 🎯 Próximos Pasos

Una vez que el bot esté corriendo:

1. Agregar tu primer cumpleaños:
```
/agregar Juan Pérez|1990-05-15|120363123456789|Familia
```

2. Configurar el grupo:
```
/grupo-config 120363123456789|9|America/Argentina/Cordoba
```

3. Ver comandos disponibles:
```
/help
```

## 📚 Más Información

- [README.md](README.md) - Documentación completa
- [DOCKER.md](DOCKER.md) - Guía avanzada de Docker
- [QUICKSTART.md](QUICKSTART.md) - Guía rápida

---

¡Disfruta de tu bot en CasaOS! 🎉
