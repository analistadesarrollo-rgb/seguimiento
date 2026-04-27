#!/bin/bash

# Script de despliegue inicial para Visitas App
# Uso: ./deploy-init.sh <servidor> <usuario> <dominio>

set -e

SERVER=$1
DEPLOY_USER=$2
DOMAIN=$3
APP_DIR="/opt/visitas-app"

if [ -z "$SERVER" ] || [ -z "$DEPLOY_USER" ] || [ -z "$DOMAIN" ]; then
    echo "Uso: ./deploy-init.sh <servidor> <usuario> <dominio>"
    echo "Ejemplo: ./deploy-init.sh 192.168.1.100 deploy visitas.tudominio.com"
    exit 1
fi

echo "🚀 Iniciando despliegue inicial..."
echo "Servidor: $SERVER"
echo "Usuario: $DEPLOY_USER"
echo "Dominio: $DOMAIN"
echo ""

# 1. Conectar al servidor y crear estructura
echo "📁 Creando estructura de directorios..."
ssh ${DEPLOY_USER}@${SERVER} << EOF
    sudo mkdir -p ${APP_DIR}/{storage,ssl,logs,nginx}
    sudo chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${APP_DIR}
    echo "✅ Directorios creados"
EOF

# 2. Copiar archivos de configuración
echo "📄 Copiando archivos de configuración..."
scp Dockerfile ${DEPLOY_USER}@${SERVER}:${APP_DIR}/
scp docker-compose.yml ${DEPLOY_USER}@${SERVER}:${APP_DIR}/
scp nginx.conf ${DEPLOY_USER}@${SERVER}:${APP_DIR}/
scp .dockerignore ${DEPLOY_USER}@${SERVER}:${APP_DIR}/
echo "✅ Archivos copiados"

# 3. Clonar repositorio
echo "🔄 Clonando repositorio..."
ssh ${DEPLOY_USER}@${SERVER} << EOF
    cd ${APP_DIR}
    git clone https://github.com/tu-usuario/visitas_maps.git temp
    cp -r temp/* .
    rm -rf temp
    echo "✅ Repositorio clonado"
EOF

# 4. Generar certificados SSL
echo "🔒 Generando certificados SSL con Let's Encrypt..."
ssh ${DEPLOY_USER}@${SERVER} << EOF
    sudo apt-get update
    sudo apt-get install -y certbot
    sudo certbot certonly --standalone \
        -d ${DOMAIN} \
        -d www.${DOMAIN} \
        --email tu-email@example.com \
        --agree-tos \
        --non-interactive
    
    # Copiar certificados
    sudo cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ${APP_DIR}/ssl/cert.pem
    sudo cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem ${APP_DIR}/ssl/key.pem
    sudo chown ${DEPLOY_USER}:${DEPLOY_USER} ${APP_DIR}/ssl/*
    echo "✅ Certificados generados"
EOF

# 5. Configurar auto-renovación
echo "⏰ Configurando auto-renovación de certificados..."
ssh ${DEPLOY_USER}@${SERVER} << EOF
    # Crear script de renovación
    cat > ~/renew-certs.sh << 'RENEW'
#!/bin/bash
certbot renew --quiet
if [ \$? -eq 0 ]; then
    cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ${APP_DIR}/ssl/cert.pem
    cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem ${APP_DIR}/ssl/key.pem
    docker exec visitas-nginx nginx -s reload
fi
RENEW
    
    chmod +x ~/renew-certs.sh
    (crontab -l 2>/dev/null | grep -v renew-certs.sh; echo "0 3 * * * ~/renew-certs.sh") | crontab -
    echo "✅ Auto-renovación configurada"
EOF

# 6. Construir y ejecutar Docker
echo "🐳 Construyendo e iniciando servicios Docker..."
ssh ${DEPLOY_USER}@${SERVER} << EOF
    cd ${APP_DIR}
    docker-compose build
    docker-compose up -d
    
    # Esperar a que la app esté lista
    sleep 10
    
    # Verificar salud
    if curl -f http://localhost:4322/api/supervisores > /dev/null; then
        echo "✅ Aplicación corriendo correctamente"
    else
        echo "❌ Error: La aplicación no responde"
        docker-compose logs app
        exit 1
    fi
EOF

# 7. Configurar firewall
echo "🔥 Configurando firewall..."
ssh ${DEPLOY_USER}@${SERVER} << EOF
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    echo "✅ Firewall configurado"
EOF

# 8. Crear estructura de backups
echo "💾 Configurando backups automáticos..."
ssh ${DEPLOY_USER}@${SERVER} << EOF
    mkdir -p ~/backups
    
    # Script de backup
    cat > ~/backup-visitas.sh << 'BACKUP'
#!/bin/bash
BACKUP_DIR=~/backups
DATE=\$(date +%Y%m%d_%H%M%S)
tar -czf \${BACKUP_DIR}/visitas-app-\${DATE}.tar.gz \
    ${APP_DIR}/storage \
    ${APP_DIR}/.env 2>/dev/null || true
echo "Backup creado: visitas-app-\${DATE}.tar.gz"
# Mantener solo los últimos 7 backups
find \${BACKUP_DIR} -name "visitas-app-*.tar.gz" -mtime +7 -delete
BACKUP
    
    chmod +x ~/backup-visitas.sh
    
    # Ejecutar backup diariamente a las 2 AM
    (crontab -l 2>/dev/null | grep -v backup-visitas.sh; echo "0 2 * * * ~/backup-visitas.sh") | crontab -
    echo "✅ Backups configurados"
EOF

# 9. Información final
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║            ✅ DESPLIEGUE COMPLETADO                    ║"
echo "╠════════════════════════════════════════════════════════╣"
echo "║ Servidor:          ${SERVER}"
echo "║ Usuario:           ${DEPLOY_USER}"
echo "║ Dominio:           ${DOMAIN}"
echo "║ App Dir:           ${APP_DIR}"
echo "║ HTTPS:             ✅ Habilitado con Let's Encrypt"
echo "║ Auto-renovación:   ✅ Configurada (3 AM diario)"
echo "║ Backups:           ✅ Configurados (2 AM diario)"
echo "║ Firewall:          ✅ Habilitado"
echo "╠════════════════════════════════════════════════════════╣"
echo "║ 🌐 Accede en: https://${DOMAIN}"
echo "║ 📊 Logs: ssh ${DEPLOY_USER}@${SERVER} 'docker-compose logs -f'"
echo "║ 🔄 Actualizar: git pull en ${APP_DIR}"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  TODO: Actualiza las siguientes credenciales en Jenkins:"
echo "   - CLOUDFLARE_ZONE_ID"
echo "   - CLOUDFLARE_RECORD_ID"
echo "   - CLOUDFLARE_API_KEY"
