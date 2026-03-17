#!/bin/bash

# WhatsApp Birthday Bot - Instalador Automático
# ==============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Banner
clear
echo -e "${CYAN}${BOLD}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     WhatsApp Birthday Bot - Instalador Automático        ║
║                                                           ║
║     🎉 Bot de Recordatorios de Cumpleaños 🎂            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Función para imprimir mensajes
print_step() {
    echo -e "\n${BLUE}${BOLD}➜ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Función para preguntar sí/no
ask_yes_no() {
    while true; do
        read -p "$(echo -e ${YELLOW}$1 [s/n]: ${NC})" yn
        case $yn in
            [Ss]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Por favor responde s (sí) o n (no).";;
        esac
    done
}

# Función para validar número de WhatsApp
validate_whatsapp_number() {
    local number=$1
    # Debe ser solo números, mínimo 10 dígitos
    if [[ $number =~ ^[0-9]{10,15}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Detectar sistema operativo
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

OS=$(detect_os)

print_step "Verificando requisitos del sistema..."

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "Error: No se encuentra package.json. ¿Estás en el directorio del proyecto?"
    exit 1
fi

print_success "Directorio del proyecto encontrado"

# Preguntar método de instalación
echo ""
echo -e "${BOLD}¿Cómo deseas instalar el bot?${NC}"
echo "1) Docker (Recomendado - No necesitas instalar Node.js)"
echo "2) Nativo (Node.js - Requiere Node.js 18+)"
echo ""
echo -ne "${YELLOW}Selecciona una opción [1-2]: ${NC}"
read install_method

case $install_method in
    1)
        INSTALL_TYPE="docker"
        ;;
    2)
        INSTALL_TYPE="native"
        ;;
    *)
        print_error "Opción inválida. Abortando."
        exit 1
        ;;
esac

# Verificar requisitos según el método
if [ "$INSTALL_TYPE" == "docker" ]; then
    print_step "Verificando Docker..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        echo ""
        print_info "Para instalar Docker:"
        if [ "$OS" == "linux" ]; then
            echo -e "${CYAN}curl -fsSL https://get.docker.com -o get-docker.sh${NC}"
            echo -e "${CYAN}sudo sh get-docker.sh${NC}"
            echo -e "${CYAN}sudo usermod -aG docker \$USER${NC}"
        elif [ "$OS" == "macos" ]; then
            echo -e "${CYAN}Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop${NC}"
        fi
        echo ""
        if ask_yes_no "¿Deseas que intente instalar Docker automáticamente? (Solo Linux)"; then
            if [ "$OS" == "linux" ]; then
                print_step "Instalando Docker..."
                curl -fsSL https://get.docker.com -o get-docker.sh
                sudo sh get-docker.sh
                sudo usermod -aG docker $USER
                rm get-docker.sh
                print_success "Docker instalado. Por favor, reinicia tu sesión y ejecuta este script nuevamente."
                exit 0
            fi
        else
            exit 1
        fi
    fi

    print_success "Docker encontrado: $(docker --version)"

    if ! command -v docker-compose &> /dev/null; then
        print_warning "docker-compose no encontrado, intentando instalar..."
        if [ "$OS" == "linux" ]; then
            sudo apt-get update && sudo apt-get install -y docker-compose
        fi
    fi

    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose encontrado: $(docker-compose --version)"
    else
        print_error "No se pudo instalar docker-compose"
        exit 1
    fi

elif [ "$INSTALL_TYPE" == "native" ]; then
    print_step "Verificando Node.js..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado"
        echo ""
        print_info "Para instalar Node.js:"
        if [ "$OS" == "linux" ]; then
            echo -e "${CYAN}curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -${NC}"
            echo -e "${CYAN}sudo apt-get install -y nodejs${NC}"
        elif [ "$OS" == "macos" ]; then
            echo -e "${CYAN}brew install node@18${NC}"
        fi
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js versión 18 o superior requerida. Tienes: $(node -v)"
        exit 1
    fi

    print_success "Node.js encontrado: $(node -v)"
    print_success "npm encontrado: $(npm -v)"
fi

# Configuración interactiva
print_step "Configuración del Bot"
echo ""

# Verificar si ya existe .env
if [ -f ".env" ]; then
    print_warning "Ya existe un archivo .env"
    if ask_yes_no "¿Deseas crear una nueva configuración? (Esto sobrescribirá la actual)"; then
        rm .env
    else
        print_info "Usando configuración existente"
        ENV_EXISTS=true
    fi
fi

if [ "$ENV_EXISTS" != "true" ]; then
    # Explicar cómo obtener el número de WhatsApp
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Paso 1: Número de Administrador${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "El número de administrador es el único autorizado para enviar comandos al bot."
    echo ""
    echo -e "${YELLOW}¿Cómo obtener tu número de WhatsApp?${NC}"
    echo "1. Abre WhatsApp en tu teléfono"
    echo "2. Ve a Configuración (tres puntos arriba a la derecha)"
    echo "3. Toca en tu nombre/foto de perfil"
    echo "4. Verás tu número, por ejemplo: +54 9 11 1234-5678"
    echo ""
    echo -e "${YELLOW}Formato requerido:${NC}"
    echo "• Sin el símbolo +"
    echo "• Sin espacios"
    echo "• Sin guiones"
    echo "• Con código de país"
    echo ""
    echo -e "${GREEN}Ejemplo:${NC}"
    echo "  Si tu número es: +54 9 11 1234-5678"
    echo "  Debes escribir:  5491112345678"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    while true; do
        echo -ne "${YELLOW}Ingresa tu número de WhatsApp: ${NC}"
        read admin_number

        if validate_whatsapp_number "$admin_number"; then
            print_success "Número válido: $admin_number"
            ADMIN_NUMBERS=$admin_number
            break
        else
            print_error "Número inválido. Debe tener entre 10-15 dígitos, solo números."
            echo "Ejemplo: 5491112345678"
        fi
    done

    # Preguntar si quiere agregar más admins
    echo ""
    if ask_yes_no "¿Deseas agregar más números de administrador?"; then
        while true; do
            echo -ne "${YELLOW}Ingresa otro número (o presiona Enter para continuar): ${NC}"
            read extra_number

            if [ -z "$extra_number" ]; then
                break
            fi

            if validate_whatsapp_number "$extra_number"; then
                ADMIN_NUMBERS="$ADMIN_NUMBERS,$extra_number"
                print_success "Número agregado: $extra_number"
            else
                print_error "Número inválido, intenta nuevamente"
            fi
        done
    fi

    # Timezone
    echo ""
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Paso 2: Zona Horaria${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Zonas horarias de Argentina:"
    echo "1) America/Argentina/Buenos_Aires (Buenos Aires, CABA)"
    echo "2) America/Argentina/Cordoba (Córdoba)"
    echo "3) America/Argentina/Mendoza (Mendoza)"
    echo "4) America/Argentina/Salta (Salta, Jujuy)"
    echo "5) America/Argentina/Ushuaia (Tierra del Fuego)"
    echo "6) Otra (ingresar manualmente)"
    echo ""

    echo -ne "${YELLOW}Selecciona tu zona horaria [1-6]: ${NC}"
    read tz_option

    case $tz_option in
        1) TIMEZONE="America/Argentina/Buenos_Aires";;
        2) TIMEZONE="America/Argentina/Cordoba";;
        3) TIMEZONE="America/Argentina/Mendoza";;
        4) TIMEZONE="America/Argentina/Salta";;
        5) TIMEZONE="America/Argentina/Ushuaia";;
        6)
            echo -ne "${YELLOW}Ingresa la zona horaria (ej: America/New_York): ${NC}"
            read TIMEZONE
            ;;
        *) TIMEZONE="America/Argentina/Cordoba";;
    esac

    print_success "Zona horaria configurada: $TIMEZONE"

    # Log level
    echo ""
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Paso 3: Nivel de Logs${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "1) info (Recomendado - balance entre información y ruido)"
    echo "2) debug (Mucha información - útil para problemas)"
    echo "3) error (Solo errores - logs mínimos)"
    echo ""

    echo -ne "${YELLOW}Selecciona nivel de logs [1-3]: ${NC}"
    read log_option

    case $log_option in
        1) LOG_LEVEL="info";;
        2) LOG_LEVEL="debug";;
        3) LOG_LEVEL="error";;
        *) LOG_LEVEL="info";;
    esac

    print_success "Nivel de logs: $LOG_LEVEL"

    # Intervalo del scheduler
    echo ""
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Paso 4: Frecuencia de Chequeo${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "¿Cada cuántos minutos debe revisar si hay cumpleaños para enviar?"
    echo ""
    echo "Recomendación: 1 minuto (para mayor precisión en la hora de envío)"
    echo ""

    echo -ne "${YELLOW}Intervalo en minutos [1-60]: ${NC}"
    read scheduler_interval

    if [[ ! "$scheduler_interval" =~ ^[0-9]+$ ]] || [ "$scheduler_interval" -lt 1 ] || [ "$scheduler_interval" -gt 60 ]; then
        print_warning "Valor inválido, usando 1 minuto"
        scheduler_interval=1
    fi

    SCHEDULER_INTERVAL=$scheduler_interval
    print_success "Intervalo configurado: cada $SCHEDULER_INTERVAL minuto(s)"

    # Crear archivo .env
    print_step "Creando archivo de configuración..."

    if [ "$INSTALL_TYPE" == "docker" ]; then
        DB_PATH="/app/storage/database.sqlite"
        NODE_ENV="production"
    else
        DB_PATH="./storage/database.sqlite"
        NODE_ENV="development"
    fi

    cat > .env << EOF
# Environment
NODE_ENV=$NODE_ENV

# Timezone
TZ=$TIMEZONE
DEFAULT_TIMEZONE=$TIMEZONE

# Admin numbers (comma separated, with country code, no + sign)
ADMIN_NUMBERS=$ADMIN_NUMBERS

# Logging
LOG_LEVEL=$LOG_LEVEL

# Database
DB_PATH=$DB_PATH

# Scheduler
SCHEDULER_CHECK_INTERVAL=$SCHEDULER_INTERVAL
EOF

    print_success "Archivo .env creado correctamente"
fi

# Crear directorios necesarios
print_step "Creando directorios..."
mkdir -p storage/auth storage/logs
print_success "Directorios creados"

# Instalación según método
if [ "$INSTALL_TYPE" == "docker" ]; then
    print_step "Construyendo imagen Docker..."
    echo ""
    docker-compose build

    print_success "Imagen Docker construida"

    print_step "Iniciando contenedor..."
    docker-compose up -d

    print_success "Contenedor iniciado"

    echo ""
    echo -e "${GREEN}${BOLD}✓ Instalación completada con éxito!${NC}"
    echo ""

elif [ "$INSTALL_TYPE" == "native" ]; then
    print_step "Instalando dependencias de Node.js..."
    npm install

    print_success "Dependencias instaladas"

    # Instalar PM2 globalmente
    print_step "Instalando PM2 (administrador de procesos)..."

    if ! command -v pm2 &> /dev/null; then
        if command -v sudo &> /dev/null; then
            sudo npm install -g pm2
        else
            npm install -g pm2
        fi
        print_success "PM2 instalado correctamente"
    else
        print_success "PM2 ya está instalado: $(pm2 -v)"
    fi

    # Preguntar si desea configurar PM2 para inicio automático
    echo ""
    if ask_yes_no "¿Deseas configurar PM2 para que el bot inicie automáticamente al reiniciar el servidor?"; then
        print_step "Configurando PM2 startup..."
        pm2 startup | tail -n 1 | grep -o 'sudo.*' | sh || true
        print_success "PM2 configurado para inicio automático"
        print_info "Recuerda ejecutar 'pm2 save' después de iniciar el bot"
    fi

    echo ""
    echo -e "${GREEN}${BOLD}✓ Instalación completada con éxito!${NC}"
    echo ""
fi

# Mostrar QR
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}Paso Final: Vincular WhatsApp${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}En unos segundos aparecerá un código QR.${NC}"
echo ""
echo "Sigue estos pasos:"
echo "1. Abre WhatsApp en tu teléfono"
echo "2. Ve a: Configuración > Dispositivos vinculados"
echo "3. Toca: 'Vincular un dispositivo'"
echo "4. Escanea el código QR que aparecerá abajo"
echo ""
echo -e "${CYAN}Presiona Enter cuando estés listo...${NC}"
read

echo ""
print_step "Mostrando logs del bot (el QR aparecerá aquí)..."
echo ""
echo -e "${YELLOW}Presiona Ctrl+C para salir de los logs (el bot seguirá corriendo)${NC}"
echo ""
sleep 2

if [ "$INSTALL_TYPE" == "docker" ]; then
    docker-compose logs -f
else
    # Si PM2 está instalado, usar PM2
    if command -v pm2 &> /dev/null; then
        print_info "Iniciando bot con PM2..."
        npm run pm2:start
        sleep 2
        npm run pm2:logs
    else
        npm start
    fi
fi

# Este código no se ejecutará hasta que el usuario presione Ctrl+C
echo ""
echo -e "${GREEN}${BOLD}¡Bot configurado correctamente!${NC}"
echo ""
echo -e "${BOLD}Comandos útiles:${NC}"
echo ""

if [ "$INSTALL_TYPE" == "docker" ]; then
    echo -e "${CYAN}Ver logs:${NC}        docker-compose logs -f"
    echo -e "${CYAN}Reiniciar bot:${NC}   docker-compose restart"
    echo -e "${CYAN}Detener bot:${NC}     docker-compose stop"
    echo -e "${CYAN}Iniciar bot:${NC}     docker-compose start"
    echo -e "${CYAN}Ver estado:${NC}      docker-compose ps"
else
    echo -e "${CYAN}Iniciar bot:${NC}     npm start"
    echo -e "${CYAN}Modo dev:${NC}        npm run dev"
    echo -e "${CYAN}Con PM2:${NC}         npm run pm2:start"
    echo -e "${CYAN}Ver logs PM2:${NC}    npm run pm2:logs"
fi

echo ""
echo -e "${BOLD}Próximos pasos:${NC}"
echo "1. Envía un mensaje privado al bot: ${GREEN}/ping${NC}"
echo "2. Agrega tu primer cumpleaños: ${GREEN}/agregar Juan|1990-05-15|groupId|Familia${NC}"
echo "3. Ve todos los comandos: ${GREEN}/help${NC}"
echo ""
echo -e "${YELLOW}Consulta README.md para más información sobre comandos y configuración.${NC}"
echo ""
