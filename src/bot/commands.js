import * as birthdayService from '../services/birthdayService.js';
import * as groupService from '../services/groupService.js';
import * as messageService from '../services/messageService.js';
import { sanitizeInput } from '../utils/validators.js';
import { formatDateForDisplay, getDaysUntilBirthday } from '../utils/dateUtils.js';
import { getSchedulerStatus } from '../services/schedulerService.js';
import logger from '../utils/logger.js';

export async function parseCommand(sock, message, text) {
  const replyJid = message.key.remoteJid;
  const args = text.trim().split(/\s+/);
  const command = args[0].toLowerCase();

  try {
    let response = '';

    switch (command) {
      case '/ping':
        response = await handlePing();
        break;

      case '/help':
        response = await handleHelp();
        break;

      case '/listar':
        response = await handleListar();
        break;

      case '/proximos':
        response = await handleProximos();
        break;

      case '/agregar':
        response = await handleAgregar(args.slice(1).join(' '));
        break;

      case '/eliminar':
        response = await handleEliminar(args[1]);
        break;

      case '/editar':
        response = await handleEditar(args.slice(1));
        break;

      case '/activar':
        response = await handleActivar(args[1]);
        break;

      case '/desactivar':
        response = await handleDesactivar(args[1]);
        break;

      case '/grupos':
        response = await handleGrupos();
        break;

      case '/grupo-config':
        response = await handleGrupoConfig(args.slice(1).join(' '));
        break;

      case '/test-cumple':
        response = await handleTestCumple(sock, args[1]);
        break;

      case '/backup':
        response = await handleBackup();
        break;

      case '/importar':
        response = await handleImportar(args.slice(1).join(' '));
        break;

      case '/status':
        response = await handleStatus();
        break;

      default:
        response = `❓ Comando desconocido: ${command}\n\nUsa /help para ver los comandos disponibles.`;
    }

    if (response) {
      await messageService.sendTextMessage(sock, replyJid, response);
    }

  } catch (error) {
    logger.error({ command, error: error.message }, 'Error executing command');
    const errorResponse = `❌ Error al ejecutar el comando:\n${error.message}`;
    await messageService.sendTextMessage(sock, replyJid, errorResponse);
  }
}

async function handlePing() {
  const schedulerStatus = getSchedulerStatus();
  return `🏓 Pong!\n\n✅ Bot activo\n📅 Scheduler: ${schedulerStatus.running ? 'Activo' : 'Inactivo'}\n⏱️ Intervalo: ${schedulerStatus.interval}`;
}

async function handleHelp() {
  return `🤖 *Comandos del Bot de Cumpleaños*

📋 *Consultas:*
/ping - Verificar si el bot está activo
/listar - Listar todos los cumpleaños
/proximos - Mostrar próximos cumpleaños
/grupos - Listar grupos conocidos
/status - Estado del sistema

➕ *Gestión de Cumpleaños:*
/agregar Nombre|YYYY-MM-DD|groupId|groupName
/eliminar <id>
/editar <id> <campo> <valor>
/activar <id>
/desactivar <id>

⚙️ *Configuración de Grupos:*
/grupo-config groupId|sendHour|timezone

🧪 *Pruebas:*
/test-cumple <id> - Enviar mensaje de prueba

💾 *Importar/Exportar:*
/backup - Exportar cumpleaños a JSON
/importar <json> - Importar desde JSON

ℹ️ *Notas:*
- Campos editables: name, birth_date, group_id, group_name, message_template, enabled
- sendHour: 0-23 (hora del día)
- timezone: ej. America/Argentina/Cordoba`;
}

async function handleListar() {
  const birthdays = birthdayService.listBirthdays(false);

  if (birthdays.length === 0) {
    return '📋 No hay cumpleaños registrados.';
  }

  let response = `📋 *Lista de Cumpleaños* (${birthdays.length}):\n\n`;

  for (const b of birthdays) {
    const status = b.enabled ? '✅' : '❌';
    response += `${status} *[${b.id}]* ${b.name}\n`;
    response += `   📅 ${formatDateForDisplay(b.birth_date)}\n`;
    response += `   👥 ${b.group_name}\n\n`;
  }

  return response;
}

async function handleProximos() {
  const birthdays = birthdayService.getUpcomingBirthdays(10);

  if (birthdays.length === 0) {
    return '📅 No hay cumpleaños próximos.';
  }

  let response = '📅 *Próximos Cumpleaños:*\n\n';

  for (const b of birthdays) {
    const days = getDaysUntilBirthday(b.birth_date);
    const daysText = days === 0 ? '¡HOY!' : days === 1 ? 'Mañana' : `En ${days} días`;

    response += `*${b.name}* - ${daysText}\n`;
    response += `   📅 ${formatDateForDisplay(b.birth_date)}\n`;
    response += `   👥 ${b.group_name}\n\n`;
  }

  return response;
}

async function handleAgregar(input) {
  const parts = input.split('|').map(p => sanitizeInput(p));

  if (parts.length !== 4) {
    return '❌ Formato incorrecto.\n\nUso: /agregar Nombre|YYYY-MM-DD|groupId|groupName\n\nEjemplo:\n/agregar Juan Pérez|1990-05-15|5491112345678|Familia';
  }

  const [name, birth_date, group_id, group_name] = parts;

  const birthday = birthdayService.addBirthday({
    name,
    birth_date,
    group_id,
    group_name
  });

  return `✅ Cumpleaños agregado correctamente!\n\n*ID:* ${birthday.id}\n*Nombre:* ${name}\n*Fecha:* ${formatDateForDisplay(birth_date)}\n*Grupo:* ${group_name}`;
}

async function handleEliminar(id) {
  if (!id) {
    return '❌ Debes proporcionar un ID.\n\nUso: /eliminar <id>';
  }

  const birthday = birthdayService.getBirthdayDetails(parseInt(id, 10));
  birthdayService.removeBirthday(parseInt(id, 10));

  return `✅ Cumpleaños eliminado:\n\n*Nombre:* ${birthday.name}\n*Fecha:* ${formatDateForDisplay(birthday.birth_date)}`;
}

async function handleEditar(args) {
  if (args.length < 3) {
    return '❌ Faltan argumentos.\n\nUso: /editar <id> <campo> <valor>\n\nCampos: name, birth_date, group_id, group_name, message_template, enabled';
  }

  const id = parseInt(args[0], 10);
  const field = args[1];
  const value = sanitizeInput(args.slice(2).join(' '));

  let finalValue = value;
  if (field === 'enabled') {
    finalValue = value === '1' || value.toLowerCase() === 'true' ? 1 : 0;
  }

  birthdayService.updateBirthdayField(id, field, finalValue);

  return `✅ Campo actualizado correctamente!\n\n*ID:* ${id}\n*Campo:* ${field}\n*Nuevo valor:* ${finalValue}`;
}

async function handleActivar(id) {
  if (!id) {
    return '❌ Debes proporcionar un ID.\n\nUso: /activar <id>';
  }

  birthdayService.toggleBirthdayStatus(parseInt(id, 10), true);
  return `✅ Cumpleaños ID ${id} activado.`;
}

async function handleDesactivar(id) {
  if (!id) {
    return '❌ Debes proporcionar un ID.\n\nUso: /desactivar <id>';
  }

  birthdayService.toggleBirthdayStatus(parseInt(id, 10), false);
  return `✅ Cumpleaños ID ${id} desactivado.`;
}

async function handleGrupos() {
  const groups = groupService.listAllGroups();

  if (groups.length === 0) {
    return '👥 No hay grupos con cumpleaños registrados.';
  }

  let response = '👥 *Grupos con Cumpleaños:*\n\n';

  for (const g of groups) {
    const configStatus = g.settings_enabled !== null
      ? (g.settings_enabled ? '⚙️ Configurado' : '⚙️ Deshabilitado')
      : '⚠️ Sin configurar';

    response += `*${g.group_name}*\n`;
    response += `   ID: ${g.group_id}\n`;
    response += `   Estado: ${configStatus}\n`;
    if (g.send_hour !== null) {
      response += `   Hora envío: ${g.send_hour}:00\n`;
      response += `   Zona horaria: ${g.timezone}\n`;
    }
    response += '\n';
  }

  return response;
}

async function handleGrupoConfig(input) {
  const parts = input.split('|').map(p => sanitizeInput(p));

  if (parts.length !== 3) {
    return '❌ Formato incorrecto.\n\nUso: /grupo-config groupId|sendHour|timezone\n\nEjemplo:\n/grupo-config 5491112345678|9|America/Argentina/Cordoba';
  }

  const [group_id, sendHourStr, timezone] = parts;
  const send_hour = parseInt(sendHourStr, 10);

  if (isNaN(send_hour) || send_hour < 0 || send_hour > 23) {
    return '❌ sendHour debe ser un número entre 0 y 23.';
  }

  groupService.configureGroup({
    group_id,
    group_name: 'Configurado',
    send_hour,
    timezone
  });

  return `✅ Grupo configurado correctamente!\n\n*Grupo ID:* ${group_id}\n*Hora de envío:* ${send_hour}:00\n*Zona horaria:* ${timezone}`;
}

async function handleTestCumple(sock, id) {
  if (!id) {
    return '❌ Debes proporcionar un ID.\n\nUso: /test-cumple <id>';
  }

  const birthday = birthdayService.getBirthdayDetails(parseInt(id, 10));

  const result = await messageService.sendBirthdayMessage(sock, birthday, true);

  if (result.success) {
    return `✅ Mensaje de prueba enviado al grupo:\n\n*Grupo:* ${birthday.group_name}\n*Mensaje:* ${result.message}`;
  } else {
    return `❌ Error al enviar mensaje de prueba:\n${result.error}`;
  }
}

async function handleBackup() {
  const birthdays = birthdayService.exportBirthdays();
  const json = JSON.stringify(birthdays, null, 2);

  return `💾 *Backup de Cumpleaños* (${birthdays.length} registros)\n\nJSON:\n\`\`\`${json}\`\`\`\n\n_Copia este JSON y guárdalo en un lugar seguro._`;
}

async function handleImportar(input) {
  if (!input) {
    return '❌ Debes proporcionar un JSON válido.\n\nUso: /importar <json>\n\nEjemplo:\n/importar [{"name":"Juan","birth_date":"1990-01-15","group_id":"123","group_name":"Familia"}]';
  }

  try {
    const data = JSON.parse(input);
    const result = birthdayService.importBirthdaysFromJson(data);

    let response = `📥 *Importación Completada*\n\n`;
    response += `✅ Importados: ${result.imported}\n`;
    response += `❌ Errores: ${result.errors}\n`;

    if (result.errors > 0) {
      response += `\n⚠️ Revisa los logs para ver detalles de los errores.`;
    }

    return response;
  } catch (error) {
    return `❌ Error al parsear JSON:\n${error.message}`;
  }
}

async function handleStatus() {
  const schedulerStatus = getSchedulerStatus();
  const birthdays = birthdayService.listBirthdays(true);
  const groups = groupService.listAllGroups();

  return `📊 *Estado del Sistema*

✅ Bot: Activo
📅 Scheduler: ${schedulerStatus.running ? 'Activo' : 'Inactivo'}
⏱️ Intervalo: ${schedulerStatus.interval}

📋 Cumpleaños activos: ${birthdays.length}
👥 Grupos registrados: ${groups.length}

⏰ Próxima revisión: En ${schedulerStatus.interval}`;
}
