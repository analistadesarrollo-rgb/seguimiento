#!/bin/bash
set -euo pipefail

# Setup remoto: se ejecuta UNA sola vez en el servidor (idempotente)
# Jenkins lo ejecuta automáticamente en el primer deploy

APP_DIR=/opt/visitas-app
APP_REPO="https://github.com/analistadesarrollo-rgb/seguimiento.git"
DEPLOY_USER="deploy"

echo "[setup-remote] starting server setup..."

# 1. Crear directorio de la app
echo "[setup-remote] ensuring app directory exists"
sudo mkdir -p "${APP_DIR}"
sudo chown "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}" 2>/dev/null || sudo chown root:root "${APP_DIR}"

# 2. Clonar repo si no existe
if [ ! -d "${APP_DIR}/.git" ]; then
  echo "[setup-remote] cloning repository"
  cd /tmp
  git clone "${APP_REPO}" "${APP_DIR}.tmp" || true
  sudo mv "${APP_DIR}.tmp" "${APP_DIR}" || true
else
  echo "[setup-remote] repository already cloned, skipping"
fi

# 3. Asegurar que existe .env (si no, crear plantilla)
if [ ! -f "${APP_DIR}/.env" ]; then
  echo "[setup-remote] creating .env file"
  sudo tee "${APP_DIR}/.env" > /dev/null <<'EOF'
DB_HOST=172.20.1.92
DB_USER=cliente
DB_PASS=adminadmon
DB_NAME=appseguimiento
EOF
fi

# 4. Fijar permisos del .env
echo "[setup-remote] fixing .env permissions"
sudo chown root:root "${APP_DIR}/.env"
sudo chmod 600 "${APP_DIR}/.env"

# 5. Crear usuario deploy si no existe
if ! id "${DEPLOY_USER}" &>/dev/null; then
  echo "[setup-remote] creating deploy user"
  sudo useradd -m -s /bin/bash "${DEPLOY_USER}"
else
  echo "[setup-remote] deploy user already exists"
fi

# 6. Asegurar que deploy puede ejecutar docker sin contraseña
if ! groups "${DEPLOY_USER}" | grep -q docker; then
  echo "[setup-remote] adding deploy to docker group"
  sudo usermod -aG docker "${DEPLOY_USER}" || true
fi

# 7. Hacer scripts ejecutables
echo "[setup-remote] making scripts executable"
sudo chmod +x "${APP_DIR}"/scripts/*.sh 2>/dev/null || true

# 8. Verificar que docker está disponible
if ! command -v docker &> /dev/null; then
  echo "[setup-remote] WARNING: docker not found, please install docker"
  exit 1
fi

echo "[setup-remote] server setup completed successfully"
echo "[setup-remote] .env location: ${APP_DIR}/.env"
echo "[setup-remote] ready for deploy"
