#!/bin/bash

echo "Creating upload package for CasaOS..."

# Crear directorio temporal
mkdir -p dist-upload

# Copiar archivos esenciales
cp Dockerfile dist-upload/
cp docker-compose.yml dist-upload/
cp .env.example dist-upload/
cp .dockerignore dist-upload/
cp package*.json dist-upload/
cp ecosystem.config.js dist-upload/

# Copiar directorios de código
cp -r src dist-upload/

# Crear directorios storage vacíos
mkdir -p dist-upload/storage/auth
mkdir -p dist-upload/storage/logs
touch dist-upload/storage/auth/.gitkeep
touch dist-upload/storage/logs/.gitkeep

# Comprimir
cd dist-upload
tar -czf ../whatsapp-bot-casaos.tar.gz .
cd ..

# Limpiar
rm -rf dist-upload

echo "✅ Package created: whatsapp-bot-casaos.tar.gz"
echo "📦 Size: $(du -h whatsapp-bot-casaos.tar.gz | cut -f1)"
echo ""
echo "Upload this file to your VPS and extract it:"
echo "  tar -xzf whatsapp-bot-casaos.tar.gz -C whatsapp-birthday-bot"
