# Guía de Instalación Automática

## 🚀 Instalación en Un Solo Comando

### Linux / macOS / WSL

```bash
bash install.sh
```

### Windows (Git Bash / PowerShell con WSL)

```bash
bash install.sh
```

## 📋 ¿Qué hace el instalador?

El script `install.sh` es un instalador interactivo que:

1. ✅ Verifica requisitos del sistema (Docker o Node.js)
2. ✅ Te pregunta cómo instalar (Docker o Nativo)
3. ✅ Te guía para obtener tu número de WhatsApp
4. ✅ Te ayuda a configurar zona horaria
5. ✅ Crea el archivo `.env` automáticamente
6. ✅ Instala todas las dependencias
7. ✅ Inicia el bot
8. ✅ Muestra el QR para vincular WhatsApp

**Todo de manera automática y con explicaciones claras.**

## 🎯 Proceso de Instalación Paso a Paso

### Paso 1: Descargar el proyecto

```bash
# Si tienes git
git clone <tu-repositorio>
cd whatsapp-birthday-bot

# O descomprime el archivo ZIP
unzip whatsapp-birthday-bot.zip
cd whatsapp-birthday-bot
```

### Paso 2: Ejecutar el instalador

```bash
bash install.sh
```

### Paso 3: Seguir las instrucciones

El instalador te preguntará:

#### 1. Método de instalación
```
¿Cómo deseas instalar el bot?
1) Docker (Recomendado - No necesitas instalar Node.js)
2) Nativo (Node.js - Requiere Node.js 18+)
```

**Recomendación:** Elige Docker si no tienes Node.js instalado.

#### 2. Número de administrador

El script te explicará cómo obtener tu número de WhatsApp:

```
¿Cómo obtener tu número de WhatsApp?
1. Abre WhatsApp en tu teléfono
2. Ve a Configuración (tres puntos arriba a la derecha)
3. Toca en tu nombre/foto de perfil
4. Verás tu número, por ejemplo: +54 9 11 1234-5678

Formato requerido:
• Sin el símbolo +
• Sin espacios
• Sin guiones
• Con código de país

Ejemplo:
  Si tu número es: +54 9 11 1234-5678
  Debes escribir:  5491112345678
```

Luego ingresa tu número cuando te lo pida.

#### 3. Zona horaria

Selecciona tu zona horaria de la lista:
```
1) America/Argentina/Buenos_Aires (Buenos Aires, CABA)
2) America/Argentina/Cordoba (Córdoba)
3) America/Argentina/Mendoza (Mendoza)
4) America/Argentina/Salta (Salta, Jujuy)
5) America/Argentina/Ushuaia (Tierra del Fuego)
6) Otra (ingresar manualmente)
```

#### 4. Nivel de logs

```
1) info (Recomendado - balance entre información y ruido)
2) debug (Mucha información - útil para problemas)
3) error (Solo errores - logs mínimos)
```

**Recomendación:** Elige `info`.

#### 5. Frecuencia de chequeo

```
¿Cada cuántos minutos debe revisar si hay cumpleaños para enviar?

Recomendación: 1 minuto (para mayor precisión en la hora de envío)

Intervalo en minutos [1-60]:
```

**Recomendación:** Deja `1`.

### Paso 4: Escanear QR

El instalador mostrará el código QR automáticamente:

```
Paso Final: Vincular WhatsApp

En unos segundos aparecerá un código QR.

Sigue estos pasos:
1. Abre WhatsApp en tu teléfono
2. Ve a: Configuración > Dispositivos vinculados
3. Toca: 'Vincular un dispositivo'
4. Escanea el código QR que aparecerá abajo
```

¡Listo! Tu bot está corriendo.

## 🔄 Si algo sale mal

### El instalador no se ejecuta

Asegúrate de darle permisos de ejecución:

```bash
chmod +x install.sh
bash install.sh
```

### Docker no está instalado

Si eliges Docker y no lo tienes, el instalador te preguntará:

```
¿Deseas que intente instalar Docker automáticamente? (Solo Linux) [s/n]:
```

Responde `s` para que lo instale automáticamente (solo en Linux).

Para **macOS** o **Windows**, instala Docker Desktop manualmente:
- Mac: https://www.docker.com/products/docker-desktop
- Windows: https://www.docker.com/products/docker-desktop

### Node.js no está instalado

Si eliges instalación nativa y no tienes Node.js 18+:

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS:**
```bash
brew install node@18
```

**Windows:**
Descarga desde: https://nodejs.org/

### El QR no aparece

1. Espera unos 10-20 segundos
2. Si no aparece, presiona `Ctrl+C` y ejecuta:

**Docker:**
```bash
docker-compose logs -f
```

**Nativo:**
```bash
npm start
```

### Error de permisos en storage/

```bash
chmod -R 755 storage/
```

## 📱 Después de la instalación

### Verificar que funciona

Envía un mensaje privado al bot (tu número que escaneó el QR):

```
/ping
```

Deberías recibir: `🏓 Pong! Bot activo.`

### Agregar tu primer cumpleaños

```
/agregar Juan Pérez|1990-05-15|5491112345678|Familia
```

Reemplaza:
- `Juan Pérez` → Nombre de la persona
- `1990-05-15` → Fecha de nacimiento (YYYY-MM-DD)
- `5491112345678` → ID del grupo de WhatsApp
- `Familia` → Nombre descriptivo del grupo

### Ver todos los comandos

```
/help
```

## 🛠️ Comandos útiles después de instalar

### Con Docker

```bash
# Ver logs
docker-compose logs -f

# Reiniciar bot
docker-compose restart

# Detener bot
docker-compose stop

# Iniciar bot
docker-compose start

# Ver estado
docker-compose ps
```

### Con instalación nativa

```bash
# Iniciar bot
npm start

# Modo desarrollo
npm run dev

# Con PM2 (para producción)
npm run pm2:start

# Ver logs PM2
npm run pm2:logs

# Reiniciar con PM2
npm run pm2:restart

# Detener PM2
npm run pm2:stop
```

## 🆘 Solución de problemas

### Reinstalar desde cero

```bash
# Detener todo
docker-compose down  # Si usas Docker
pm2 delete whatsapp-birthday-bot  # Si usas PM2

# Limpiar
rm .env
rm -rf node_modules
rm -rf storage/auth/*

# Reinstalar
bash install.sh
```

### Cambiar configuración

Si quieres cambiar alguna configuración después de instalar:

1. Edita el archivo `.env`:
```bash
nano .env
```

2. Reinicia el bot:
```bash
docker-compose restart  # Docker
# o
npm run pm2:restart     # PM2
```

### Ver logs detallados

Cambia el nivel de log a `debug` en `.env`:
```env
LOG_LEVEL=debug
```

Y reinicia el bot.

## 📚 Más información

- [README.md](README.md) - Documentación completa
- [DOCKER.md](DOCKER.md) - Guía de Docker
- [CASAOS_DEPLOY.md](CASAOS_DEPLOY.md) - Despliegue en CasaOS
- [QUICKSTART.md](QUICKSTART.md) - Guía rápida

---

**¿Necesitas ayuda?** Revisa los archivos de documentación o los logs del bot.
