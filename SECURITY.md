# Guía de Seguridad - WhatsApp Birthday Bot

Este documento explica todas las medidas de seguridad implementadas en el bot.

## 🔐 Capas de Seguridad

### 1. Control de Acceso a Comandos del Bot

**Números Autorizados**

Solo los números configurados en `AUTHORIZED_NUMBERS` pueden ejecutar comandos del bot.

```bash
# Archivo .env
AUTHORIZED_NUMBERS=5491112345678,5491187654321
```

**Importante:**
- Formato: código de país + número (sin el símbolo +)
- Separados por comas, sin espacios
- Ejemplo Argentina: `549` + código de área + número
- Cualquier número NO autorizado recibirá un mensaje de "No autorizado"

**Comandos protegidos:**
- `!agregar` / `!add`
- `!eliminar` / `!remove`
- `!editar` / `!edit`
- `!lista` / `!list`
- `!ver-cumples`
- `!ayuda` / `!help`
- Y todos los demás comandos administrativos

### 2. Autenticación del Panel Web

**Contraseña Obligatoria**

El panel web SIEMPRE requiere autenticación. No es opcional.

**Primera vez:**
1. Al iniciar el bot, se genera automáticamente una contraseña segura de 20 caracteres
2. La contraseña se muestra en la consola:
   ```
   🔐 CONTRASEÑA DEL PANEL WEB:
      XyZ123!@#$abcDEF456
   ```
3. La contraseña se guarda en `.env` como `WEB_PANEL_PASSWORD`

**Ver la contraseña:**
```bash
cat .env | grep WEB_PANEL_PASSWORD
```

**Cambiar la contraseña:**
```bash
# Edita el archivo .env
nano .env

# Modifica la línea:
WEB_PANEL_PASSWORD=tu_nueva_contraseña_super_segura_123!
```

**Cerrar sesión:**
- Usa el botón "🚪 Cerrar Sesión" en la esquina superior derecha del panel
- También puedes usar modo incógnito para no guardar la contraseña

**Recomendaciones:**
- Usa una contraseña fuerte (mínimo 16 caracteres)
- Incluye mayúsculas, minúsculas, números y símbolos
- No compartas la contraseña
- Cámbiala periódicamente

### 3. Protección de la API REST

**Todas las rutas de la API requieren autenticación:**

- `GET /api/birthdays` - Listar cumpleaños
- `POST /api/birthdays` - Agregar cumpleaños
- `PUT /api/birthdays/:id` - Editar cumpleaños
- `DELETE /api/birthdays/:id` - Eliminar cumpleaños
- `PATCH /api/birthdays/:id/toggle` - Activar/desactivar
- `GET /api/groups` - Listar grupos
- `POST /api/groups/config` - Configurar grupo
- `GET /api/whatsapp/groups` - Grupos de WhatsApp
- `GET /api/connection` - Estado de conexión y QR

**Rutas públicas (sin autenticación):**
- `GET /api/auth/check` - Verificar si requiere auth
- `POST /api/auth/verify` - Validar contraseña
- `GET /api/health` - Health check

**Uso de la API con autenticación:**

```bash
curl -H "Authorization: Bearer tu_contraseña" \
     http://localhost:3000/api/birthdays
```

```javascript
fetch('/api/birthdays', {
  headers: {
    'Authorization': 'Bearer tu_contraseña'
  }
});
```

## 🛡️ Mejores Prácticas

### Para Producción

1. **Firewall:**
   ```bash
   # Solo permite acceso desde tu red local
   sudo ufw allow from 192.168.1.0/24 to any port 3000
   ```

2. **Reverse Proxy con HTTPS:**
   ```nginx
   # nginx config
   server {
       listen 443 ssl;
       server_name bot.tudominio.com;

       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **Variables de Entorno:**
   ```bash
   # Permisos restrictivos para .env
   chmod 600 .env
   chown bot-user:bot-user .env
   ```

4. **Rate Limiting:**
   Considera usar nginx o express-rate-limit para prevenir ataques de fuerza bruta

### Backups

**Base de datos:**
```bash
# Backup automático diario
0 2 * * * cp /ruta/al/bot/storage/database.sqlite /backups/db-$(date +\%Y\%m\%d).sqlite
```

**Archivo .env:**
```bash
# Backup del archivo de configuración
cp .env .env.backup-$(date +%Y%m%d)
chmod 600 .env.backup-*
```

## 🚨 Qué NO Hacer

1. ❌ NO compartas tu archivo `.env`
2. ❌ NO subas `.env` a Git (ya está en .gitignore)
3. ❌ NO uses contraseñas débiles como "123456" o "password"
4. ❌ NO expongas el puerto 3000 directamente a Internet sin HTTPS
5. ❌ NO agregues números desconocidos a AUTHORIZED_NUMBERS
6. ❌ NO compartas tu contraseña del panel web
7. ❌ NO desactives la autenticación del panel web

## 🔍 Monitoreo

**Logs de seguridad:**

Los intentos de acceso no autorizados se registran en:
```bash
tail -f storage/logs/app.log | grep "No autorizado"
```

**Ver intentos de login fallidos:**
```bash
tail -f storage/logs/app.log | grep "Invalid password"
```

## 📞 Soporte

Si tienes dudas sobre seguridad:
1. Lee esta guía completa
2. Revisa la [Guía del Panel Web](WEB_GUIDE.md)
3. Consulta los logs para detectar actividad sospechosa

## ✅ Checklist de Seguridad

Antes de poner en producción, verifica:

- [ ] `AUTHORIZED_NUMBERS` está configurado correctamente
- [ ] `WEB_PANEL_PASSWORD` es una contraseña fuerte
- [ ] El archivo `.env` tiene permisos 600
- [ ] El firewall está configurado
- [ ] Los backups automáticos están funcionando
- [ ] Solo las IPs necesarias tienen acceso al puerto 3000
- [ ] HTTPS está configurado (si es acceso público)
- [ ] Los logs se están guardando correctamente
- [ ] Has probado que usuarios no autorizados NO pueden acceder

## 🔄 Recuperación de Contraseña

**Si perdiste la contraseña del panel web:**

1. Accede al servidor por SSH
2. Lee el archivo `.env`:
   ```bash
   cat .env | grep WEB_PANEL_PASSWORD
   ```
3. O genera una nueva:
   ```bash
   nano .env
   # Cambia WEB_PANEL_PASSWORD por tu nueva contraseña

   # Reinicia el bot
   pm2 restart whatsapp-birthday-bot
   ```

**Si perdiste acceso al servidor:**

Necesitarás acceso físico o SSH al servidor para recuperar la contraseña.
No hay forma de recuperarla sin acceso al archivo `.env`.
