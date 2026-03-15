# Guía de Inicio Rápido

## Configuración Inicial (5 minutos)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
nano .env  # o usa tu editor preferido
```

Edita `ADMIN_NUMBERS` con tu número de WhatsApp (con código de país, sin +):

```env
ADMIN_NUMBERS=5491112345678
```

### 3. Iniciar el bot

```bash
npm run dev
```

### 4. Escanear QR

Cuando aparezca el código QR en la terminal:

1. Abre WhatsApp en tu teléfono
2. Ve a **Configuración > Dispositivos vinculados**
3. Toca **Vincular un dispositivo**
4. Escanea el QR

¡Listo! El bot está conectado.

## Primer Cumpleaños (2 minutos)

Envía un mensaje privado al bot (a tu número que escaneó el QR):

```
/agregar Juan Pérez|1990-05-15|5491112345678|Familia
```

Reemplaza:
- `Juan Pérez` con el nombre
- `1990-05-15` con la fecha de nacimiento (YYYY-MM-DD)
- `5491112345678` con el ID del grupo de WhatsApp
- `Familia` con el nombre descriptivo del grupo

## Obtener el ID de un Grupo

El `group_id` es necesario para asociar cumpleaños a grupos. Para obtenerlo:

### Método 1: Desde los logs

1. Inicia el bot
2. Envía cualquier mensaje en el grupo donde quieres los cumpleaños
3. Revisa el archivo `storage/logs/app.log`
4. Busca una línea que contenga el `remoteJid` del grupo, algo como: `120363XXXXXXXXX@g.us`
5. El número antes de `@g.us` es tu `group_id`

### Método 2: Temporalmente habilitar logging

Edita `src/bot/handlers.js` y agrega este log:

```javascript
logger.info({ sender, remoteJid: sender }, 'Message from');
```

Luego envía un mensaje en el grupo y revisa los logs o la consola.

## Configurar Hora de Envío

```
/grupo-config 5491112345678|9|America/Argentina/Cordoba
```

Esto configurará el grupo para enviar cumpleaños a las 9:00 AM hora de Córdoba.

## Probar un Cumpleaños

```
/test-cumple 1
```

Donde `1` es el ID del cumpleaños (lo ves con `/listar`).

## Comandos Útiles

```
/ping         # Verificar que el bot está activo
/help         # Ver todos los comandos
/listar       # Ver todos los cumpleaños
/proximos     # Ver próximos cumpleaños
/status       # Ver estado del sistema
```

## Desplegar en VPS

### Instalar PM2

```bash
npm install -g pm2
```

### Iniciar con PM2

```bash
npm run pm2:start
```

### Ver logs

```bash
pm2 logs whatsapp-birthday-bot
```

### Reiniciar en cada inicio del servidor

```bash
pm2 save
pm2 startup
```

Sigue las instrucciones que PM2 te muestra.

---

**¡Ya estás listo! 🎉**

Para más detalles, consulta el [README.md](README.md) completo.
